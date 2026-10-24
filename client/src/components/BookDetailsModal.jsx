import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  BookOpen, 
  FileText, 
  Video, 
  Link2, 
  Send, 
  UploadCloud, 
  Heart, 
  Download, 
  ExternalLink, 
  Plus, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  HardDrive,
  Users,
  Eye,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function BookDetailsModal({ bookId, onClose, onBookUpdated, onSelectMember }) {
  const { user, setIsAuthModalOpen } = useAuth();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Chat
  const [newMessage, setNewMessage] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const chatScrollRef = useRef(null);

  // Adicionar Material Form
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [itemMode, setItemMode] = useState('upload'); // 'upload' ou 'link'
  const [itemTitle, setItemTitle] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemFileType, setItemFileType] = useState('pdf'); // 'pdf', 'video', 'doc', 'link'
  const [itemUrl, setItemUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [submittingItem, setSubmittingItem] = useState(false);
  const [itemSuccessNotice, setItemSuccessNotice] = useState('');

  // Preview ativo
  const [activePreview, setActivePreview] = useState(null);

  async function fetchBookDetails() {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`/api/books/${bookId}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setBook(data);
      }
    } catch (err) {
      console.error('Erro ao buscar detalhes do livro:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (bookId) {
      setLoading(true);
      fetchBookDetails();
    }
  }, [bookId]);

  // Rola o chat para o final ao receber novas mensagens
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [book?.messages]);

  async function handleToggleLike() {
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
        setBook(prev => ({
          ...prev,
          has_liked: data.has_liked,
          likes_count: data.likes_count
        }));
        if (onBookUpdated) onBookUpdated();
      }
    } catch (err) {
      console.error('Erro ao curtir livro:', err);
    }
  }

  async function handleSendMessage(e) {
    e.preventDefault();
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    if (!newMessage.trim() || sendingMsg) return;

    setSendingMsg(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/books/${bookId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ message: newMessage.trim() })
      });

      if (res.ok) {
        const data = await res.json();
        setBook(prev => ({
          ...prev,
          messages: [...(prev.messages || []), data.message]
        }));
        setNewMessage('');
        if (onBookUpdated) onBookUpdated();
      }
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
    } finally {
      setSendingMsg(false);
    }
  }

  async function handleAddItem(e) {
    e.preventDefault();
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!itemTitle.trim()) {
      alert('Por favor, informe o título do material.');
      return;
    }

    setSubmittingItem(true);
    try {
      const token = localStorage.getItem('token');

      if (itemMode === 'upload') {
        if (!selectedFile) {
          alert('Por favor, selecione um arquivo (PDF, vídeo ou documento).');
          setSubmittingItem(false);
          return;
        }

        const formData = new FormData();
        formData.append('title', itemTitle.trim());
        formData.append('description', itemDescription.trim());
        formData.append('file_type', itemFileType);
        formData.append('file', selectedFile);

        const res = await fetch(`/api/books/${bookId}/items`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });

        if (res.ok) {
          const data = await res.json();
          setBook(prev => ({
            ...prev,
            items: [...(prev.items || []), data.item]
          }));
          resetItemForm();
          setItemSuccessNotice('Material enviado! Vídeos e imagens são compactados automaticamente em segundos.');
          setTimeout(() => setItemSuccessNotice(''), 4000);
          if (onBookUpdated) onBookUpdated();
        } else {
          const errData = await res.json();
          alert(errData.error || 'Erro ao fazer upload do material.');
        }
      } else {
        // Link externo
        if (!itemUrl.trim()) {
          alert('Por favor, informe a URL do material.');
          setSubmittingItem(false);
          return;
        }

        const res = await fetch(`/api/books/${bookId}/items`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            title: itemTitle.trim(),
            description: itemDescription.trim(),
            file_type: itemFileType,
            file_url: itemUrl.trim(),
            external_platform: 'web'
          })
        });

        if (res.ok) {
          const data = await res.json();
          setBook(prev => ({
            ...prev,
            items: [...(prev.items || []), data.item]
          }));
          resetItemForm();
          setItemSuccessNotice('Material adicionado à coletânea com sucesso!');
          setTimeout(() => setItemSuccessNotice(''), 4000);
          if (onBookUpdated) onBookUpdated();
        } else {
          const errData = await res.json();
          alert(errData.error || 'Erro ao adicionar link ao dossiê.');
        }
      }
    } catch (err) {
      console.error('Erro ao acrescentar material:', err);
      alert('Erro inesperado ao acrescentar material.');
    } finally {
      setSubmittingItem(false);
    }
  }

  function resetItemForm() {
    setItemTitle('');
    setItemDescription('');
    setItemUrl('');
    setSelectedFile(null);
    setIsAddingItem(false);
  }

  function formatBytes(bytes) {
    if (!bytes || bytes === 0) return 'Leve / Web';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  function renderMediaIcon(type) {
    switch (type) {
      case 'pdf':
        return <FileText size={18} color="var(--danger)" />;
      case 'video':
        return <Video size={18} color="var(--signal)" />;
      case 'doc':
        return <FileText size={18} color="var(--accent)" />;
      default:
        return <Link2 size={18} color="var(--accent)" />;
    }
  }

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="modal-card" style={{ maxWidth: '600px', textAlign: 'center', padding: '3rem' }}>
          <div style={{ color: 'var(--ink-3)' }}>Carregando dossiê e materiais colaborativos...</div>
        </div>
      </div>
    );
  }

  if (!book) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-card" 
        style={{ maxWidth: '1150px', maxHeight: '92vh', display: 'flex', flexDirection: 'column', padding: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho do Dossiê */}
        <div style={{
          padding: '1.75rem 2rem',
          borderBottom: '1px solid var(--rule-strong)',
          background: 'var(--surface)',
          position: 'relative'
        }}>
          {/* Botão Fechar */}
          <button
            type="button"
            className="close-btn"
            onClick={onClose}
            style={{ position: 'absolute', right: '1.5rem', top: '1.5rem' }}
          >
            <X size={20} />
          </button>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
            <span className="badge badge-accent" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <BookOpen size={12} />
              {book.category}
            </span>
            <span className="badge badge-accent" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <CheckCircle2 size={12} />
              Dossiê Aberto para Colaboração
            </span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
            <div style={{ maxWidth: '780px' }}>
              <h2 style={{ fontSize: '1.65rem', lineHeight: 1.25, marginBottom: '0.6rem' }}>
                {book.title}
              </h2>
              <p style={{ color: 'var(--ink-2)', fontSize: '1.0rem', lineHeight: 1.55 }}>
                {book.description}
              </p>
            </div>

            {/* Ações Topo: Curtir */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={handleToggleLike}
                className="btn btn-secondary btn-sm"
                style={{
                  background: book.has_liked ? 'var(--danger-soft)' : 'var(--fill)',
                  borderColor: book.has_liked ? 'var(--danger)' : 'var(--rule)',
                  color: book.has_liked ? 'var(--danger)' : 'var(--ink)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <Heart size={15} fill={book.has_liked ? 'var(--danger)' : 'none'} />
                <span>{book.likes_count || 0} Apoios</span>
              </button>
            </div>
          </div>

          {/* Autor do Dossiê e Colaboradores */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            marginTop: '1.25rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--rule)'
          }}>
            <div 
              onClick={() => {
                if (onSelectMember) onSelectMember(book.creator_id);
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer' }}
              title="Ver perfil do fundador criador"
            >
              <img
                src={book.creator_avatar}
                alt={book.creator_name}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '1.5px solid var(--accent-line)'
                }}
              />
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--ink)' }}>
                  Iniciado por {book.creator_name}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--accent)' }}>
                  {book.creator_role} • {book.creator_company}
                </div>
              </div>
            </div>

            {/* Colaboradores da Coletânea */}
            {book.contributors && book.contributors.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--ink-3)' }}>
                <Users size={14} color="var(--signal)" />
                <span>Empreendedores que acrescentaram materiais:</span>
                <div style={{ display: 'flex', marginLeft: '0.2rem' }}>
                  {book.contributors.map((c, i) => (
                    <img
                      key={c.id}
                      src={c.avatar}
                      alt={c.name}
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2px solid var(--surface)',
                        marginLeft: i > 0 ? '-8px' : '0',
                        cursor: 'pointer'
                      }}
                      title={`${c.name} (${c.company})`}
                      onClick={() => {
                        if (onSelectMember) onSelectMember(c.id);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notificação de Sucesso */}
        {itemSuccessNotice && (
          <div style={{
            background: 'var(--accent-soft)',
            borderBottom: '1px solid var(--accent-line)',
            color: 'var(--accent)',
            padding: '0.75rem 2rem',
            fontSize: '0.94rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <CheckCircle2 size={16} />
            <span>{itemSuccessNotice}</span>
          </div>
        )}

        {/* Conteúdo Principal Split (Lado Esquerdo: Materiais / Lado Direito: Chat) */}
        <div style={{ display: 'flex', flex: 1, minHeight: '480px', overflow: 'hidden' }}>
          
          {/* Coluna Esquerda: Capítulos & Materiais (62%) */}
          <div style={{
            flex: '1.4',
            padding: '1.75rem 2rem',
            overflowY: 'auto',
            borderRight: '1px solid var(--rule)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}>
            {/* Header da Seção de Materiais */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Layers size={18} color="var(--accent)" />
                  Capítulos & Materiais do Dossiê ({book.items?.length || 0})
                </h3>
                <p style={{ color: 'var(--ink-3)', fontSize: '0.875rem', marginTop: '0.2rem' }}>
                  PDFs, gravações e minutas disponibilizados em versões leves e compactadas.
                </p>
              </div>

              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setIsAddingItem(!isAddingItem)}
              >
                <Plus size={14} />
                <span>Acrescentar Material</span>
              </button>
            </div>

            {/* Formulário de Adição de Material (Retrátil) */}
            {isAddingItem && (
              <form 
                onSubmit={handleAddItem}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--accent-line)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.25rem 1.5rem',
                  boxShadow: 'var(--shadow)',
                  animation: 'fadeIn 0.2s ease-out'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '1.0rem', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <UploadCloud size={16} />
                    <span>Contribuir com este Dossiê Coletivo</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAddingItem(false)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--ink-3)', cursor: 'pointer' }}
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Seleção do Modo: Upload vs Link */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  <button
                    type="button"
                    className={`btn btn-sm ${itemMode === 'upload' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setItemMode('upload')}
                    style={{ flex: 1 }}
                  >
                    <UploadCloud size={14} />
                    <span>Subir Arquivo (PDF / Vídeo / Doc)</span>
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${itemMode === 'link' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setItemMode('link')}
                    style={{ flex: 1 }}
                  >
                    <Link2 size={14} />
                    <span>Link / Documento Online</span>
                  </button>
                </div>

                <div className="form-group">
                  <label className="form-label">Título do Material / Capítulo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Parecer do STF sobre ISS em SaaS ou Aula de Vesting"
                    value={itemTitle}
                    onChange={(e) => setItemTitle(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Contexto e Relevância para o Dossiê</label>
                  <textarea
                    rows={2}
                    placeholder="Explique brevemente por que este material é importante e como outros membros podem aplicá-lo..."
                    value={itemDescription}
                    onChange={(e) => setItemDescription(e.target.value)}
                    className="form-textarea"
                    style={{ minHeight: '65px' }}
                  />
                </div>

                {itemMode === 'upload' ? (
                  <div className="form-group">
                    <label className="form-label">Selecione o Arquivo (Otimização Automática)</label>
                    <input
                      type="file"
                      accept=".pdf,.mp4,.webm,.doc,.docx,.png,.jpg"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        setSelectedFile(file);
                        if (file && !itemTitle) {
                          setItemTitle(file.name.replace(/\.[^/.]+$/, ''));
                        }
                      }}
                      className="form-input"
                      style={{ padding: '0.5rem', background: 'rgba(0,0,0,0.3)' }}
                    />
                    <div style={{ fontSize: '0.8rem', color: 'var(--ink-3)', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <HardDrive size={13} color="var(--accent)" />
                      <span>O arquivo será comprimido e adaptado para carregamento instantâneo no navegador.</span>
                    </div>
                  </div>
                ) : (
                  <div className="form-group">
                    <label className="form-label">URL do Material (YouTube, Loom, Google Docs, Drive)</label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={itemUrl}
                      onChange={(e) => setItemUrl(e.target.value)}
                      className="form-input"
                    />
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '1rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setIsAddingItem(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={submittingItem}
                  >
                    {submittingItem ? 'Processando e Compactando...' : 'Publicar no Dossiê'}
                  </button>
                </div>
              </form>
            )}

            {/* Painel de Preview Ativo (se clicado) */}
            {activePreview && (
              <div style={{
                background: '#04070D',
                border: '1px solid var(--rule-strong)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
                position: 'relative'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.94rem', fontWeight: 600 }}>
                    <Eye size={15} color="var(--accent)" />
                    <span>Visualização: {activePreview.title}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActivePreview(null)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--ink-3)', cursor: 'pointer' }}
                  >
                    <X size={16} />
                  </button>
                </div>

                {activePreview.file_type === 'video' ? (
                  <video
                    controls
                    autoPlay
                    style={{ width: '100%', maxHeight: '380px', borderRadius: 'var(--radius-md)', background: '#000' }}
                    src={activePreview.file_url}
                  >
                    Seu navegador não suporta visualização direta de vídeo.
                  </video>
                ) : activePreview.file_type === 'pdf' ? (
                  <iframe
                    src={activePreview.file_url}
                    title={activePreview.title}
                    style={{
                      width: '100%',
                      height: '420px',
                      border: 'none',
                      borderRadius: 'var(--radius-md)',
                      background: '#1E293B'
                    }}
                  />
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                    <p style={{ color: 'var(--ink-2)', fontSize: '0.94rem', marginBottom: '1rem' }}>
                      Este material é um link ou documento editável.
                    </p>
                    <a
                      href={activePreview.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary btn-sm"
                    >
                      <ExternalLink size={14} />
                      <span>Abrir Documento na Nova Aba</span>
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Lista dos Materiais / Capítulos */}
            {(!book.items || book.items.length === 0) ? (
              <div style={{
                textAlign: 'center',
                padding: '3rem 1rem',
                background: 'var(--fill)',
                borderRadius: 'var(--radius-lg)',
                border: '1px dashed var(--rule)'
              }}>
                <HardDrive size={32} color="var(--ink-3)" style={{ margin: '0 auto 0.75rem' }} />
                <h4 style={{ fontSize: '1rem', marginBottom: '0.4rem' }}>Nenhum material anexado ainda</h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--ink-3)', maxWidth: '380px', margin: '0 auto 1rem' }}>
                  Este livro está recém-criado. Seja o primeiro a acrescentar um PDF, vídeo ou modelo para os membros.
                </p>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => setIsAddingItem(true)}
                >
                  <Plus size={14} />
                  <span>Subir Primeiro Arquivo</span>
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {book.items.map((item, idx) => {
                  const originalSize = item.file_size_bytes || 0;
                  const compressedSize = item.compressed_size_bytes || originalSize;
                  const savingPercent = originalSize > 0
                    ? Math.round(((originalSize - compressedSize) / originalSize) * 100)
                    : 0;

                  return (
                    <div
                      key={item.id}
                      style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--rule)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '1.25rem',
                        transition: 'var(--transition)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.85rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', flex: 1 }}>
                          <div style={{
                            width: 38,
                            height: 38,
                            borderRadius: 'var(--radius-md)',
                            background: 'var(--fill)',
                            border: '1px solid var(--rule)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            {renderMediaIcon(item.file_type)}
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--ink-3)' }}>
                                Capítulo #{idx + 1} • {item.file_type.toUpperCase()}
                              </span>
                              {savingPercent > 0 && <span style={{
                                fontSize: '0.8rem',
                                color: 'var(--accent)',
                                background: 'var(--accent-soft)',
                                padding: '0.15rem 0.5rem',
                                borderRadius: 'var(--radius-full)',
                                border: '1px solid var(--accent-line)'
                              }}>
                                Versão Compacta (-{savingPercent}%)
                              </span>}
                            </div>
                            <h4 style={{ fontSize: '1.02rem', lineHeight: 1.3, marginTop: '0.2rem', color: 'var(--ink)' }}>
                              {item.title}
                            </h4>
                          </div>
                        </div>

                        {/* Botões de Ação para o Material */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => setActivePreview(item)}
                            title="Visualizar documento ou vídeo"
                            style={{ padding: '0.35rem 0.65rem' }}
                          >
                            <Eye size={14} />
                            <span>Preview</span>
                          </button>

                          <a
                            href={item.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={item.original_name || item.title}
                            className="btn btn-outline btn-sm"
                            title="Download direto ou link oficial"
                            style={{ padding: '0.35rem 0.65rem' }}
                          >
                            <Download size={14} />
                          </a>
                        </div>
                      </div>

                      {/* Descrição do Material */}
                      {item.description && (
                        <p style={{ fontSize: '0.875rem', color: 'var(--ink-2)', lineHeight: 1.5, margin: 0 }}>
                          {item.description}
                        </p>
                      )}

                      {/* Barra de Informações: Uploader & Tamanho Leve */}
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.5rem',
                        fontSize: '0.8rem',
                        color: 'var(--ink-3)',
                        paddingTop: '0.65rem',
                        borderTop: '1px solid var(--rule)'
                      }}>
                        {/* Quem acrescentou */}
                        <div 
                          onClick={() => {
                            if (onSelectMember) onSelectMember(item.uploader_id);
                          }}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer' }}
                          title="Ver perfil de quem colaborou"
                        >
                          <img
                            src={item.uploader_avatar}
                            alt={item.uploader_name}
                            style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover' }}
                          />
                          <span>
                            Acrescentado por <strong style={{ color: 'var(--ink)' }}>{item.uploader_name}</strong> ({item.uploader_company})
                          </span>
                        </div>

                        {/* Dados de Compactação */}
                        {originalSize > 0 && <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <HardDrive size={12} color="var(--accent)" />
                          <span>Original: {formatBytes(originalSize)}</span>
                          <span>•</span>
                          <span style={{ color: 'var(--accent)', fontWeight: 600 }}>
                            Compactado: {formatBytes(compressedSize)}
                          </span>
                        </div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Coluna Direita: Bate-Papo & Discussão do Livro (38%) */}
          <div style={{
            flex: '1',
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--surface)'
          }}>
            {/* Header do Chat */}
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--rule)',
              background: 'var(--surface)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: 'var(--accent)',
                  boxShadow: 'none'
                }} />
                <h4 style={{ fontSize: '1.0rem', fontWeight: 700 }}>
                  Discussão & Bate-Papo do Dossiê
                </h4>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--ink-3)' }}>
                {book.messages?.length || 0} mensagens
              </span>
            </div>

            {/* Feed de Mensagens */}
            <div 
              ref={chatScrollRef}
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}
            >
              {(!book.messages || book.messages.length === 0) ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--ink-3)', fontSize: '0.875rem' }}>
                  Nenhuma mensagem ainda. Inicie o debate sobre a jurisprudência ou materiais deste dossiê!
                </div>
              ) : (
                book.messages.map((msg) => {
                  const isMe = user && user.id === msg.user_id;

                  return (
                    <div
                      key={msg.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isMe ? 'flex-end' : 'flex-start',
                        maxWidth: '92%',
                        alignSelf: isMe ? 'flex-end' : 'flex-start'
                      }}
                    >
                      {/* Autor & Horário */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        fontSize: '0.8rem',
                        color: 'var(--ink-3)',
                        marginBottom: '0.25rem',
                        padding: '0 0.2rem'
                      }}>
                        {!isMe && (
                          <img
                            src={msg.user_avatar}
                            alt={msg.user_name}
                            style={{ width: 18, height: 18, borderRadius: '50%', objectFit: 'cover' }}
                          />
                        )}
                        <span style={{ fontWeight: 600, color: isMe ? 'var(--accent)' : 'var(--ink-2)' }}>
                          {isMe ? 'Você' : msg.user_name}
                        </span>
                        {!isMe && msg.user_company && (
                          <span>• {msg.user_company}</span>
                        )}
                      </div>

                      {/* Balão da Mensagem */}
                      <div style={{
                        background: isMe 
                          ? 'linear-gradient(135deg, var(--accent-line) 0%, var(--accent-line) 100%)'
                          : 'var(--fill)',
                        border: isMe ? '1px solid var(--accent-line)' : '1px solid var(--rule)',
                        borderRadius: 'var(--radius-md)',
                        padding: '0.75rem 1rem',
                        fontSize: '0.94rem',
                        color: 'var(--ink)',
                        lineHeight: 1.5,
                        wordBreak: 'break-word',
                        boxShadow: 'var(--shadow)'
                      }}>
                        {msg.message}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input para Nova Mensagem */}
            <form
              onSubmit={handleSendMessage}
              style={{
                padding: '1rem',
                borderTop: '1px solid var(--rule)',
                background: 'var(--surface)',
                display: 'flex',
                gap: '0.6rem'
              }}
            >
              {user ? (
                <>
                  <input
                    type="text"
                    placeholder="Adicionar comentário ou dúvida ao debate..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="form-input"
                    style={{
                      padding: '0.65rem 0.9rem',
                      fontSize: '0.875rem',
                      borderRadius: 'var(--radius-md)'
                    }}
                  />
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={sendingMsg || !newMessage.trim()}
                    style={{ padding: '0.65rem 1rem' }}
                  >
                    <Send size={15} />
                  </button>
                </>
              ) : (
                <div style={{ textAlign: 'center', width: '100%', padding: '0.4rem 0' }}>
                  <button
                    type="button"
                    onClick={() => setIsAuthModalOpen(true)}
                    className="btn btn-outline btn-sm"
                    style={{ width: '100%' }}
                  >
                    Faça login para participar deste debate
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
