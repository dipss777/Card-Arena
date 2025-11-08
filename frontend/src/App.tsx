import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Lobby from './pages/Lobby';
import GameRoom from './pages/GameRoom';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Lobby />} />
        <Route path="/game" element={<GameRoom />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
