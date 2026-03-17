# Ops Center

Pannello operativo Next.js per gestire siti server, connessioni SSH/SFTP, file manager, backup, notifiche e audit log.

## Funzioni operative
- Login/logout con sessione cookie HTTP-only.
- Gestione siti (creazione, aggiornamento, archiviazione).
- Provider sito: server generico oppure Plesk.
- Test connessione:
  - Generic: test SSH/SFTP.
  - Plesk: test API token su endpoint Plesk.
- File manager remoto completo:
  - navigazione cartelle
  - upload, download
  - rinomina, elimina, mkdir
  - editor file testuale con salvataggio remoto
- Backup manuali (FILES, DATABASE, FULL).
- Notifiche con marcatura lette.
- Audit trail completo e log tecnici.
- Profilo account e pagina utenti (solo admin).

## Deploy VPS Ubuntu (bittax.it)
Architettura consigliata: Docker Compose con
- `app` (Next.js)
- `db` (PostgreSQL)
- `caddy` (reverse proxy + HTTPS automatico)

### 1. DNS
Configura i record A:
- `bittax.it` -> IP VPS
- `www.bittax.it` -> IP VPS

### 2. Copia progetto in VPS
```bash
cd /opt
sudo git clone <URL_REPO_GIT> ops-center
sudo chown -R $USER:$USER /opt/ops-center
cd /opt/ops-center
```

### 3. Installa Docker
```bash
chmod +x infra/vps/install-ubuntu.sh
./infra/vps/install-ubuntu.sh
# poi esci/rientra dalla sessione SSH
```

### 4. Configura variabili produzione
```bash
cp .env.vps.example .env.vps
nano .env.vps
```
Imposta almeno:
- `POSTGRES_PASSWORD`
- `AUTH_SECRET` (lungo e random)
- `BOOTSTRAP_ADMIN_EMAIL`
- `BOOTSTRAP_ADMIN_PASSWORD`

### 5. Avvio stack
```bash
chmod +x infra/vps/deploy.sh
./infra/vps/deploy.sh
```

### 6. Verifica
Apri:
- `https://bittax.it`

Caddy emette certificato HTTPS automatico appena DNS punta correttamente.

### Update successivi
```bash
chmod +x infra/vps/update.sh
./infra/vps/update.sh
```

## Gestione siti dall'app
- `PROD` = Produzione (live)
- `STAGING` = Pre-rilascio
- `DEV` = Sviluppo

Per sito Plesk:
- Provider = `Plesk`
- URL panel (es: `https://panel.example.com:8443`)
- API token Plesk
- Subscription ID opzionale

Nota: file manager/backup usano canale SSH/SFTP, quindi host/porta/username/credenziali server restano necessari.

## Sviluppo locale
1. Installa dipendenze:
```bash
npm install
```
2. Configura `.env`.
3. Prisma:
```bash
npm run prisma:generate
npx prisma db push
```
4. Seed admin:
```bash
npm run prisma:seed
```
5. Avvio:
```bash
npm run dev
```
