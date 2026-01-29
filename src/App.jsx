import { Routes, Route } from 'react-router-dom';
import { GamesProvider } from './context/GamesContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import games from './games';

const App = () => {
  return (
    <GamesProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          {games.map((game) => (
            <Route key={game.id} path={game.path} element={<game.component />} />
          ))}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </GamesProvider>
  );
};

export default App;
