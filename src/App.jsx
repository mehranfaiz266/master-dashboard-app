import { useState } from 'react';
import Login from './Login';
import Dashboard from './Dashboard';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

export default function App() {
  const [user, setUser] = useState(auth.currentUser);
  const [ready, setReady] = useState(false);

  onAuthStateChanged(auth, u => {
    setUser(u);
    setReady(true);
  });

  if (!ready) return <div className="p-4">Loading...</div>;
  if (!user) return <Login onLogin={setUser} />;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<Dashboard user={user} onLogout={() => setUser(null)} />} />
      </Routes>
    </BrowserRouter>
  );
}
