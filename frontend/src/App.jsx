import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Chat from './components/Chat';
import useAuthStore from '../store/useAuthStore';

function App() {
  const user = useAuthStore((state) => state.user);

  return (
    <Routes>
      {/* Если пользователь не залогинен — показываем логин */}
      <Route path="/login" element={<Login />} />

      {/* Если пользователь залогинен — показываем чат, иначе — отправляем на логин */}
      <Route
        path="/chat"
        element={user ? <Chat /> : <Navigate to="/login" />}
      />

      {/* При заходе на корень / — сразу перенаправляем на /login */}
      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;