import axios from "axios";

const client = axios.create({
  baseURL: process.env.API_BASE_URL || "http://localhost:5001",
});

export default client;
