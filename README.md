# ALEJOZSSTORE BOT

Bot de Discord que recibe órdenes del sitio web y las manda directo a tu DM.

## Deploy en Railway (GRATIS)

1. Ve a **railway.app** y crea una cuenta con GitHub
2. Click **New Project → Deploy from GitHub repo**
3. Sube estos archivos a un repo de GitHub primero:
   - Ve a **github.com** → New repository → llámalo `alejozsstore-bot`
   - Sube los archivos `index.js`, `package.json`, `.gitignore`
4. En Railway selecciona ese repo → Deploy
5. Railway te da una URL pública tipo: `https://alejozsstore-bot.up.railway.app`
6. **Copia esa URL** — la necesitas en el sitio web

## Actualizar el sitio web

En el archivo `alejozsstorage.html`, busca esta línea en `submitOrder()`:

```js
fetch('https://discord.com/api/webhooks/...',
```

Y reemplázala por:

```js
fetch('https://TU-URL.up.railway.app/order', {
  method: 'POST',
  headers: {'Content-Type':'application/json'},
  body: JSON.stringify({ message: orderText })
});
```

## Verificar que funciona

Abre en el navegador: `https://TU-URL.up.railway.app/`
Debe responder: `{"status":"ALEJOZSSTORE BOT ONLINE"}`
