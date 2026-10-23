import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  Building, 
  Briefcase, 
  Lightbulb, 
  Calendar, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function MembersList({ onSelectTag }) {
  const { user, loginAsDemo, setIsAuthModalOpen } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMembers() {
      setLoading(true);
      try {
        const res = await fetch('/api/users');
        if (res.ok) {
          const data = await res.json();
          setMembers(data);
        }
      } catch (err) {
        console.error('Erro ao buscar membros:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchMembers();
  }, []);

  return (
    <div>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(16, 24, 40, 0.8) 0%, rgba(13, 19, 31, 0.9) 100%)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
        padding: '2.25rem 2rem',
        marginBottom: '2rem',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
          <span className="badge badge-gold">Diretório de Fundadores</span>
        </div>
        <h1 style={{ fontSize: '2.1rem', lineHeight: 1.2 }}>
          Membros do <span className="text-gradient-gold">Empreendedores do Brasil</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '720px', marginTop: '0.4rem' }}>
          Conheça os líderes, fundadores e tomadores de decisão que compõem o grupo. Troque experiências e construa parcerias de alto valor.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-dim)' }}>
          Carregando membros da rede...
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.5rem'
        }}>
          {members.map((m) => (
            <div
              key={m.id}
              className="glass-panel"
              style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                position: 'relative'
              }}
            >
              {/* Foto & Dados Principais */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <img
                  src={m.avatar}
                  alt={m.name}
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid var(--gold-border)'
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontSize: '1.05rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {m.name}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--gold-light)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Building size={13} />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.company}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    {m.role}
                  </div>
                </div>
              </div>

              {/* Bio */}
              <p style={{
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
                lineHeight: 1.5,
                background: 'rgba(255, 255, 255, 0.02)',
                padding: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                minHeight: '65px'
              }}>
                {m.bio || 'Membro ativo na comunidade de negócios.'}
              </p>

              {/* Estatísticas de Contribuição */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '0.5rem',
                borderTop: '1px solid var(--border-subtle)',
                fontSize: '0.78rem',
                color: 'var(--text-dim)'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Lightbulb size={13} color="var(--gold-light)" />
                  <strong>{m.ideas_count}</strong> {m.ideas_count === 1 ? 'ideia' : 'ideias'}
                </span>

                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Calendar size={13} color="var(--blue-light)" />
                  <strong>{m.events_attended_count}</strong> {m.events_attended_count === 1 ? 'evento' : 'eventos'}
                </span>

                {/* Botão para testar com esse perfil */}
                {(!user || user.email !== m.email) && (
                  <button
                    type="button"
                    onClick={() => loginAsDemo(m.email)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--gold-light)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.2rem'
                    }}
                    title="Alternar login para este usuário de teste"
                  >
                    Simular <ArrowRight size={11} />
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
