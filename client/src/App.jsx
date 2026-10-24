import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import IdeasBoard from './components/IdeasBoard';
import EventsCalendar from './components/EventsCalendar';
import MembersList from './components/MembersList';
import KnowledgeHub from './components/KnowledgeHub';
import BookDetailsModal from './components/BookDetailsModal';
import NewBookModal from './components/NewBookModal';
import MemberProfileModal from './components/MemberProfileModal';
import HomeView from './components/HomeView';
import Footer from './components/Footer';
import IdeaDetailsModal from './components/IdeaDetailsModal';
import NewIdeaModal from './components/NewIdeaModal';
import NewEventModal from './components/NewEventModal';
import AuthModal from './components/AuthModal';
import LessonsView, { NewLessonModal } from './components/LessonsView';

const TABS = ['home', 'library', 'lessons', 'ideas', 'events', 'members'];

function readTabFromHash() {
  const tab = window.location.hash.slice(1);
  return TABS.includes(tab) ? tab : 'home';
}

function MainApp() {
  const { isAuthModalOpen, setIsAuthModalOpen } = useAuth();
  // Aba ativa sincronizada com o hash da URL (#ideas, #library...) para o voltar do navegador e links diretos
  const [activeTab, setActiveTabState] = useState(() => readTabFromHash());

  useEffect(() => {
    const onHashChange = () => setActiveTabState(readTabFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  function setActiveTab(tab) {
    window.location.hash = tab === 'home' ? '' : tab;
    setActiveTabState(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Modais
  const [selectedIdeaId, setSelectedIdeaId] = useState(null);
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [isNewIdeaOpen, setIsNewIdeaOpen] = useState(false);
  const [isNewEventOpen, setIsNewEventOpen] = useState(false);
  const [isNewBookOpen, setIsNewBookOpen] = useState(false);
  const [isNewLessonOpen, setIsNewLessonOpen] = useState(false);
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
        onOpenNewLesson={() => setIsNewLessonOpen(true)}
        onSelectMember={(id) => setSelectedMemberId(id)}
      />

      {/* Conteúdo Principal */}
      <main className="main-content">
        {activeTab === 'home' && (
          <HomeView
            onNavigateTab={(tab) => setActiveTab(tab)}
            onSelectBook={(id) => setSelectedBookId(id)}
            onSelectIdea={(id) => setSelectedIdeaId(id)}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        )}

        {activeTab === 'library' && (
          <KnowledgeHub
            key={`library-${refreshKey}`}
            onSelectBook={(id) => setSelectedBookId(id)}
            onOpenNewBook={() => setIsNewBookOpen(true)}
            onSelectMember={(id) => setSelectedMemberId(id)}
          />
        )}

        {activeTab === 'lessons' && (
          <LessonsView
            key={`lessons-${refreshKey}`}
            onOpenUpload={() => setIsNewLessonOpen(true)}
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

      {/* Footer Completo de Site Real */}
      <Footer onNavigateTab={(tab) => setActiveTab(tab)} />

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

      {isNewLessonOpen && (
        <NewLessonModal
          onClose={() => setIsNewLessonOpen(false)}
          onCreated={() => {
            handleTriggerRefresh();
            setActiveTab('lessons');
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
