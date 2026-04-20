import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response, // function fulFilled: ok non fare nulla
  async (error) => {
    // function notFulFilled: ritprova la richiesta
    const originalRequest = error.config;

    // Se l'errore è 401 e non abbiamo già provato a fare il refresh
    if (
      error.response.status === 401 &&
      error.response.data?.message !== "Invalid credentials" &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true; // Segniamo che stiamo provando il refresh

      try {
        const refreshToken = localStorage.getItem("refresh_token");

        // Chiamiamo l'endpoint di Django per il refresh e ottenere il nuovo accesso token
        const res = await axios.post(
          "http://localhost:8000/api/token/refresh/",
          {
            refresh: refreshToken,
          },
        );

        if (res.status === 200) {
          // Salviamo il nuovo access token
          localStorage.setItem("access_token", res.data.access);

          // Cambiamo l'header della richiesta fallita con il nuovo token
          api.defaults.headers.common["Authorization"] =
            `Bearer ${res.data.access}`;

          // Riprova la richiesta originale
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Se anche il refresh token è scaduto, dobbiamo sloggare l'utente
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
