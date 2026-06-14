// ------------------------------------------------- @Index.js ----------------------------------------------------------------------

require('dotenv').config({ quiet: true });
const { loadEvents } = require('../src/Handlers/eventHandler');
const { registerCommands } = require('./register-commands');
const { loadFunctions }  = require('./Handlers/functionHandler');
const commandHandler = require('../src/Handlers/commandHandler');
const PrefixCommands = require('../src/Handlers/prefixcommandsHandler');

// Database -------------------------------------------------------------------------------------------------------------------------
const db = require('../src/Handlers/database');

// Show Guilds ----------------------------------------------------------------------------------------------------------------------
const showGuilds = require('./ShowGuilds/showguilds');

const { Client, Collection, Partials, GatewayIntentBits, ActivityType, } = require('discord.js');
const { user, Message, GuildMember, ThreadMember, Channel, Reaction, User, GuildScheduledEvent, SoundboardSound } = Partials;

// Load Console Colors --------------------------------------------------------------------------------------------------------------

const colors = require('colors'); // For console colors
// loads colors globally for console use.

// ----------------------------------------------------------------------------------------------------------------------------------
const client = new Client({
    intents: 53608447, // All intents
    partials: [user, Message, GuildMember, ThreadMember, Channel, Reaction, User, GuildScheduledEvent, SoundboardSound],
    // All partials
});

// Collections for commands and events ---------------------------------------------------------------------------------------------

client.events = new Collection();
client.commands = new Collection();
client.prefixCommands = new Collection();

// Deployment timestamp (Unix seconds) — set once at process start
client.startupTime = Math.floor(Date.now() / 1000);

// Ready Event ---------------------------------------------------------------------------------------------------------------------
client.once("clientReady", async () => {
    console.log(`🌿・${client.user.tag} Is Starting Up!`.bold.white);

    // Registers Application Commands
    registerCommands(client);

    // Wait Imports to fully load
    await showGuilds(client);
    await loadFunctions(client);
    await loadEvents(client);
    await commandHandler(client);
    await PrefixCommands(client);

    // Status Toggles
    const normal = true;
    const down = false;
    const issues = false;

    // Status Groups
    const normalstatus = [
    "Reacting to everything in sight",
    "Watching the chat like a hawk 👀",
    "Waiting for someone to ping me...",
    "Powered by chaos and emojis",
    "Turning messages into reactions",
    "Currently pressing every emoji button",
    "Living inside your Discord server",
    "Processing vibes... please wait",
    "Loading cheeky responses...",
    "Spreading reaction energy across the server",
    "Collecting reactions like Pokémon",
    "Emotional support reaction bot",
    "Born to react, forced to wait for messages",
    "Standing by for emotional damage 😭",
    "Reacting faster than your internet",
    "Deploying instant reactions",
    "Scanning chat for funny moments",
    "Waiting for chaos to unfold",
    "Auto-react mode: ENABLED",
    "ReactionCore online and observing",
    "Making messages more expressive",
    "Turning silence into reactions",
    "Powered by server activity",
    "Monitoring vibes in real time",
    "Reacting responsibly (sometimes)",
    "Just a bot, standing in front of a server",
    "Cheeky reactions coming through",
    "Learning from every emoji sent",
    "Your certified reaction technician",
    "Injecting personality into messages",
    "Here to react, not overthink",
    "Currently emotionally available for reactions",
    "Making Discord slightly more fun",
    "Waiting for something worth reacting to",
    "Reacting is my cardio",
    "Emoji distribution system active",
    "Serving reactions on demand",
    "Your local reaction provider",
    "Turning chats into interactive chaos",
    "Powered by CheekyCharlie energy"
];

const downstatus = [
    "",
    ""
];

const issuesstatus = [
    ""
];

// Combine all enabled statuses
const activeStatuses = [
    ...(normal ? normalstatus : []),
    ...(down ? downstatus : []),
    ...(issues ? issuesstatus : [])
];

// Set Activity
setInterval(() => {
    if (activeStatuses.length === 0) return; // Prevent crash if no statuses are enabled
    const activity = activeStatuses[Math.floor(Math.random() * activeStatuses.length)];
    client.user.setActivity(activity, { type: ActivityType.Custom });
}, 5000);

    // Bisechosting Finished Startup!
    console.log(`successfully finished startup`.bold.green);

    // ReactionCore is Online!
    console.log(`🌿・${client.user.tag} Is Online!`.bold.white);
});

// Interaction Command Handler -----------------------------------------------------------------------------------------------------

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(`[Slash Command Error] /${interaction.commandName}:`, error);
        const reply = { content: 'There was an error while executing this command!', flags: 64 };
        try {
            if (interaction.replied || interaction.deferred)
                await interaction.followUp(reply);
            else
                await interaction.reply(reply);
        } catch { /* interaction expired or already cleaned up */ }
    }
});

// Prefix Command Handler -----------------------------------------------------------------------------------------------------------

client.defaultPrefix = "?"; // 👈 default fallback prefix

client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.guild) return;

  // 👇 USE DB PREFIX OR FALLBACK
  const prefix = client.defaultPrefix;

  if (!message.content.startsWith(prefix)) return;

  const trimmedContent = message.content.slice(prefix.length).trimStart();
  if (!trimmedContent) return;

  const firstWhitespaceIndex = trimmedContent.search(/\s/);
  const commandName = (
    firstWhitespaceIndex === -1
      ? trimmedContent
      : trimmedContent.slice(0, firstWhitespaceIndex)
  ).toLowerCase();
  const rawArgs = firstWhitespaceIndex === -1
    ? ''
    : trimmedContent.slice(firstWhitespaceIndex).trimStart();
  const args = rawArgs ? rawArgs.trim().split(/\s+/) : [];

  message.rawArgs = rawArgs;
  
  const command =
    client.prefixCommands.get(commandName) ||
    client.prefixCommands.find(cmd => cmd.aliases?.includes(commandName));

  if (!command) return;

  try {
    await command.execute(message, args, client);
  } catch (error) {
    console.error(`[Prefix Command Error] ${commandName}:`, error);
  }
});

// Client Login ---------------------------------------------------------------------------------------------------------------------
client.login(process.env.TOKEN);
