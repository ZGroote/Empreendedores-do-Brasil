import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  BookOpen, 
  Tag, 
  Plus, 
  Check, 
  Sparkles, 
  Users, 
  Layers,
  Palette
} from 'lucide-react';

export default function NewBookModal({ isOpen, onClose, onBookCreated }) {
  const { user, setIsAuthModalOpen } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Direito & Legislação');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState(['Jurisprudência', 'Contratos']);
  const [colorGradient, setColorGradient] = useState('gold');
  const [isCollaborative, setIsCollaborative] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const categories = [
    'Direito & Legislação',
    'Finanças & Captação',
    'Tecnologia & IA',
    'Vendas & Growth',
    'Gestão & Governança'
  ];

  const colorOptions = [
    { id: 'gold', name: 'Ocre', color: 'var(--book-gold)' },
    { id: 'blue', name: 'Índigo', color: 'var(--book-blue)' },
    { id: 'purple', name: 'Ameixa', color: 'var(--book-purple)' },
    { id: 'emerald', name: 'Verde', color: 'var(--book-emerald)' }
  ];

  function handleAddTag(e) {
    e.preventDefault();
    const clean = tagInput.trim().replace(/^#/, '');
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
      setTagInput('');
    }
  }

  function handleRemoveTag(tagToRemove) {
    setTags(tags.filter(t => t !== tagToRemove));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!title.trim() || !description.trim()) {
      setError('Por favor, preencha o título e a descrição do dossiê.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category,
          tags,
          color_gradient: colorGradient,
          is_collaborative: isCollaborative
        })
      });

      if (res.ok) {
        const data = await res.json();
        onClose();
        if (onBookCreated) onBookCreated(data.bookId);
      } else {
        const err = await res.json();
        setError(err.error || 'Erro ao criar dossiê.');
      }
    } catch (err) {
      console.error('Erro ao submeter novo livro:', err);
      setError('Erro de conexão ao criar dossiê.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-card" 
        style={{ maxWidth: '640px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-soft)',
              border: '1px solid var(--accent-line)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <BookOpen size={18} color="var(--accent)" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', lineHeight: 1.2 }}>Criar Novo Dossiê / Livro</h2>
              <div style={{ fontSize: '0.8rem', color: 'var(--ink-3)' }}>
                Inaugure uma nova coletânea de conhecimento para a rede
              </div>
            </div>
          </div>
          <button type="button" className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div style={{
                background: 'var(--danger-soft)',
                border: '1px solid var(--danger)',
                color: 'var(--danger)',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                marginBottom: '1.25rem'
              }}>
                {error}
              </div>
            )}

            {/* Título do Livro */}
            <div className="form-group">
              <label className="form-label">Título do Dossiê / Livro *</label>
              <input
                type="text"
                required
                placeholder="Ex: Jurisprudência Trabalhista & Vesting para Startups"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="form-input"
              />
            </div>

            {/* Categoria */}
            <div className="form-group">
              <label className="form-label">Área / Categoria de Negócio *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="form-select"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Descrição */}
            <div className="form-group">
              <label className="form-label">Objetivo e Escopo do Conhecimento *</label>
              <textarea
                required
                rows={3}
                placeholder="Explique o que este dossiê cobre e quais tipos de materiais (acórdãos, minutas, vídeos) os membros devem anexar aqui..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="form-textarea"
              />
            </div>

            {/* Cor / Lombada do Livro */}
            <div className="form-group">
              <label className="form-label">Cor de Destaque da Capa</label>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {colorOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setColorGradient(opt.id)}
                    style={{
                      flex: 1,
                      padding: '0.6rem 0.5rem',
                      background: colorGradient === opt.id ? 'var(--fill-strong)' : 'var(--fill)',
                      border: colorGradient === opt.id ? `2px solid ${opt.color}` : '1px solid var(--rule)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.4rem',
                      cursor: 'pointer',
                      transition: 'var(--transition)'
                    }}
                  >
                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: opt.color }} />
                    <span style={{ fontSize: '0.8rem', color: colorGradient === opt.id ? 'var(--ink)' : 'var(--ink-3)' }}>
                      {opt.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tags Temáticas */}
            <div className="form-group">
              <label className="form-label">Palavras-chave e Tags</label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.6rem' }}>
                <input
                  type="text"
                  placeholder="Ex: STF, Tributário, Acordo de Sócios"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  className="form-input"
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="btn btn-secondary btn-sm"
                >
                  <Plus size={14} /> Adicionar
                </button>
              </div>

              {tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {tags.map((t) => (
                    <span
                      key={t}
                      style={{
                        background: 'var(--fill)',
                        border: '1px solid var(--rule)',
                        borderRadius: 'var(--radius-full)',
                        padding: '0.2rem 0.65rem',
                        fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}
                    >
                      #{t}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(t)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--ink-3)', cursor: 'pointer' }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Toggle Colaborativo */}
            <div style={{
              background: 'var(--fill)',
              border: '1px solid var(--rule)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer'
            }}
              onClick={() => setIsCollaborative(!isCollaborative)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Users size={20} color="var(--accent)" />
                <div>
                  <div style={{ fontSize: '0.94rem', fontWeight: 600, color: 'var(--ink)' }}>
                    Permitir que outros membros acrescentem materiais
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--ink-3)' }}>
                    Dossiê colaborativo: qualquer empreendedor verificado pode anexar PDFs e vídeos.
                  </div>
                </div>
              </div>

              <input
                type="checkbox"
                checked={isCollaborative}
                onChange={(e) => setIsCollaborative(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: 'var(--accent)', cursor: 'pointer' }}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Criando Dossiê...' : 'Publicar Dossiê na Biblioteca'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
