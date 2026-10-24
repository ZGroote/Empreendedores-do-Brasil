import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

const SECTIONS = [
  { id: 'events', title: 'Agenda', text: 'Palestras dadas pelos próprios membros e os encontros do grupo, com presença confirmada.' },
  { id: 'ideas', title: 'Banco de ideias', text: 'Propostas de parceria, compras conjuntas e projetos, discutidas e votadas por quem está dentro.' },
  { id: 'library', title: 'Biblioteca', text: 'Dossiês montados a várias mãos: contratos, teses, relatórios e gravações organizados por tema.' },
  { id: 'lessons', title: 'Aulas', text: 'Vídeos curtos em que cada membro ensina o que domina, separados por categoria.' },
  { id: 'members', title: 'Membros', text: 'Quem faz parte, o que cada um faz e o que já compartilhou com o grupo.' }
];

export default function HomeView({ onNavigateTab, onOpenAuth }) {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [nextEvent, setNextEvent] = useState(null);

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(setStats).catch(() => {});
    fetch('/api/events')
      .then(r => r.json())
      .then(events => setNextEvent(events.find(e => new Date(e.date_time) >= new Date()) || null))
      .catch(() => {});
  }, []);

  const eventDate = nextEvent && new Date(nextEvent.date_time);

  return (
    <div>
      <section className="home-hero">
        <div>
          <span className="badge badge-accent">Grupo fechado · Brasil</span>
          <h1 style={{ marginTop: '1.25rem' }}>
            Empreendedores trocando o que <span className="em-accent">aprenderam</span> na prática.
          </h1>
          <p className="lede">
            Um espaço só dos membros para discutir ideias, marcar palestras e reuniões, guardar materiais e gravar aulas uns para os outros.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            <button type="button" className="btn btn-primary btn-lg" onClick={() => onNavigateTab('events')}>
              Ver a agenda <ArrowRight size={17} />
            </button>
            {user ? (
              <button type="button" className="btn btn-secondary btn-lg" onClick={() => onNavigateTab('ideas')}>
                Banco de ideias
              </button>
            ) : (
              <button type="button" className="btn btn-secondary btn-lg" onClick={onOpenAuth}>
                Entrar
              </button>
            )}
          </div>
        </div>

        <aside className="home-aside">
          <span className="badge">Próximo encontro</span>
          {nextEvent ? (
            <button
              type="button"
              onClick={() => onNavigateTab('events')}
              style={{ display: 'block', width: '100%', background: 'none', border: 'none', color: 'inherit', textAlign: 'left', cursor: 'pointer', marginTop: '0.75rem' }}
            >
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '3.2rem', lineHeight: 1, fontWeight: 400 }}>
                {eventDate.toLocaleDateString('pt-BR', { day: '2-digit' })}
                <span style={{ fontSize: '1.1rem', fontStyle: 'italic', color: 'var(--ink-2)', marginLeft: '0.5rem' }}>
                  {eventDate.toLocaleDateString('pt-BR', { month: 'long' })}, {eventDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <h3 style={{ fontSize: '1.2rem', lineHeight: 1.3, margin: '0.9rem 0 0.5rem' }}>{nextEvent.title}</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--ink-3)' }}>
                {nextEvent.type === 'talk' ? 'Palestra' : 'Reunião'}
                {nextEvent.speaker?.name ? ` com ${nextEvent.speaker.name}` : ''} · {nextEvent.attendees_count} confirmados
              </p>
            </button>
          ) : (
            <p style={{ color: 'var(--ink-3)', marginTop: '0.75rem', fontSize: '0.95rem' }}>Nenhum encontro marcado ainda.</p>
          )}
        </aside>
      </section>

      <section className="numbers-row" aria-label="O grupo em números">
        {[
          [stats?.members, 'membros'],
          [stats?.events, 'encontros na agenda'],
          [stats?.ideas, 'ideias propostas'],
          [stats?.books, 'dossiês na biblioteca'],
          [stats?.lessons, 'aulas gravadas']
        ].map(([value, label]) => (
          <div key={label}>
            <strong>{value ?? '–'}</strong>
            <span>{label}</span>
          </div>
        ))}
      </section>

      <section style={{ marginTop: '4rem' }}>
        <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontStyle: 'italic', fontWeight: 400, marginBottom: '0.5rem' }}>
          O que tem aqui dentro
        </h2>
        <ol className="section-index">
          {SECTIONS.map((section, i) => (
            <li key={section.id}>
              <button type="button" onClick={() => onNavigateTab(section.id)}>
                <span className="num">{String(i + 1).padStart(2, '0')}</span>
                <span>
                  <h3>{section.title}</h3>
                  <p>{section.text}</p>
                </span>
                <ArrowUpRight size={22} className="arrow" />
              </button>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
