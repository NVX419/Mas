const { Events, EmbedBuilder } = require('discord.js');
const { Database } = require('st.db');
const moment = require('moment');

const protectiondb = new Database("/Database/Protection");

module.exports = {
  name: Events.ChannelCreate,
  execute(channel) {
    const guild = channel.guild;
    guild.fetchAuditLogs({ action: 10, limit: 1 }).then(async (audit) => {
        const info = audit.entries.first();
        if (info.action === 10 && info.target?.id === channel.id && info.executor) {
            if (info.executor?.id === channel.client.user?.id || info.executor?.id === guild.ownerId) return;
            let limit = protectiondb.get("actionLimit_" + "create_channel_" + guild.id) || 5;
            let automode = protectiondb.get("autoMode_" + "create_channel_" + guild.id) || "delete_roles";
            let whitelistCheck = protectiondb.get("whiteList_" + guild.id + "_" + channel.id) || [];
            let logID = protectiondb.get("protectionLog_" + guild.id) || null;

            if (whitelistCheck && (whitelistCheck.includes("create_channel") || whitelistCheck.includes("all"))) {
                if (logID) {
                    let log = guild.channels.cache.get(logID);
                    if (log) {
                      let embed = new EmbedBuilder()
                      .setColor("Red")
                      .setThumbnail(channel.user?.avatarURL({ dynamic: true }))
                      .setAuthor({ name: channel.user?.username, iconURL: channel.user?.avatarURL({ dynamic: true }) })
                      .setFooter({ iconURL: info.executor.avatarURL({ dynamic: true }), text: info.executor.username })
                      .setTimestamp()
                      .setDescription(`**Channel Created:** ${channel.name} \n **Author:** ${info.executor} \n **Action:** whitelisted`);
                      log.send({embeds: [embed]});
                    }
                }
            } else {
                let userData = protectiondb.get("protectionData_" + "create_channel_" + guild.id + "_" + info.executor.id) || 0;
                let timeLeft = limit - userData;

                if (logID) {
                    let log = guild.channels.cache.get(logID);
                    if (log) {
                        let embed = new EmbedBuilder()
                        .setColor("Red")
                        .setThumbnail(channel.user?.avatarURL({ dynamic: true }))
                        .setAuthor({ name: channel.user?.username, iconURL: channel.user?.avatarURL({ dynamic: true }) })
                        .setFooter({ iconURL: info.executor.avatarURL({ dynamic: true }), text: info.executor.username })
                        .setTimestamp()
                        .setDescription(`**Channel Created:** ${channel.name} \n **Author:** ${info.executor} \n **Action:** unauthorized \n **Remaining Attempts:** ${timeLeft}`);
                        log.send({embeds: [embed]});
                    }
                }
                
                const endTime = moment().add(20, 'minutes').format('YYYY-MM-DD HH:mm:ss');
                protectiondb.set("protectionData_" + "create_channel_" + guild.id + "_" + info.executor.id, userData + 1).then(() => {
                    protectiondb.push(`protectionTimer_${guild.id}`, {
                        ID: info.executor.id,
                        action: 'create_channel',
                        Time: endTime,
                        server: guild.id,
                        Number: userData
                    });
                });

                if (userData >= limit) {
                    let done = false;
                    if (automode === 'delete_roles') {
                        const user = guild.members.cache.get(info.executor.id);
                        if (user) {
                            user.roles.cache.forEach(async r => {
                                await user.roles.remove(r).then(() => {
                                    done = true;
                                }).catch(err => { });
                            });
                        }
                    } else if (automode === 'kick') {
                        const user = guild.members.cache.get(info.executor.id);
                        user.kick().then(() => {
                            done = true;
                        }).catch(err => { });
                    } else if (automode === 'ban') {
                        const user = guild.members.cache.get(info.executor.id);
                        user.ban().then(() => {
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
                            .setDescription(`**Action Taken:** \n **Owner:** ${serverOwner} \n **Server:** ${guild.name} \n **Author:** ${info.executor} \n **Author ID:** ${info.executor.id} \n **Action:** Creating Channel`);
                            serverOwner.send({embeds: [embed]});
                        }
                    }, 1000);
                }
            }
        }
    });
  },
};
