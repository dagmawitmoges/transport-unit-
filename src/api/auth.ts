import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3000",
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

export const googleOAuthLogin = async (googleUser: {
  email: string;
  first_name: string;
  last_name: string;
  uid: string;
  avatar_url: string;
}) => {
  const response = await API.post("/api/v1/auth/oauth_login", {
    user: {
      email:      googleUser.email,
      first_name: googleUser.first_name,
      last_name:  googleUser.last_name,
      provider:   "google",
      uid:        googleUser.uid,
      avatar_url: googleUser.avatar_url,
    },
  });
  return response.data;
};
