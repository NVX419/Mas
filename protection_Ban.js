const { Events, EmbedBuilder } = require('discord.js');
const { Database } = require('st.db');
const moment = require('moment');

const protectiondb = new Database("/Database/Protection");

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    client.on(Events.GuildBanAdd, async (guild, user) => {
      const audit = await guild.fetchAuditLogs({ action: 22, limit: 1 });
      const info = audit.entries.first();
      
      if (info.action === 22 && info.target?.id === user.id && info.executor) {
        if (info.executor?.id === client.user?.id || info.executor?.id === guild.ownerId) return;

        let limit = protectiondb.get("actionLimit_" + "ban_" + guild?.id) || 5;
        let automode = protectiondb.get("autoMode_" + "ban_" + guild?.id) || "delete_roles";
        let whitelistCheck = protectiondb.get("whiteList_" + guild?.id + "_" + user.id) || [];
        let logID = protectiondb.get("protectionLog_" + guild.id) || null;

        if (whitelistCheck && (whitelistCheck.includes("ban") || whitelistCheck.includes("all"))) {
          if (logID) {
            let log = guild.channels.cache.get(logID);
            if (log) {
              let embed = new EmbedBuilder()
                .setColor("Red")
                .setThumbnail(user.avatarURL({ dynamic: true }))
                .setAuthor({ name: user.username, iconURL: user.avatarURL({ dynamic: true }) })
                .setFooter({ iconURL: info.executor.avatarURL({ dynamic: true }), text: info.executor.username })
                .setTimestamp()
                .setDescription(`**تعرف للباند:** ${user.tag} \n **العضو:** ${info.executor} \n **الاجراء:** القائمة البيضاء`);
              log.send({embeds: [embed]});
            }
          }
        } else {
          let userData = protectiondb.get("protectionData_" + "ban_" + guild?.id + "_" + info.executor?.id) || 0;
          let timeLeft = limit - userData;

          if (logID) {
            let log = guild.channels.cache.get(logID);
            if (log) {
              let embed = new EmbedBuilder()
                .setColor("Red")
                .setThumbnail(user.avatarURL({ dynamic: true }))
                .setAuthor({ name: user.username, iconURL: user.avatarURL({ dynamic: true }) })
                .setFooter({ iconURL: info.executor.avatarURL({ dynamic: true }), text: info.executor.username })
                .setTimestamp()
                .setDescription(`**تعرض للباند:** ${user.tag} \n **العضو:** ${info.executor} \n **الاجراء:** unauthorized \n **Remaining Attempts:** ${timeLeft}`);
              log.send({embeds: [embed]});
            }
          }

          const endTime = moment().add(20, 'minutes').format('YYYY-MM-DD HH:mm:ss');
          protectiondb.set("protectionData_" + "ban_" + guild?.id + "_" + info.executor?.id, userData + 1).then(() => {
            protectiondb.push(`protectionTimer_${guild.id}`, {
              ID: info.executor?.id,
              action: 'ban',
              Time: endTime,
              server: guild.id,
              Number: userData
            });
          });

          if (userData >= limit) {
            let done = false;
            if (automode === 'delete_roles') {
              const member = guild.members.cache.get(info.executor?.id);
              if (member) {
                member.roles.cache.forEach(async r => {
                  await member.roles.remove(r).then(() => {
                    done = true;
                  }).catch(err => { });
                });
              }
            } else if (automode === 'kick') {
              const member = guild.members.cache.get(info.executor?.id);
              member.kick().then(() => {
                done = true;
              }).catch(err => { });
            } else if (automode === 'ban') {
              const member = guild.members.cache.get(info.executor?.id);
              member.ban().then(() => {
                done = true;
              }).catch(err => { });
            }

            let serverOwner = guild.members.cache.get(guild.ownerId);
            setTimeout(() => {
              if (serverOwner && done === true) {
                let embed = new EmbedBuilder()
                  .setColor("Green")
                  .setFooter({ text: "Managed by the bot" })
                  .setTimestamp()
                  .setDescription(`**الاجراء:** \n **الاونر:** ${serverOwner} \n **السيرفر:** ${guild.name} \n **العضو:** ${info.executor} \n **ايدي العضو:** ${info.executor?.id} \n **الاجراء:** تم تبنيد`);
                serverOwner.send({embeds: [embed]});
              }
            }, 1000);
          }
        }
      }
    });
  },
};
