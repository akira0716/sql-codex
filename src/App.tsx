import { Routes, Route } from 'react-router-dom';
import { Layout } from './Layout';
import { FunctionList } from './pages/FunctionList';
import { FunctionEditor } from './pages/FunctionEditor';
import { Settings } from './pages/Settings';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<FunctionList />} />
        <Route path="new" element={<FunctionEditor />} />
        <Route path="edit/:id" element={<FunctionEditor />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default App
