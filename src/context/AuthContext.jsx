import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GithubAuthProvider,
  signOut 
} from 'firebase/auth';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loginWithGithub() {
    const provider = new GithubAuthProvider();
    const result = await signInWithPopup(auth, provider);
    
    // Obtener el nombre de usuario de Github
    const githubUsername = result._tokenResponse.screenName || result.user.reloadUserInfo.screenName;
    
    // Validar que solo el usuario permitido pueda entrar al admin
    if (githubUsername && githubUsername.toLowerCase() !== 'gad07') {
      await logout();
      throw new Error('Acceso denegado. No eres el administrador.');
    }
    
    return result;
  }

  function logout() {
    return signOut(auth);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loginWithGithub,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
