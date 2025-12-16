const { Events, EmbedBuilder } = require('discord.js');
const { Database } = require('st.db');
const moment = require('moment');

const protectiondb = new Database("/Database/Protection");

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    client.on(Events.ChannelDelete, async (channel) => {
      const audit = await channel.guild.fetchAuditLogs({ action: 12, limit: 1 });
      const info = audit.entries.first();

      if (info && info.action === 12 && info.target?.id === channel.id && info.executor) {
        if (info.executor?.id === client.user?.id || info.executor?.id === channel.guild.ownerId) return;

        let limit = protectiondb.get(`actionLimit_delete_channel_${channel.guild.id}`) || 5;
        let automode = protectiondb.get(`autoMode_delete_channel_${channel.guild.id}`) || "delete_roles";
        let whitelistCheck = protectiondb.get(`whiteList_${channel.guild.id}_${channel.id}`) || [];
        let logID = protectiondb.get(`protectionLog_${channel.guild.id}`) || null;

        const logChannel = logID ? channel.guild.channels.cache.get(logID) : null;

        // Log whitelisted actions
        if (whitelistCheck && (whitelistCheck.includes("delete_channel") || whitelistCheck.includes("all"))) {
          if (logChannel) {
            const embed = new EmbedBuilder()
              .setColor("Red")
              .setThumbnail(info.executor.avatarURL({ dynamic: true }))
              .setAuthor({ name: info.executor.username, iconURL: info.executor.avatarURL({ dynamic: true }) })
              .setFooter({ text: "Whitelisted Action", iconURL: info.executor.avatarURL({ dynamic: true }) })
              .setTimestamp()
              .setDescription(`**Channel Deleted:** ${channel.name} \n **Author:** ${info.executor} \n **Action:** whitelisted`);
            logChannel.send({ embeds: [embed] });
          }
        } else {
          // Log unauthorized actions
          let userData = protectiondb.get(`protectionData_delete_channel_${channel.guild.id}_${info.executor.id}`) || 0;
          let timeLeft = limit - userData;

          if (logChannel) {
            const embed = new EmbedBuilder()
              .setColor("Red")
              .setThumbnail(info.executor.avatarURL({ dynamic: true }))
              .setAuthor({ name: info.executor.username, iconURL: info.executor.avatarURL({ dynamic: true }) })
              .setFooter({ text: "Unauthorized Action", iconURL: info.executor.avatarURL({ dynamic: true }) })
              .setTimestamp()
              .setDescription(`**Channel Deleted:** ${channel.name} \n **Author:** ${info.executor} \n **Action:** unauthorized \n **Remaining Attempts:** ${timeLeft}`);
            logChannel.send({ embeds: [embed] });
          }

          const endTime = moment().add(20, 'minutes').format('YYYY-MM-DD HH:mm:ss');
          protectiondb.set(`protectionData_delete_channel_${channel.guild.id}_${info.executor.id}`, userData + 1).then(() => {
            protectiondb.push(`protectionTimer_${channel.guild.id}`, {
              ID: info.executor.id,
              action: 'delete_channel',
              Time: endTime,
              server: channel.guild.id,
              Number: userData
            });
          });

          // Take action if limit reached
          if (userData >= limit) {
            const user = channel.guild.members.cache.get(info.executor.id);
            let done = false;

            if (automode === 'delete_roles' && user) {
              const roles = user.roles.cache;
              for (const role of roles.values()) {
                await user.roles.remove(role).catch(console.error);
              }
              done = true;
            } else if (automode === 'kick' && user) {
              await user.kick().catch(console.error);
              done = true;
            } else if (automode === 'ban' && user) {
              await user.ban().catch(console.error);
              done = true;
            }

            // Notify server owner
            const serverOwner = channel.guild.members.cache.get(channel.guild.ownerId);
            setTimeout(() => {
              if (serverOwner && done) {
                const embed = new EmbedBuilder()
                  .setColor("Green")
                  .setFooter({ text: "Managed by the bot" })
                  .setTimestamp()
                  .setDescription(`**Action Taken:** \n **Owner:** ${serverOwner} \n **Server:** ${channel.guild.name} \n **Author:** ${info.executor} \n **Author ID:** ${info.executor.id} \n **Action:** Deleting Channel`);
                serverOwner.send({ embeds: [embed] });
              }
            }, 1000);
          }
        }
      }
    });
  },
};
