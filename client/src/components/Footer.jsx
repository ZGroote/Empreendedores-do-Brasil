import React from 'react';
import { Crown, BookOpen, Lightbulb, Calendar, Users, Shield, ArrowUpRight, Heart } from 'lucide-react';

export default function Footer({ onNavigateTab }) {
  return (
    <footer style={{
      borderTop: '1px solid var(--border-subtle)',
      background: 'rgba(8, 12, 20, 0.98)',
      padding: '4rem 1.5rem 2.5rem',
      marginTop: 'auto',
      fontSize: '0.9rem',
      color: 'var(--text-muted)'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))',
        gap: '2.5rem',
        marginBottom: '3rem'
      }}>
        {/* Coluna 1: Marca & Missão */}
        <div style={{ maxWidth: '320px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 'var(--radius-sm)',
              background: 'linear-gradient(135deg, #1C273D 0%, #0F172A 100%)',
              border: '1px solid var(--gold-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Crown size={18} color="var(--gold-primary)" />
            </div>
            <span style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '1rem',
              fontWeight: 800,
              color: 'var(--text-main)',
              letterSpacing: '0.04em'
            }}>
              EMPREENDEDORES <span className="text-gradient-gold">DO BRASIL</span>
            </span>
          </div>

          <p style={{ fontSize: '0.85rem', lineHeight: 1.6, color: 'var(--text-dim)', marginBottom: '1rem' }}>
            A rede estratégica para líderes, fundadores e tomadores de decisão trocarem teses, jurisprudência, modelos contratuais e parcerias corporativas.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--gold-light)' }}>
            <Shield size={14} />
            <span>Ecossistema Fechado & Seguro</span>
          </div>
        </div>

        {/* Coluna 2: Navegação Rápida */}
        <div>
          <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-main)', fontWeight: 700, marginBottom: '1.2rem' }}>
            Plataforma
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: 0 }}>
            <li>
              <button
                type="button"
                onClick={() => onNavigateTab('home')}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, fontSize: '0.88rem' }}
                onMouseEnter={(e) => e.target.style.color = 'var(--gold-light)'}
                onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
              >
                Início
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNavigateTab('library')}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, fontSize: '0.88rem' }}
                onMouseEnter={(e) => e.target.style.color = 'var(--gold-light)'}
                onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
              >
                Acervo de Dossiês & Jurisprudência
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNavigateTab('lessons')}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, fontSize: '0.88rem' }}
                onMouseEnter={(e) => e.target.style.color = 'var(--gold-light)'}
                onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
              >
                Aulas em Vídeo
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNavigateTab('ideas')}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, fontSize: '0.88rem' }}
                onMouseEnter={(e) => e.target.style.color = 'var(--gold-light)'}
                onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
              >
                Banco de Ideias & Inovações
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNavigateTab('events')}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, fontSize: '0.88rem' }}
                onMouseEnter={(e) => e.target.style.color = 'var(--gold-light)'}
                onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
              >
                Palestras Internas & Reuniões
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNavigateTab('members')}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, fontSize: '0.88rem' }}
                onMouseEnter={(e) => e.target.style.color = 'var(--gold-light)'}
                onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
              >
                Diretório de Membros
              </button>
            </li>
          </ul>
        </div>

        {/* Coluna 3: Governança & Práticas */}
        <div>
          <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-main)', fontWeight: 700, marginBottom: '1.2rem' }}>
            Governança & Diretrizes
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: 0, fontSize: '0.88rem' }}>
            <li>Confidencialidade entre Membros</li>
            <li>Código de Ética e Parcerias B2B</li>
            <li>Critérios de Admissão de Novos Membros</li>
            <li>Auditoria e Moderação de Dossiês</li>
            <li>Privacidade & Proteção de Dados (LGPD)</li>
          </ul>
        </div>

        {/* Coluna 4: Suporte & Sobre */}
        <div>
          <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-main)', fontWeight: 700, marginBottom: '1.2rem' }}>
            Sobre o Projeto
          </h4>
          <p style={{ fontSize: '0.85rem', lineHeight: 1.6, color: 'var(--text-dim)', marginBottom: '1rem' }}>
            Desenvolvido para autonomia total com SQLite local de alta performance, sem dependência de terceiros.
          </p>
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem',
            fontSize: '0.8rem',
            color: 'var(--text-muted)'
          }}>
            Status: <span style={{ color: 'var(--emerald-primary)', fontWeight: 600 }}>● Sistema Operacional</span>
          </div>
        </div>
      </div>

      {/* Linha Inferior com Copyright */}
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        paddingTop: '2rem',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        fontSize: '0.82rem',
        color: 'var(--text-dim)'
      }}>
        <div>
          © 2026 Empreendedores do Brasil. Todos os direitos reservados.
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          Construído por e para fundadores brasileiros.
        </div>
      </div>
    </footer>
  );
}
