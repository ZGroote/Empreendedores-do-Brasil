import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Video, 
  Mic, 
  Users, 
  PlusCircle, 
  CheckCircle2, 
  ExternalLink,
  Sparkles,
  MapPin
} from 'lucide-react';

export default function EventsCalendar({ onOpenNewEvent }) {
  const { user, token, setIsAuthModalOpen } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all'); // 'all', 'talk', 'meeting'

  useEffect(() => {
    fetchEvents();
  }, [filterType, token]);

  async function fetchEvents() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterType !== 'all') params.append('type', filterType);

      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const res = await fetch(`/api/events?${params.toString()}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (err) {
      console.error('Erro ao buscar eventos:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleRsvp(e, eventItem) {
    e.stopPropagation();
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    // Otimista
    const prevHasRsvp = eventItem.has_rsvp;
    const prevCount = eventItem.attendees_count;

    setEvents(events.map(ev => {
      if (ev.id === eventItem.id) {
        return {
          ...ev,
          has_rsvp: !prevHasRsvp,
          attendees_count: prevHasRsvp ? prevCount - 1 : prevCount + 1
        };
      }
      return ev;
    }));

    try {
      const res = await fetch(`/api/events/${eventItem.id}/rsvp`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setEvents(prev => prev.map(ev => {
          if (ev.id === eventItem.id) {
            return {
              ...ev,
              has_rsvp: data.has_rsvp,
              attendees_count: data.attendees_count,
              attendees: data.attendees
            };
          }
          return ev;
        }));
      }
    } catch (err) {
      console.error('Erro ao atualizar RSVP:', err);
      // Reverter
      setEvents(events.map(ev => ev.id === eventItem.id ? {
        ...ev,
        has_rsvp: prevHasRsvp,
        attendees_count: prevCount
      } : ev));
    }
  }

  function formatEventDate(dateString) {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase().replace('.', '');
    const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const weekday = date.toLocaleDateString('pt-BR', { weekday: 'long' });
    return { day, month, time, weekday };
  }

  return (
    <div>
      {/* Banner Superior */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(16, 24, 40, 0.8) 0%, rgba(13, 19, 31, 0.9) 100%)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
        padding: '2.25rem 2rem',
        marginBottom: '2rem',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1.5rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: '680px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
            <span className="badge badge-gold">Agenda & Conexão ao Vivo</span>
          </div>
          <h1 style={{ fontSize: '2.1rem', lineHeight: 1.2 }}>
            Reuniões & Palestras <span className="text-gradient-gold">Internas</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.5rem' }}>
            Aprenda diretamente com a experiência de outros fundadores nas palestras internas (talks) e participe das decisões estratégicas nas reuniões de alinhamento.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-gold btn-lg"
          onClick={onOpenNewEvent}
          style={{ gap: '0.6rem' }}
        >
          <PlusCircle size={18} />
          <span>Agendar Reunião ou Palestra</span>
        </button>
      </div>

      {/* Abas de Filtros de Tipos de Eventos */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            type="button"
            className={`btn btn-sm ${filterType === 'all' ? 'btn-gold' : 'btn-secondary'}`}
            onClick={() => setFilterType('all')}
            style={{ borderRadius: 'var(--radius-full)' }}
          >
            Todos os Eventos ({events.length})
          </button>

          <button
            type="button"
            className={`btn btn-sm ${filterType === 'talk' ? 'btn-gold' : 'btn-secondary'}`}
            onClick={() => setFilterType('talk')}
            style={{ borderRadius: 'var(--radius-full)', gap: '0.4rem' }}
          >
            <Mic size={14} />
            <span>Palestras Internas</span>
          </button>

          <button
            type="button"
            className={`btn btn-sm ${filterType === 'meeting' ? 'btn-gold' : 'btn-secondary'}`}
            onClick={() => setFilterType('meeting')}
            style={{ borderRadius: 'var(--radius-full)', gap: '0.4rem' }}
          >
            <Users size={14} />
            <span>Reuniões Estratégicas</span>
          </button>
        </div>

        <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>
          Horários sincronizados no fuso oficial de Brasília (BRT)
        </span>
      </div>

      {/* Lista de Eventos */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-dim)' }}>
          Carregando cronograma de reuniões e palestras...
        </div>
      ) : events.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: 'var(--bg-secondary)',
          border: '1px dashed var(--border-bright)',
          borderRadius: 'var(--radius-xl)'
        }}>
          <CalendarIcon size={42} color="var(--gold-light)" style={{ opacity: 0.6, marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Nenhum evento agendado no filtro</h3>
          <p style={{ color: 'var(--text-dim)', maxWidth: '420px', margin: '0 auto 1.5rem', fontSize: '0.9rem' }}>
            Nenhuma reunião ou palestra encontrada nesta categoria. Agende a primeira para mobilizar o grupo!
          </p>
          <button type="button" className="btn btn-gold" onClick={onOpenNewEvent}>
            <PlusCircle size={16} /> Agendar Agora
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {events.map((eventItem) => {
            const { day, month, time, weekday } = formatEventDate(eventItem.date_time);
            const isTalk = eventItem.type === 'talk';

            return (
              <div
                key={eventItem.id}
                className="glass-panel"
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'stretch',
                  overflow: 'hidden',
                  position: 'relative',
                  borderLeft: isTalk ? '4px solid var(--gold-primary)' : '4px solid var(--blue-primary)'
                }}
              >
                {/* Bloco de Data e Horário em Destaque */}
                <div style={{
                  padding: '1.75rem 1.5rem',
                  background: 'rgba(11, 16, 26, 0.6)',
                  borderRight: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '130px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: isTalk ? 'var(--gold-light)' : 'var(--blue-light)', textTransform: 'uppercase' }}>
                    {month}
                  </div>
                  <div style={{ fontSize: '2.2rem', fontWeight: 800, lineHeight: 1.1, color: 'var(--text-main)' }}>
                    {day}
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Clock size={12} />
                    {time}
                  </div>
                </div>

                {/* Conteúdo Central do Evento */}
                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
                  <div>
                    {/* Header: Tipo de Evento + Duração */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
                      <span className={`badge ${isTalk ? 'badge-gold' : 'badge-blue'}`}>
                        {isTalk ? <Mic size={12} /> : <Users size={12} />}
                        {isTalk ? 'Palestra Interna (Talk)' : 'Reunião Estratégica'}
                      </span>

                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Clock size={12} /> {eventItem.duration_minutes} minutos
                      </span>

                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                        • {weekday}
                      </span>
                    </div>

                    {/* Título do Evento */}
                    <h3 style={{ fontSize: '1.35rem', marginBottom: '0.6rem', lineHeight: 1.3 }}>
                      {eventItem.title}
                    </h3>

                    {/* Descrição */}
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1rem' }}>
                      {eventItem.description}
                    </p>

                    {/* Destaque do Palestrante (Se for Palestra) */}
                    {isTalk && eventItem.speaker && eventItem.speaker.name && (
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        background: 'rgba(212, 175, 55, 0.06)',
                        border: '1px solid var(--gold-border)',
                        borderRadius: 'var(--radius-md)',
                        padding: '0.6rem 1rem',
                        marginBottom: '0.5rem'
                      }}>
                        <img
                          src={eventItem.speaker.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                          alt={eventItem.speaker.name}
                          style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                            Palestrante: {eventItem.speaker.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--gold-light)' }}>
                            {eventItem.speaker.topic || `${eventItem.speaker.company}`}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Rodapé do Evento: Link da Sala, Participantes e RSVP */}
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    paddingTop: '0.85rem',
                    borderTop: '1px solid var(--border-subtle)'
                  }}>
                    {/* Link da Reunião / Sala Virtual */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      {eventItem.meeting_link ? (
                        <a
                          href={eventItem.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary btn-sm"
                          style={{ gap: '0.4rem', color: 'var(--blue-light)' }}
                        >
                          <Video size={14} />
                          <span>Acessar Link da Sala</span>
                          <ExternalLink size={12} />
                        </a>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Video size={14} /> Link será disponibilizado aos confirmados
                        </span>
                      )}
                    </div>

                    {/* Presenças e Botão de RSVP */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      {/* Avatar Stack de Membros Confirmados */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <div style={{ display: 'flex', marginLeft: '0.5rem' }}>
                          {eventItem.attendees && eventItem.attendees.map((att, i) => (
                            <img
                              key={att.id}
                              src={att.avatar}
                              alt={att.name}
                              title={`${att.name} (${att.company})`}
                              style={{
                                width: 26,
                                height: 26,
                                borderRadius: '50%',
                                border: '2px solid var(--bg-secondary)',
                                marginLeft: i === 0 ? 0 : -8,
                                objectFit: 'cover'
                              }}
                            />
                          ))}
                        </div>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                          <strong>{eventItem.attendees_count}</strong> {eventItem.attendees_count === 1 ? 'membro confirmado' : 'membros confirmados'}
                        </span>
                      </div>

                      {/* Botão de Presença RSVP */}
                      <button
                        type="button"
                        onClick={(e) => handleToggleRsvp(e, eventItem)}
                        className={`btn btn-sm ${eventItem.has_rsvp ? 'badge-emerald' : 'btn-gold'}`}
                        style={{
                          padding: '0.55rem 1rem',
                          fontWeight: 700,
                          borderRadius: 'var(--radius-md)'
                        }}
                      >
                        {eventItem.has_rsvp ? (
                          <>
                            <CheckCircle2 size={15} />
                            <span>Presença Confirmada</span>
                          </>
                        ) : (
                          <>
                            <span>Vou Participar</span>
                          </>
                        )}
                      </button>
                    </div>

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
