import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  Calendar, 
  Clock, 
  Video, 
  Mic, 
  Users, 
  Link as LinkIcon, 
  CheckCircle2, 
  Sparkles 
} from 'lucide-react';

export default function NewEventModal({ isOpen, onClose, onEventCreated }) {
  const { user, token, setIsAuthModalOpen } = useAuth();
  const [type, setType] = useState('talk'); // 'talk' ou 'meeting'
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [meetingLink, setMeetingLink] = useState('https://meet.google.com/');
  const [speakerTopic, setSpeakerTopic] = useState('');
  const [speakerId, setSpeakerId] = useState('');
  const [membersList, setMembersList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Carrega lista de membros para selecionar palestrante
  useEffect(() => {
    async function fetchMembers() {
      try {
        const res = await fetch('/api/users');
        if (res.ok) {
          const data = await res.json();
          setMembersList(data);
          if (user && !speakerId) {
            setSpeakerId(user.id);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }

    if (isOpen) {
      fetchMembers();
      // Sugestão de data para amanhã às 19:00
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 2);
      tomorrow.setHours(19, 0, 0, 0);
      const isoString = tomorrow.toISOString().slice(0, 16);
      setDateTime(isoString);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!title.trim() || !dateTime) {
      setError('Por favor, informe o título e o horário do evento.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const selectedSpeaker = membersList.find(m => String(m.id) === String(speakerId));

      const res = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: title.trim(),
          type,
          description: description.trim(),
          date_time: new Date(dateTime).toISOString(),
          duration_minutes: durationMinutes,
          location_type: 'online',
          meeting_link: meetingLink.trim(),
          speaker_id: type === 'talk' ? (speakerId || user.id) : null,
          speaker_name: selectedSpeaker ? selectedSpeaker.name : null,
          speaker_topic: type === 'talk' ? speakerTopic.trim() : null
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao agendar evento');
      }

      onClose();
      if (onEventCreated) onEventCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-sm)',
              background: type === 'talk' ? 'var(--accent-soft)' : 'var(--signal-soft)',
              border: `1px solid ${type === 'talk' ? 'var(--accent-line)' : 'var(--signal-line)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {type === 'talk' ? <Mic size={18} color="var(--accent)" /> : <Users size={18} color="var(--signal)" />}
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem' }}>Agendar Reunião ou Palestra Interna</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--ink-3)' }}>
                Conecte os empreendedores em uma sessão ao vivo de alinhamento ou aprendizado
              </p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Tipo de Evento Toggle */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.75rem',
          padding: '1.25rem 1.75rem 0',
        }}>
          <button
            type="button"
            onClick={() => setType('talk')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6rem',
              padding: '0.85rem',
              borderRadius: 'var(--radius-md)',
              border: `1px solid ${type === 'talk' ? 'var(--accent)' : 'var(--rule)'}`,
              background: type === 'talk' ? 'var(--accent-soft)' : 'var(--fill)',
              color: type === 'talk' ? 'var(--accent)' : 'var(--ink-2)',
              fontWeight: 700,
              fontSize: '0.94rem',
              cursor: 'pointer',
              transition: 'var(--transition)'
            }}
          >
            <Mic size={18} />
            <span>Palestra Interna (Talk)</span>
          </button>

          <button
            type="button"
            onClick={() => setType('meeting')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6rem',
              padding: '0.85rem',
              borderRadius: 'var(--radius-md)',
              border: `1px solid ${type === 'meeting' ? 'var(--signal)' : 'var(--rule)'}`,
              background: type === 'meeting' ? 'var(--signal-soft)' : 'var(--fill)',
              color: type === 'meeting' ? 'var(--signal)' : 'var(--ink-2)',
              fontWeight: 700,
              fontSize: '0.94rem',
              cursor: 'pointer',
              transition: 'var(--transition)'
            }}
          >
            <Users size={18} />
            <span>Reunião Estratégica</span>
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ padding: '1.25rem 1.75rem' }}>
            
            {error && (
              <div style={{
                background: 'var(--danger-soft)',
                border: '1px solid var(--danger-soft)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 1rem',
                color: 'var(--danger)',
                fontSize: '0.875rem',
                marginBottom: '1.25rem'
              }}>
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">
                {type === 'talk' ? 'Tema da Palestra' : 'Pauta Principal da Reunião'}
              </label>
              <input
                type="text"
                className="form-input"
                placeholder={type === 'talk' ? 'Ex: Como Escalar Vendas B2B Sem Investimento Externo' : 'Ex: Alinhamento Estratégico Mensal e Parcerias'}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Campos Específicos para Palestra Interna */}
            {type === 'talk' && (
              <div style={{
                background: 'var(--accent-soft)',
                border: '1px solid var(--accent-line)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                marginBottom: '1.25rem'
              }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--accent)', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Mic size={14} /> Dados do Palestrante / Apresentador
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.875rem' }}>Membro Palestrante</label>
                    <select
                      className="form-select"
                      value={speakerId}
                      onChange={(e) => setSpeakerId(e.target.value)}
                    >
                      {membersList.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.company})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.875rem' }}>Área de Domínio / Foco</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ex: Growth B2B, Inteligência Artificial"
                      value={speakerTopic}
                      onChange={(e) => setSpeakerTopic(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Data, Horário e Duração */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Data e Horário (Brasília)</label>
                <div style={{ position: 'relative' }}>
                  <Calendar size={16} color="var(--ink-3)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="datetime-local"
                    className="form-input"
                    style={{ paddingLeft: '2.5rem' }}
                    value={dateTime}
                    onChange={(e) => setDateTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Duração Prevista</label>
                <div style={{ position: 'relative' }}>
                  <Clock size={16} color="var(--ink-3)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <select
                    className="form-select"
                    style={{ paddingLeft: '2.5rem' }}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  >
                    <option value={30}>30 minutos</option>
                    <option value={45}>45 minutos</option>
                    <option value={60}>60 minutos (1 hora)</option>
                    <option value={75}>75 minutos</option>
                    <option value={90}>90 minutos (1h 30m)</option>
                    <option value={120}>120 minutos (2 horas)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Link da Sala Virtual */}
            <div className="form-group">
              <label className="form-label">Link da Sala Virtual (Google Meet, Zoom, Teams)</label>
              <div style={{ position: 'relative' }}>
                <Video size={16} color="var(--ink-3)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="url"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="https://meet.google.com/xyz-abcd-efg"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                />
              </div>
            </div>

            {/* Descrição e Pauta Detalhada */}
            <div className="form-group">
              <label className="form-label">Resumo e Pauta da Sessão</label>
              <textarea
                className="form-textarea"
                style={{ minHeight: '90px' }}
                placeholder="Detalhe os tópicos que serão abordados, se haverá espaço para perguntas e o que os participantes devem preparar..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button
              type="submit"
              className={type === 'talk' ? 'btn btn-primary' : 'btn btn-primary'}
              disabled={loading}
            >
              {loading ? 'Agendando...' : (type === 'talk' ? 'Confirmar Palestra Interna' : 'Agendar Reunião Estratégica')}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
