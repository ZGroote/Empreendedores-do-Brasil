import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  Building, 
  Briefcase, 
  BookOpen, 
  FileText, 
  Video, 
  Link2, 
  Heart, 
  ArrowRight,
  HardDrive,
  Download,
  Calendar,
  Lightbulb,
  Sparkles
} from 'lucide-react';

export default function MemberProfileModal({ userId, onClose, onSelectBook }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [libraryData, setLibraryData] = useState({ created_books: [], contributed_items: [] });
  const [activeTab, setActiveTab] = useState('books'); // 'books', 'materials'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // Busca dados de usuários
        const [usersRes, libRes] = await Promise.all([
          fetch('/api/users'),
          fetch(`/api/users/${userId}/library`)
        ]);

        if (usersRes.ok) {
          const users = await usersRes.json();
          const target = users.find(u => u.id === Number(userId));
          setProfile(target);
        }

        if (libRes.ok) {
          const lib = await libRes.json();
          setLibraryData(lib);
        }
      } catch (err) {
        console.error('Erro ao carregar dados do perfil:', err);
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      loadData();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="modal-card" style={{ maxWidth: '550px', textAlign: 'center', padding: '3rem' }}>
          <div style={{ color: 'var(--text-dim)' }}>Carregando perfil e acervo do empreendedor...</div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-card" 
        style={{ maxWidth: '780px', padding: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header do Perfil */}
        <div style={{
          padding: '2rem',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'linear-gradient(135deg, rgba(20, 28, 45, 0.95) 0%, rgba(13, 19, 31, 0.98) 100%)',
          position: 'relative'
        }}>
          <button
            type="button"
            className="close-btn"
            onClick={onClose}
            style={{ position: 'absolute', right: '1.5rem', top: '1.5rem' }}
          >
            <X size={20} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <img
              src={profile.avatar}
              alt={profile.name}
              style={{
                width: 76,
                height: 76,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2.5px solid var(--gold-border)',
                boxShadow: 'var(--glow-gold)'
              }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                <h2 style={{ fontSize: '1.4rem' }}>{profile.name}</h2>
                <span className="badge badge-gold">Empreendedor Membro</span>
              </div>
              <div style={{ fontSize: '0.88rem', color: 'var(--gold-light)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Building size={14} />
                <span>{profile.company}</span>
                <span style={{ color: 'var(--text-dim)' }}>•</span>
                <span style={{ color: 'var(--text-muted)' }}>{profile.role}</span>
              </div>
            </div>
          </div>

          <p style={{
            fontSize: '0.88rem',
            color: 'var(--text-muted)',
            lineHeight: 1.55,
            marginTop: '1.2rem',
            background: 'rgba(255, 255, 255, 0.03)',
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-md)'
          }}>
            {profile.bio || 'Membro ativo da rede Empreendedores do Brasil.'}
          </p>

          {/* Métricas do Perfil */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1.25rem',
            marginTop: '1.25rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-subtle)',
            fontSize: '0.82rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--gold-light)' }}>
              <BookOpen size={15} />
              <span><strong>{libraryData.created_books?.length || 0}</strong> Dossiês Criados</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--blue-light)' }}>
              <FileText size={15} />
              <span><strong>{libraryData.contributed_items?.length || 0}</strong> Materiais e PDFs</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-dim)' }}>
              <Lightbulb size={14} />
              <span>{profile.ideas_count || 0} Ideias Propostas</span>
            </div>
          </div>
        </div>

        {/* Abas do Perfil */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'rgba(7, 10, 16, 0.5)',
          padding: '0 1.5rem'
        }}>
          <button
            type="button"
            onClick={() => setActiveTab('books')}
            style={{
              padding: '0.85rem 1.25rem',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'books' ? '2px solid var(--gold-primary)' : '2px solid transparent',
              color: activeTab === 'books' ? 'var(--gold-light)' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem'
            }}
          >
            <BookOpen size={16} />
            <span>Dossiês & Livros Criados ({libraryData.created_books?.length || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('materials')}
            style={{
              padding: '0.85rem 1.25rem',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'materials' ? '2px solid var(--gold-primary)' : '2px solid transparent',
              color: activeTab === 'materials' ? 'var(--gold-light)' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem'
            }}
          >
            <FileText size={16} />
            <span>Materiais & Arquivos Contribuídos ({libraryData.contributed_items?.length || 0})</span>
          </button>
        </div>

        {/* Conteúdo da Aba */}
        <div style={{ padding: '1.75rem', maxHeight: '420px', overflowY: 'auto' }}>
          {activeTab === 'books' ? (
            libraryData.created_books?.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-dim)' }}>
                Este membro ainda não iniciou nenhum dossiê na biblioteca.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {libraryData.created_books.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => {
                      onClose();
                      if (onSelectBook) onSelectBook(b.id);
                    }}
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '1.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'var(--transition)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--gold-border)';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-subtle)';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                        <span className="badge badge-gold" style={{ fontSize: '0.68rem' }}>
                          {b.category}
                        </span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                          {b.items_count || 0} materiais • {b.likes_count || 0} apoios
                        </span>
                      </div>
                      <h4 style={{ fontSize: '1.05rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                        {b.title}
                      </h4>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0, lineClamp: 2 }}>
                        {b.description}
                      </p>
                    </div>

                    <div style={{ color: 'var(--gold-light)', paddingLeft: '1rem' }}>
                      <ArrowRight size={18} />
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            libraryData.contributed_items?.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-dim)' }}>
                Este membro ainda não fez upload de materiais no acervo.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {libraryData.contributed_items.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1rem 1.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <div style={{
                        width: 34,
                        height: 34,
                        borderRadius: 'var(--radius-sm)',
                        background: 'rgba(255, 255, 255, 0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {item.file_type === 'pdf' ? (
                          <FileText size={17} color="#F43F5E" />
                        ) : item.file_type === 'video' ? (
                          <Video size={17} color="#3B82F6" />
                        ) : (
                          <Link2 size={17} color="var(--gold-light)" />
                        )}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '0.92rem', color: 'var(--text-main)' }}>
                          {item.title}
                        </h4>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                          No dossiê: <strong style={{ color: 'var(--gold-light)' }}>{item.book_title}</strong>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          onClose();
                          if (onSelectBook) onSelectBook(item.book_id);
                        }}
                      >
                        Ver Dossiê
                      </button>
                      <a
                        href={item.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline-gold btn-sm"
                        title="Download direto"
                      >
                        <Download size={14} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
