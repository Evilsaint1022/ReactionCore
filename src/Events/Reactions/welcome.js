// events/welcome_reaction.js
module.exports = {
  name: 'messageCreate',
  once: false,
  async execute(message) {

    // Ignore bots & webhooks
    if (message.author.bot) return;
    if (message.webhookId) return;
    if (message.content.includes(':')) return;

    // Check content
    if (!message.content.toLowerCase().includes('welcome')) return;

    try {

      // 🔍 Re-fetch the message to ensure it still exists
      const fetchedMessage = await message.channel.messages.fetch(message.id).catch(() => null);
      if (!fetchedMessage) return; // Message was deleted

      console.log(
        `[❤️] [WELCOME REACTION] [${new Date().toLocaleDateString('en-GB')}] ` +
        `[${new Date().toLocaleTimeString("en-NZ", { timeZone: "Pacific/Auckland" })}] ` +
        `${message.guild.name} (${message.guild.id}) - ` +
        `#${message.channel.name} (${message.channel.id})`
      );

      await fetchedMessage.react('❤️');

    } catch (error) {
      // Ignore Error: Unknown Emoji
      if (error.code !== 10014) return;
      if (error.code !== 30010) return;
      if (error.code !== 98881) return;

      console.error('Failed to add welcome reaction:', error);
    }
  },
};
