import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen, 
  Search, 
  Plus, 
  Heart, 
  MessageSquare, 
  FileText, 
  Video, 
  Link2, 
  Sparkles, 
  Scale, 
  TrendingUp, 
  Cpu, 
  HardDrive,
  Users,
  CheckCircle2,
  ChevronRight,
  Layers,
  ArrowUpRight
} from 'lucide-react';

export default function KnowledgeHub({ onSelectBook, onOpenNewBook, onSelectMember }) {
  const { user, setIsAuthModalOpen } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('Todas');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('popular'); // 'popular', 'recent', 'materials'

  const categories = [
    'Todas',
    'Direito & Legislação',
    'Finanças & Captação',
    'Tecnologia & IA',
    'Vendas & Growth',
    'Gestão & Governança'
  ];

  async function fetchBooks() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category !== 'Todas') params.append('category', category);
      if (search.trim()) params.append('search', search.trim());
      if (sort) params.append('sort', sort);

      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await fetch(`/api/books?${params.toString()}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setBooks(data);
      }
    } catch (err) {
      console.error('Erro ao buscar livros do acervo:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBooks();
  }, [category, sort]);

  function handleSearchSubmit(e) {
    e.preventDefault();
    fetchBooks();
  }

  async function handleToggleLike(e, bookId) {
    e.stopPropagation();
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/books/${bookId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBooks(prev => prev.map(b => b.id === bookId ? {
          ...b,
          has_liked: data.has_liked,
          likes_count: data.likes_count
        } : b));
      }
    } catch (err) {
      console.error('Erro ao curtir dossiê:', err);
    }
  }

  // Estatísticas calculadas
  const totalMaterials = books.reduce((acc, b) => acc + (b.items_count || 0), 0);
  const totalDiscussions = books.reduce((acc, b) => acc + (b.messages_count || 0), 0);

  // Cada dossiê tem uma cor de "lombada" (ids antigos: gold, blue, purple, emerald)
  function getGradientStyle(theme) {
    const color = `var(--book-${['gold', 'blue', 'purple'].includes(theme) ? theme : 'emerald'})`;
    return {
      banner: `color-mix(in srgb, ${color} 7%, var(--surface))`,
      border: 'var(--rule)',
      accent: color,
      pillBg: 'transparent'
    };
  }

  return (
    <div>
      <header className="page-header">
        <div>
          <span className="badge badge-accent">Biblioteca</span>
          <h1>Dossiês e <span className="em-accent">materiais</span></h1>
          <p>
            Coletâneas montadas a várias mãos: contratos, teses, relatórios e gravações. Crie um dossiê sobre um tema e o grupo vai somando material.
          </p>
          <p style={{ fontSize: '0.94rem', color: 'var(--ink-3)', marginTop: '0.75rem' }}>
            {books.length} dossiês · {totalMaterials} materiais · {totalDiscussions} mensagens
          </p>
        </div>
        <button type="button" className="btn btn-primary btn-lg" onClick={onOpenNewBook}>
          <Plus size={18} />
          <span>Novo dossiê</span>
        </button>
      </header>

      {/* Barra de Filtros, Categorias e Pesquisa */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {/* Categorias (Pills) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          overflowX: 'auto',
          paddingBottom: '0.4rem',
          maxWidth: '100%'
        }}>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`tag-chip ${category === cat ? 'active' : ''}`}
              onClick={() => setCategory(cat)}
              style={{ whiteSpace: 'nowrap' }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Busca e Ordenação */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <form onSubmit={handleSearchSubmit} style={{ position: 'relative', minWidth: '260px' }}>
            <Search 
              size={16} 
              style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)' }} 
            />
            <input
              type="text"
              placeholder="Buscar por tema, jurisprudência, autor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
              style={{
                paddingLeft: '2.4rem',
                fontSize: '0.875rem',
                paddingTop: '0.5rem',
                paddingBottom: '0.5rem',
                borderRadius: 'var(--radius-full)'
              }}
            />
          </form>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="form-select"
            style={{
              width: 'auto',
              fontSize: '0.875rem',
              padding: '0.5rem 0.9rem',
              borderRadius: 'var(--radius-full)'
            }}
          >
            <option value="popular">Mais apoiados</option>
            <option value="recent">Adicionados Recentemente</option>
            <option value="materials">Mais Materiais Anexados</option>
          </select>
        </div>
      </div>

      {/* Grade de Livros / Dossiês */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--ink-3)' }}>
          Carregando acervo de inteligência coletiva...
        </div>
      ) : books.length === 0 ? (
        <div style={{
          background: 'var(--surface)',
          border: '1px dashed var(--rule-strong)',
          borderRadius: 'var(--radius-xl)',
          padding: '4rem 2rem',
          textAlign: 'center'
        }}>
          <BookOpen size={48} color="var(--accent)" style={{ opacity: 0.6, margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Nenhum dossiê encontrado nesta categoria</h3>
          <p style={{ color: 'var(--ink-2)', fontSize: '0.94rem', maxWidth: '460px', margin: '0 auto 1.5rem' }}>
            Seja o pioneiro a inaugurar este tema com um novo livro colaborativo, subindo os primeiros arquivos ou jurisprudências.
          </p>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={onOpenNewBook}
          >
            <Plus size={15} />
            <span>Criar Primeiro Dossiê</span>
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(370px, 100%), 1fr))',
          gap: '1.75rem'
        }}>
          {books.map((book) => {
            const g = getGradientStyle(book.color_gradient);

            return (
              <div
                key={book.id}
                className="card-hover"
                onClick={() => onSelectBook(book.id)}
                style={{
                  background: 'var(--surface)',
                  borderRadius: 'var(--radius-xl)',
                  border: `1px solid ${g.border}`,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  boxShadow: 'var(--shadow)'
                }}

              >
                {/* Capa Frontal Executiva / Estilo Livro com Lombada */}
                <div style={{
                  background: g.banner,
                  padding: '1.6rem 1.75rem',
                  borderBottom: '1px solid var(--rule)',
                  position: 'relative'
                }}>
                  {/* Faixa decorativa da lombada do livro */}
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: '6px',
                    background: g.accent
                  }} />

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.85rem' }}>
                    <span 
                      style={{
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        color: g.accent
                      }}
                    >
                      {book.category}
                    </span>

                    {/* Botão de Curtir / Apoiar */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleLike(e, book.id)}
                      style={{
                        background: book.has_liked ? 'var(--danger-soft)' : 'var(--fill-strong)',
                        border: book.has_liked ? '1px solid var(--danger)' : '1px solid var(--rule)',
                        color: book.has_liked ? 'var(--danger)' : 'var(--ink-3)',
                        borderRadius: 'var(--radius-full)',
                        padding: '0.35rem 0.65rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'var(--transition)'
                      }}
                      title="Apoiar este dossiê"
                    >
                      <Heart size={13} fill={book.has_liked ? 'var(--danger)' : 'none'} />
                      <span>{book.likes_count || 0}</span>
                    </button>
                  </div>

                  {/* Título do Livro / Dossiê */}
                  <h3 style={{
                    fontSize: '1.22rem',
                    lineHeight: 1.3,
                    color: 'var(--ink)',
                    marginBottom: '0.5rem',
                    fontWeight: 700
                  }}>
                    {book.title}
                  </h3>

                  {/* Selo Colaborativo */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--ink-2)' }}>
                    <CheckCircle2 size={13} color="var(--accent)" />
                    <span>Aberto a colaboração</span>
                  </div>
                </div>

                {/* Corpo do Card */}
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1, gap: '1.2rem' }}>
                  {/* Descrição resumida */}
                  <p style={{
                    fontSize: '0.94rem',
                    color: 'var(--ink-2)',
                    lineHeight: 1.55,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    margin: 0
                  }}>
                    {book.description}
                  </p>

                  {/* Tags */}
                  {book.tags && book.tags.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {book.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          style={{
                            fontSize: '0.8rem',
                            color: 'var(--ink-3)',
                            background: 'var(--fill)',
                            padding: '0.2rem 0.55rem',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--rule)'
                          }}
                        >
                          #{tag}
                        </span>
                      ))}
                      {book.tags.length > 3 && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--ink-3)' }}>
                          +{book.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Informações de Materiais & Leveza */}
                  <div style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--rule)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.85rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.875rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--accent)' }}>
                      <FileText size={15} />
                      <strong style={{ color: 'var(--ink)' }}>{book.items_count || 0}</strong>
                      <span style={{ color: 'var(--ink-2)' }}>{book.items_count === 1 ? 'material' : 'materiais'}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--signal)' }}>
                      <MessageSquare size={14} />
                      <strong style={{ color: 'var(--ink)' }}>{book.messages_count || 0}</strong>
                      <span style={{ color: 'var(--ink-2)' }}>mensagens</span>
                    </div>
                  </div>

                  {/* Rodapé: Autor e Colaboradores */}
                  <div style={{
                    marginTop: 'auto',
                    paddingTop: '0.85rem',
                    borderTop: '1px solid var(--rule)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.5rem'
                  }}>
                    {/* Criador */}
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSelectMember) onSelectMember(book.creator_id);
                      }}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', cursor: 'pointer' }}
                      title="Ver perfil do autor"
                    >
                      <img
                        src={book.creator_avatar}
                        alt={book.creator_name}
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '1.5px solid var(--accent-line)'
                        }}
                      />
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ink)' }}>
                          {book.creator_name}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--ink-3)' }}>
                          {book.creator_company}
                        </div>
                      </div>
                    </div>

                    {/* Colaboradores adicionais (se houver) */}
                    {book.contributors && book.contributors.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '-6px' }} title={`${book.contributors.length} membros contribuíram com materiais`}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--ink-3)', marginRight: '0.35rem' }}>
                          +colabs:
                        </div>
                        <div style={{ display: 'flex', marginLeft: '-0.3rem' }}>
                          {book.contributors.slice(0, 3).map((c, i) => (
                            <img
                              key={c.id}
                              src={c.avatar}
                              alt={c.name}
                              style={{
                                width: 24,
                                height: 24,
                                borderRadius: '50%',
                                objectFit: 'cover',
                                border: '2px solid var(--surface)',
                                marginLeft: i > 0 ? '-8px' : '0'
                              }}
                              title={`${c.name} (${c.company})`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Botão de Acesso */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    color: g.accent,
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    paddingTop: '0.3rem'
                  }}>
                    <span>Abrir dossiê</span>
                    <ArrowUpRight size={15} />
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
