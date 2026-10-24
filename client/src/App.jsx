import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import IdeasBoard from './components/IdeasBoard';
import EventsCalendar from './components/EventsCalendar';
import MembersList from './components/MembersList';
import KnowledgeHub from './components/KnowledgeHub';
import BookDetailsModal from './components/BookDetailsModal';
import NewBookModal from './components/NewBookModal';
import MemberProfileModal from './components/MemberProfileModal';
import IdeaDetailsModal from './components/IdeaDetailsModal';
import NewIdeaModal from './components/NewIdeaModal';
import NewEventModal from './components/NewEventModal';
import AuthModal from './components/AuthModal';

function MainApp() {
  const { isAuthModalOpen, setIsAuthModalOpen } = useAuth();
  const [activeTab, setActiveTab] = useState('library'); // Inicia em 'library' para destacar o novo acervo
  
  // Modais
  const [selectedIdeaId, setSelectedIdeaId] = useState(null);
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [isNewIdeaOpen, setIsNewIdeaOpen] = useState(false);
  const [isNewEventOpen, setIsNewEventOpen] = useState(false);
  const [isNewBookOpen, setIsNewBookOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  function handleTriggerRefresh() {
    setRefreshKey(prev => prev + 1);
  }

  return (
    <div className="app-container">
      {/* Barra de Navegação Superior */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewIdea={() => setIsNewIdeaOpen(true)}
        onOpenNewEvent={() => setIsNewEventOpen(true)}
        onOpenNewBook={() => setIsNewBookOpen(true)}
        onSelectMember={(id) => setSelectedMemberId(id)}
      />

      {/* Conteúdo Principal */}
      <main className="main-content">
        {activeTab === 'library' && (
          <KnowledgeHub
            key={`library-${refreshKey}`}
            onSelectBook={(id) => setSelectedBookId(id)}
            onOpenNewBook={() => setIsNewBookOpen(true)}
            onSelectMember={(id) => setSelectedMemberId(id)}
          />
        )}

        {activeTab === 'ideas' && (
          <IdeasBoard
            key={`ideas-${refreshKey}`}
            onSelectIdea={(id) => setSelectedIdeaId(id)}
            onOpenNewIdea={() => setIsNewIdeaOpen(true)}
          />
        )}

        {activeTab === 'events' && (
          <EventsCalendar
            key={`events-${refreshKey}`}
            onOpenNewEvent={() => setIsNewEventOpen(true)}
          />
        )}

        {activeTab === 'members' && (
          <MembersList 
            key={`members-${refreshKey}`} 
            onSelectMember={(id) => setSelectedMemberId(id)}
          />
        )}
      </main>

      {/* Footer Executivo */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        background: 'rgba(7, 10, 16, 0.95)',
        padding: '2rem 1.5rem',
        marginTop: 'auto',
        fontSize: '0.85rem',
        color: 'var(--text-dim)',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <strong style={{ color: 'var(--text-main)' }}>Empreendedores do Brasil</strong> — Hub de Ideias, Dossiês de Conhecimento e Encontros
          </div>
          <div>
            Projeto autônomo com SQLite local integrado • Sem dependências de contas externas
          </div>
        </div>
      </footer>

      {/* Modais Globais */}
      {selectedBookId && (
        <BookDetailsModal
          bookId={selectedBookId}
          onClose={() => setSelectedBookId(null)}
          onBookUpdated={handleTriggerRefresh}
          onSelectMember={(id) => setSelectedMemberId(id)}
        />
      )}

      {isNewBookOpen && (
        <NewBookModal
          isOpen={isNewBookOpen}
          onClose={() => setIsNewBookOpen(false)}
          onBookCreated={(newBookId) => {
            handleTriggerRefresh();
            setActiveTab('library');
            if (newBookId) setSelectedBookId(newBookId);
          }}
        />
      )}

      {selectedMemberId && (
        <MemberProfileModal
          userId={selectedMemberId}
          onClose={() => setSelectedMemberId(null)}
          onSelectBook={(id) => setSelectedBookId(id)}
        />
      )}

      {selectedIdeaId && (
        <IdeaDetailsModal
          ideaId={selectedIdeaId}
          onClose={() => setSelectedIdeaId(null)}
          onIdeaUpdated={handleTriggerRefresh}
        />
      )}

      {isNewIdeaOpen && (
        <NewIdeaModal
          isOpen={isNewIdeaOpen}
          onClose={() => setIsNewIdeaOpen(false)}
          onIdeaCreated={() => {
            handleTriggerRefresh();
            setActiveTab('ideas');
          }}
        />
      )}

      {isNewEventOpen && (
        <NewEventModal
          isOpen={isNewEventOpen}
          onClose={() => setIsNewEventOpen(false)}
          onEventCreated={() => {
            handleTriggerRefresh();
            setActiveTab('events');
          }}
        />
      )}

      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
