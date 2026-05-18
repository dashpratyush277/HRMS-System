// Converts a relative upload path stored in DB to a full URL.
// VITE_API_URL = "http://localhost:5000/api"  →  base = "http://localhost:5000"
const BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api")
  .replace(/\/api\/?$/, "");

const getFileUrl = (filePath) => {
  if (!filePath) return null;
  if (filePath.startsWith("http://") || filePath.startsWith("https://")) return filePath;
  return `${BASE_URL}${filePath}`;
};

export default getFileUrl;
