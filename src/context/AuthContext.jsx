import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Kayıt Olma Fonksiyonu
  const signup = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  // Giriş Yapma Fonksiyonu
  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Çıkış Yapma Fonksiyonu
  const logout = () => {
    return signOut(auth);
  };

  // Kullanıcı durumunu takip et
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, signup, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);