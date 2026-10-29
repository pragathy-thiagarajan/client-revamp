import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { getProfile, loginUser } from "../api/authApi";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "organizer" | "admin";
  status: "active" | "blocked";
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const savedToken = localStorage.getItem("token");

      if (!savedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await getProfile();

        setUser(response.data.user);
      } catch (error) {
        console.log("Failed to restore session", error);
        console.error("Failed to restore session");

        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (
    email: string,
    password: string
  ) => {
    const response = await loginUser({
      email,
      password,
    });

    const { token, user } = response.data;

    localStorage.setItem("token", token);

    setToken(token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem("token");

    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};