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

export default function MembersList({ onSelectTag, onSelectMember }) {
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
      <header className="page-header">
        <div>
          <span className="badge badge-accent">Membros</span>
          <h1>Quem faz <span className="em-accent">parte</span></h1>
          <p>
            Fundadores e executivos do grupo. Abra um perfil para ver o que cada um já compartilhou.
          </p>
        </div>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--ink-3)' }}>
          Carregando membros da rede...
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(320px, 100%), 1fr))',
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
              {/* Foto & Dados Principais (Clicável para ver o perfil) */}
              <div 
                onClick={() => onSelectMember && onSelectMember(m.id)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', cursor: 'pointer' }}
                title="Clique para ver perfil e acervo deste membro"
              >
                <img
                  src={m.avatar}
                  alt={m.name}
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid var(--accent-line)'
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontSize: '1.05rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--ink)' }}>
                    {m.name}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Building size={13} />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.company}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--ink-3)' }}>
                    {m.role}
                  </div>
                </div>
              </div>

              {/* Bio */}
              <p style={{
                fontSize: '0.85rem',
                color: 'var(--ink-2)',
                lineHeight: 1.5,
                background: 'var(--fill)',
                padding: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                minHeight: '65px'
              }}>
                {m.bio || 'Membro ativo na comunidade de negócios.'}
              </p>

              {/* Botão de Ver Acervo do Membro */}
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => onSelectMember && onSelectMember(m.id)}
                style={{ width: '100%', fontSize: '0.8rem', justifyContent: 'center' }}
              >
                Ver perfil <ArrowRight size={13} />
              </button>

              {/* Estatísticas de Contribuição */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '0.5rem',
                borderTop: '1px solid var(--rule)',
                fontSize: '0.78rem',
                color: 'var(--ink-3)'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Lightbulb size={13} color="var(--accent)" />
                  <strong>{m.ideas_count}</strong> {m.ideas_count === 1 ? 'ideia' : 'ideias'}
                </span>

                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Calendar size={13} color="var(--signal)" />
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
                      color: 'var(--accent)',
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
