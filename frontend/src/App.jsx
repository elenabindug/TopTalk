import Login from './components/Login';
import useAuthStore from './store/useAuthStore.mock';

function App() {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <Login />;
  }

  return (
    <div>
      <h1>Добро пожаловать, {user.name}!</h1>
      <p>Здесь будет чат</p>
    </div>
  );
}

export default App;