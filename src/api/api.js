import axios from "axios";
export const http = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});
export const userApi = axios.create({
  baseURL: "http://localhost:5000/api/user", // apna backend ka base URL dalain
  headers: {
    "Content-Type": "application/json",
  },
});
export const authApi = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});
export const verify = axios.create({
  baseURL: "http://localhost:5000/api/authenticate",
  headers: {
    "Content-Type": "application/json",
  },
});
