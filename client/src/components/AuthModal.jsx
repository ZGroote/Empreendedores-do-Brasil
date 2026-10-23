import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail, User, Building, Briefcase, Sparkles, ArrowRight } from 'lucide-react';

export default function AuthModal({ isOpen, onClose }) {
  const { login, register, loginAsDemo, demoAccounts } = useAuth();
  const [tab, setTab] = useState('login'); // 'login' ou 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [bio, setBio] = useState('');

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (tab === 'login') {
        await login(email, password);
      } else {
        await register({ name, email, password, company, role, bio });
      }
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleQuickDemo(demoEmail) {
    setError('');
    setLoading(true);
    try {
      await loginAsDemo(demoEmail);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        
        {/* Header do Modal */}
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="text-gradient-gold">Empreendedores do Brasil</span>
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
              {tab === 'login' ? 'Acesse sua conta para interagir e agendar' : 'Junte-se à rede exclusiva de fundadores'}
            </p>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Fechar modal">
            <X size={20} />
          </button>
        </div>

        {/* Abas de Troca Login / Registro */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'rgba(11, 16, 26, 0.4)'
        }}>
          <button
            type="button"
            onClick={() => { setTab('login'); setError(''); }}
            style={{
              flex: 1,
              padding: '0.85rem',
              background: 'transparent',
              border: 'none',
              borderBottom: tab === 'login' ? '2px solid var(--gold-primary)' : '2px solid transparent',
              color: tab === 'login' ? 'var(--gold-light)' : 'var(--text-dim)',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'var(--transition)'
            }}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => { setTab('register'); setError(''); }}
            style={{
              flex: 1,
              padding: '0.85rem',
              background: 'transparent',
              border: 'none',
              borderBottom: tab === 'register' ? '2px solid var(--gold-primary)' : '2px solid transparent',
              color: tab === 'register' ? 'var(--gold-light)' : 'var(--text-dim)',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'var(--transition)'
            }}
          >
            Cadastrar Novo Membro
          </button>
        </div>

        <div className="modal-body" style={{ paddingTop: '1.25rem' }}>
          
          {/* Mensagem de Erro */}
          {error && (
            <div style={{
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              color: '#FDA4AF',
              fontSize: '0.85rem',
              marginBottom: '1.25rem'
            }}>
              {error}
            </div>
          )}

          {/* Atalho Demo - Muito prático para testar sem precisar digitar */}
          <div style={{
            background: 'rgba(212, 175, 55, 0.05)',
            border: '1px dashed var(--gold-border)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--gold-light)', marginBottom: '0.75rem' }}>
              <Sparkles size={14} />
              Acesso Rápido de Teste (1 Clique):
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {demoAccounts.slice(0, 3).map((demo) => (
                <button
                  key={demo.email}
                  type="button"
                  onClick={() => handleQuickDemo(demo.email)}
                  disabled={loading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.5rem 0.75rem',
                    background: 'rgba(16, 24, 40, 0.6)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-main)',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'var(--transition)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--gold-border)';
                    e.currentTarget.style.background = 'rgba(212, 175, 55, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    e.currentTarget.style.background = 'rgba(16, 24, 40, 0.6)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <img
                      src={demo.avatar}
                      alt={demo.name}
                      style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <span style={{ fontWeight: 600 }}>{demo.name}</span>
                      <span style={{ color: 'var(--text-dim)', marginLeft: '0.4rem', fontSize: '0.75rem' }}>({demo.company})</span>
                    </div>
                  </div>
                  <ArrowRight size={14} color="var(--gold-light)" />
                </button>
              ))}
            </div>
          </div>

          {/* Formulário Principal */}
          <form onSubmit={handleSubmit}>
            {tab === 'register' && (
              <>
                <div className="form-group">
                  <label className="form-label">Nome Completo</label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      className="form-input"
                      style={{ paddingLeft: '2.5rem' }}
                      placeholder="Ex: Guilherme Santos"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Sua Empresa / Startup</label>
                    <div style={{ position: 'relative' }}>
                      <Building size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        type="text"
                        className="form-input"
                        style={{ paddingLeft: '2.5rem' }}
                        placeholder="Ex: NovaTech Brasil"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Seu Cargo / Atuação</label>
                    <div style={{ position: 'relative' }}>
                      <Briefcase size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        type="text"
                        className="form-input"
                        style={{ paddingLeft: '2.5rem' }}
                        placeholder="Ex: Founder & CEO"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Breve Bio do Negócio</label>
                  <textarea
                    className="form-textarea"
                    style={{ minHeight: '65px' }}
                    placeholder="Conte resumidamente seu nicho de atuação e interesses no grupo..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="form-group">
              <label className="form-label">E-mail Corporativo</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="seu@negocio.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Senha de Acesso</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-gold"
              style={{ width: '100%', marginTop: '0.75rem', height: '46px' }}
              disabled={loading}
            >
              {loading ? 'Processando...' : (tab === 'login' ? 'Entrar na Plataforma' : 'Criar Conta de Membro')}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
