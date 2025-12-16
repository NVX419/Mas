console.clear();
const { Client, Collection, GatewayIntentBits, Partials, REST, Routes, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder, Events, PermissionsBitField, ChannelType, ModalBuilder, TextInputBuilder, TextInputStyle, createCanvas, loadImage, InteractionType } = require("discord.js");
const mongoose = require('mongoose');
const { readdirSync } = require("fs");
const ascii = require('ascii-table');
const { token, prefix } = require('./config.json');
const { EventEmitter } = require('events');
const { Database } = require("st.db");
const discordTranscripts = require('discord-html-transcripts');
const CountingSchema = require('./Schemas/CountingSchema.js');
const BlacklistSchema = require('./Schemas/BlacklistSchema');
const db = new Database("/Database/Ticket");
const path = require("path");
const axios = require("axios");
const db2 = new Database("./Database/ChannelConfig"); 
let afkSchema = require("./Schemas/afkSchema.js");
const shortcutDB = new Database("./Database/ShortcutConfig"); 
const EmojiChannel = require('./Schemas/EmojiChannelSchema.js'); 
const badWordsDB = new Database("./Database/badwords.json");
const autoRoleDB = new Database("./Database/autorole.json");
const calculatorDB = new Database("./Database/calculator.json");
const fontChannelDB = new Database("./Database/fontChannels.json");
const DecorativeFont = require("decorative-fonts.js");
const autoReactDB = new Database("./Database/autoreact.json");
const tempVoiceDB = new Database("./Database/tempvoice.json");
const logsDB = new Database("./Database/logs.json");
const InvitesSchema = require('./Schemas/InvitesSchema');
const feedbackDB = new Database("./Database/feedback.json");
const Level = require('./Schemas/LevelSchema');
const levelDB = new Database("./Database/levels.json");
const canvasDB = new Database("./Database/canvas.json");


const emitter = new EventEmitter();
emitter.setMaxListeners(999);

const client = new Client({
  intents: Object.keys(GatewayIntentBits),
  shards: "auto",
  partials: Object.keys(Partials)
});

client.login(token);

client.slashcommands = new Collection();
client.commandaliases = new Collection();
const rest = new REST({ version: '10' }).setToken(token);


client.on("ready", async () => {
  try {
      await rest.put(Routes.applicationCommands(client.user.id), { body: slashcommands });
      const table = new ascii();
      const totalCommands = slashcommands.length;
      table.addRow(`${totalCommands} </> Slash Commands`);
      console.log(table.toString());
  } catch (error) {
      console.error(error);
  }
});;

const fs = require("fs");

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});


client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: "حدث خطأ أثناء تنفيذ الأمر.", ephemeral: true });
  }
});

client.on("messageCreate", async message => {
    if (message.content.startsWith('$font')) {
      let words = message.content.split(" ").slice(1).join(" ");
      let words2 = words.replaceAll("a", "𝐚").replaceAll("A", "𝐀").replaceAll("b", "𝐛").replaceAll("B", "𝐁").replaceAll('c', "𝐜").replaceAll("C", "𝐂").replaceAll("d", "𝐝").replaceAll("D", "𝐃").replaceAll("e", "𝐞").replaceAll("E", "𝐄").replaceAll("f", "𝐟").replaceAll("F", "𝐅").replaceAll("g", "𝐠").replaceAll("G", "𝐆").replaceAll("h", "𝐡").replaceAll("H", "𝐇").replaceAll("i", "𝐢").replaceAll("I", "𝐈").replaceAll("j", "𝐣").replaceAll("J", "𝐉").replaceAll("k", "𝐤").replaceAll("K", "𝐊").replaceAll("l", "𝐥").replaceAll("L", "𝐋").replaceAll("m", "𝐦").replaceAll("M", "𝐌").replaceAll("n", "𝐧").replaceAll("N", "𝐍").replaceAll("o", "𝐨").replaceAll("O", "𝐎").replaceAll("p", "𝐩").replaceAll("P", "𝐏").replaceAll("q", "𝐪").replaceAll("Q", "𝐐").replaceAll("r", "𝐫").replaceAll("R", "𝐑").replaceAll("s", "𝐬").replaceAll("S", "𝐒").replaceAll("t", "𝐭").replaceAll("T", "𝐓").replaceAll("u", "𝐮").replaceAll("U", "𝐔").replaceAll("v", "𝐯").replaceAll("V", "𝐕").replaceAll("w", "𝐰").replaceAll("W", "𝐖").replaceAll("x", "𝐱").replaceAll("X", "𝐗").replaceAll("y", "𝐲").replaceAll("Y", "𝐘").replaceAll("z", "𝐳").replaceAll("Z", "𝐙").replaceAll("1","𝟏").replaceAll("2","𝟐").replaceAll("3","𝟑").replaceAll("4","𝟒").replaceAll("5","𝟓").replaceAll("6","𝟔").replaceAll("7","𝟕").replaceAll("8","𝟖").replaceAll("9","𝟗").replaceAll("0","𝟎")
      if (!words) return message.channel.send('>  Please Write a Word ❌ !')
      message.reply(`${words2}`);
    }
    
    if (message.content.startsWith('$delete')) {
       
        if (!message.channel.name.startsWith('ticket-')) {
            return message.reply('This command can only be used in ticket channels.');
        }

       
        let ticketData = db2.get("ticketData_" + message.guild.id + "_" + message.channel.id);
        if (!ticketData) {
            return message.reply({ content: 'No ticket data found!', ephemeral: true });
        }

        
        const author = await message.guild.members.fetch(message.author.id);

        const hasRole = author.roles.cache.some(role => role.id === ticketData.support_role);
        if (!hasRole) {
            return message.reply({ content: 'You do not have the required role to delete this ticket!', ephemeral: true });
        }

       
        const TranChannelID = db.get(`tranScript_${message.guild.id}`);
        const TranChannel = message.guild.channels.cache.get(TranChannelID) || await message.guild.channels.fetch(TranChannelID).catch();

        if (!TranChannel) {
            return message.reply('Transcript channel not found.');
        }

       
        const embedStart = new EmbedBuilder().setColor("#FFFF00").setDescription('جاري إنشاء ...');
        const sentMessage = await message.channel.send({ embeds: [embedStart] });

        try {
            const attachment = await discordTranscripts.createTranscript(message.channel, {
                returnType: 'attachment',
                filename: `${message.channel.name}.html`,
                saveImages: true,
            });

            const embedComplete = new EmbedBuilder()
                .setColor("#8D33FF")
                .setTitle('Transcript Ready')
                .setDescription('لقد تم إنشاء النص بنجاح.')
                .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
                .setTimestamp();

            const actionRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Link)
                    .setURL(`https://mahto.id/chat-exporter?url=${attachment.url}`)
                    .setLabel('View Transcript')
            );

            await TranChannel.send({ embeds: [embedComplete], components: [actionRow] });
            await sentMessage.edit({ embeds: [embedComplete] });

            
            const deleteEmbed = new EmbedBuilder()
                .setColor("#FF0000")
                .setDescription("سيتم حذف التذكرة خلال 10 ثواني...");

            await message.channel.send({ embeds: [deleteEmbed] });
            setTimeout(async () => {
                await message.channel.delete();
            }, 10000);

        } catch (error) {
            console.error(error);
            await message.reply('حدث خطأ أثناء إنشاء النسخة .');
        }
    }
});    





const slashcommands = [];
const slashTable = new ascii('SlashCommands').setJustify();

readdirSync('./SlashCommands/')
  .filter(folder => !folder.includes('.'))
  .forEach(folder => {
    readdirSync(`./SlashCommands/${folder}`)
      .filter(file => file.endsWith('.js'))
      .forEach(file => {
        const command = require(`./SlashCommands/${folder}/${file}`);
        if (command) {
          slashcommands.push(command.data.toJSON());
          client.slashcommands.set(command.data.name, command);
          slashTable.addRow(`/${command.data.name}`, '🟢 Working');
        }
      });
  });

console.log(slashTable.toString());


['Events', 'Rows'].forEach(category => {
  readdirSync(`./${category}/`)
      .filter(folder => !folder.includes('.'))
      .forEach(folder => {
          readdirSync(`./${category}/${folder}`)
              .filter(file => file.endsWith('.js'))
              .forEach(file => {
                  const event = require(`./${category}/${folder}/${file}`);
                  if (event.once) {
                      client.once(event.name, (...args) => event.execute(...args));
                  } else {
                      client.on(event.name, (...args) => event.execute(...args));
                  }
              });
      });

  readdirSync(`./${category}/`)
      .filter(file => file.endsWith('.js'))
      .forEach(file => {
          require(`./${category}/${file}`);
      });
});


client.commands = new Collection()
const commands = []; 

const table2 = new ascii('Prefix Commands').setJustify();
for (let folder of readdirSync('./Commands/').filter(folder => !folder.includes('.'))) {
  for (let file of readdirSync('./Commands/' + folder).filter(f => f.endsWith('.js'))) {
	  let command = require(`./Commands/${folder}/${file}`);
	  if(command) {
		commands.push(command);
  client.commands.set(command.name, command);
		  if(command.name) {
			  table2.addRow(`${command.name}` , '🟢 Working')
		  }
		  if(!command.name) {
			  table2.addRow(`${command.name}` , '🔴 Not Working')
		  }
	  }
  }
}
console.log(table2.toString())


mongoose.connect("رابط المونجو", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('🚀 MongoDB Connection: SUCCESS');
  console.log('🔗 Connected to MongoDB Database');
}).catch(err => console.error('❌ MongoDB Connection: FAILED\n', err));


client.on('interactionCreate', async(interaction) => {
    if (!interaction.isStringSelectMenu() || interaction.customId !== 'help_menu') return;

    try {

        if (!interaction.deferred && !interaction.replied) {
            await interaction.deferUpdate();
        }

        const selectedOption = interaction.values[0];
        let responseContent = '';

        switch (selectedOption) {
            case 'owner_commands':
                responseContent = `**> اوامر الاونر:

\`*\` /bot-cotrol
\`*\` /join-voice 
\`*\` /cmd-shortcut 
\`*\` /calculator setchannel
\`*\` /calculator removechannel
\`*\` /create-room
\`*\` /change-server name
\`*\` /change-server avatar
\`*\` /change-server banner
\`*\` /fonts setchannel
\`*\` /fonts removechannel

**`;
                break;
            case 'admin_commands':
                responseContent = ` ** > الاوامر الادارية: 

\`*\` ${prefix}unban
\`*\` ${prefix}come 
\`*\` ${prefix}clear 
\`*\` ${prefix}say 
\`*\` ${prefix}ban 
\`*\` ${prefix}user 
\`*\` ${prefix}avatar
\`*\` ${prefix}lock
\`*\` ${prefix}unlock
\`*\` ${prefix}hide
\`*\` ${prefix}unhide
\`*\` ${prefix}server
\`*\` ${prefix}hide-all
\`*\` ${prefix}unhide-all
\`*\` ${prefix}lock-all
\`*\` ${prefix}unlock-all
\`*\` ${prefix}unban-all
-----------------------------------------
\`*\` /ban
\`*\` /ban-list
\`*\` /embed send
\`*\` /embed edit
\`*\` /category hide
\`*\` /category unhide
\`*\` /category hidechannel
\`*\` /category unhidechannel
\`*\` /category delete
\`*\` /kick
\`*\` /lock
\`*\` /unlock
\`*\` /mute
\`*\` /unmute
\`*\` /mute list
\`*\` /say
\`*\` /slowmode set
\`*\` /slowmode list
\`*\` /timeout add
\`*\` /timeout remove
\`*\` /timeout list
\`*\` /unban-all
\`*\` /voice-move all
\`*\` /voice-move user
\`*\` /warn add
\`*\` /warn remove
\`*\` /warn list
**`;
                break;
            case 'public_commands':
                responseContent = `**> الاوامر العامة:
\`*\` ${prefix}avatar 
\`*\` /avatar 
\`*\` /avatar-server 
\`*\` /afk 
\`*\` /big-name 
\`*\` /bot-invite 
\`*\` ${prefix}fonts
**`
;
                break;
                case 'giveaway_commands':
                responseContent = `**> اوامر القيف اوي:
\`*\` ${prefix}drop 
\`*\` /g-start 
\`*\` /g-roll 
\`*\` /g-end **`;
                break;
                 case 'ticket_commands':
                responseContent = `**> اوامر التكت :

\`*\` /ticket-setup
\`*\` /ticket-manage
\`*\` /transcrip-setup
\`*\` /rename
\`*\` /add
\`*\` /remove
\`*\` ${prefix}delete
**`;

                         break;
                 case 'invites_commands':
                responseContent = `**> اوامر نظام الانفايت :

\`*\` /invites check
\`*\` /invites add
\`*\` /invites channel
\`*\` /invites remove-channel
\`*\` /invites reset-all
\`*\` /invites reset-user**`;

                       break;
                 case 'bad_commands':
           responseContent = `**> اوامر نظام الكلمات المسيئة :

\`*\` /bad-word add 
\`*\` /bad-word remove 
\`*\` /bad-word list **`;

                     break;
               case 'emoji_commands':
               responseContent = `**> اوامر نظام الايموجيات  :
\`*\` ${prefix}add-emoji
\`*\` /add-sticker
\`*\` /add-emoji  
\`*\` /emoji-channel set 
\`*\` /emoji-channel remove **`;

                      break;
                      case 'reply_commands':
                     responseContent = `**> اوامر نظام الرد التلقائي  :
\`*\` /autorelpy add
\`*\` /autoreply remove
\`*\` /autorelpy list
**`;

                        break;
                case 'react_commands':
         responseContent = `**> اوامر نظام اوتو رياكشن :

\`*\` /autoreact setchannel
\`*\` /autoreact removechannel
\`*\` /autoreact list
**`;

                              break;
                          case 'feedback_commands':
                    responseContent = `**> اوامر نظام الفيدباك :

\`*\` /feedback-room
\`*\` /remove-feedback
\`*\` /feedback-mode
\`*\` /feedback-line
**`;

                        break;
                       case 'temp_commands':
                     responseContent = `**> اوامر نظام تحكم رومات صوتية :

\`*\` /temp-voice setup
\`*\` /temp-voice disable
\`*\` /temp-voice panel
\`*\` ${prefix}temp
**`;

                        break;
                    case 'welcome_commands':
                 responseContent = `**> اوامر نظام الترحيب :

\`*\` /auto-role add
\`*\` /auto-role remove
\`*\` /auto-role list
**`;

                           break;
                          case 'webhook_commands':
                          responseContent = `**> اوامر نظام ويبهوك :

\`*\` /webhook create
\`*\` /webhook delete
\`*\` /webhook list
\`*\` /webhook deleteall
**`;

                           break;
                        case 'count_commands':
                       responseContent = `**> اوامر نظام العد :

\`*\` /counting setup
\`*\` /counting top
\`*\` /counting leaderboard
\`*\` /counting remove
\`*\` /counting reset
\`*\` /counting emoji
**`;

                                 break;
                           case 'security_commands':
                 responseContent = `**> اوامر نظام الحماية :

\`*\` /security antilinks
\`*\` /security antidelete-channels
\`*\` /security antidelete-roles
\`*\` /security antidelete-categories
\`*\` /security antiban
\`*\` /security antikick
\`*\` /security whitelist
**`;

                                 break;
                         case 'logs_commands':
                   responseContent = `**> اوامر نظام اللوق :

\`*\` /setup-logs create
\`*\` /setup-logs delete
**`;

                             break;
                       case 'black_commands':
                    responseContent = `**> اوامر نظام بلاك ليست :

\`*\` /blacklist setup
\`*\` /blacklist add
\`*\` /blacklist remove
**`;

                             break;
                           case 'level_commands':
                    responseContent = `**> اوامر نظام المستوى :

\`*\` /level setup
\`*\` /level add
\`*\` /level remove
\`*\` /level reset
\`*\` /level channel
\`*\` /level requirements
\`*\` ${prefix}profile
**`;

                     break;
                    case 'roles_commands':
                responseContent = `**> اوامر نظام الرولات :

\`*\` /color-roles create
\`*\` /color-roles panel
\`*\` /color-roles delete
\`*\` /role create
\`*\` /role rename
\`*\` /temp-role
\`*\` /role multiple
\`*\` /role user
\`*\` /role remove_user

**`;
        }


        await interaction.followUp({ content: responseContent, ephemeral: true }).catch(console.error);
    } catch (error) {
        console.error("Error handling select menu interaction:", error);
    }
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;
  const check = await afkSchema.findOne({
      Guild: message.guild.id,
      User: message.author.id,
  });
  if (check) {
      await afkSchema.deleteMany({
          Guild: message.guild.id,
          User: message.author.id,
      });
      const m1 = await message.reply({
          content: `Welcome back, ${message.author}! I have removed your AFK.`,
      });
  } else {
      const members = message.mentions.users.first();
      if (!members) return;
      const Data = await afkSchema.findOne({
          Guild: message.guild.id,
          User: members.id,
      });
      if (!Data) return;

      const member = message.guild.members.cache.get(members.id);
      const msg = Data.Message || "I'm AFK!";
      if (message.content.includes(members)) {
          const m = await message.reply({
              content: `${member.user.tag} is currently AFK! - Reason: **${msg}**`,
          });
      }
  }
});


const AutoReply = require('./Schemas/AutoReply.js'); 

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;

   
    const autoReplies = await AutoReply.find({ Guild: message.guild.id });

    for (const autoReply of autoReplies) {
        if (autoReply.Search && message.content.includes(autoReply.Message)) {
            
            if (autoReply.Type === 'reply') {
                return message.reply(autoReply.Reply);
            } else if (autoReply.Type === 'send') {
                return message.channel.send(autoReply.Reply);
            }
        } else if (!autoReply.Search && message.content === autoReply.Message) {
           
            if (autoReply.Type === 'reply') {
                return message.reply(autoReply.Reply);
            } else if (autoReply.Type === 'send') {
                return message.channel.send(autoReply.Reply);
            }
        }
    }
});


client.on('messageCreate', async message => {
  const cmd = shortcutDB.get(`clear_cmd_${message.guild.id}`) || null;
    if (message.author.bot) return;
    if (message.content.startsWith(`${prefix}clear`) || message.content.startsWith(`${cmd}`)) {
     if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return;
        const args = message.content.split(' ').slice(1);
        const amount = args[0] ? parseInt(args[0]) : 99;
        if (isNaN(amount) || amount <= 0 || amount > 100) return;
        try {
            const fetchedMessages = await message.channel.messages.fetch({ limit: amount });
            const messagesToDelete = fetchedMessages.filter(msg => {
                const fourteenDays = 14 * 24 * 60 * 60 * 1000;
                return (Date.now() - msg.createdTimestamp) < fourteenDays;
            });
            await message.channel.bulkDelete(messagesToDelete);
        } catch (error) {
        }
    }
});

client.on('messageCreate', async message => {
const cmd = await shortcutDB.get(`come_cmd_${message.guild.id}`) || null;  
    if (message.content.startsWith(`${prefix}come`) || message.content.startsWith(`${cmd}`)) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return message.reply('يجب أن تملك صلاحية إدارة الرسائل (MANAGE_MESSAGES).');
        }

        const mentionOrID = message.content.split(/\s+/)[1];
        const targetMember = message.mentions.members.first() || message.guild.members.cache.get(mentionOrID);

        if (!targetMember) {
            return message.reply('من فضلك قم بعمل منشن لشخص أو ضع الإيدي.');
        }

        const directMessageContent = `**تم استدعائك بواسطة : ${message.author}\nفي : ${message.channel}**`;

        try {
            await targetMember.send(directMessageContent);
            await message.reply('**تم الارسال للشخص بنجاح**');
        } catch (error) {
            await message.reply('**لم استطع الارسال للشخص**');
        }
    }
});

client.on("messageCreate", async (message) => {
  const cmd = await shortcutDB.get(`lock_cmd_${message.guild.id}`) || null;
  
  if (message.content === `${prefix}lock` || message.content === `${cmd}`) {
    try {
      if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
        return message.reply({ content: `**لا تمتلك صلاحية لفعل ذلك**` });
      }
      await message.channel.permissionOverwrites.edit(
        message.channel.guild.roles.everyone, 
        { SendMessages: false }
      );
      return message.reply({ content: `**${message.channel} has been locked**` });
    } catch (error) {
      message.reply({ content: `لقد حدث خطأ، اتصل بالمطورين.` });
      console.log(error);
    }
  }
});


client.on("messageCreate", async (message) => {
const cmd = await shortcutDB.get(`unlock_cmd_${message.guild.id}`) || null;  
  if (message.content === `${prefix}unlock` || message.content === `${cmd}`) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return message.reply({ content: `**لا تمتلك صلاحية لفعل ذلك**` });
    }
      await message.channel.permissionOverwrites.edit(
      message.channel.guild.roles.everyone, 
      { SendMessages: true }
    );
    return message.reply({ content: `**${message.channel} has been unlocked**` });
  }
});

client.on("messageCreate", async (message) => {
const cmd = await shortcutDB.get(`hide_cmd_${message.guild.id}`) || null;  
  if (message.content === `${prefix}hide` || message.content === `${cmd}`) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return message.reply({ content: `**لا تمتلك صلاحية لفعل ذلك**` });
    }
      await message.channel.permissionOverwrites.edit(
      message.channel.guild.roles.everyone, 
      { ViewChannel: false }
    );
    return message.reply({ content: `**${message.channel} has been hidden**` });
  }
});

client.on("messageCreate", async (message) => {
const cmd = await shortcutDB.get(`unhide_cmd_${message.guild.id}`) || null; 
  if (message.content === `${prefix}unhide` || message.content === `${cmd}`) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return message.reply({ content: `**لا تمتلك صلاحية لفعل ذلك**` });
    }
      await message.channel.permissionOverwrites.edit(
      message.channel.guild.roles.everyone, 
      { ViewChannel: true }
    );
    return message.reply({ content: `**${message.channel} has been unhidded**` });
  }
});

client.on("messageCreate", async (message) => {
const cmd = await shortcutDB.get(`server_cmd_${message.guild.id}`) || null;
  if (message.content === `${prefix}server` || message.content === `${cmd}`) {
    const embedser = new EmbedBuilder()
      .setAuthor({ name: message.guild.name, iconURL: message.guild.iconURL({ dynamic: true }) })
      .setColor('Random')
      .addFields(
        {
          name: `**🆔 Server ID:**`, 
          value: message.guild.id, 
          inline: false
        },
        {
          name: `**📆 Created On:**`, 
          value: `**<t:${parseInt(message.guild.createdTimestamp / 1000)}:R>**`, 
          inline: false
        },
        {
          name: `**👑 Owned By:**`, 
          value: `**<@${message.guild.ownerId}>**`, 
          inline: false
        },
        {
          name: `**👥 Members (${message.guild.memberCount})**`, 
          value: `**${message.guild.premiumSubscriptionCount} Boosts ✨**`, 
          inline: false
        },
        {
          name: `**💬 Channels (${message.guild.channels.cache.size})**`, 
          value: `**${message.guild.channels.cache.filter(r => r.type === ChannelType.GuildText).size}** Text | **${
              message.guild.channels.cache.filter(r => r.type === ChannelType.GuildVoice).size
            }** Voice | **${message.guild.channels.cache.filter(r => r.type === ChannelType.GuildCategory).size}** Category`,
          inline: false
        },
        {
          name: '🌍 Others',
          value: `**Verification Level:** ${message.guild.verificationLevel}`,
          inline: false
        }
      )
      .setThumbnail(message.guild.iconURL({ dynamic: true }));
    return message.reply({ embeds: [embedser] });
  }
});

client.on('messageCreate', async message => {
    const cmd = await shortcutDB.get(`ban_cmd_${message.guild.id}`) || null;
    if (message.content.startsWith(`${prefix}ban`) || message.content.startsWith(`${cmd}`)) {
        
        if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return message.reply('** لا تمتلك صلاحية باند**');
        }

        const args = message.content.split(' ');
        const targetUser = message.mentions.members.first() || 
            (args[1] ? await message.guild.members.fetch(args[1]).catch(() => null) : null);

        if (!targetUser) {
            return message.reply('** يرجى تحديد العضو المراد حظره ( منشن او ايدي )**');
        }

        if (!targetUser.bannable) {
            return message.reply('** لا يمكنني حظر هذا العضو**');
        }

        const reason = args.slice(2).join(' ') || 'لا يوجد سبب';

        try {
            // Send DM to user before banning
            try {
                await targetUser.send(`**تم حظرك من سيرفر ${message.guild.name}\nالسبب: ${reason}**`);
            } catch (err) {
                console.log(`Couldn't DM user ${targetUser.user.tag}`);
            }

            // Ban the user
            await targetUser.ban({ reason: reason });

            // Send confirmation
            await message.reply(`** تم حظر ${targetUser.user.tag}\nبواسطة: ${message.author.tag}\nالسبب: ${reason}**`);

        } catch (error) {
            console.error(error);
            message.reply('** حدث خطأ اثناء الحظر**');
        }
    }
});

    client.on('messageCreate', async message => {
        const cmd = await shortcutDB.get(`unban_cmd_${message.guild.id}`) || null;
        if (message.content.startsWith(`${prefix}unban`) || message.content.startsWith(`${cmd}`)) {
         
            if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
                return message.reply('** لا تمتلك صلاحية فك الباند**');
            }
    
           
            const userId = message.content.split(' ')[1];
            if (!userId) {
                return message.reply('** يرجى كتابة ايدي الشخص**');
            }
    
            try {
                
                const banList = await message.guild.bans.fetch();
                const bannedUser = banList.find(ban => ban.user.id === userId);
    
                if (!bannedUser) {
                    return message.reply('** هذا الشخص غير محظور**');
                }
    
             
                await message.guild.members.unban(userId);
                
                
                await message.reply(`** تم فك الحظر عن ${bannedUser.user.tag}**`);
    
            } catch (error) {
                console.error(error);
                message.reply('** حدث خطأ أثناء فك الحظر**');
            }
        }
    });


    client.on('messageCreate', async message => {
        const cmd = await shortcutDB.get(`user_cmd_${message.guild.id}`) || null;
        if (message.content.startsWith(`${prefix}user`) || message.content.startsWith(`${cmd}`)) {
            try {
                const member = message.mentions.members.first() 
                    || message.guild.members.cache.get(message.content.split(' ')[1]) 
                    || message.member;
    
                const joinPosition = Array.from(message.guild.members.cache
                    .sort((a, b) => a.joinedTimestamp - b.joinedTimestamp)
                    .keys())
                    .indexOf(member.id) + 1;
    
                const avatarURL = member.user.displayAvatarURL({ dynamic: true, size: 4096 });
    
                const embed = new EmbedBuilder()
                    .setAuthor({ 
                        name: member.user.tag, 
                        iconURL: avatarURL
                    })
                    .setColor('Random')
                    .setThumbnail(avatarURL)
                    .addFields(
                        { 
                            name: '👤 Account Info',
                            value: [
                                `**• Username:** ${member.user.username}`,
                                `**• Display Name:** ${member.displayName}`,
                                `**• ID:** ${member.id}`,
                                `**• Account Created:** <t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`
                            ].join('\n'),
                            inline: false
                        },
                        {
                            name: '📋 Member Info',
                            value: [
                                `**• Join Date:** <t:${Math.floor(member.joinedTimestamp / 1000)}:R>`,
                                `**• Join Position:** ${joinPosition}`,
                                `**• Nickname:** ${member.nickname || 'None'}`,
                                `**• Highest Role:** ${member.roles.highest}`,
                                `**• Roles [${member.roles.cache.size - 1}]:** ${member.roles.cache
                                    .filter(r => r.id !== message.guild.id)
                                    .map(r => `${r}`)
                                    .join(', ') || 'None'}`
                            ].join('\n'),
                            inline: false
                        }
                    )
                    .setFooter({ 
                        text: `Requested by ${message.author.tag}`, 
                        iconURL: message.author.displayAvatarURL({ dynamic: true }) 
                    })
                    .setTimestamp();
    
                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`copy_id_${member.id}`)
                            .setLabel('Copy ID')
                            .setStyle(ButtonStyle.Primary)
                            .setEmoji('📋')
                    );
    
                const response = await message.reply({
                    embeds: [embed],
                    components: [row]
                });
    
                const collector = response.createMessageComponentCollector({ time: 60000 });
    
                collector.on('collect', async i => {
                    if (i.customId === `copy_id_${member.id}`) {
                        await i.reply({
                            content: `\`${member.id}\``,
                            ephemeral: true
                        });
                    }
                });
    
                collector.on('end', () => {
                    row.components[0].setDisabled(true);
                    response.edit({ components: [row] }).catch(() => {});
                });
    
            } catch (error) {
                console.error(error);
                await message.reply('❌ An error occurred while fetching user information.');
            }
        }
    });


    
    
client.on('messageCreate', async message => {
  const cmd = await shortcutDB.get(`tax_cmd_${message.guild.id}`) || null; 
      if (message.content.startsWith(`${prefix}tax`) || message.content.startsWith(`${cmd}`)) {
          const args = message.content.startsWith(`${prefix}tax`) 
              ? message.content.slice(`${prefix}tax`.length).trim() 
              : message.content.slice(`${cmd}`.length).trim();
  
          let number = args;
          if (number.endsWith("k")) number = number.replace(/k/gi, "") * 1000;
          else if (number.endsWith("K")) number = number.replace(/K/gi, "") * 1000;
          else if (number.endsWith("m")) number = number.replace(/m/gi, "") * 1000000;
          else if (number.endsWith("M")) number = number.replace(/M/gi, "") * 1000000;
  
          let number2 = parseFloat(number);
  
          if (isNaN(number2)) {
              return message.reply('يرجى إدخال رقم صحيح بعد الأمر');
          }
  
          let tax = Math.floor(number2 * (20) / (19) + 1); 
          let tax2 = Math.floor(tax - number2); 
  
          await message.reply(`${tax}`);
      }
  });



function parseEmoji(emoji) {
  const match = emoji.match(/<?(a)?:?(\w{2,32}):(\d{17,19})>?/);
  if (!match) return null;

  return {
      animated: Boolean(match[1]),
      name: match[2],
      id: match[3],
  };
}

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return;

  
  const emojiChannelConfig = await EmojiChannel.findOne({ Guild: message.guild.id });
  if (!emojiChannelConfig || message.channel.id !== emojiChannelConfig.Channel) return;

 
  const emojisRaw = message.content.split(' ').map(emoji => emoji.trim());
  const addedEmojis = [];
  const failedEmojis = [];

 
  const isImage = (url) => {
      const extension = url.split('.').pop().toLowerCase();
      return ['png', 'jpg', 'jpeg', 'gif'].includes(extension);
  };

  for (const emojiRaw of emojisRaw) {
      let link;

      if (!isImage(emojiRaw)) {
          const emoteMatch = emojiRaw.match(/<?(a)?:?(\w{2,32}):(\d{17,19})>?/gi);
          if (emoteMatch) {
              const emote = emoteMatch[0];
              const parsedEmoji = parseEmoji(emote);
              link = `https://cdn.discordapp.com/emojis/${parsedEmoji.id}.${parsedEmoji.animated ? 'gif' : 'png'}`;
          } else {
              link = emojiRaw; 
          }
      } else {
          link = emojiRaw; 
      }

      const emojiName = `emoji_${Date.now()}`; 

      try {
          const emoji = await message.guild.emojis.create({ attachment: link, name: emojiName });
          addedEmojis.push(emoji);
      } catch (error) {
          console.error(error); 
          failedEmojis.push(emojiRaw);
      }
  }

  const responseMessage = [];
  if (addedEmojis.length) {
      responseMessage.push(`${addedEmojis.length} emojis added: ${addedEmojis.join(', ')}`);
  }
  if (failedEmojis.length) {
      responseMessage.push(`فشل في إضافة الرموز التعبيرية التالية: ${failedEmojis.join(', ')}`);
  }

  if (responseMessage.length) {
      await message.reply({ content: responseMessage.join('\n') });
  }
});


//////////////////// Channel ID


client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  
  if (message.content.startsWith(`${prefix}ch`)) {
      const mentionedChannel = message.mentions.channels.first();

      if (!mentionedChannel) {
          return message.reply('يرجى ذكر القناة للحصول على معرفها.');
      }

     
      return message.reply(`${mentionedChannel.id}`);
  }
});

///////////////// ID Members

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  
  if (message.content.startsWith(`${prefix}id`)) {
      const mentionedMember = message.mentions.members.first();

      if (!mentionedMember) {
          return message.reply('يرجى ذكر أحد الأعضاء للحصول على ID.');
      }

      
      return message.reply(`${mentionedMember.id}`);
  }
});

//////// afk prefix

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;


  const afkCheck = await afkSchema.findOne({
      Guild: message.guild.id,
      User: message.author.id
  });

  if (afkCheck) {
      await afkSchema.findOneAndDelete({
          Guild: message.guild.id,
          User: message.author.id
      });

      const welcomeBack = new EmbedBuilder()
          .setColor('Green')
          .setDescription(`Welcome back ${message.author}! I have removed your AFK status.`);

      message.reply({ embeds: [welcomeBack] }).then(msg => {
          setTimeout(() => msg.delete().catch(() => {}), 5000);
      });
  }

  
  const mentionedUsers = message.mentions.users;
  if (mentionedUsers.size > 0) {
      for (const [, mentionedUser] of mentionedUsers) {
          const afkUser = await affkSchema.findOne({
              Guild: message.guild.id,
              User: mentionedUser.id
          });

          if (afkUser) {
              const afkEmbed = new EmbedBuilder()
                  .setColor('Yellow')
                  .setTitle(`${mentionedUser.tag} is AFK`)
                  .addFields(
                      { name: 'Reason', value: afkUser.Message },
                      { name: 'Since', value: `<t:${Math.floor(afkUser.Time / 1000)}:R>` }
                  );

              message.reply({ embeds: [afkEmbed] });
          }
      }
  }
});


///// banner button 

client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;

  
  if (interaction.customId.startsWith('show_banner_')) {
      const userId = interaction.customId.split('_')[2]; 
      const user = await client.users.fetch(userId); 
      const bannerUrl = user.bannerURL({ dynamic: true, size: 1024 });

      if (bannerUrl) {
          const bannerEmbed = new EmbedBuilder()
              .setTitle(`${user.username}'s Banner`)
              .setImage(bannerUrl)
              .setColor('Random')
              .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) });

          await interaction.reply({ embeds: [bannerEmbed], ephemeral: true }); 
      } else {
          await interaction.reply({ content: 'هذا المستخدم ليس لديه بنر.', ephemeral: true });
      }
  }
});


client.on('messageCreate', async (message) => {
  if (!message.content.startsWith(`${prefix}avatar`) || message.author.bot) return;

  const user = message.mentions.users.first() || message.author;
  const member = message.guild.members.cache.get(user.id);
  const userDetails = await user.fetch();

  const avatarUrl = user.displayAvatarURL({ dynamic: true, size: 4096 });
  const bannerUrl = userDetails.bannerURL({ dynamic: true, size: 4096 });

  const embed = new EmbedBuilder()
      .setTitle(`${user.username}'s Information`)
      .setThumbnail(avatarUrl)
      .setColor('Random')
      .setTimestamp()
      .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) });

  const row = new ActionRowBuilder()
      .addComponents(
          new ButtonBuilder()
              .setCustomId('show_avatar')
              .setLabel('Avatar')
              .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
              .setCustomId('show_banner')
              .setLabel('Banner')
              .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
              .setCustomId('show_userid')
              .setLabel('ID')
              .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
              .setCustomId('show_serverid')
              .setLabel('Server ID')
              .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
              .setCustomId('show_invite')
              .setLabel('Server Link')
              .setStyle(ButtonStyle.Success)
      );

  const botMessage = await message.channel.send({ embeds: [embed], components: [row] });

  const collector = botMessage.createMessageComponentCollector({
      filter: (i) => i.user.id === message.author.id
  });

  collector.on('collect', async (interaction) => {
      const ephemeralEmbed = new EmbedBuilder()
          .setColor('Random')
          .setTimestamp()
          .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) });

      switch (interaction.customId) {
          case 'show_avatar':
              ephemeralEmbed
                  .setTitle(`${user.username}'s Avatar`)
                  .setImage(avatarUrl)
                  .setDescription(' User\'s Avatar');
              break;
          case 'show_banner':
              if (bannerUrl) {
                  ephemeralEmbed
                      .setTitle(`${user.username}'s Banner`)
                      .setImage(bannerUrl)
                      .setDescription('User\'s Banner');
              } else {
                  ephemeralEmbed
                      .setDescription('هذا المستخدم ليس لديه بنر.');
              }
              break;
          case 'show_userid':
              ephemeralEmbed
                  .setTitle('User ID')
                  .setDescription(`🆔 **${user.username}'s ID:** \`${user.id}\``);
              break;
          case 'show_serverid':
              ephemeralEmbed
                  .setTitle('Server ID')
                  .setDescription(`**Server ID:** \`${message.guild.id}\``);
              break;
          case 'show_invite':
              try {
                  const invite = await message.channel.createInvite({
                      maxAge: 0,
                      maxUses: 0
                  });
                  ephemeralEmbed
                      .setTitle('Server Invite')
                      .setDescription(`🔗 **Server Invite Link:** ${invite.url}`);
              } catch (error) {
                  ephemeralEmbed
                      .setDescription('فشل في إنشاء رابط الدعوة');
              }
              break;
      }

      
      await interaction.reply({ embeds: [ephemeralEmbed], ephemeral: true });
  });

  collector.on('error', (error) => console.error(error));
});



client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const badWords = badWordsDB.get(`badwords_${message.guild.id}`) || [];
  const content = message.content.toLowerCase();

  for (const badWord of badWords) {
      if (content.includes(badWord.word)) {
          try {
              
              await message.delete();

              
              await message.member.timeout(badWord.timeout * 1000, 'Bad word usage');

              
              const embed = new EmbedBuilder()
                  .setColor('Red')
                  .setTitle('**كلمة سيئة**')
                  .setDescription(`${message.author} has been timed out for ${badWord.timeout} seconds for using a bad word.`)
                  .setTimestamp();

              const warningMsg = await message.channel.send({ embeds: [embed] });
              
              
              setTimeout(() => warningMsg.delete().catch(() => {}), 5000);
              
              break; 
          } catch (error) {
              console.error('Error handling bad word:', error);
          }
      }
  }
});


/////// auto role


client.on('guildMemberAdd', async (member) => {
  try {
      const autoRoles = autoRoleDB.get(`autoroles_${member.guild.id}`) || [];
      
      if (autoRoles.length > 0) {
          for (const roleId of autoRoles) {
              const role = member.guild.roles.cache.get(roleId);
              if (role) {
                  await member.roles.add(role);
              }
          }
          
          
          const logChannel = member.guild.systemChannel;
          if (logChannel) {
              const embed = new EmbedBuilder()
                  .setColor('Green')
                  .setTitle('رتب تلقائية')
                  .setDescription(`auto roles to ${member.user.tag}`)
                  .setTimestamp();
              
              await logChannel.send({ embeds: [embed] });
          }
      }
  } catch (error) {
      console.error('Error assigning auto roles:', error);
  }
});


////// calc


client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const calculatorChannel = calculatorDB.get(`calculator_${message.guild.id}`);
  if (message.channel.id !== calculatorChannel) return;

 
  const mathRegex = /^\s*(-?\d+(?:\.\d+)?)\s*([-+*/])\s*(-?\d+(?:\.\d+)?)\s*$/;
  const match = message.content.match(mathRegex);

  if (match) {
      const [, num1Str, operator, num2Str] = match;
      const num1 = parseFloat(num1Str);
      const num2 = parseFloat(num2Str);

      let result;
      switch (operator) {
          case '+':
              result = num1 + num2;
              break;
          case '-':
              result = num1 - num2;
              break;
          case '*':
              result = num1 * num2;
              break;
          case '/':
              if (num2 === 0) {
                  return message.reply('لا يجوز القسمة على الصفر.');
              }
              result = num1 / num2;
              break;
      }

      message.reply({
          content: `🧮 **Result:**\n\`${num1} ${operator} ${num2} = ${result}\``,
      });
  }
});

///////// colors 


client.on('interactionCreate', async interaction => {
  if (!interaction.isStringSelectMenu() || interaction.customId !== 'color_roles') return;

  try {
      const selectedRoleId = interaction.values[0];
      const member = interaction.member;

      
      const colorRoles = interaction.guild.roles.cache.filter(role => 
          role.name.includes('❤️') || role.name.includes('💙') || 
          role.name.includes('💚') || role.name.includes('💛') || 
          role.name.includes('💜') || role.name.includes('🤎') ||
          role.name.includes('🧡') || role.name.includes('💗') ||
          role.name.includes('🤍') || role.name.includes('🖤') ||
          role.name.includes('💠') || role.name.includes('🔮') ||
          role.name.includes('🌺') || role.name.includes('🌸') ||
          role.name.includes('🍏')
      );

      await member.roles.remove(colorRoles);

      
      const selectedRole = interaction.guild.roles.cache.get(selectedRoleId);
      await member.roles.add(selectedRole);

      await interaction.reply({
          content: `**تم تغيير اللون الخاص بك بنجاح إلى ${selectedRole.name}!**`,
          ephemeral: true
      });
  } catch (error) {
      console.error(error);
      await interaction.reply({
          content: '**حدث خطأ أثناء تغيير اللون الخاص بك.**',
          ephemeral: true
      });
  }
});

/////// fonts

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const fontChannel = fontChannelDB.get(`fontchannel_${message.guild.id}`);
  if (message.channel.id !== fontChannel) return;

  const text = message.content;
  let response = '';

 
  response += `${DecorativeFont.serif(text)}\n`;
  response += `${DecorativeFont.Fraktur(text)}\n`;
  response += `${DecorativeFont.bold(text)}\n`;
  response += `${DecorativeFont.Italic(text)}\n`;
  response += `${DecorativeFont.MTBold(text)}\n`;
  response += `${DecorativeFont.Edwardian(text)}\n`;
  response += `${DecorativeFont.buckle(text)}`;

  await message.reply(response);
});


client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const emoji = autoReactDB.get(`autoreact_${message.guild.id}_${message.channel.id}`);
  if (!emoji) return;

  try {
      await message.react(emoji);
  } catch (error) {
      console.error('Error adding reaction:', error);
  }
});


//// temp voice

const tempChannels = new Map();



client.on('voiceStateUpdate', async (oldState, newState) => {
  try {
      const config = tempVoiceDB.get(`tempvoice_${newState.guild.id}`);
      if (!config) return;

      
      if (newState.channelId === config.joinChannelId) {
          const channel = await newState.guild.channels.create({
              name: `${newState.member.user.username}'s Channel`,
              type: ChannelType.GuildVoice,
              parent: config.categoryId,
              permissionOverwrites: [
                  {
                      id: newState.member.id,
                      allow: [PermissionsBitField.Flags.ManageChannels, PermissionsBitField.Flags.MoveMembers]
                  }
              ]
          });

          
          try {
              await newState.member.voice.setChannel(channel.id);
              tempChannels.set(channel.id, newState.member.id);
          } catch (moveError) {
              console.error('Error moving member to new channel:', moveError);
              
              await channel.delete().catch(console.error);
          }
      }

      
      if (oldState.channel && tempChannels.has(oldState.channelId)) {
          if (oldState.channel.members.size === 0) {
              tempChannels.delete(oldState.channelId);
              await oldState.channel.delete().catch(console.error);
          }
      }
  } catch (error) {
      console.error('Error in temporary voice system:', error);
  }
});


client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton() && !interaction.isModalSubmit()) return;

  try {
      if (interaction.isButton() && interaction.customId.startsWith('temp_')) {
          const member = interaction.member;
          const voiceChannel = member.voice.channel;

          if (!voiceChannel || !tempChannels.has(voiceChannel.id)) {
              return interaction.reply({
                  content: 'يجب أن تكون في قناتك الصوتية المؤقتة لاستخدام عناصر التحكم هذه!',
                  ephemeral: true
              });
          }

          if (tempChannels.get(voiceChannel.id) !== member.id) {
              return interaction.reply({
                  content: 'لا يمكن إلا لمالك القناة استخدام عناصر التحكم هذه!',
                  ephemeral: true
              });
          }

          switch (interaction.customId) {
              case 'temp_lock': {
                  const isLocked = voiceChannel.permissionsFor(interaction.guild.roles.everyone).has(PermissionsBitField.Flags.Connect);
                  await voiceChannel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                      Connect: !isLocked
                  });
                  await interaction.reply({
                      content: `🔒 Channel ${isLocked ? 'locked' : 'unlocked'}!`,
                      ephemeral: true
                  });
                  break;
              }

              case 'temp_limit': {
                  const modal = new ModalBuilder()
                      .setCustomId('temp_limit_modal')
                      .setTitle('تعيين حد الاعضاء');

                  const limitInput = new TextInputBuilder()
                      .setCustomId('limit_input')
                      .setLabel('أدخل حد (0-99)')
                      .setStyle(TextInputStyle.Short)
                      .setPlaceholder('Enter a number between 0 and 99')
                      .setMinLength(1)
                      .setMaxLength(2)
                      .setRequired(true);

                  modal.addComponents(new ActionRowBuilder().addComponents(limitInput));
                  await interaction.showModal(modal);
                  break;
              }

              case 'temp_rename': {
                  const modal = new ModalBuilder()
                      .setCustomId('temp_rename_modal')
                      .setTitle('إعادة تسمية القناة');

                  const nameInput = new TextInputBuilder()
                      .setCustomId('name_input')
                      .setLabel('أدخل اسم القناة الجديدة')
                      .setStyle(TextInputStyle.Short)
                      .setPlaceholder('Enter a new name for your channel')
                      .setMinLength(1)
                      .setMaxLength(32)
                      .setRequired(true);

                  modal.addComponents(new ActionRowBuilder().addComponents(nameInput));
                  await interaction.showModal(modal);
                  break;
              }
              case 'temp_claim': {
                const currentOwner = tempChannels.get(voiceChannel.id);
                const currentOwnerMember = await interaction.guild.members.fetch(currentOwner).catch(() => null);
                const claimingMember = interaction.member;
            
                
                const isOwnerInChannel = currentOwnerMember?.voice?.channel?.id === voiceChannel.id;
            
                
                if (!isOwnerInChannel) {
                    
                    if (claimingMember.voice.channel?.id === voiceChannel.id) {
                       
                        tempChannels.set(voiceChannel.id, claimingMember.id);
            
                       
                        await voiceChannel.permissionOverwrites.edit(claimingMember.id, {
                            ManageChannels: true,
                            MoveMembers: true,
                            Connect: true,
                            Speak: true
                        });
            
                        
                        if (currentOwner && currentOwner !== claimingMember.id) {
                            await voiceChannel.permissionOverwrites.edit(currentOwner, {
                                ManageChannels: false,
                                MoveMembers: false
                            });
                        }
            
                        
                        await voiceChannel.setName(`${claimingMember.user.username}'s Channel`);
            
                        await interaction.reply({
                            content: '👑 أنت الآن مالك القناة! تم تحديث القناة باسمك.',
                            ephemeral: true
                        });
                    } else {
                        await interaction.reply({
                            content: 'يجب أن تكون في قناة الصوت للمطالبة بالملكية!',
                            ephemeral: true
                        });
                    }
                } else {
                    await interaction.reply({
                        content: 'المالك الحالي لا يزال في القناة!',
                        ephemeral: true
                    });
                }
                break;
            }
              case 'temp_delete': {
                  await voiceChannel.delete();
                  tempChannels.delete(voiceChannel.id);
                  await interaction.reply({
                      content: 'تم حذف القناة!',
                      ephemeral: true
                  });
                  break;
              }
          }
      }

      
      if (interaction.isModalSubmit()) {
          const voiceChannel = interaction.member.voice.channel;

          if (!voiceChannel || !tempChannels.has(voiceChannel.id)) {
              return interaction.reply({
                  content: 'يجب أن تكون في قناة صوتك المؤقتة!',
                  ephemeral: true
              });
          }

          switch (interaction.customId) {
              case 'temp_limit_modal': {
                  const limit = parseInt(interaction.fields.getTextInputValue('limit_input'));

                  if (isNaN(limit) || limit < 0 || limit > 99) {
                      return interaction.reply({
                          content: 'الرجاء إدخال رقم صالح بين 0 و 99!',
                          ephemeral: true
                      });
                  }

                  await voiceChannel.setUserLimit(limit);
                  await interaction.reply({
                      content: `تم ضبط حد الاستخدام على ${limit}!`,
                      ephemeral: true
                  });
                  break;
              }

              case 'temp_rename_modal': {
                  const newName = interaction.fields.getTextInputValue('name_input');
                  await voiceChannel.setName(newName);
                  await interaction.reply({
                      content: 'تمت إعادة تسمية القناة بنجاح!',
                      ephemeral: true
                  });
                  break;
              }
          }
      }
  } catch (error) {
      console.error('Error handling temporary voice interaction:', error);
      if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({
              content: 'حدث خطأ أثناء معالجة طلبك.',
              ephemeral: true
          }).catch(() => {});
      }
  }
});



client.on('messageCreate', async (message) => {
  if (!message.content.startsWith(`${prefix}temp`) || message.author.bot) return;

  
  if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply('تحتاج إلى صلاحية المسؤول لاستخدام هذا الأمر!');
  }

  try {
      const config = tempVoiceDB.get(`tempvoice_${message.guild.id}`);
      if (!config) {
          return message.reply('لم يتم إعداد نظام الصوت المؤقت! استخدم `/tempvoice setup` أولاً.');
      }

     
      const embed = new EmbedBuilder()
          .setTitle('🎙️ Temporary Voice Channel Controls')
          .setDescription('Join the voice channel to create your own temporary voice channel!\n\n**Controls:**')
          .addFields(
              { name: '🔒 Lock/Unlock', value: 'Control who can join your channel' },
              { name: '👥 User Limit', value: 'Set the maximum number of users' },
              { name: '✏️ Rename', value: 'Change your channel name' },
              { name: '👑 Claim', value: 'Claim ownership if the owner left' },
              { name: '❌ Delete', value: 'Delete your temporary channel' }
          )
          .setColor('Blue')
          .setTimestamp();

      
      const row = new ActionRowBuilder()
          .addComponents(
              new ButtonBuilder()
                  .setCustomId('temp_lock')
                  .setLabel('Lock/Unlock')
                  .setStyle(ButtonStyle.Primary)
                  .setEmoji('🔒'),
              new ButtonBuilder()
                  .setCustomId('temp_limit')
                  .setLabel('User Limit')
                  .setStyle(ButtonStyle.Primary)
                  .setEmoji('👥'),
              new ButtonBuilder()
                  .setCustomId('temp_rename')
                  .setLabel('Rename')
                  .setStyle(ButtonStyle.Primary)
                  .setEmoji('✏️'),
              new ButtonBuilder()
                  .setCustomId('temp_claim')
                  .setLabel('Claim')
                  .setStyle(ButtonStyle.Success)
                  .setEmoji('👑'),
              new ButtonBuilder()
                  .setCustomId('temp_delete')
                  .setLabel('Delete')
                  .setStyle(ButtonStyle.Danger)
                  .setEmoji('❌')
          );


          await message.channel.send({
          embeds: [embed],
          components: [row]
      });


      await message.delete().catch(() => {});

  } catch (error) {
      console.error('Error sending voice panel:', error);
      await message.reply('حدث خطأ أثناء إنشاء لوحة الصوت.');
  }
});

client.on(Events.ClientReady, () => {
    
    require('./Events/Channel/channelLogs.js').execute(client);
});


client.on('messageCreate', async message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'drop') {
        const prize = args.join(' ');
        if (!prize) return message.reply('يرجى تحديد الجائزة!');

        const button = new ButtonBuilder()
            .setCustomId('claim_gift')
            .setLabel('🎁 Claim Gift!')
            .setStyle(ButtonStyle.Success);

        const row = new ActionRowBuilder().addComponents(button);

        const embed = new EmbedBuilder()
            .setTitle('🎉 Gift Drop!')
            .setDescription(`**Prize**: ${prize}\n\n **Hosted by: ${message.author}**`)
            .setColor('#FF1493')
            .setTimestamp()
            .setFooter({ text: `Hosted by: ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) });

        const giftMessage = await message.channel.send({
            embeds: [embed],
            components: [row]
        });

        const filter = i => i.customId === 'claim_gift';
        const collector = giftMessage.createMessageComponentCollector({ filter, time: 30000, max: 1 });

        collector.on('collect', async i => {
            const winEmbed = new EmbedBuilder()
                .setTitle('🎉 Gift Claimed!')
                .setDescription(`${i.user} was the first to claim:\n\n**Prize: ${prize}**`)
                .setColor('#00FF00')
                .setTimestamp();

            const disabledButton = new ButtonBuilder()
                .setCustomId('claimed_gift')
                .setLabel(`${message.guild.name}`)
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true);

            const disabledRow = new ActionRowBuilder().addComponents(disabledButton);

            await message.channel.send({
                content: `🎊 Congratulations ${i.user}! , you won **${prize}**`
            });

            try {
                const dmEmbed = new EmbedBuilder()
                    .setTitle('🎉 You Won a Gift!')
                    .setDescription(`Congratulations! You claimed the gift first!\n\n**Prize**: ${prize}`)
                    .setColor('#00FF00')
                    .setTimestamp();
                
                await i.user.send({ embeds: [dmEmbed] });
            } catch (error) {
                console.error('Could not send DM to winner:', error);
            }

            await i.update({
                embeds: [winEmbed],
                components: [disabledRow]
            });
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                const expiredEmbed = new EmbedBuilder()
                    .setTitle('Gift Expired')
                    .setDescription('Nobody claimed the gift in time!')
                    .setColor('#FF0000')
                    .setTimestamp();

                const expiredButton = new ButtonBuilder()
                    .setCustomId('expired_gift')
                    .setLabel(`${message.guild.name}`)
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(true);

                const expiredRow = new ActionRowBuilder().addComponents(expiredButton);

                giftMessage.edit({
                    embeds: [expiredEmbed],
                    components: [expiredRow]
                });
            }
        });
    }
});



client.on('messageCreate', async message => {
    if (message.author.bot) return;

    const countData = await CountingSchema.findOne({ guildId: message.guild.id });
    if (!countData || message.channel.id !== countData.channelId) return;

    const number = parseInt(message.content);
    if (isNaN(number)) {
        await message.delete();
        return;
    }

    if (message.author.id === countData.lastUserId) {
        await message.delete();
        return message.channel.send(`${message.author}، لا يمكنك العد مرتين على التوالي!`).then(msg => {
            setTimeout(() => msg.delete(), 5000);
        });
    }

    if (number !== countData.currentCount + 1) {
        await message.delete();
        return message.channel.send(`الرقم خاطئ! الرقم التالي يجب أن يكون ${countData.currentCount + 1}`).then(msg => {
            setTimeout(() => msg.delete(), 5000);
        });
    }

  
    const userIndex = countData.users.findIndex(user => user.userId === message.author.id);
    if (userIndex === -1) {
        countData.users.push({
            userId: message.author.id,
            count: 1,
            highestCount: number
        });
    } else {
        countData.users[userIndex].count++;
        if (number > countData.users[userIndex].highestCount) {
            countData.users[userIndex].highestCount = number;
        }
    }

    countData.currentCount = number;
    countData.lastUserId = message.author.id;
    await countData.save();

    
    const reactionEmoji = countData.emoji || '✅';
    await message.react(reactionEmoji);
});




client.on('messageCreate', async message => {
    if (message.author.bot || !message.guild) return;

    
    const linkRegex = /(https?:\/\/|discord\.gg\/)[^\s]+/gi;
    const links = message.content.match(linkRegex);
    
    if (links) {
        
        if (!client.linkSpam) client.linkSpam = new Map();
        
        const userData = client.linkSpam.get(message.author.id) || {
            count: 0,
            timer: null
        };

        userData.count++;
        
  
        if (userData.timer) clearTimeout(userData.timer);
        userData.timer = setTimeout(() => {
            client.linkSpam.delete(message.author.id);
        }, 3600000); 

        client.linkSpam.set(message.author.id, userData);

        if (userData.count >= 3) {
            try {
                await message.member.timeout(24 * 60 * 60 * 1000, 'Excessive link spam');
                client.linkSpam.delete(message.author.id); 

                const embed = new EmbedBuilder()
                    .setColor('Red')
                    .setDescription(`${message.author} تم إيقافه لمدة 24 ساعة بسبب كثرة الروابط العشوائية.`)
                    .setTimestamp();

                await message.channel.send({ embeds: [embed] })
                    .then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
            } catch (error) {
                console.error('Error handling link spam timeout:', error);
            }
        }
    }
});


client.invites = new Collection();

client.on('ready', async () => {
    
    client.guilds.cache.forEach(async guild => {
        const firstInvites = await guild.invites.fetch();
        client.invites.set(guild.id, firstInvites);
    });
});

client.on('inviteCreate', async invite => {
    const guildInvites = client.invites.get(invite.guild.id);
    guildInvites.set(invite.code, invite);
    client.invites.set(invite.guild.id, guildInvites);
});

client.on('guildMemberAdd', async member => {
    try {
        const cachedInvites = client.invites.get(member.guild.id);
        const newInvites = await member.guild.invites.fetch();
        client.invites.set(member.guild.id, newInvites);
        
        const usedInvite = newInvites.find(inv => cachedInvites.get(inv.code)?.uses < inv.uses);
        if (!usedInvite) return;

        const inviter = await client.users.fetch(usedInvite.inviterId);
        
        
        await InvitesSchema.findOneAndUpdate(
            { guildId: member.guild.id, userId: inviter.id },
            { 
                $inc: {
                    'invites.total': 1,
                    'invites.joins': 1  
                }
            },
            { upsert: true }
        );

        
        const config = await InvitesSchema.findOne({ guildId: member.guild.id });
        if (config?.inviteChannel) {
            const channel = await member.guild.channels.fetch(config.inviteChannel);
            if (channel) {
                const embed = new EmbedBuilder()
                    .setColor('Green')
                    .setTitle('Member Joined')
                    .setDescription(`${member.user.tag} joined\nInvited by: ${inviter.tag}\nInvite Code: ${usedInvite.code}\nTotal Invites: ${usedInvite.uses}`)
                    .setTimestamp();

                channel.send({ embeds: [embed] });
            }
        }
    } catch (error) {
        console.error('Error handling invite tracking:', error);
    }
});


client.on('guildMemberRemove', async member => {
    try {
        const inviteData = await InvitesSchema.findOne({
            guildId: member.guild.id,
            'invites.joins': { $gt: 0 }  
        });

        if (inviteData) {
            await InvitesSchema.updateOne(
                { guildId: member.guild.id, userId: inviteData.userId },
                { $inc: { 'invites.left': 1 } }
            );
        }
    } catch (error) {
        console.error('Error handling member leave:', error);
    }
});



const invitesCache = new Collection();


client.on('ready', async () => {
    for (const guild of client.guilds.cache.values()) {
        try {
            const guildInvites = await guild.invites.fetch();
            invitesCache.set(guild.id, new Collection(guildInvites.map(invite => [invite.code, invite.uses])));
        } catch (error) {
            console.error(`Error fetching invites for guild ${guild.id}:`, error);
        }
    }
});


client.on('inviteCreate', async invite => {
    const guildInvites = invitesCache.get(invite.guild.id) || new Collection();
    guildInvites.set(invite.code, invite.uses);
    invitesCache.set(invite.guild.id, guildInvites);
});


client.on('guildMemberAdd', async member => {
    try {
        const oldInvites = invitesCache.get(member.guild.id) || new Collection();
        const newInvites = await member.guild.invites.fetch();
        invitesCache.set(member.guild.id, new Collection(newInvites.map(invite => [invite.code, invite.uses])));

       
        const usedInvite = newInvites.find(invite => oldInvites.get(invite.code) < invite.uses);
        if (!usedInvite) return;

        
        await InvitesSchema.findOneAndUpdate(
            { 
                guildId: member.guild.id, 
                userId: usedInvite.inviter.id 
            },
            { 
                $inc: {
                    'invites.total': 1,
                    'invites.joins': 1
                }
            },
            { upsert: true }
        );

       
        const inviteData = await InvitesSchema.findOne({ guildId: member.guild.id });
        if (inviteData?.inviteChannel) {
            const channel = await member.guild.channels.fetch(inviteData.inviteChannel);
            if (channel) {
                const embed = new EmbedBuilder()
                    .setColor('Green')
                    .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL() })
                    .setDescription(`Welcome ${member}!\nInvited by: ${usedInvite.inviter}\nInvite Used: ${usedInvite.code}\nTotal Members: ${member.guild.memberCount}`)
                    .setTimestamp();

                channel.send({ embeds: [embed] });
            }
        }
    } catch (error) {
        console.error('Error handling member join:', error);
    }
});


client.on('guildMemberRemove', async member => {
    try {

        const inviteData = await InvitesSchema.find({ guildId: member.guild.id });
        const inviter = inviteData.find(data => 
            data.invites.joins > data.invites.left
        );

        if (inviter) {

            await InvitesSchema.updateOne(
                { guildId: member.guild.id, userId: inviter.userId },
                { $inc: { 'invites.left': 1 } }
            );


            const config = await InvitesSchema.findOne({ guildId: member.guild.id });
            if (config?.inviteChannel) {
                const channel = await member.guild.channels.fetch(config.inviteChannel);
                if (channel) {
                    const embed = new EmbedBuilder()
                        .setColor('Red')
                        .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL() })
                        .setDescription(`${member.user.tag} left the server\nThey were invited by <@${inviter.userId}>\nRemaining Members: ${member.guild.memberCount}`)
                        .setTimestamp();

                    channel.send({ embeds: [embed] });
                }
            }
        }
    } catch (error) {
        console.error('Error handling member leave:', error);
    }
});


client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  
  const line = feedbackDB.get(`line_${message.guild.id}`);
  const chan = feedbackDB.get(`feedback_room_${message.guild.id}`);
  const feedbackMode = feedbackDB.get(`feedback_mode_${message.guild.id}`) || 'embed'; 
  const feedbackEmoji = feedbackDB.get(`feedback_emoji_${message.guild.id}`) || "❤"; 

  if (chan) {
    if (message.channel.id !== chan) return;

    const embed = new EmbedBuilder()
      .setColor('Random')
      .setTimestamp()
      .setTitle(`** > ${message.content} **`)
      .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
      .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
      .setFooter({ text: message.guild.name, iconURL: message.guild.iconURL({ dynamic: true }) });

    if (feedbackMode === 'embed') {
      await message.delete();
      const themsg = await message.channel.send({ content: `**<@${message.author.id}> شكرا لمشاركتنا رأيك :tulip:**`, embeds: [embed] });
      await themsg.react("❤");
      await themsg.react("❤️‍🔥");
      if (line) {
        await message.channel.send({ files: [line] });
      }
    } else if (feedbackMode === 'reactions') {
      await message.react(feedbackEmoji);
      if (line) {
        await message.channel.send({ files: [line] });
      }
    }
  }
});




client.on('messageCreate', async message => {
    if (message.author.bot || !message.guild) return;

    try {
        let userData = await Level.findOne({ 
            guildId: message.guild.id, 
            userId: message.author.id 
        });

        if (!userData) {
            userData = new Level({
                guildId: message.guild.id,
                userId: message.author.id,
                textLevel: 1,
                textXP: 0,
                messagesCount: 0
            });
        }

     
        userData.messagesCount += 1;

    
        const earnedXP = Math.floor(Math.random() * 30) + 1;
        userData.textXP += earnedXP;


        const requiredXP = userData.textLevel * 100;

        if (userData.textXP >= requiredXP) {
            userData.textLevel += 1;
            userData.textXP = 0;

  
            const channel = message.guild.channels.cache.get(levelDB.get(`levelchannel_${message.guild.id}`));
            if (channel) {
                const embed = new EmbedBuilder()
                    .setColor('Gold')
                    .setTitle('Level Up! 🎉')
                    .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
                    .setDescription(`Congratulations ${message.author}!`)
                    .addFields(
                        { name: 'New Level', value: `${userData.textLevel}`, inline: true },
                        { name: 'Total Messages', value: `${userData.messagesCount}`, inline: true }
                    )
                    .setTimestamp();

                channel.send({ embeds: [embed] });
            }
        }

        await userData.save();
    } catch (error) {
        console.error('Error in leveling system:', error);
    }
});

const voiceStates = new Map();

client.on('voiceStateUpdate', async (oldState, newState) => {
    if (newState.member.user.bot) return;

    if (!oldState.channelId && newState.channelId) {
    
        voiceStates.set(newState.id, Date.now());
    } else if (oldState.channelId && !newState.channelId) {
    
        const joinTime = voiceStates.get(oldState.id);
        if (!joinTime) return;

        const timeSpent = Date.now() - joinTime;
        voiceStates.delete(oldState.id);

        if (timeSpent < 60000) return; 

        const userData = await Level.findOne({ guildId: oldState.guild.id, userId: oldState.member.id }) ||
            new Level({ guildId: oldState.guild.id, userId: oldState.member.id });

        const xpGained = Math.floor(timeSpent / 60000); // 
        userData.voiceXP += xpGained;

        if (userData.voiceXP >= userData.voiceLevel * 100) {
            userData.voiceXP = 0;
            userData.voiceLevel++;

            const channel = await oldState.guild.channels.fetch(levelDB.get(`levelchannel_${oldState.guild.id}`)).catch(() => null);
            if (channel) {
                channel.send(`🎉 Congratulations ${oldState.member}! You reached voice level ${userData.voiceLevel}!`);
            }
        }

        await userData.save();
    }
});


const VOICE_LEVEL_REQUIREMENTS = {
    1: 30,     // Level 1: 30 minutes
    2: 60,     // Level 2: 1 hour
    3: 120,    // Level 3: 2 hours
    4: 180,    // Level 4: 3 hours
    5: 240,    // Level 5: 4 hours
    6: 300,    // Level 6: 5 hours
    7: 360,    // Level 7: 6 hours
    8: 420,    // Level 8: 7 hours
    9: 480,    // Level 9: 8 hours
    10: 540,   // Level 10: 9 hours
    11: 600,   // Level 11: 10 hours
    12: 720,   // Level 12: 12 hours
    13: 840,   // Level 13: 14 hours
    14: 960,   // Level 14: 16 hours
    15: 1080,  // Level 15: 18 hours
    16: 1200,  // Level 16: 20 hours
    17: 1320,  // Level 17: 22 hours
    18: 1440,  // Level 18: 24 hours
    19: 1680,  // Level 19: 28 hours
    20: 1920,  // Level 20: 32 hours
    21: 2160,  // Level 21: 36 hours
    22: 2400,  // Level 22: 40 hours
    23: 2640,  // Level 23: 44 hours
    24: 2880,  // Level 24: 48 hours
    25: 3120,  // Level 25: 52 hours
    26: 3360,  // Level 26: 56 hours
    27: 3600,  // Level 27: 60 hours
    28: 3840,  // Level 28: 64 hours
    29: 4080,  // Level 29: 68 hours
    30: 4320   // Level 30: 72 hours
};


client.on('voiceStateUpdate', async (oldState, newState) => {
    if (newState.member.user.bot) return;

    try {
        if (!oldState.channelId && newState.channelId) {

            voiceStates.set(newState.id, Date.now());
        } else if (oldState.channelId && !newState.channelId) {

            const joinTime = voiceStates.get(oldState.id);
            if (!joinTime) return;

            const timeSpent = Math.floor((Date.now() - joinTime) / 60000); 
            voiceStates.delete(oldState.id);

            if (timeSpent < 1) return; 

            let userData = await Level.findOne({ 
                guildId: oldState.guild.id, 
                userId: oldState.member.id 
            }) || new Level({ 
                guildId: oldState.guild.id, 
                userId: oldState.member.id 
            });

            userData.voiceXP += timeSpent; 

           
            const nextLevel = userData.voiceLevel + 1;
            const requiredMinutes = VOICE_LEVEL_REQUIREMENTS[nextLevel];

            if (requiredMinutes && userData.voiceXP >= requiredMinutes) {
                userData.voiceLevel = nextLevel;
                userData.voiceXP = 0; 

                const channel = await oldState.guild.channels.fetch(levelDB.get(`levelchannel_${oldState.guild.id}`)).catch(() => null);
                if (channel) {
                    const embed = new EmbedBuilder()
                        .setColor('Purple')
                        .setTitle('Voice Level Up! 🎙️')
                        .setThumbnail(oldState.member.user.displayAvatarURL({ dynamic: true }))
                        .setDescription(`Congratulations ${oldState.member}!`)
                        .addFields(
                            { name: 'New Voice Level', value: `${nextLevel}`, inline: true },
                            { name: 'Time Required', value: `${requiredMinutes} minutes`, inline: true },
                            { name: 'Next Level Requires', value: `${VOICE_LEVEL_REQUIREMENTS[nextLevel + 1] || 'Max Level'} minutes`, inline: true }
                        )
                        .setTimestamp();

                    channel.send({ embeds: [embed] });
                }
            }

            await userData.save();
        }
    } catch (error) {
        console.error('Error in voice leveling system:', error);
    }
});


client.on('messageCreate', async message => {
    if (message.content.toLowerCase().startsWith(prefix + 'profile')) {
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const { handleProfileCommand } = require('./SlashCommands/Levels/profile.js');
        await handleProfileCommand(message, args);
    }
});


client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.slashcommands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ 
            content: 'There was an error executing this command!', 
            ephemeral: true 
        });
    }
});






// Handle errors
process.on("unhandledRejection", console.log);
process.on("uncaughtException", console.log);
process.on("uncaughtExceptionMonitor", console.log);

module.exports = client;


