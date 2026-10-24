import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen, 
  Lightbulb, 
  Calendar, 
  Users, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  TrendingUp, 
  CheckCircle2, 
  FileText,
  MessageSquare,
  Building,
  ChevronRight
} from 'lucide-react';

export default function HomeView({ 
  onNavigateTab, 
  onSelectBook, 
  onSelectIdea,
  onOpenAuth 
}) {
  const { user } = useAuth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
      
      {/* 1. HERO SECTION INSTITUCIONAL */}
      <section style={{
        textAlign: 'center',
        padding: '3.5rem 1rem 2rem',
        maxWidth: '920px',
        margin: '0 auto',
        position: 'relative'
      }}>
        {/* Badge de Destaque */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <span style={{
            background: 'rgba(212, 175, 55, 0.1)',
            border: '1px solid rgba(212, 175, 55, 0.25)',
            color: 'var(--gold-light)',
            padding: '0.35rem 0.9rem',
            borderRadius: '9999px',
            fontSize: '0.82rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}>
            <Sparkles size={14} color="var(--gold-primary)" />
            Rede Estratégica de Líderes & Fundadores
          </span>
        </div>

        {/* Título Principal */}
        <h1 style={{
          fontSize: '3.2rem',
          fontWeight: 800,
          lineHeight: 1.15,
          letterSpacing: '-0.03em',
          marginBottom: '1.25rem',
          color: '#FFFFFF'
        }}>
          O ecossistema onde quem decide no Brasil <span className="text-gradient-gold">constrói o futuro</span>.
        </h1>

        {/* Subtítulo */}
        <p style={{
          fontSize: '1.18rem',
          color: 'var(--text-muted)',
          lineHeight: 1.6,
          maxWidth: '720px',
          margin: '0 auto 2.25rem'
        }}>
          Uma plataforma colaborativa e fechada para troca de teses jurídicas, acervo de contratos, validação de ideias de alto impacto e encontros exclusivos entre empreendedores.
        </p>

        {/* Botões de Ação Principais */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-gold btn-lg"
            onClick={() => onNavigateTab('library')}
            style={{ padding: '0.85rem 1.8rem', fontSize: '0.98rem' }}
          >
            <BookOpen size={18} />
            <span>Explorar Acervo & Dossiês</span>
            <ArrowRight size={16} />
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-lg"
            onClick={() => onNavigateTab('ideas')}
            style={{ padding: '0.85rem 1.8rem', fontSize: '0.98rem' }}
          >
            <Lightbulb size={18} color="var(--gold-light)" />
            <span>Banco de Ideias</span>
          </button>
        </div>

        {/* Garantias / Prova Social rápida */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2rem',
          marginTop: '2.5rem',
          fontSize: '0.82rem',
          color: 'var(--text-dim)',
          flexWrap: 'wrap'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <CheckCircle2 size={15} color="var(--emerald-primary)" /> Membros Verificados
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ShieldCheck size={15} color="var(--blue-light)" /> Privacidade & Segurança
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <FileText size={15} color="var(--gold-primary)" /> Minutas & Conteúdos Auditados
          </span>
        </div>
      </section>

      {/* 2. FAIXA DE MÉTRICAS INSTITUCIONAIS */}
      <section style={{
        background: 'rgba(16, 24, 40, 0.65)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
        padding: '1.75rem 2.5rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '2rem',
        textAlign: 'center'
      }}>
        <div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--gold-light)' }}>100%</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Autonomia & Colaboração</div>
        </div>
        <div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--blue-light)' }}>Dossiês</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Jurisprudência & Contratos</div>
        </div>
        <div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#34D399' }}>~72%</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Otimização de Mídias</div>
        </div>
        <div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#FBBF24' }}>Encontros</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Palestras & Alinhamentos</div>
        </div>
      </section>

      {/* 3. PILARES DO SITE (O QUE A PLATAFORMA OFERECE) */}
      <section>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
            Pilares da Nossa <span className="text-gradient-gold">Comunidade</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '620px', margin: '0 auto' }}>
            Tudo o que você precisa para trocar conhecimento estratégico, validar movimentos de mercado e acelerar sua empresa.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem'
        }}>
          {/* Card 1: Dossiês */}
          <div 
            onClick={() => onNavigateTab('library')}
            className="glass-panel"
            style={{
              padding: '2rem',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              transition: 'var(--transition)'
            }}
          >
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 'var(--radius-md)',
              background: 'rgba(212, 175, 55, 0.12)',
              border: '1px solid var(--gold-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--gold-light)'
            }}>
              <BookOpen size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem' }}>Acervo de Dossiês & Jurisprudência</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6, flex: 1 }}>
              Livros colaborativos sobre direito empresarial, minutas de acordo de acionistas, teses fiscais e gravações práticas organizadas por tema.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--gold-light)', fontSize: '0.88rem', fontWeight: 600 }}>
              <span>Explorar o Acervo</span>
              <ArrowRight size={15} />
            </div>
          </div>

          {/* Card 2: Banco de Ideias */}
          <div 
            onClick={() => onNavigateTab('ideas')}
            className="glass-panel"
            style={{
              padding: '2rem',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              transition: 'var(--transition)'
            }}
          >
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 'var(--radius-md)',
              background: 'rgba(59, 130, 246, 0.12)',
              border: '1px solid var(--blue-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--blue-light)'
            }}>
              <Lightbulb size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem' }}>Banco Coletivo de Ideias</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6, flex: 1 }}>
              Propostas de compras corporativas conjuntas, parcerias B2B, redução de custos fixos e projetos de inovação votados pelos membros.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--blue-light)', fontSize: '0.88rem', fontWeight: 600 }}>
              <span>Ver Ideias em Discussão</span>
              <ArrowRight size={15} />
            </div>
          </div>

          {/* Card 3: Palestras e Encontros */}
          <div 
            onClick={() => onNavigateTab('events')}
            className="glass-panel"
            style={{
              padding: '2rem',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              transition: 'var(--transition)'
            }}
          >
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 'var(--radius-md)',
              background: 'rgba(168, 85, 247, 0.12)',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#C084FC'
            }}>
              <Calendar size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem' }}>Palestras Internas & Reuniões</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6, flex: 1 }}>
              Workshops práticos apresentados pelos próprios membros especialistas e reuniões de alinhamento estratégico com presença confirmada.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#C084FC', fontSize: '0.88rem', fontWeight: 600 }}>
              <span>Consultar Agenda</span>
              <ArrowRight size={15} />
            </div>
          </div>

          {/* Card 4: Membros */}
          <div 
            onClick={() => onNavigateTab('members')}
            className="glass-panel"
            style={{
              padding: '2rem',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              transition: 'var(--transition)'
            }}
          >
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 'var(--radius-md)',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#34D399'
            }}>
              <Users size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem' }}>Diretório de Fundadores</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6, flex: 1 }}>
              Perfis de quem faz acontecer no Brasil: empresas, cargos, biografias e o acervo de materiais disponibilizados por cada um.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#34D399', fontSize: '0.88rem', fontWeight: 600 }}>
              <span>Conhecer os Membros</span>
              <ArrowRight size={15} />
            </div>
          </div>
        </div>
      </section>

      {/* 4. BANNER INSTITUCIONAL DE CTA */}
      <section style={{
        background: 'linear-gradient(135deg, rgba(20, 28, 45, 0.95) 0%, rgba(13, 19, 31, 0.98) 100%)',
        border: '1px solid var(--gold-border)',
        borderRadius: 'var(--radius-xl)',
        padding: '3rem 2.5rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <h2 style={{ fontSize: '2.1rem', marginBottom: '0.75rem' }}>
          Pronto para colaborar e trocar inteligência com o grupo?
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '640px', margin: '0 auto 2rem' }}>
          Crie um dossiê temático, anexe suas minutas contratuais ou proponha uma nova ideia para ser votada pelos fundadores.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-gold btn-lg"
            onClick={() => onNavigateTab('library')}
          >
            <BookOpen size={18} />
            <span>Acessar Acervo Completo</span>
          </button>
          
          {!user && (
            <button
              type="button"
              className="btn btn-secondary btn-lg"
              onClick={onOpenAuth}
            >
              Fazer Login / Cadastrar
            </button>
          )}
        </div>
      </section>

    </div>
  );
}
