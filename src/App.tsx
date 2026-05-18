import { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useSessionStore } from '@/stores/sessionAccessor';
import '@/shared/styles/global.scss';
import './App.css';
import Home from './pages/Home';
import Details from './pages/Details';
import Settings from './pages/Settings';
import Gallery from './pages/Gallery';

const App = () => {
  const theme = useSessionStore(s => s.theme);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
  }, [theme]);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="details" element={<Details />} />
      <Route path="settings" element={<Settings />} />
      <Route path="gallery" element={<Gallery />} />
      <Route
        path="*"
        element={
          <section className="remote-page">
            <h1>Remote MFE — Not Found</h1>
          </section>
        }
      />
    </Routes>
  );
};

export default App;
