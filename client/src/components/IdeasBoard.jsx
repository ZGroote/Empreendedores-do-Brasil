import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Lightbulb, 
  Search, 
  Heart, 
  MessageSquare, 
  PlusCircle, 
  SlidersHorizontal,
  Flame,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Tag,
  Building
} from 'lucide-react';

export default function IdeasBoard({ onSelectIdea, onOpenNewIdea }) {
  const { user, token, setIsAuthModalOpen } = useAuth();
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ members: 0, ideas: 0, events: 0, comments: 0 });

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [sortBy, setSortBy] = useState('popular'); // 'popular', 'recent', 'discussed'

  // Carregar dados
  useEffect(() => {
    fetchIdeas();
    fetchStats();
  }, [selectedTag, sortBy, token]);

  async function fetchStats() {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function fetchIdeas() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedTag) params.append('tag', selectedTag);
      if (sortBy) params.append('sort', sortBy);

      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const res = await fetch(`/api/ideas?${params.toString()}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setIdeas(data);
      }
    } catch (err) {
      console.error('Erro ao buscar ideias:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    fetchIdeas();
  }

  async function handleVote(e, idea) {
    e.stopPropagation();
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    // Otimista
    const prevHasVoted = idea.has_voted;
    const prevCount = idea.votes_count;
    setIdeas(ideas.map(i => i.id === idea.id ? {
      ...i,
      has_voted: !prevHasVoted,
      votes_count: prevHasVoted ? prevCount - 1 : prevCount + 1
    } : i));

    try {
      const res = await fetch(`/api/ideas/${idea.id}/vote`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setIdeas(prev => prev.map(i => i.id === idea.id ? {
          ...i,
          has_voted: data.has_voted,
          votes_count: data.votes_count
        } : i));
      }
    } catch (err) {
      console.error(err);
      // Reverter
      setIdeas(ideas.map(i => i.id === idea.id ? {
        ...i,
        has_voted: prevHasVoted,
        votes_count: prevCount
      } : i));
    }
  }

  // Tags mais frequentes para o filtro rápido
  const quickTags = [
    'Parcerias',
    'B2B',
    'Inteligência Artificial',
    'Venture Capital',
    'Redução de Custos',
    'Inovação',
    'Tech'
  ];

  return (
    <div>
      <header className="page-header">
        <div>
          <span className="badge badge-accent">Banco de ideias</span>
          <h1>Ideias em <span className="em-accent">discussão</span></h1>
          <p>
            Propostas de parceria, compras conjuntas e projetos. Apoie as que valem a pena e entre na conversa.
          </p>
          <p style={{ fontSize: '0.88rem', color: 'var(--ink-3)', marginTop: '0.75rem' }}>
            {stats.ideas} ideias · {stats.comments} comentários · {stats.members} membros
          </p>
        </div>
        <button type="button" className="btn btn-primary btn-lg" onClick={onOpenNewIdea}>
          <PlusCircle size={18} />
          <span>Propor ideia</span>
        </button>
      </header>

      {/* Barra de Filtros, Busca e Ordenação */}
      <div style={{
        marginBottom: '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        {/* Linha 1: Input de Busca + Ordenação + Botão Nova Ideia */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem'
        }}>
          {/* Busca */}
          <form onSubmit={handleSearchSubmit} style={{ flex: '1 1 280px', position: 'relative' }}>
            <Search size={16} color="var(--ink-3)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Pesquisar por título, palavra-chave ou problema..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </form>

          {/* Ordenação */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--ink-3)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <SlidersHorizontal size={14} /> Ordenar:
            </span>
            <select
              className="form-select"
              style={{ width: 'auto', padding: '0.55rem 0.85rem', fontSize: '0.85rem' }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="popular">Mais apoiadas</option>
              <option value="discussed">Mais discutidas</option>
              <option value="recent">Mais recentes</option>
            </select>
          </div>
        </div>

        {/* Linha 2: Chips de Tags para Filtros Rápidos */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap',
        }}>
          <button
            type="button"
            className={`tag-chip ${selectedTag === '' ? 'active' : ''}`}
            onClick={() => setSelectedTag('')}
          >
            Todas
          </button>

          {quickTags.map((t) => (
            <button
              key={t}
              type="button"
              className={`tag-chip ${selectedTag === t ? 'active' : ''}`}
              onClick={() => setSelectedTag(selectedTag === t ? '' : t)}
            >
              #{t}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Cards de Ideias */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--ink-3)' }}>
          Carregando mural de ideias...
        </div>
      ) : ideas.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: 'var(--surface)',
          border: '1px dashed var(--rule-strong)',
          borderRadius: 'var(--radius-xl)'
        }}>
          <Lightbulb size={40} color="var(--accent)" style={{ opacity: 0.6, marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Nenhuma ideia encontrada</h3>
          <p style={{ color: 'var(--ink-3)', maxWidth: '420px', margin: '0 auto 1.5rem', fontSize: '0.9rem' }}>
            Não encontramos ideias com os filtros selecionados. Seja o primeiro a propor uma nova iniciativa!
          </p>
          <button type="button" className="btn btn-primary" onClick={onOpenNewIdea}>
            <PlusCircle size={16} /> Propor ideia
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(360px, 100%), 1fr))',
          gap: '1.5rem'
        }}>
          {ideas.map((idea) => {
            const statusColor = 
              idea.status === 'Validado' ? 'badge-accent' :
              idea.status === 'Parceria Aberta' ? 'badge-signal' : 'badge-signal';

            return (
              <div
                key={idea.id}
                className="glass-panel"
                onClick={() => onSelectIdea(idea.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '1.5rem',
                  cursor: 'pointer',
                  position: 'relative'
                }}
              >
                {/* Header do Card: Autor + Status */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <img
                      src={idea.author.avatar}
                      alt={idea.author.name}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '1px solid var(--rule-strong)'
                      }}
                    />
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--ink)' }}>
                        {idea.author.name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--accent)' }}>
                        {idea.author.company}
                      </div>
                    </div>
                  </div>

                  <span className={`badge ${statusColor}`}>
                    {idea.status}
                  </span>
                </div>

                {/* Título da Ideia */}
                <h3 style={{
                  fontSize: '1.18rem',
                  marginBottom: '0.65rem',
                  lineHeight: 1.35,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {idea.title}
                </h3>

                {/* Descrição Preview */}
                <p style={{
                  fontSize: '0.88rem',
                  color: 'var(--ink-2)',
                  lineHeight: 1.6,
                  marginBottom: '1.25rem',
                  flex: 1,
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {idea.description}
                </p>

                {/* Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1.25rem' }}>
                  {idea.tags.slice(0, 3).map((tag, idx) => (
                    <span
                      key={idx}
                      className="tag-chip"
                      style={{ fontSize: '0.7rem', padding: '0.15rem 0.55rem' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTag(tag);
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                  {idea.tags.length > 3 && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--ink-3)', alignSelf: 'center' }}>
                      +{idea.tags.length - 3}
                    </span>
                  )}
                </div>

                {/* Rodapé com Interações: Voto + Comentários */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '0.85rem',
                  borderTop: '1px solid var(--rule)',
                  marginTop: 'auto'
                }}>
                  {/* Botão de Votar */}
                  <button
                    type="button"
                    onClick={(e) => handleVote(e, idea)}
                    className={`btn btn-sm ${idea.has_voted ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ gap: '0.4rem', padding: '0.4rem 0.75rem' }}
                  >
                    <Heart size={14} fill={idea.has_voted ? 'currentColor' : 'none'} />
                    <span>{idea.votes_count}</span>
                  </button>

                  {/* Contador de Comentários / Abrir Discussão */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.82rem',
                    color: 'var(--ink-2)'
                  }}>
                    <MessageSquare size={15} color="var(--signal)" />
                    <span>{idea.comments_count} {idea.comments_count === 1 ? 'discussão' : 'discussões'}</span>
                    <ArrowRight size={13} color="var(--ink-3)" style={{ marginLeft: '0.2rem' }} />
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
