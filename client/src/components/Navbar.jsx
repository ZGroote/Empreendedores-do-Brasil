import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Crown,
  BookOpen,
  Lightbulb,
  Calendar,
  Plus,
  ChevronDown,
  LogOut,
  Sparkles,
  Building,
  Menu,
  X,
  Film
} from 'lucide-react';

const navItems = [
  { id: 'home', label: 'Início' },
  { id: 'library', label: 'Acervo & Dossiês' },
  { id: 'lessons', label: 'Aulas' },
  { id: 'ideas', label: 'Banco de Ideias' },
  { id: 'events', label: 'Palestras & Encontros' },
  { id: 'members', label: 'Membros' }
];

export default function Navbar({
  activeTab,
  setActiveTab,
  onOpenNewIdea,
  onOpenNewEvent,
  onOpenNewBook,
  onOpenNewLesson,
  onSelectMember
}) {
  const { user, logout, setIsAuthModalOpen, demoAccounts, loginAsDemo } = useAuth();
  // Um único menu aberto por vez: 'create' | 'profile' | 'mobile' | null
  const [openMenu, setOpenMenu] = useState(null);

  const toggle = (name) => setOpenMenu(openMenu === name ? null : name);
  const close = () => setOpenMenu(null);

  function go(tab) {
    setActiveTab(tab);
    close();
  }

  const createActions = [
    { label: 'Novo Dossiê / Livro', icon: <BookOpen size={15} color="var(--gold-light)" />, run: onOpenNewBook },
    { label: 'Enviar Aula em Vídeo', icon: <Film size={15} color="#34D399" />, run: onOpenNewLesson },
    { label: 'Propor Ideia', icon: <Lightbulb size={15} color="var(--blue-light)" />, run: onOpenNewIdea },
    { label: 'Agendar Palestra/Reunião', icon: <Calendar size={15} color="#C084FC" />, run: onOpenNewEvent }
  ];

  return (
    <header className="navbar">
      {/* Fundo invisível que fecha qualquer menu ao tocar/clicar fora (funciona no celular) */}
      {openMenu && <div className="navbar-backdrop" onClick={close} />}

      <div className="navbar-inner">
        <button type="button" className="navbar-brand" onClick={() => go('home')} aria-label="Ir para o início">
          <span className="navbar-logo">
            <Crown size={20} color="var(--gold-primary)" />
          </span>
          <span>
            <span className="navbar-title">
              EMPREENDEDORES <span className="text-gradient-gold">DO BRASIL</span>
            </span>
            <span className="navbar-subtitle">Comunidade Estratégica</span>
          </span>
        </button>

        <nav className={`navbar-links ${openMenu === 'mobile' ? 'open' : ''}`}>
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`navbar-link ${activeTab === item.id ? 'active' : ''}`}
              aria-current={activeTab === item.id ? 'page' : undefined}
              onClick={() => go(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="navbar-actions">
          <div className="dropdown-anchor">
            <button
              type="button"
              className="btn btn-gold btn-sm navbar-publish"
              aria-expanded={openMenu === 'create'}
              onClick={() => toggle('create')}
            >
              <Plus size={15} />
              <span className="hide-sm">Publicar</span>
              <ChevronDown size={13} className="hide-sm" />
            </button>

            {openMenu === 'create' && (
              <div className="dropdown-menu" style={{ width: 230 }}>
                {createActions.map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    className="dropdown-item"
                    onClick={() => {
                      close();
                      action.run();
                    }}
                  >
                    {action.icon}
                    <span>{action.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {user ? (
            <div className="dropdown-anchor">
              <button
                type="button"
                className="navbar-avatar-btn"
                aria-expanded={openMenu === 'profile'}
                onClick={() => toggle('profile')}
              >
                <img src={user.avatar} alt={user.name} />
                <span className="hide-sm">{user.name.split(' ')[0]}</span>
                <ChevronDown size={13} color="var(--text-dim)" />
              </button>

              {openMenu === 'profile' && (
                <div className="dropdown-menu" style={{ width: 250, padding: '0.75rem' }}>
                  <div style={{ padding: '0.4rem 0.5rem 0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{user.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{user.email}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gold-light)', marginTop: '0.2rem' }}>
                      {user.role} @ {user.company}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn btn-outline-gold btn-sm"
                    style={{ width: '100%', margin: '0.6rem 0 0.25rem', justifyContent: 'flex-start' }}
                    onClick={() => {
                      close();
                      if (onSelectMember) onSelectMember(user.id);
                    }}
                  >
                    <BookOpen size={14} />
                    <span>Meu Perfil & Acervo</span>
                  </button>

                  <div style={{ padding: '0.5rem 0.25rem 0.25rem' }}>
                    <div className="dropdown-label">
                      <Sparkles size={11} color="var(--gold-light)" />
                      Simular outro membro
                    </div>
                    {demoAccounts.filter(d => d.email !== user.email).slice(0, 3).map(demo => (
                      <button
                        key={demo.email}
                        type="button"
                        className="dropdown-item dropdown-item-sm"
                        onClick={() => {
                          loginAsDemo(demo.email);
                          close();
                        }}
                      >
                        <Building size={12} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {demo.name.split(' ')[0]} ({demo.company})
                        </span>
                      </button>
                    ))}
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '0.5rem', paddingTop: '0.4rem' }}>
                    <button
                      type="button"
                      className="dropdown-item"
                      style={{ color: 'var(--rose-primary)' }}
                      onClick={() => {
                        logout();
                        close();
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
            <button type="button" className="btn btn-outline-gold btn-sm" onClick={() => setIsAuthModalOpen(true)}>
              Entrar
            </button>
          )}

          <button
            type="button"
            className="navbar-burger"
            aria-label={openMenu === 'mobile' ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={openMenu === 'mobile'}
            onClick={() => toggle('mobile')}
          >
            {openMenu === 'mobile' ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
    </header>
  );
}
