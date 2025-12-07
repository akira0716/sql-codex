import { OnboardingModal } from './components/OnboardingModal';
import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from './Layout';
import { FunctionList } from './pages/FunctionList';
import { FunctionEditor } from './pages/FunctionEditor';
import { Settings } from './pages/Settings';
import { useAuth } from './AuthContext';
import { syncData } from './sync';
import './App.css';

function App() {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      syncData();
    }

    const handleOnline = () => {
      console.log('Network recovered. Attempting sync...');
      if (user) {
        syncData();
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [user]);

  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<FunctionList />} />
          <Route path="new" element={<FunctionEditor />} />
          <Route path="edit/:id" element={<FunctionEditor />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
      <OnboardingModal />
    </>
  );
}

export default App
