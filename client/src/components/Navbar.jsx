import { 
  Lightbulb, 
  Calendar, 
  Users, 
  PlusCircle, 
  LogOut, 
  User, 
  ChevronDown, 
  Crown,
  Sparkles,
  BookOpen
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  onOpenNewIdea, 
  onOpenNewEvent,
  onOpenNewBook,
  onSelectMember
}) {
  const { user, logout, setIsAuthModalOpen, demoAccounts, loginAsDemo } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(7, 10, 16, 0.82)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border-subtle)',
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0.85rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem'
      }}>
        
        {/* Logo & Marca */}
        <div 
          onClick={() => setActiveTab('ideas')} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem', 
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, #1C273D 0%, #0F172A 100%)',
            border: '1px solid var(--gold-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--glow-gold)'
          }}>
            <Crown size={22} color="var(--gold-primary)" />
          </div>
          <div>
            <div style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '1.05rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
              lineHeight: 1.1
            }}>
              EMPREENDEDORES <span className="text-gradient-gold">DO BRASIL</span>
            </div>
            <div style={{
              fontSize: '0.7rem',
              color: 'var(--text-dim)',
              letterSpacing: '0.06em',
              fontWeight: 600,
              textTransform: 'uppercase'
            }}>
              Comunidade & Hub Estratégico
            </div>
          </div>
        </div>

        {/* Abas de Navegação Principal */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'ideas' ? 'btn-gold' : 'btn-secondary'}`}
            onClick={() => setActiveTab('ideas')}
            style={{ borderRadius: 'var(--radius-full)', padding: '0.5rem 1rem' }}
          >
            <Lightbulb size={16} />
            <span>Banco de Ideias</span>
          </button>

          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'events' ? 'btn-gold' : 'btn-secondary'}`}
            onClick={() => setActiveTab('events')}
            style={{ borderRadius: 'var(--radius-full)', padding: '0.5rem 1rem' }}
          >
            <Calendar size={16} />
            <span>Reuniões & Palestras</span>
          </button>

          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'library' ? 'btn-gold' : 'btn-secondary'}`}
            onClick={() => setActiveTab('library')}
            style={{ borderRadius: 'var(--radius-full)', padding: '0.5rem 1rem' }}
          >
            <BookOpen size={16} />
            <span>Acervo & Dossiês</span>
          </button>

          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'members' ? 'btn-gold' : 'btn-secondary'}`}
            onClick={() => setActiveTab('members')}
            style={{ borderRadius: 'var(--radius-full)', padding: '0.5rem 1rem' }}
          >
            <Users size={16} />
            <span>Membros</span>
          </button>
        </nav>

        {/* Ações de Criação e Perfil */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          
          {/* Botão de Novo Dossiê */}
          <button
            type="button"
            className="btn btn-gold btn-sm"
            onClick={onOpenNewBook}
            title="Criar um novo dossiê ou livro colaborativo"
          >
            <BookOpen size={15} />
            <span>+ Dossiê</span>
          </button>

          {/* Botão de Nova Ideia */}
          <button
            type="button"
            className="btn btn-outline-gold btn-sm"
            onClick={onOpenNewIdea}
            title="Propor uma nova ideia ao grupo"
          >
            <PlusCircle size={15} />
            <span style={{ display: 'none', minWidth: '0' }} className="d-md-inline">+ Ideia</span>
            <span>Nova Ideia</span>
          </button>

          {/* Botão de Agendar Reunião ou Palestra */}
          <button
            type="button"
            className="btn btn-blue btn-sm"
            onClick={onOpenNewEvent}
            title="Agendar reunião ou palestra interna"
          >
            <Calendar size={15} />
            <span>Agendar</span>
          </button>

          {/* Área de Autenticação */}
          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-full)',
                  padding: '0.25rem 0.65rem 0.25rem 0.35rem',
                  cursor: 'pointer',
                  color: 'var(--text-main)',
                  transition: 'var(--transition)'
                }}
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '1px solid var(--gold-border)'
                  }}
                />
                <div style={{ textAlign: 'left', lineHeight: 1.1 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.name.split(' ')[0]}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--gold-light)' }}>
                    {user.company || 'Membro'}
                  </div>
                </div>
                <ChevronDown size={14} color="var(--text-dim)" />
              </button>

              {/* Dropdown do Usuário */}
              {dropdownOpen && (
                <div 
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 'calc(100% + 8px)',
                    width: 240,
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-bright)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-lg)',
                    padding: '0.75rem',
                    zIndex: 200,
                    animation: 'fadeIn 0.15s ease-out'
                  }}
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  <div style={{ padding: '0.4rem 0.5rem 0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{user.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{user.email}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gold-light)', marginTop: '0.2rem' }}>
                      {user.role} @ {user.company}
                    </div>
                  </div>

                  {/* Atalho para o Perfil e Acervo do Usuário */}
                  <div style={{ padding: '0.5rem 0.2rem 0.25rem' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false);
                        if (onSelectMember && user) onSelectMember(user.id);
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: 'rgba(212, 175, 55, 0.1)',
                        border: '1px solid var(--gold-border)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--gold-light)',
                        padding: '0.5rem 0.65rem',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'var(--transition)'
                      }}
                    >
                      <BookOpen size={14} />
                      <span>Meu Perfil & Acervo</span>
                    </button>
                  </div>

                  {/* Trocar de Perfil Rápido */}
                  <div style={{ padding: '0.5rem 0.5rem 0.25rem' }}>
                    <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: 700, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Sparkles size={11} color="var(--gold-light)" />
                      Simular Outro Membro:
                    </div>
                    {demoAccounts.filter(d => d.email !== user.email).slice(0, 3).map(demo => (
                      <button
                        key={demo.email}
                        type="button"
                        onClick={() => {
                          loginAsDemo(demo.email);
                          setDropdownOpen(false);
                        }}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-muted)',
                          padding: '0.35rem 0.4rem',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          borderRadius: 'var(--radius-sm)',
                          textAlign: 'left'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = '#FFF'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
                      >
                        <img src={demo.avatar} alt="" style={{ width: 18, height: 18, borderRadius: '50%' }} />
                        <span>{demo.name.split(' ')[0]} ({demo.company})</span>
                      </button>
                    ))}
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '0.5rem', paddingTop: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setDropdownOpen(false);
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--rose-primary)',
                        padding: '0.4rem 0.5rem',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        borderRadius: 'var(--radius-sm)'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--rose-bg)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <LogOut size={14} />
                      <span>Sair da Conta</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              className="btn btn-gold btn-sm"
              onClick={() => setIsAuthModalOpen(true)}
            >
              <User size={15} />
              <span>Entrar / Cadastrar</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
}
