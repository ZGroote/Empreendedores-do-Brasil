import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Crown, 
  BookOpen, 
  Lightbulb, 
  Calendar, 
  Users, 
  Plus, 
  ChevronDown, 
  LogOut, 
  Sparkles, 
  User, 
  Building,
  PlusCircle
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  onOpenNewIdea, 
  onOpenNewEvent,
  onOpenNewBook,
  onSelectMember
}) {
  const { user, logout, setIsAuthModalOpen, demoAccounts, loginAsDemo } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [createDropdownOpen, setCreateDropdownOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Início' },
    { id: 'library', label: 'Acervo & Dossiês' },
    { id: 'ideas', label: 'Banco de Ideias' },
    { id: 'events', label: 'Palestras & Encontros' },
    { id: 'members', label: 'Membros' }
  ];

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(9, 13, 22, 0.88)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0.85rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1.5rem'
      }}>
        
        {/* Logo & Marca Corporativa */}
        <div 
          onClick={() => setActiveTab('home')} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem', 
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--radius-sm)',
            background: 'linear-gradient(135deg, #1C273D 0%, #0F172A 100%)',
            border: '1px solid var(--gold-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.4)'
          }}>
            <Crown size={20} color="var(--gold-primary)" />
          </div>
          <div>
            <div style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '1.02rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
              lineHeight: 1.1,
              color: '#FFFFFF'
            }}>
              EMPREENDEDORES <span className="text-gradient-gold">DO BRASIL</span>
            </div>
            <div style={{
              fontSize: '0.68rem',
              color: 'var(--text-dim)',
              letterSpacing: '0.05em',
              fontWeight: 600,
              textTransform: 'uppercase'
            }}>
              Comunidade Estratégica
            </div>
          </div>
        </div>

        {/* Links de Navegação de Site Normal */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem'
        }}>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                style={{
                  background: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                  border: 'none',
                  borderBottom: isActive ? '2px solid var(--gold-primary)' : '2px solid transparent',
                  borderRadius: isActive ? '6px 6px 0 0' : '6px',
                  color: isActive ? 'var(--gold-light)' : 'var(--text-muted)',
                  fontSize: '0.9rem',
                  fontWeight: isActive ? 700 : 500,
                  padding: '0.55rem 0.9rem',
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.target.style.color = '#FFFFFF';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.target.style.color = 'var(--text-muted)';
                }}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Lado Direito: Ações Limpas & Perfil */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          
          {/* Botão Unificado "+ Criar" (Dropdown elegante) */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              className="btn btn-gold btn-sm"
              onClick={() => {
                setCreateDropdownOpen(!createDropdownOpen);
                setProfileDropdownOpen(false);
              }}
              style={{
                borderRadius: 'var(--radius-full)',
                padding: '0.45rem 0.9rem',
                fontSize: '0.84rem'
              }}
            >
              <Plus size={15} />
              <span>Publicar</span>
              <ChevronDown size={13} />
            </button>

            {createDropdownOpen && (
              <div 
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 8px)',
                  width: 220,
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-bright)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)',
                  padding: '0.4rem',
                  zIndex: 200,
                  animation: 'fadeIn 0.15s ease-out'
                }}
                onMouseLeave={() => setCreateDropdownOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => {
                    setCreateDropdownOpen(false);
                    onOpenNewBook();
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-main)',
                    padding: '0.55rem 0.65rem',
                    fontSize: '0.84rem',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <BookOpen size={15} color="var(--gold-light)" />
                  <span>Novo Dossiê / Livro</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCreateDropdownOpen(false);
                    onOpenNewIdea();
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-main)',
                    padding: '0.55rem 0.65rem',
                    fontSize: '0.84rem',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <Lightbulb size={15} color="var(--blue-light)" />
                  <span>Propor Ideia</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCreateDropdownOpen(false);
                    onOpenNewEvent();
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-main)',
                    padding: '0.55rem 0.65rem',
                    fontSize: '0.84rem',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <Calendar size={15} color="#C084FC" />
                  <span>Agendar Palestra/Reunião</span>
                </button>
              </div>
            )}
          </div>

          {/* Autenticação & Perfil */}
          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => {
                  setProfileDropdownOpen(!profileDropdownOpen);
                  setCreateDropdownOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-full)',
                  padding: '0.25rem 0.65rem 0.25rem 0.35rem',
                  cursor: 'pointer',
                  color: 'var(--text-main)',
                  transition: 'var(--transition)'
                }}
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '1px solid var(--gold-border)'
                  }}
                />
                <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                  {user.name.split(' ')[0]}
                </span>
                <ChevronDown size={13} color="var(--text-dim)" />
              </button>

              {profileDropdownOpen && (
                <div 
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 'calc(100% + 8px)',
                    width: 240,
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-bright)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-lg)',
                    padding: '0.75rem',
                    zIndex: 200,
                    animation: 'fadeIn 0.15s ease-out'
                  }}
                  onMouseLeave={() => setProfileDropdownOpen(false)}
                >
                  <div style={{ padding: '0.4rem 0.5rem 0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{user.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{user.email}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gold-light)', marginTop: '0.2rem' }}>
                      {user.role} @ {user.company}
                    </div>
                  </div>

                  {/* Atalho para o Perfil e Acervo */}
                  <div style={{ padding: '0.5rem 0.2rem 0.25rem' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        if (onSelectMember && user) onSelectMember(user.id);
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: 'rgba(212, 175, 55, 0.1)',
                        border: '1px solid var(--gold-border)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--gold-light)',
                        padding: '0.5rem 0.65rem',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      <BookOpen size={14} />
                      <span>Meu Perfil & Acervo</span>
                    </button>
                  </div>

                  {/* Alternar Usuário de Teste */}
                  <div style={{ padding: '0.5rem 0.5rem 0.25rem' }}>
                    <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: 700, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Sparkles size={11} color="var(--gold-light)" />
                      Simular Outro Membro:
                    </div>
                    {demoAccounts.filter(d => d.email !== user.email).slice(0, 3).map(demo => (
                      <button
                        key={demo.email}
                        type="button"
                        onClick={() => {
                          loginAsDemo(demo.email);
                          setProfileDropdownOpen(false);
                        }}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-muted)',
                          padding: '0.35rem 0.4rem',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          borderRadius: 'var(--radius-sm)',
                          textAlign: 'left'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-main)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                      >
                        <Building size={11} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {demo.name.split(' ')[0]} ({demo.company})
                        </span>
                      </button>
                    ))}
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '0.5rem', paddingTop: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setProfileDropdownOpen(false);
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--rose-primary)',
                        padding: '0.4rem 0.5rem',
                        fontSize: '0.8rem',
                        cursor: 'pointer'
                      }}
                    >
                      <LogOut size={14} />
                      <span>Encerrar Sessão</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setIsAuthModalOpen(true)}
              >
                Entrar
              </button>
              <button
                type="button"
                className="btn btn-outline-gold btn-sm"
                onClick={() => setIsAuthModalOpen(true)}
              >
                Fazer Parte
              </button>
            </div>
          )}

        </div>

      </div>
    </header>
  );
}
