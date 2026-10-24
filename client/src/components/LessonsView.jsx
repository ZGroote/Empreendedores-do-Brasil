import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, PlayCircle, Upload, Loader2, Film } from 'lucide-react';

const LESSON_CATEGORIES = [
  'Vendas & Growth',
  'Finanças & Captação',
  'Direito & Jurídico',
  'Tecnologia & IA',
  'Gestão & Liderança',
  'Marketing',
  'Outros'
];

function formatBytes(bytes) {
  if (!bytes) return '0 KB';
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export default function LessonsView({ onOpenUpload }) {
  const [lessons, setLessons] = useState([]);
  const [category, setCategory] = useState('Todas');
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/lessons?category=${encodeURIComponent(category)}`);
        if (res.ok && !cancelled) setLessons(await res.json());
      } catch (err) {
        console.error('Erro ao buscar aulas:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [category, reloadKey]);

  // Enquanto algum vídeo está sendo compactado, recarrega a lista a cada 5s
  const hasProcessing = lessons.some(l => l.status === 'processing');
  useEffect(() => {
    if (!hasProcessing) return;
    const timer = setInterval(() => setReloadKey(k => k + 1), 5000);
    return () => clearInterval(timer);
  }, [hasProcessing]);

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <span className="badge badge-gold" style={{ marginBottom: '0.5rem' }}>Aulas & Treinamentos</span>
          <h1 style={{ fontSize: 'clamp(1.6rem, 5vw, 2.1rem)', lineHeight: 1.2 }}>
            Aulas em <span className="text-gradient-gold">Vídeo</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '640px', marginTop: '0.4rem' }}>
            Grave o que você sabe e compartilhe com o grupo. Os vídeos são compactados automaticamente para carregar rápido e ocupar pouco espaço.
          </p>
        </div>
        <button type="button" className="btn btn-gold btn-lg" onClick={onOpenUpload}>
          <Upload size={18} />
          <span>Enviar Aula</span>
        </button>
      </div>

      {/* Categorias */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.4rem', marginBottom: '1.5rem' }}>
        {['Todas', ...LESSON_CATEGORIES].map((cat) => (
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

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-dim)' }}>Carregando aulas...</div>
      ) : lessons.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Film size={40} color="var(--text-dim)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ marginBottom: '0.5rem' }}>Nenhuma aula {category !== 'Todas' ? `em ${category}` : 'ainda'}</h3>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Seja o primeiro a compartilhar um vídeo com o grupo.
          </p>
          <button type="button" className="btn btn-outline-gold" onClick={onOpenUpload}>
            <Upload size={16} /> Enviar Aula
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(300px, 100%), 1fr))',
          gap: '1.5rem'
        }}>
          {lessons.map((lesson) => {
            const ready = lesson.status === 'ready';
            const saved = lesson.original_size_bytes
              ? Math.round((1 - lesson.compressed_size_bytes / lesson.original_size_bytes) * 100)
              : 0;
            return (
              <div
                key={lesson.id}
                className="glass-panel card-hover"
                role="button"
                tabIndex={0}
                style={{ overflow: 'hidden', cursor: ready ? 'pointer' : 'default' }}
                onClick={() => ready && setPlaying(lesson)}
                onKeyDown={(e) => e.key === 'Enter' && ready && setPlaying(lesson)}
              >
                <div className="lesson-thumb">
                  {ready ? (
                    <>
                      {/* #t=1 mostra um quadro do vídeo como capa sem baixar tudo */}
                      <video src={`${lesson.file_url}#t=1`} preload="metadata" muted />
                      <PlayCircle size={52} className="lesson-play" />
                    </>
                  ) : (
                    <div className="lesson-processing">
                      <Loader2 size={28} className="spin" />
                      <span>Compactando vídeo...</span>
                    </div>
                  )}
                </div>

                <div style={{ padding: '1.1rem 1.25rem 1.25rem' }}>
                  <span className="badge badge-blue" style={{ marginBottom: '0.6rem' }}>{lesson.category}</span>
                  <h3 style={{ fontSize: '1.08rem', lineHeight: 1.35, marginBottom: '0.35rem' }}>{lesson.title}</h3>
                  {lesson.description && (
                    <p className="line-clamp-2" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
                      {lesson.description}
                    </p>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginTop: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                      <img src={lesson.uploader_avatar} alt="" style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover' }} />
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {lesson.uploader_name}
                      </span>
                    </div>
                    {ready && (
                      <span style={{ fontSize: '0.72rem', color: '#34D399', whiteSpace: 'nowrap' }} title={`Original: ${formatBytes(lesson.original_size_bytes)}`}>
                        {formatBytes(lesson.compressed_size_bytes)}{saved > 0 ? ` · −${saved}%` : ''}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Player */}
      {playing && (
        <div className="modal-overlay" onClick={() => setPlaying(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '960px' }}>
            <div className="modal-header">
              <div style={{ minWidth: 0 }}>
                <h3 style={{ fontSize: '1.15rem' }}>{playing.title}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                  {playing.category} · por {playing.uploader_name}
                </p>
              </div>
              <button className="close-btn" onClick={() => setPlaying(null)} aria-label="Fechar">
                <X size={20} />
              </button>
            </div>
            <video src={playing.file_url} controls autoPlay style={{ width: '100%', display: 'block', background: '#000', maxHeight: '70vh' }} />
            {playing.description && (
              <div className="modal-body">
                <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', whiteSpace: 'pre-line' }}>{playing.description}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function NewLessonModal({ onClose, onCreated }) {
  const { user, token, setIsAuthModalOpen } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(LESSON_CATEGORIES[0]);
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    if (!title.trim() || !file) {
      setError('Informe o título e escolha o vídeo.');
      return;
    }

    const form = new FormData();
    form.append('title', title.trim());
    form.append('description', description.trim());
    form.append('category', category);
    form.append('video', file);

    // XHR em vez de fetch para mostrar o progresso do envio (vídeos são grandes)
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/lessons');
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.upload.onprogress = (ev) => ev.lengthComputable && setProgress(Math.round((ev.loaded / ev.total) * 100));
    xhr.onload = () => {
      if (xhr.status === 201) {
        onClose();
        onCreated();
        return;
      }
      let message = 'Erro ao enviar aula';
      try { message = JSON.parse(xhr.responseText).error || message; } catch { /* resposta não-JSON */ }
      if (xhr.status === 413) message = 'Vídeo grande demais para o servidor.';
      setError(message);
      setProgress(null);
    };
    xhr.onerror = () => {
      setError('Falha de conexão durante o envio.');
      setProgress(null);
    };
    setError('');
    setProgress(0);
    xhr.send(form);
  }

  const sending = progress !== null;

  return (
    <div className="modal-overlay" onClick={sending ? undefined : onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '1.2rem' }}>Enviar Aula</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              O vídeo é compactado automaticamente após o envio
            </p>
          </div>
          <button className="close-btn" onClick={onClose} disabled={sending} aria-label="Fechar">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div style={{ background: 'var(--rose-bg)', color: 'var(--rose-primary)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="lesson-title">Título</label>
              <input id="lesson-title" className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Como montar um funil de vendas B2B" />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="lesson-category">Categoria</label>
              <select id="lesson-category" className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                {LESSON_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="lesson-desc">Descrição (opcional)</label>
              <textarea id="lesson-desc" className="form-textarea" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="O que a pessoa vai aprender nesta aula?" />
            </div>

            <label className="file-drop">
              <input type="file" accept="video/*" onChange={(e) => setFile(e.target.files[0] || null)} hidden />
              <Film size={26} color="var(--gold-light)" />
              <span style={{ fontWeight: 600 }}>{file ? file.name : 'Escolher vídeo'}</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                {file ? formatBytes(file.size) : 'MP4, MOV, WEBM, MKV ou AVI'}
              </span>
            </label>

            {sending && (
              <div style={{ marginTop: '1.25rem' }}>
                <div className="progress-track"><div className="progress-bar" style={{ width: `${progress}%` }} /></div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                  {progress < 100 ? `Enviando... ${progress}%` : 'Finalizando...'}
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={sending}>Cancelar</button>
            <button type="submit" className="btn btn-gold" disabled={sending}>
              <Upload size={16} /> {sending ? 'Enviando...' : 'Enviar Aula'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
