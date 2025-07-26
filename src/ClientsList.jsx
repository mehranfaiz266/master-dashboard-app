import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getClients } from './api';

export default function ClientsList() {
  const [clients, setClients] = useState([]);

  useEffect(() => {
    const load = async () => {
      const list = await getClients();
      setClients(list);
    };
    load();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Clients</h2>
        <Link to="/clients/new" className="bg-blue-600 text-white px-3 py-1 rounded">Add Client</Link>
      </div>
      <ul className="space-y-2">
        {clients.map(c => (
          <li key={c.id} className="border p-2 flex justify-between items-center">
            <span>{c.companyName}</span>
            <Link to={`/clients/${c.id}`} className="text-blue-600">Edit</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
