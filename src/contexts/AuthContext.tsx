import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, type User, signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import api from "../lib/api";

type UserGestionCobranza = {
  id: string;
  firebaseUid: string;
  nombreUsuario: string;
  email: string;
  idEntidad: number | undefined;
  nombreEntidad: string | null;
  idEntidades: number[];
  roles: string[];
  permisos: string[];
};

interface AuthContextType {
  user: UserGestionCobranza | null;
  firebaseUser: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [user, setUser] = useState<UserGestionCobranza | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentFirebaseUser) => {
        setFirebaseUser(currentFirebaseUser);
        if (currentFirebaseUser) {
          try {
            // Fetch additional user data from our backend
            const response = await api.get("/auth/me");
            setUser(response.data);
          } catch (error) {
            console.error("Error fetching user profile:", error);
            setUser(null);
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
