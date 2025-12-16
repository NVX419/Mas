const { Events, ActivityType } = require('discord.js');

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    client.user.setStatus('dnd');
    console.log(`Ready! Logged in as ${client.user.tag}`);

    // Array of activities to display
    const activities = [
      'Managing Tickets', 
      'Probot Tax Calculation',
      'Collecting Members Suggestions',
      'Managing Take-away Rolls',
      'Protecting Server from Attacks',
      'Monitoring Server Logs',
      'Managing Giveaways and Prizes',
      'General Commands',
      'Collecting Members Feedback',
      'Autoline System Commands',
      'Managing Submissions',
      'Admin Commands'
    ];

    let i = 0;
    // Set activity every 5 seconds
    setInterval(() => {
      client.user.setActivity({ 
        type: ActivityType.Custom,
        name: 'customstatus',
        state: activities[i++ % activities.length]
      });
    }, 5000);
  },
};