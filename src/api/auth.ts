import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3000", // change if your backend port is different
});

export const loginRequest = async (email: string, password: string) => {
  const response = await API.post("/api/v1/auth/login", {
    auth: {
      email,
      password,
    },
  });

  return response.data; 
};

export const googleLoginRequest = async (credential: string) => {
  const response = await API.post("/api/v1/auth/google", {
    auth: { credential },
  });

  return response.data;
};
