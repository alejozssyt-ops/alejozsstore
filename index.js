const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const cors = require('cors');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const app = express();

app.use(cors());
app.use(express.json());

const BOT_TOKEN = process.env.BOT_TOKEN;
const YOUR_USER_ID = '1452878677988610198';

client.once('ready', () => {
  console.log(`✅ Bot online: ${client.user.tag}`);
});

client.login(BOT_TOKEN);

app.get('/', (req, res) => {
  res.json({ status: 'ALEJOZSSTORE BOT ONLINE' });
});

app.post('/order', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'No message provided' });

    const user = await client.users.fetch(YOUR_USER_ID);
    await user.send(message);

    console.log('📦 Order sent to DM:', message);
    res.json({ ok: true });
  } catch (e) {
    console.error('❌ Error sending DM:', e.message);
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
