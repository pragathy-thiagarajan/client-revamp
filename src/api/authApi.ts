import api from "./axios";

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: "user" | "organizer";
}

export interface LoginData {
  email: string;
  password: string;
}

export const registerUser = (data: RegisterData) => {
  return api.post("/auth/register", data);
};

export const loginUser = (data: LoginData) => {
  return api.post("/auth/login", data);
};

export const getProfile = () => {
  return api.get("/auth/profile");
};