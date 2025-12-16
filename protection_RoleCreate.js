const { Events, EmbedBuilder } = require('discord.js');
const { Database } = require('st.db');
const moment = require('moment');

const protectiondb = new Database("/Database/Protection");

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    client.on(Events.RoleCreate, async (role) => {
      const audit = await role.guild.fetchAuditLogs({ action: 30, limit: 1 });
      const info = audit.entries.first();
      
      if (info.action === 30 && info.target?.id === role.id && info.executor) {
        if (info.executor?.id === client.user?.id || info.executor?.id === role.guild.ownerId) return;

        let limit = protectiondb.get("actionLimit_" + "create_roles_" + role.guild?.id) || 5;
        let automode = protectiondb.get("autoMode_" + "create_roles_" + role.guild?.id) || "delete_roles";
        let whitelistCheck = protectiondb.get("whiteList_" + role.guild?.id + "_" + role?.id) || [];
        let logID = protectiondb.get("protectionLog_" + role.guild.id) || null;

        if (whitelistCheck && (whitelistCheck.includes("create_role") || whitelistCheck.includes("all"))) {
          if (logID) {
            let log = role.guild.channels.cache.get(logID);
            if (log) {
              let embed = new EmbedBuilder()
                .setColor("Red")
                .setThumbnail(role?.iconURL({ dynamic: true }))
                .setAuthor({ name: role.name, iconURL: role.guild.iconURL() })
                .setFooter({ iconURL: info.executor.avatarURL({ dynamic: true }), text: info.executor.username })
                .setTimestamp()
                .setDescription(`**Role Created:** ${role.name} \n **Author:** ${info.executor} \n **Action:** whitelisted`);
              log.send({embeds: [embed]});
            }
          }
        } else {
          let userData = protectiondb.get("protectionData_" + "create_roles_" + role.guild?.id + "_" + info.executor?.id) || 0;
          let timeLeft = limit - userData;

          if (logID) {
            let log = role.guild.channels.cache.get(logID);
            if (log) {
              let embed = new EmbedBuilder()
                .setColor("Red")
                .setThumbnail(role?.iconURL({ dynamic: true }))
                .setAuthor({ name: role.name, iconURL: role.guild.iconURL() })
                .setFooter({ iconURL: info.executor.avatarURL({ dynamic: true }), text: info.executor.username })
                .setTimestamp()
                .setDescription(`**Role Created:** ${role.name} \n **Author:** ${info.executor} \n **Action:** unauthorized \n **Remaining Attempts:** ${timeLeft}`);
              log.send({embeds: [embed]});
            }
          }

          const endTime = moment().add(20, 'minutes').format('YYYY-MM-DD HH:mm:ss');
          protectiondb.set("protectionData_" + "create_roles_" + role.guild?.id + "_" + info.executor?.id, userData + 1).then(() => {
            protectiondb.push(`protectionTimer_${role.guild.id}`, {
              ID: info.executor?.id,
              action: 'create_role',
              Time: endTime,
              server: role.guild.id,
              Number: userData
            });
          });

          if (userData >= limit) {
            let done = false;
            if (automode === 'delete_roles') {
              const user = role.guild.members.cache.get(info.executor?.id);
              if (user) {
                user.roles.cache.forEach(async r => {
                  await user.roles.remove(r).then(() => {
                    done = true;
                  }).catch(err => { });
                });
              }
            } else if (automode == 'kick') {
              const user = role.guild.members.cache.get(info.executor?.id);
              user.kick().then(() => {
                done = true;
              }).catch(err => { });
            } else if (automode == 'ban') {
              const user = role.guild.members.cache.get(info.executor?.id);
              user.ban().then(() => {
                done = true;
              }).catch(err => { });
            }

            let serverOwner = role.guild.members.cache.get(role.guild.ownerId);
            setTimeout(() => {
              if (serverOwner && done == true) {
                let embed = new EmbedBuilder()
                  .setColor("Green")
                  .setFooter({ text: "Managed by the bot" })
                  .setTimestamp()
                  .setDescription(`**Action Taken:** \n **Owner:** ${serverOwner} \n **Server:** ${role.guild.name} \n **Author:** ${info.executor} \n **Author ID:** ${info.executor?.id} \n **Action:** Creating Role`);
                serverOwner.send({embeds: [embed]});
              }
            }, 1000);
          }
        }
      }
    });
  },
};
