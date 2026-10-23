import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const DEMO_ACCOUNTS = [
  {
    name: 'Ana Paula Silveira',
    email: 'ana@omnipay.com.br',
    company: 'OmniPay Fintech',
    role: 'Founder & CEO',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  },
  {
    name: 'Carlos Eduardo Ramos',
    email: 'carlos@agrotech.com.br',
    company: 'AgroTech Brasil',
    role: 'Co-founder & CTO',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    name: 'Mariana Botelho',
    email: 'mariana@logix.com.br',
    company: 'Logix Express',
    role: 'Head de Growth',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
  },
  {
    name: 'Lucas Mendonça',
    email: 'lucas@nexusia.com.br',
    company: 'Nexus IA Generativa',
    role: 'Fundador',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    name: 'Empreendedor Membro',
    email: 'demo@empreendedores.com.br',
    company: 'Sua Startup',
    role: 'Fundador & Diretor',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  }
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('emp_br_token'));
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Carrega usuário ao inicializar se existir token
  useEffect(() => {
    async function loadUser() {
      const storedToken = localStorage.getItem('emp_br_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${storedToken}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setToken(storedToken);
        } else {
          localStorage.removeItem('emp_br_token');
          setUser(null);
          setToken(null);
        }
      } catch (err) {
        console.error('Falha ao verificar sessão do usuário:', err);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  // Login com e-mail e senha
  async function login(email, password) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Erro ao realizar login');
    }

    localStorage.setItem('emp_br_token', data.token);
    setToken(data.token);
    setUser(data.user);
    setIsAuthModalOpen(false);
    return data.user;
  }

  // Cadastro de novo usuário
  async function register(userData) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Erro ao cadastrar usuário');
    }

    localStorage.setItem('emp_br_token', data.token);
    setToken(data.token);
    setUser(data.user);
    setIsAuthModalOpen(false);
    return data.user;
  }

  // Login rápido de demonstração (senha padrão '123456')
  async function loginAsDemo(email) {
    return login(email, '123456');
  }

  // Logout
  function logout() {
    localStorage.removeItem('emp_br_token');
    setUser(null);
    setToken(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthModalOpen,
        setIsAuthModalOpen,
        login,
        register,
        loginAsDemo,
        logout,
        demoAccounts: DEMO_ACCOUNTS
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
