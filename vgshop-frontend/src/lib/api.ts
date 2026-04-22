import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: true, // Fondamentale per inviare/ricevere cookie
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor per le richieste:
// Se Django usa i cookie, non serve aggiungere l'header Authorization manualmente.
// Tuttavia, se Django si aspetta il CSRF token, dovresti aggiungerlo qui.
api.interceptors.request.use((config) => {
  // Esempio per CSRF (se necessario)
  // const csrfToken = Cookies.get('csrftoken');
  // if (csrfToken) config.headers['X-CSRFToken'] = csrfToken;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Se l'errore è 401 e non è un tentativo di refresh fallito
    if (
      error.response.status === 401 &&
      error.response.data?.message !== "Invalid credentials" &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        // Nota: Non passiamo il refresh token nel body.
        // Se Django è impostato correttamente, lo leggerà dai cookie HttpOnly.
        await axios.post(
          "http://localhost:8000/api/token/refresh/",
          {}, // Body vuoto o con dati minimi
          { withCredentials: true },
        );

        // Se il refresh ha successo, Django avrà inviato un nuovo Set-Cookie
        // Riprova la richiesta originale (i nuovi cookie verranno inclusi automaticamente)
        return api(originalRequest);
      } catch (refreshError) {
        // Se il refresh fallisce (es. refresh token scaduto)
        console.error("Sessione scaduta. Reindirizzamento al login.");

        // Pulizia lato client (opzionale se gestisci tutto via cookie)
        localStorage.clear();
        window.location.href = "/login";

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
