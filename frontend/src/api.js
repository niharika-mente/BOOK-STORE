
const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/+$/, "")}/api/v1`
  : "http://localhost:1000/api/v1";

export default BASE_URL;
