import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lightbulb, Tag, Plus, Check } from 'lucide-react';

const SUGGESTED_TAGS = [
  'Parcerias',
  'B2B',
  'Inteligência Artificial',
  'Venture Capital',
  'Redução de Custos',
  'Inovação',
  'Growth',
  'Tech',
  'Operações'
];

const CATEGORIES = [
  'Geral',
  'Parcerias & Custos',
  'Tecnologia & IA',
  'Finanças & Captação',
  'Vendas & Growth',
  'Operações & Pessoas'
];

export default function NewIdeaModal({ isOpen, onClose, onIdeaCreated }) {
  const { user, token, setIsAuthModalOpen } = useAuth();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Parcerias & Custos');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState(['Parcerias', 'B2B']);
  const [customTag, setCustomTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  function toggleSuggestedTag(tag) {
    if (tags.includes(tag)) {
      setTags(tags.filter(t => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  }

  function handleAddCustomTag(e) {
    e.preventDefault();
    const clean = customTag.trim();
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
      setCustomTag('');
    }
  }

  function removeTag(tagToRemove) {
    setTags(tags.filter(t => t !== tagToRemove));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!title.trim() || !description.trim()) {
      setError('Por favor, preencha o título e o descritivo da ideia.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/ideas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          tags,
          category,
          status: 'Em Discussão'
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao publicar ideia');
      }

      onClose();
      if (onIdeaCreated) onIdeaCreated();
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
              width: 34,
              height: 34,
              borderRadius: 'var(--radius-sm)',
              background: 'var(--accent-soft)',
              border: '1px solid var(--accent-line)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Lightbulb size={18} color="var(--accent)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem' }}>Cadastrar Nova Ideia</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--ink-3)' }}>
                Compartilhe uma oportunidade ou projeto com os empreendedores
              </p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ padding: '1.5rem' }}>
            
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
              <label className="form-label">Título da Ideia / Proposta</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: Central Unificada de Negociação de SaaS para Membros"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Categoria</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Seletor de Tags */}
            <div className="form-group">
              <label className="form-label">Tags para Filtros e Busca</label>
              
              {/* Tags Selecionadas */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.65rem' }}>
                {tags.map(tag => (
                  <span
                    key={tag}
                    className="badge badge-accent"
                    style={{ fontSize: '0.8rem', cursor: 'pointer', padding: '0.35rem 0.65rem' }}
                    onClick={() => removeTag(tag)}
                    title="Clique para remover"
                  >
                    #{tag} &times;
                  </span>
                ))}
              </div>

              {/* Tags Sugeridas para Clique Rápido */}
              <div style={{ fontSize: '0.8rem', color: 'var(--ink-3)', marginBottom: '0.4rem' }}>
                Sugestões rápidas:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.75rem' }}>
                {SUGGESTED_TAGS.map(tag => {
                  const isSelected = tags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleSuggestedTag(tag)}
                      className={`tag-chip ${isSelected ? 'active' : ''}`}
                      style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem' }}
                    >
                      {isSelected && <Check size={12} style={{ marginRight: '0.25rem' }} />}
                      {tag}
                    </button>
                  );
                })}
              </div>

              {/* Input de tag personalizada */}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ fontSize: '0.875rem', padding: '0.5rem 0.75rem' }}
                  placeholder="Ou adicione uma tag customizada..."
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomTag(e);
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleAddCustomTag}
                >
                  <Plus size={14} /> Adicionar
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Descritivo Detalhado da Ideia</label>
              <textarea
                className="form-textarea"
                style={{ minHeight: '130px' }}
                placeholder="Explique o contexto, qual o benefício para os integrantes do grupo, próximos passos e como outros empreendedores podem colaborar..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Cadastrando...' : 'Publicar Ideia no Mural'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
