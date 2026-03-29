import { jwtDecode } from "jwt-decode";

export interface DecodedToken {
  user_id: string;
  role: string;
  exp: number;
}

export const saveToken = (token: string) => {
  localStorage.setItem("token", token);
};

export const getToken = () => {
  return localStorage.getItem("token");
};

export const getUserRole = (): string | null => {
  const token = getToken();
  if (!token) return null;

  try {
    const decoded = jwtDecode <DecodedToken>(token);
    return decoded.role;
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  } finally {
    // Optionally, you can check for token expiration here and remove it if expired
  }};