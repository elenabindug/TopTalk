import Login from './components/Login';  
import Chat from './components/Chat';
import useAuthStore from './store/useAuthStore.mock';

function App() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  if (!user) {
    return <Login />;
  }

 return <Chat />;
}

export default App;