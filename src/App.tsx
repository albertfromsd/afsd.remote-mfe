import { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useStore } from '@/shared/stores/storeAccessor';
import Page from '@/components/Page';
import '@/shared/styles/global.scss';
import Home from './pages/Home';
import Details from './pages/Details';
import Settings from './pages/Settings';
import Gallery from './pages/Gallery';

const App = () => {
  const theme = useStore((s) => s.theme);

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
      <Route path="*" element={<Page eyebrow="Remote MFE" title="Not Found" />} />
    </Routes>
  );
};

export default App;
