const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

// ── FIREBASE ADMIN SDK ────────────────────────────────────────────────────────
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

// ── DISCORD BOT ───────────────────────────────────────────────────────────────
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const app = express();
app.use(cors());
app.use(express.json());

const BOT_TOKEN    = process.env.BOT_TOKEN;
const YOUR_USER_ID = '1452878677988610198';
const CLIENT_ID    = '1485397528420552775';

// ── REGISTER SLASH COMMAND ────────────────────────────────────────────────────
const commands = [
  new SlashCommandBuilder()
    .setName('completed')
    .setDescription('Mark an order as completed')
    .addStringOption(opt =>
      opt.setName('token')
         .setDescription('The order token (e.g. ABC12345)')
         .setRequired(true)
    )
].map(c => c.toJSON());

const rest = new REST({ version: '10' }).setToken(BOT_TOKEN);

client.once('ready', async () => {
  console.log(`✅ Bot online: ${client.user.tag}`);
  try {
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
    console.log('✅ Slash commands registered');
  } catch(e) {
    console.error('❌ Slash command register error:', e.message);
  }
});

// ── /completed COMMAND ────────────────────────────────────────────────────────
client.on('interactionCreate', async interaction => {
  if(!interaction.isChatInputCommand()) return;
  if(interaction.commandName !== 'completed') return;

  const token = interaction.options.getString('token').trim().toUpperCase();
  await interaction.deferReply({ ephemeral: true });

  try {
    const docRef = db.collection('store').doc('data');
    const doc = await docRef.get();
    if(!doc.exists) return interaction.editReply('❌ No data found in database.');

    const data = doc.data();
    const market = data.market || [];
    const idx = market.findIndex(o => (o.token||'').toUpperCase() === token);

    if(idx === -1) return interaction.editReply(`❌ No order found with token \`${token}\`.`);
    if(market[idx].status === 'completed') return interaction.editReply(`⚠️ Order ${market[idx].orderNum} is already completed.`);

    market[idx].status = 'completed';
    await docRef.update({ market });

    await interaction.editReply(`✅ Order **${market[idx].orderNum}** marked as **COMPLETED**!`);
    console.log(`✅ Order ${market[idx].orderNum} (token: ${token}) completed`);

  } catch(e) {
    console.error('❌ /completed error:', e.message);
    await interaction.editReply('❌ Error: ' + e.message);
  }
});

client.login(BOT_TOKEN);

// ── EXPRESS ───────────────────────────────────────────────────────────────────
app.get('/', (req, res) => res.json({ status: 'ALEJOZSSTORE BOT ONLINE' }));

app.post('/order', async (req, res) => {
  try {
    const { message } = req.body;
    if(!message) return res.status(400).json({ error: 'No message' });
    const user = await client.users.fetch(YOUR_USER_ID);
    await user.send(message);
    console.log('📦 Order DM sent');
    res.json({ ok: true });
  } catch(e) {
    console.error('❌ DM error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));
