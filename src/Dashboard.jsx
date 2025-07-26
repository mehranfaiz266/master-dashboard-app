import { signOut } from 'firebase/auth';
import { auth } from './firebase';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import ClientsList from './ClientsList';
import ClientForm from './ClientForm';

export default function Dashboard({ user, onLogout }) {

  const handleLogout = async () => {
    await signOut(auth);
    onLogout();
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Welcome {user.email}</h1>
        <button onClick={handleLogout} className="bg-gray-700 text-white px-3 py-1 rounded">Sign Out</button>
      </div>
      <nav className="space-x-4">
        <Link to="/clients" className="text-blue-600">Clients</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Navigate to="/clients" />} />
        <Route path="/clients" element={<ClientsList />} />
        <Route path="/clients/new" element={<ClientForm />} />
        <Route path="/clients/:id" element={<ClientForm />} />
      </Routes>
    </div>
  );
}
