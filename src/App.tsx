import { Route, Routes } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import Details from './pages/Details';
import Settings from './pages/Settings';
import Gallery from './pages/Gallery';

const App = () => {
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
