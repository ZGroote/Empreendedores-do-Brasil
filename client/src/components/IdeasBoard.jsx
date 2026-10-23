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
      {/* Hero Banner Executivo com Métricas */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(16, 24, 40, 0.8) 0%, rgba(13, 19, 31, 0.9) 100%)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
        padding: '2.25rem 2rem',
        marginBottom: '2rem',
        boxShadow: 'var(--shadow-md)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Efeito Glow Dourado Sutil no Fundo */}
        <div style={{
          position: 'absolute',
          top: '-30%',
          right: '-10%',
          width: '320px',
          height: '320px',
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.12) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
              <span className="badge badge-gold">Mural de Inovações & Negócios</span>
            </div>
            <h1 style={{ fontSize: '2.1rem', lineHeight: 1.2 }}>
              Banco de Ideias dos <span className="text-gradient-gold">Empreendedores</span>
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '720px', marginTop: '0.4rem' }}>
              Proponha parcerias estratégicas, compartilhe ideias disruptivas com filtros por tags e debata soluções práticas com os membros do grupo.
            </p>
          </div>

          {/* Cards de Métricas em Tempo Real */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '1rem',
            paddingTop: '0.5rem'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1rem'
            }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>
                Ideias Propostas
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--gold-light)', marginTop: '0.2rem' }}>
                {stats.ideas}
              </div>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1rem'
            }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>
                Discussões Ativas
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--blue-light)', marginTop: '0.2rem' }}>
                {stats.comments}
              </div>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1rem'
            }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>
                Reuniões & Palestras
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#34D399', marginTop: '0.2rem' }}>
                {stats.events}
              </div>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1rem'
            }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>
                Membros Conectados
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#F8FAFC', marginTop: '0.2rem' }}>
                {stats.members}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Barra de Filtros, Busca e Ordenação */}
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem',
        marginBottom: '1.75rem',
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
            <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
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
            <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <SlidersHorizontal size={14} /> Ordenar:
            </span>
            <select
              className="form-select"
              style={{ width: 'auto', padding: '0.55rem 0.85rem', fontSize: '0.85rem' }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="popular">🔥 Mais Apoiadas</option>
              <option value="discussed">💬 Mais Discutidas</option>
              <option value="recent">⏱ Mais Recentes</option>
            </select>
          </div>

          {/* Botão Nova Ideia */}
          <button
            type="button"
            className="btn btn-gold"
            onClick={onOpenNewIdea}
            style={{ gap: '0.5rem' }}
          >
            <PlusCircle size={16} />
            <span>Cadastrar Ideia</span>
          </button>
        </div>

        {/* Linha 2: Chips de Tags para Filtros Rápidos */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap',
          paddingTop: '0.25rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.04)'
        }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase' }}>
            Filtrar por Tag:
          </span>

          <button
            type="button"
            className={`tag-chip ${selectedTag === '' ? 'active' : ''}`}
            onClick={() => setSelectedTag('')}
          >
            Todas as Ideias
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
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-dim)' }}>
          Carregando mural de ideias...
        </div>
      ) : ideas.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: 'var(--bg-secondary)',
          border: '1px dashed var(--border-bright)',
          borderRadius: 'var(--radius-xl)'
        }}>
          <Lightbulb size={40} color="var(--gold-light)" style={{ opacity: 0.6, marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Nenhuma ideia encontrada</h3>
          <p style={{ color: 'var(--text-dim)', maxWidth: '420px', margin: '0 auto 1.5rem', fontSize: '0.9rem' }}>
            Não encontramos ideias com os filtros selecionados. Seja o primeiro a propor uma nova iniciativa!
          </p>
          <button type="button" className="btn btn-gold" onClick={onOpenNewIdea}>
            <PlusCircle size={16} /> Cadastrar Nova Ideia
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: '1.5rem'
        }}>
          {ideas.map((idea) => {
            const statusColor = 
              idea.status === 'Validado' ? 'badge-emerald' :
              idea.status === 'Parceria Aberta' ? 'badge-blue' : 'badge-amber';

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
                        border: '1px solid var(--border-bright)'
                      }}
                    />
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        {idea.author.name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--gold-light)' }}>
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
                  color: 'var(--text-muted)',
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
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', alignSelf: 'center' }}>
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
                  borderTop: '1px solid var(--border-subtle)',
                  marginTop: 'auto'
                }}>
                  {/* Botão de Votar */}
                  <button
                    type="button"
                    onClick={(e) => handleVote(e, idea)}
                    className={`btn btn-sm ${idea.has_voted ? 'btn-gold' : 'btn-secondary'}`}
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
                    color: 'var(--text-muted)'
                  }}>
                    <MessageSquare size={15} color="var(--blue-light)" />
                    <span>{idea.comments_count} {idea.comments_count === 1 ? 'discussão' : 'discussões'}</span>
                    <ArrowRight size={13} color="var(--text-dim)" style={{ marginLeft: '0.2rem' }} />
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
