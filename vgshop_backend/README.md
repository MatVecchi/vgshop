# Backend

Il backend gestisce l'autenticazione, la logica di business, il portafoglio utenti, le recensioni, le amicizie e i servizi di chat in tempo reale.

## Installazione

### 1. Accededere alla cartella del backend

Aprire un terminale e posizionarsi nella cartella `vgshop_backend`:

```bash
cd vgshop/vgshop_backend
```

### 2. Creare l'Ambiente Virtuale e Installare le dipendenze

Eseguire i seguenti comandi per creare l'ambiente virtuale ed installare tutte le dipendenze a partire dal file `requirements.txt`:

```bash
# Crea l'ambiente ed installa le dipendenze da requirements.txt
pipenv install -r requirements.txt

# Attiva l'ambiente virtuale (shell di pipenv)
pipenv shell
```

### 3. Configurare le variabili d'ambiente

All'interno della cartella `vgshop_backend` bisogna creare il file `.env` e popolarlo con le seguenti chiavi necessarie:

- `SECRET_KEY` e `SALT_KEY`: Chiavi di crittografia per la sicurezza di Django.
- `IGDB_TWITCH_CLIENT_ID` e `IGDB_TWITCH_CLIENT_SECRET`: Per l'integrazione con le API di IGDB (Twitch) per recuperare i dettagli dei videogiochi.
- `SMTP_EMAIL` e `SMTP_KEY`: Per l'invio di email transazionali (es. ripristino password o conferme).
- `DOMAIN`: Per comodità impostarlo su `localhost`.

---

## Avvio

Dato che il backend integra Django Channels per i WebSocket, il server di sviluppo utilizzerà **Daphne** automaticamente per gestire sia le richieste HTTP che i WebSocket sulla porta **8000**:

```bash
python manage.py runserver
```

Il backend sarà attivo su: [**`http://localhost:8000`**](http://localhost:8000).

---

## Comandi utili

Ecco una lista di comandi utili, per qualunque informazione utilizzare il parametro `-h` per qualunque di questi comandi:

- `python manage.py seed` per la popolazione del database
- `python manage.py train_model` per allenare il modello per il reccomendation system

---

## Tecnologie Utilizzate

Il backend del progetto è realizzato con le seguenti tecnologie e librerie chiave:

- **Django**: Framework web di alto livello per uno sviluppo rapido e pulito.
- **Django REST Framework (DRF)**: Toolkit potente e flessibile per la creazione di API web RESTful.
- **Django Channels & Daphne**: Per gestire WebSocket, chat in tempo reale e protocolli asincroni.
- **SQLite**: Database relazionale leggero predefinito per la memorizzazione dei dati locali.
- **SimpleJWT**: Pacchetto di autenticazione per gestire i token JSON Web Token (JWT).
- **python-dotenv**: Per caricare le configurazioni sensibili dal file `.env` nelle variabili d'ambiente.
- **Pillow**: Per la gestione e l'elaborazione dei file media (immagini dei giochi e profili utenti).
