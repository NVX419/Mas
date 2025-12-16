const { Events, EmbedBuilder } = require('discord.js');
const { Database } = require('st.db');
const moment = require('moment');

const protectiondb = new Database("/Database/Protection");

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    client.on(Events.GuildMemberRemove, async (member) => {
      const audit = await member.guild.fetchAuditLogs({ action: 20, limit: 1 });
      const info = audit.entries.first();

      if (info.action === 20 && info.target?.id === member.id && info.executor) {
        if (info.executor?.id === client.user?.id || info.executor?.id === member.guild.ownerId) return;

        let limit = protectiondb.get("actionLimit_" + "kick_" + member.guild?.id) || 5;
        let automode = protectiondb.get("autoMode_" + "kick_" + member.guild?.id) || "delete_roles";
        let whitelistCheck = protectiondb.get("whiteList_" + member.guild?.id + "_" + member.id) || [];
        let logID = protectiondb.get("protectionLog_" + member.guild.id) || null;

        if (whitelistCheck && (whitelistCheck.includes("kick") || whitelistCheck.includes("all"))) {
          if (logID) {
            let log = member.guild.channels.cache.get(logID);
            if (log) {
              let embed = new EmbedBuilder()
                .setColor("Red")
                .setThumbnail(member.user.avatarURL({ dynamic: true }))
                .setAuthor({ name: member.user.username, iconURL: member.user.avatarURL({ dynamic: true }) })
                .setFooter({ iconURL: info.executor.avatarURL({ dynamic: true }), text: info.executor.username })
                .setTimestamp()
                .setDescription(`**تم طرد:** ${member.user.tag} \n **Author:** ${info.executor} \n **Action:** whitelisted`);
              log.send({ embeds: [embed] });
            }
          }
        } else {
          let userData = protectiondb.get("protectionData_" + "kick_" + member.guild?.id + "_" + info.executor?.id) || 0;
          let timeLeft = limit - userData;

          if (logID) {
            let log = member.guild.channels.cache.get(logID);
            if (log) {
              let embed = new EmbedBuilder()
                .setColor("Red")
                .setThumbnail(member.user.avatarURL({ dynamic: true }))
                .setAuthor({ name: member.user.username, iconURL: member.user.avatarURL({ dynamic: true }) })
                .setFooter({ iconURL: info.executor.avatarURL({ dynamic: true }), text: info.executor.username })
                .setTimestamp()
                .setDescription(`**User Kicked:** ${member.user.tag} \n **Author:** ${info.executor} \n **Action:** unauthorized \n **Remaining Attempts:** ${timeLeft}`);
              log.send({ embeds: [embed] });
            }
          }

          const endTime = moment().add(20, 'minutes').format('YYYY-MM-DD HH:mm:ss');
          protectiondb.set("protectionData_" + "kick_" + member.guild?.id + "_" + info.executor?.id, userData + 1).then(() => {
            protectiondb.push(`protectionTimer_${member.guild.id}`, {
              ID: info.executor?.id,
              action: 'kick',
              Time: endTime,
              server: member.guild.id,
              Number: userData
            });
          });

          if (userData >= limit) {
            let done = false;
            if (automode === 'delete_roles') {
              const targetMember = member.guild.members.cache.get(info.executor?.id);
              if (targetMember) {
                targetMember.roles.cache.forEach(async r => {
                  await targetMember.roles.remove(r).then(() => {
                    done = true;
                  }).catch(err => { });
                });
              }
            } else if (automode === 'kick') {
              const targetMember = member.guild.members.cache.get(info.executor?.id);
              targetMember.kick().then(() => {
                done = true;
              }).catch(err => { });
            } else if (automode === 'ban') {
              const targetMember = member.guild.members.cache.get(info.executor?.id);
              targetMember.ban().then(() => {
                done = true;
              }).catch(err => { });
            }

            let serverOwner = member.guild.members.cache.get(member.guild.ownerId);
            setTimeout(() => {
              if (serverOwner && done === true) {
                let embed = new EmbedBuilder()
                  .setColor("Green")
                  .setFooter({ text: "Managed by the bot" })
                  .setTimestamp()
                  .setDescription(`**Action Taken:** \n **Owner:** ${serverOwner} \n **Server:** ${member.guild.name} \n **Author:** ${info.executor} \n **Author ID:** ${info.executor?.id} \n **Action:** Kicking User`);
                serverOwner.send({ embeds: [embed] });
              }
            }, 1000);
          }
        }
      }
    });
  },
};
