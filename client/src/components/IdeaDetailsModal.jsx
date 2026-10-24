import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  Heart, 
  MessageSquare, 
  Send, 
  Tag, 
  Sparkles, 
  Clock, 
  Building, 
  Share2,
  CheckCircle2
} from 'lucide-react';

export default function IdeaDetailsModal({ ideaId, onClose, onIdeaUpdated }) {
  const { user, token, setIsAuthModalOpen } = useAuth();
  const [idea, setIdea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [voting, setVoting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (!ideaId) return;

    async function fetchIdeaDetails() {
      setLoading(true);
      try {
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        const res = await fetch(`/api/ideas/${ideaId}`, { headers });
        if (res.ok) {
          const data = await res.json();
          setIdea(data);
        }
      } catch (err) {
        console.error('Erro ao carregar detalhes da ideia:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchIdeaDetails();
  }, [ideaId, token]);

  async function handleVote() {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    if (voting || !idea) return;

    setVoting(true);
    // Atualização otimista
    const prevHasVoted = idea.has_voted;
    const prevCount = idea.votes_count;
    setIdea({
      ...idea,
      has_voted: !prevHasVoted,
      votes_count: prevHasVoted ? prevCount - 1 : prevCount + 1
    });

    try {
      const res = await fetch(`/api/ideas/${idea.id}/vote`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setIdea(prev => ({
          ...prev,
          has_voted: data.has_voted,
          votes_count: data.votes_count
        }));
        if (onIdeaUpdated) onIdeaUpdated();
      }
    } catch (err) {
      console.error('Erro ao votar:', err);
      // Reverte em caso de erro
      setIdea(prev => ({ ...prev, has_voted: prevHasVoted, votes_count: prevCount }));
    } finally {
      setVoting(false);
    }
  }

  async function handleAddComment(e) {
    e.preventDefault();
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    if (!commentText.trim() || submittingComment) return;

    setSubmittingComment(true);
    try {
      const res = await fetch(`/api/ideas/${idea.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: commentText.trim() })
      });

      if (res.ok) {
        const newComment = await res.json();
        setIdea(prev => ({
          ...prev,
          comments_count: prev.comments_count + 1,
          comments: [...prev.comments, newComment]
        }));
        setCommentText('');
        if (onIdeaUpdated) onIdeaUpdated();
      }
    } catch (err) {
      console.error('Erro ao enviar comentário:', err);
    } finally {
      setSubmittingComment(false);
    }
  }

  function handleShare() {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  }

  if (!ideaId) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '780px' }}>
        
        {/* Header do Modal */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span className="badge badge-accent" style={{ fontSize: '0.8rem' }}>
              {idea ? idea.status : 'Carregando...'}
            </span>
            {idea && (
              <span style={{ fontSize: '0.875rem', color: 'var(--ink-3)' }}>
                Categoria: <strong style={{ color: 'var(--ink-2)' }}>{idea.category}</strong>
              </span>
            )}
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="modal-body" style={{ padding: '1.75rem' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--ink-3)' }}>
              Carregando detalhes e discussões da ideia...
            </div>
          ) : !idea ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--danger)' }}>
              Ideia não encontrada.
            </div>
          ) : (
            <>
              {/* Autor da Ideia */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <img
                    src={idea.author.avatar}
                    alt={idea.author.name}
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid var(--accent-line)'
                    }}
                  />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--ink)' }}>
                      {idea.author.name}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--accent)' }}>
                      {idea.author.role} @ {idea.author.company}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleShare}
                  style={{ gap: '0.4rem' }}
                >
                  {copiedLink ? <CheckCircle2 size={15} color="var(--accent)" /> : <Share2 size={15} />}
                  <span>{copiedLink ? 'Link Copiado!' : 'Compartilhar'}</span>
                </button>
              </div>

              {/* Título da Ideia */}
              <h2 style={{ fontSize: '1.45rem', marginBottom: '1rem', lineHeight: 1.3 }}>
                {idea.title}
              </h2>

              {/* Descrição Completa */}
              <div style={{
                background: 'var(--surface)',
                border: '1px solid var(--rule)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                fontSize: '1.0rem',
                lineHeight: 1.7,
                color: '#E2E8F0',
                marginBottom: '1.25rem',
                whiteSpace: 'pre-line'
              }}>
                {idea.description}
              </div>

              {/* Tags da Ideia */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.75rem' }}>
                {idea.tags.map((tag, idx) => (
                  <span key={idx} className="tag-chip" style={{ fontSize: '0.8rem' }}>
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Barra de Apoio e Métricas */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1.25rem',
                background: 'var(--accent-soft)',
                border: '1px solid var(--accent-line)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '2rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className={`btn btn-sm ${idea.has_voted ? 'btn-primary' : 'btn-outline'}`}
                    onClick={handleVote}
                    style={{ gap: '0.4rem' }}
                  >
                    <Heart size={16} fill={idea.has_voted ? 'currentColor' : 'none'} />
                    <span>{idea.has_voted ? 'Você Apoiou' : 'Apoiar esta Ideia'}</span>
                  </button>
                  <span style={{ fontSize: '0.875rem', color: 'var(--ink-2)', marginLeft: '0.3rem' }}>
                    <strong>{idea.votes_count}</strong> {idea.votes_count === 1 ? 'voto de apoio' : 'votos de apoio'}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', color: 'var(--ink-2)' }}>
                  <MessageSquare size={16} color="var(--signal)" />
                  <span><strong>{idea.comments.length}</strong> {idea.comments.length === 1 ? 'contribuição' : 'contribuições'}</span>
                </div>
              </div>

              {/* =======================================
                  SISTEMA DE COMENTÁRIOS E DISCUSSÕES
                  ======================================= */}
              <div>
                <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  <MessageSquare size={18} color="var(--accent)" />
                  <span>Discussão Estratégica entre Membros</span>
                </h3>

                {/* Formulário de Novo Comentário */}
                <form onSubmit={handleAddComment} style={{ marginBottom: '1.75rem' }}>
                  <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                    <img
                      src={user ? user.avatar : 'https://api.dicebear.com/7.x/initials/svg?seed=Guest'}
                      alt=""
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '1px solid var(--rule-strong)',
                        marginTop: '0.2rem'
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <textarea
                        className="form-textarea"
                        style={{ minHeight: '80px', marginBottom: '0.5rem' }}
                        placeholder={user ? `Adicione sua perspectiva como ${user.name.split(' ')[0]}...` : 'Faça login para participar da discussão...'}
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onFocus={() => { if (!user) setIsAuthModalOpen(true); }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          type="submit"
                          className="btn btn-primary btn-sm"
                          disabled={submittingComment || !commentText.trim()}
                        >
                          <Send size={14} />
                          <span>{submittingComment ? 'Publicando...' : 'Comentar'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </form>

                {/* Feed de Comentários */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {idea.comments.length === 0 ? (
                    <div style={{
                      textAlign: 'center',
                      padding: '2rem',
                      background: 'var(--fill)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--ink-3)',
                      fontSize: '0.94rem'
                    }}>
                      Ainda não há comentários nesta ideia. Seja o primeiro a contribuir com sua visão!
                    </div>
                  ) : (
                    idea.comments.map((comment) => (
                      <div
                        key={comment.id}
                        style={{
                          background: 'var(--surface)',
                          border: '1px solid var(--rule)',
                          borderRadius: 'var(--radius-md)',
                          padding: '1rem 1.15rem',
                          transition: 'var(--transition)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <img
                              src={comment.user.avatar}
                              alt={comment.user.name}
                              style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
                            />
                            <div>
                              <span style={{ fontWeight: 600, fontSize: '0.94rem', color: 'var(--ink)' }}>
                                {comment.user.name}
                              </span>
                              <span style={{ fontSize: '0.8rem', color: 'var(--accent)', marginLeft: '0.5rem' }}>
                                {comment.user.role} @ {comment.user.company}
                              </span>
                            </div>
                          </div>
                          <span style={{ fontSize: '0.8rem', color: 'var(--ink-3)' }}>
                            {new Date(comment.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <p style={{ fontSize: '0.94rem', color: '#CBD5E1', lineHeight: 1.6, marginLeft: '2.65rem' }}>
                          {comment.content}
                        </p>
                      </div>
                    ))
                  )}
                </div>

              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
