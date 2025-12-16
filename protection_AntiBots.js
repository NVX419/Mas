const { Events, EmbedBuilder } = require('discord.js');
const { Database } = require('st.db');

const protectiondb = new Database("/Database/Protection");

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    // Anti-bots
    client.on(Events.ClientReady, async (client) => {
      const { inviteTracker } = require("discord-inviter"),
        tracker = new inviteTracker(client);
        
      tracker.on("guildMemberAdd", async (member, inviter, invite, error) => {
        let inviterUser;
        if (member?.user?.id == inviter?.id) inviterUser = null;
        inviterUser = inviter;

        if (member.user.bot) {
          if (inviter.id == client.user.id || inviter.id == member?.guild?.ownerId) {
            // Do nothing if the inviter is the bot or the server owner
          } else {
            let status = protectiondb.get("antiBots_" + member.guild.id) || "on";
            if (status == "on") {
              member.kick().catch(err => { });
            }

            let limit = protectiondb.get("actionLimit_" + "add_bots_" + member?.guild?.id) || 3;
            let automode = protectiondb.get("autoMode_" + "add_bots_" + member?.guild?.id) || "delete_roles";
            let whitelistCheck = protectiondb.get("whiteList_" + member?.guild?.id) || [];
            let logID = protectiondb.get("protectionLog_" + member?.guild?.id) || null;

            if (whitelistCheck && (whitelistCheck.includes("add_bots") || whitelistCheck.includes("all"))) {
              if (logID) {
                let log = member?.guild?.channels.cache.get(logID);
                if (log) {
                  let embed = new EmbedBuilder()
                    .setColor("Red")
                    .setThumbnail(member.user.avatarURL({ dynamic: true }))
                    .setAuthor({ name: member.user.username, iconURL: member.user.avatarURL({ dynamic: true }) })
                    .setFooter({ iconURL: inviter.avatarURL({ dynamic: true }), text: inviter.username })
                    .setTimestamp()
                    .setDescription(`**دخل بوت:** ${member.user} \n **المدعو:** ${inviterUser} \n **القائمة البيضاء:** نعم`);
                  log.send({ embeds: [embed] });
                }
              }
            } else {
              let userData = protectiondb.get("protectionData_" + "add_bots_" + member?.guild?.id + "_" + inviter.id) || 0;
              let timeLeft = limit - userData;

              if (logID) {
                let log = member?.guild?.channels.cache.get(logID);
                if (log) {
                  let embed = new EmbedBuilder()
                    .setColor("Red")
                    .setThumbnail(member.user.avatarURL({ dynamic: true }))
                    .setAuthor({ name: member.user.username, iconURL: member.user.avatarURL({ dynamic: true }) })
                    .setFooter({ iconURL: inviter.avatarURL({ dynamic: true }), text: inviter.username })
                    .setTimestamp()
                    .setDescription(`**اليوزر:** ${member.user} \n **المدعو:** ${inviter} \n **القرار:** اضاف \n **باقي اجراءات للاتخاذ:** ${timeLeft}`);
                  log.send({ embeds: [embed] });
                }
              }
              
              protectiondb.set("protectionData_" + "add_bots_" + member?.guild?.id + "_" + inviter.id, userData + 1);

              if (userData >= limit) {
                let done = false;
                const user = member?.guild?.members.cache.get(inviter.id);
                
                if (automode === 'delete_roles' && user) {
                  user.roles.cache.forEach(async r => {
                    await user.roles.remove(r).then(() => {
                      done = true;
                    }).catch(err => { });
                  });
                } else if (automode === 'kick' && user) {
                  user.kick().then(() => {
                    done = true;
                  }).catch(err => { });
                } else if (automode === 'ban' && user) {
                  user.ban().then(() => {
                    done = true;
                  }).catch(err => { });
                }

                let serverOwner = member?.guild?.members.cache.get(member?.guild?.ownerId);
                setTimeout(() => {
                  if (serverOwner && done == true) {
                    let embed = new EmbedBuilder()
                      .setColor("Green")
                      .setFooter({ text: "Powered by Your Bot" })
                      .setTimestamp()
                      .setDescription(`**تم الاجراء:** \n **الاونر:** ${serverOwner} \n **العضو:** ${member?.guild?.name} \n **المدعو:** ${inviter} \n **ايدي اليوزر:** ${inviter.id} \n **الاجراء:** اضافة بوت`);
                    serverOwner.send({ embeds: [embed] });
                  }
                }, 1000);
              }
            }
          }
        }
      });
    });
  },
};
