import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Calendar } from './components/Calendar';
import { AccountManager } from './components/AccountManager';
import { PostComposer } from './components/PostComposer';
import { Settings } from './components/Settings';
import { PostList } from './components/PostList';
import { Login } from './components/Login';
import { useAuth } from './hooks/useAuth';
import { Loader2 } from 'lucide-react';
import type { Post, SocialAccount } from './types';
import {
  getPosts,
  savePost,
  getAccounts,
  saveAccount,
  deleteAccount,
  initializeStorage
} from './services/api';
import './App.css';

function App() {
  const { user, isAuthenticated, isLoading: isAuthLoading, login, register, loginGuest, logout } = useAuth();
  const [activeView, setActiveView] = useState('dashboard');
  const [posts, setPosts] = useState<Post[]>([]);
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | undefined>();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Scheduler Loop
  useEffect(() => {
    if (!isAuthenticated) return;

    // Check every 60 seconds
    // Scheduler is now handled by the backend (node-cron)
    // We only need to refresh data periodically to see status updates
    const interval = setInterval(() => {
      loadData();
    }, 10000); // Poll every 10s for UI updates

    // Initial permission request for notifications
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      initializeStorage().then(() => {
        loadData();
      });
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      const fetchedPosts = await getPosts();
      const fetchedAccounts = await getAccounts();
      setPosts(fetchedPosts);
      setAccounts(fetchedAccounts);
    } catch (e) {
      console.error("Failed to load data", e);
    }
  };

  const handleSavePost = async (postData: Omit<Post, 'id' | 'createdAt'>) => {
    const newPost: Post = {
      ...postData,
      id: selectedPost?.id || `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: selectedPost?.createdAt || new Date(),
    };

    await savePost(newPost);
    loadData();
    setSelectedPost(undefined);
  };

  const handleAddAccount = async (accountData: Omit<SocialAccount, 'id'>) => {
    const newAccount: SocialAccount = {
      ...accountData,
      id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Temp ID, backend handles it
    };
    await saveAccount(newAccount);
    loadData();
  };

  const handleRemoveAccount = async (accountId: string) => {
    if (confirm('Tem certeza que deseja remover esta conta?')) {
      await deleteAccount(accountId);
      loadData();
    }
  };

  const handlePostClick = (post: Post) => {
    setSelectedPost(post);
    setIsComposerOpen(true);
  };

  const handleDateClick = () => {
    setIsComposerOpen(true);
  };

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard posts={posts} onCreatePost={() => setIsComposerOpen(true)} />;
      case 'posts':
        return (
          <PostList
            posts={posts}
            onCreatePost={() => setIsComposerOpen(true)}
            onEditPost={handlePostClick}
          />
        );
      case 'calendar':
        return (
          <Calendar
            posts={posts}
            onPostClick={handlePostClick}
            onDateClick={handleDateClick}
          />
        );
      case 'accounts':
        return (
          <AccountManager
            accounts={accounts}
            onAddAccount={handleAddAccount}
            onRemoveAccount={handleRemoveAccount}
          />
        );
      case 'settings':
        // Protect the settings route
        if (user?.role !== 'developer') {
          setActiveView('dashboard'); // Redirect if not developer
          return <Dashboard posts={posts} onCreatePost={() => setIsComposerOpen(true)} />;
        }
        return <Settings />;
      default:
        return <Dashboard posts={posts} onCreatePost={() => setIsComposerOpen(true)} />;
    }
  };



  return (
    <div className="app">
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        user={user}
        onLogout={logout}
      />

      <main className="main-content">
        {renderView()}
      </main>

      <PostComposer
        isOpen={isComposerOpen}
        onClose={() => {
          setIsComposerOpen(false);
          setSelectedPost(undefined);
        }}
        onSave={handleSavePost}
        accounts={accounts}
        editPost={selectedPost}
      />
    </div>
  );
}

export default App;
