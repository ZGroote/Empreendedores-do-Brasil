import React from 'react';

const links = [
  { id: 'library', label: 'Biblioteca' },
  { id: 'lessons', label: 'Aulas' },
  { id: 'ideas', label: 'Banco de ideias' },
  { id: 'events', label: 'Agenda' },
  { id: 'members', label: 'Membros' }
];

export default function Footer({ onNavigateTab }) {
  return (
    <footer style={{ borderTop: '1px solid var(--ink)', marginTop: 'auto' }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '3rem 1.5rem 2rem',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: '2rem'
      }}>
        <div style={{ maxWidth: '360px' }}>
          <button
            type="button"
            onClick={() => onNavigateTab('home')}
            className="navbar-title"
            style={{ background: 'none', border: 'none', color: 'var(--ink)', cursor: 'pointer', padding: 0 }}
          >
            Empreendedores <em>do Brasil</em>
          </button>
          <p style={{ fontSize: '0.9rem', color: 'var(--ink-2)', marginTop: '0.75rem' }}>
            Um grupo fechado de empreendedores que troca ideias, conhecimento e contatos.
          </p>
        </div>

        <nav style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem 1.75rem', alignItems: 'flex-start' }}>
          {links.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => onNavigateTab(link.id)}
              className="footer-link"
            >
              {link.label}
            </button>
          ))}
        </nav>
      </div>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '1.25rem 1.5rem 2rem',
        borderTop: '1px solid var(--rule)',
        fontSize: '0.8rem',
        color: 'var(--ink-3)'
      }}>
        © {new Date().getFullYear()} Empreendedores do Brasil
      </div>
    </footer>
  );
}
