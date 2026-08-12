import axios from "axios";

const apiClient = axios.create({
    baseURL: process.env.API_BASE_URL ?? "http://localhost:4000",
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 5000, // Set a timeout of 5 seconds for requests
});

export default apiClient;