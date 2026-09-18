
const configuredApiUrl = import.meta.env.VITE_API_URL?.replace( /\/+$/, "" );
const defaultApiUrl =
  window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
    ? "http://localhost:1000"
    : "https://book-store-5v8f.onrender.com";

const BASE_URL = `${ configuredApiUrl || defaultApiUrl }/api/v1`;

export default BASE_URL;
