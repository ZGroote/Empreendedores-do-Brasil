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

  function getGradientStyle(theme) {
    switch (theme) {
      case 'gold':
        return {
          banner: 'linear-gradient(135deg, rgba(212, 175, 55, 0.22) 0%, rgba(17, 24, 39, 0.95) 100%)',
          border: 'var(--gold-border)',
          accent: 'var(--gold-primary)',
          pillBg: 'rgba(212, 175, 55, 0.12)'
        };
      case 'blue':
        return {
          banner: 'linear-gradient(135deg, rgba(59, 130, 246, 0.22) 0%, rgba(17, 24, 39, 0.95) 100%)',
          border: 'var(--blue-border)',
          accent: 'var(--blue-light)',
          pillBg: 'rgba(59, 130, 246, 0.12)'
        };
      case 'purple':
        return {
          banner: 'linear-gradient(135deg, rgba(168, 85, 247, 0.22) 0%, rgba(17, 24, 39, 0.95) 100%)',
          border: 'rgba(168, 85, 247, 0.35)',
          accent: '#C084FC',
          pillBg: 'rgba(168, 85, 247, 0.12)'
        };
      default:
        return {
          banner: 'linear-gradient(135deg, rgba(16, 185, 129, 0.22) 0%, rgba(17, 24, 39, 0.95) 100%)',
          border: 'rgba(16, 185, 129, 0.35)',
          accent: '#34D399',
          pillBg: 'rgba(16, 185, 129, 0.12)'
        };
    }
  }

  return (
    <div>
      {/* Banner Hero do Acervo de Conhecimento */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(20, 28, 45, 0.95) 0%, rgba(10, 15, 26, 0.98) 100%)',
        border: '1px solid var(--border-bright)',
        borderRadius: 'var(--radius-xl)',
        padding: '2.5rem 2rem',
        marginBottom: '2rem',
        boxShadow: 'var(--shadow-lg), 0 0 30px rgba(0, 0, 0, 0.4)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Luz Decorativa de Fundo */}
        <div style={{
          position: 'absolute',
          top: '-30%',
          right: '-10%',
          width: '450px',
          height: '450px',
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, transparent 70%)',
          filter: 'blur(50px)',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem', position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: '780px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <span className="badge badge-gold" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Sparkles size={12} />
                Acervo Colaborativo & Dossiês Vivos
              </span>
              <span className="badge badge-blue">
                Compressão Leve & Otimizada
              </span>
            </div>
            
            <h1 style={{ fontSize: 'clamp(1.6rem, 5vw, 2.3rem)', lineHeight: 1.15, marginBottom: '0.8rem' }}>
              Biblioteca de <span className="text-gradient-gold">Conhecimento & Dossiês</span>
            </h1>
            
            <p style={{ color: 'var(--text-muted)', fontSize: '1.02rem', lineHeight: 1.6 }}>
              Centralize e construa coletâneas temáticas de alto valor: jurisprudência, modelos de contrato, teses tributárias, vídeos e relatórios executivos. Qualquer membro pode criar um dossiê e outros empreendedores colaboram acrescentando materiais relevantes.
            </p>

            {/* Destaques Numéricos */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gold-light)', lineHeight: 1 }}>
                  {books.length}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                  Dossiês Coletivos
                </div>
              </div>

              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--blue-light)', lineHeight: 1 }}>
                  {totalMaterials}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                  Materiais (PDFs, Vídeos, Docs)
                </div>
              </div>

              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FBBF24', lineHeight: 1 }}>
                  {totalDiscussions}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                  Discussões nos Chats
                </div>
              </div>
            </div>
          </div>

          {/* Botão de Ação Primária */}
          <div>
            <button
              type="button"
              className="btn btn-gold btn-lg"
              onClick={onOpenNewBook}
              style={{
                boxShadow: 'var(--glow-gold)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem'
              }}
            >
              <Plus size={18} />
              <span>Criar Novo Dossiê / Livro</span>
            </button>
          </div>
        </div>
      </div>

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
              style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} 
            />
            <input
              type="text"
              placeholder="Buscar por tema, jurisprudência, autor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
              style={{
                paddingLeft: '2.4rem',
                fontSize: '0.85rem',
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
              fontSize: '0.85rem',
              padding: '0.5rem 0.9rem',
              borderRadius: 'var(--radius-full)'
            }}
          >
            <option value="popular">Mais Relevantes (Apoios)</option>
            <option value="recent">Adicionados Recentemente</option>
            <option value="materials">Mais Materiais Anexados</option>
          </select>
        </div>
      </div>

      {/* Grade de Livros / Dossiês */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-dim)' }}>
          Carregando acervo de inteligência coletiva...
        </div>
      ) : books.length === 0 ? (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px dashed var(--border-bright)',
          borderRadius: 'var(--radius-xl)',
          padding: '4rem 2rem',
          textAlign: 'center'
        }}>
          <BookOpen size={48} color="var(--gold-light)" style={{ opacity: 0.6, margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Nenhum dossiê encontrado nesta categoria</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '460px', margin: '0 auto 1.5rem' }}>
            Seja o pioneiro a inaugurar este tema com um novo livro colaborativo, subindo os primeiros arquivos ou jurisprudências.
          </p>
          <button
            type="button"
            className="btn btn-gold btn-sm"
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
                onClick={() => onSelectBook(book.id)}
                style={{
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-xl)',
                  border: `1px solid ${g.border}`,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  boxShadow: 'var(--shadow-md)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = `0 12px 30px -8px rgba(0,0,0,0.7), 0 0 20px ${g.pillBg}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
              >
                {/* Capa Frontal Executiva / Estilo Livro com Lombada */}
                <div style={{
                  background: g.banner,
                  padding: '1.6rem 1.75rem',
                  borderBottom: '1px solid var(--border-subtle)',
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
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        color: g.accent,
                        background: g.pillBg,
                        padding: '0.25rem 0.65rem',
                        borderRadius: 'var(--radius-full)',
                        border: `1px solid ${g.border}`
                      }}
                    >
                      {book.category}
                    </span>

                    {/* Botão de Curtir / Apoiar */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleLike(e, book.id)}
                      style={{
                        background: book.has_liked ? 'rgba(244, 63, 94, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                        border: book.has_liked ? '1px solid rgba(244, 63, 94, 0.4)' : '1px solid var(--border-subtle)',
                        color: book.has_liked ? '#FB7185' : 'var(--text-dim)',
                        borderRadius: 'var(--radius-full)',
                        padding: '0.35rem 0.65rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'var(--transition)'
                      }}
                      title="Apoiar este dossiê"
                    >
                      <Heart size={13} fill={book.has_liked ? '#FB7185' : 'none'} />
                      <span>{book.likes_count || 0}</span>
                    </button>
                  </div>

                  {/* Título do Livro / Dossiê */}
                  <h3 style={{
                    fontSize: '1.22rem',
                    lineHeight: 1.3,
                    color: 'var(--text-main)',
                    marginBottom: '0.5rem',
                    fontWeight: 700
                  }}>
                    {book.title}
                  </h3>

                  {/* Selo Colaborativo */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <CheckCircle2 size={13} color="var(--emerald-primary)" />
                    <span>Dossiê Colaborativo Aberto</span>
                  </div>
                </div>

                {/* Corpo do Card */}
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1, gap: '1.2rem' }}>
                  {/* Descrição resumida */}
                  <p style={{
                    fontSize: '0.88rem',
                    color: 'var(--text-muted)',
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
                            fontSize: '0.72rem',
                            color: 'var(--text-dim)',
                            background: 'rgba(255, 255, 255, 0.03)',
                            padding: '0.2rem 0.55rem',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border-subtle)'
                          }}
                        >
                          #{tag}
                        </span>
                      ))}
                      {book.tags.length > 3 && (
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                          +{book.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Informações de Materiais & Leveza */}
                  <div style={{
                    background: 'rgba(7, 10, 16, 0.6)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.85rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.8rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--gold-light)' }}>
                      <FileText size={15} />
                      <strong style={{ color: 'var(--text-main)' }}>{book.items_count || 0}</strong>
                      <span style={{ color: 'var(--text-muted)' }}>{book.items_count === 1 ? 'material' : 'materiais'}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--blue-light)' }}>
                      <MessageSquare size={14} />
                      <strong style={{ color: 'var(--text-main)' }}>{book.messages_count || 0}</strong>
                      <span style={{ color: 'var(--text-muted)' }}>mensagens</span>
                    </div>
                  </div>

                  {/* Rodapé: Autor e Colaboradores */}
                  <div style={{
                    marginTop: 'auto',
                    paddingTop: '0.85rem',
                    borderTop: '1px solid var(--border-subtle)',
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
                          border: '1.5px solid var(--gold-border)'
                        }}
                      />
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>
                          {book.creator_name}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                          {book.creator_company}
                        </div>
                      </div>
                    </div>

                    {/* Colaboradores adicionais (se houver) */}
                    {book.contributors && book.contributors.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '-6px' }} title={`${book.contributors.length} membros contribuíram com materiais`}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginRight: '0.35rem' }}>
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
                                border: '2px solid var(--bg-card)',
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
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    paddingTop: '0.3rem'
                  }}>
                    <span>Explorar Capítulos & Bate-Papo</span>
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
