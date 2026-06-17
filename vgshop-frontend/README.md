# Frontend

Il frontend si occupa di visualizzare lo store dei videogiochi, la chat, il carrello, la libreria personale e i profili utente. Comunica con il backend tramite chiamate API REST e connessioni WebSocket.

## Installazione

### 1. Accedere alla cartella del frontend

Aprire un **terminale** diverso da quello utilizzando per il **backend** e posizionarsi nella cartella `vgshop-frontend`:

```bash
cd vgshop/vgshop-frontend
```

### 2. Installare le dipendenze Node.js

Installare tutti i pacchetti richiesti definiti nel file `package.json`:

```bash
npm install
```

---

## Avvio

Avviare l'ambiente di sviluppo locale di Next.js:

```bash
npm run dev
```

Il frontend sarà attivo su: [**`http://localhost:3000`**](http://localhost:3000).

---

## Tecnologie e Librerie Chiave Utilizzate

- **Next.js 16 (App Router)**: Framework React per rendering ibrido e routing ottimizzato.
- **Three.js & React Three Fiber/Drei**: Per la renderizzazione di elementi grafici in 3D.
- **GSAP**: Libreria per animazioni fluide e interattive ad alte prestazioni.
- **TailwindCSS v4**: Per lo styling responsivo e moderno.
- **Axios**: Per le chiamate API REST verso il backend Django.
- **SWR**: Per il data fetching, caching e re-validation in tempo reale sul client.
- **Lucide React & React Icons**: Set di icone moderne.
