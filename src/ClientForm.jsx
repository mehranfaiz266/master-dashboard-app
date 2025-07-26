import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  deleteDoc,
  getDocs
} from 'firebase/firestore';
import { db } from './firebase';

export default function ClientForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(id);

  const [companyName, setCompanyName] = useState('');
  const [members, setMembers] = useState([]);
  const [contactId, setContactId] = useState('');
  const [campaigns, setCampaigns] = useState([]);
  const [numbers, setNumbers] = useState([]);

  useEffect(() => {
    if (editing) {
      const load = async () => {
        const docRef = doc(db, 'clients', id);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          setCompanyName(data.companyName || '');
          setMembers(data.members || []);
          setContactId(data.contactId || '');
        }
        const campSnap = await getDocs(collection(docRef, 'campaigns'));
        setCampaigns(campSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        const numSnap = await getDocs(collection(docRef, 'phoneNumbers'));
        setNumbers(numSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      };
      load();
    } else {
      setMembers([]);
    }
  }, [editing, id]);

  const saveClient = async e => {
    e.preventDefault();
    const data = { companyName, members, contactId };
    if (editing) {
      await updateDoc(doc(db, 'clients', id), data);
    } else {
      const newDoc = await addDoc(collection(db, 'clients'), data);
      navigate(`/clients/${newDoc.id}`);
      return;
    }
    navigate('/clients');
  };

  const addMember = () => {
    setMembers([...members, { id: Date.now().toString(), firstName: '', lastName: '', email: '', phone: '' }]);
  };

  const updateMember = (idx, field, value) => {
    const next = members.slice();
    next[idx] = { ...next[idx], [field]: value };
    setMembers(next);
  };

  const removeMember = idx => {
    const next = members.slice();
    const [removed] = next.splice(idx, 1);
    setMembers(next);
    if (removed.id === contactId) setContactId('');
  };

  const addCampaign = async name => {
    const col = collection(db, 'clients', id, 'campaigns');
    await addDoc(col, { name });
    const snap = await getDocs(col);
    setCampaigns(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const removeCampaign = async cid => {
    await deleteDoc(doc(db, 'clients', id, 'campaigns', cid));
    setCampaigns(campaigns.filter(c => c.id !== cid));
  };

  const addNumber = async number => {
    const col = collection(db, 'clients', id, 'phoneNumbers');
    await addDoc(col, { number });
    const snap = await getDocs(col);
    setNumbers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const removeNumber = async nid => {
    await deleteDoc(doc(db, 'clients', id, 'phoneNumbers', nid));
    setNumbers(numbers.filter(n => n.id !== nid));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">{editing ? 'Edit' : 'New'} Client</h2>
        <Link to="/clients" className="text-blue-600">Back</Link>
      </div>
      <form onSubmit={saveClient} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Company Name</label>
          <input
            className="border rounded w-full p-2"
            value={companyName}
            onChange={e => setCompanyName(e.target.value)}
          />
        </div>
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">Members</span>
            <button type="button" onClick={addMember} className="text-sm text-blue-600">Add</button>
          </div>
          <div className="space-y-2">
            {members.map((m, idx) => (
              <div key={m.id} className="border p-2 space-y-2">
                <div className="flex space-x-2">
                  <input className="border p-1 flex-1" placeholder="First Name" value={m.firstName} onChange={e => updateMember(idx, 'firstName', e.target.value)} />
                  <input className="border p-1 flex-1" placeholder="Last Name" value={m.lastName} onChange={e => updateMember(idx, 'lastName', e.target.value)} />
                </div>
                <div className="flex space-x-2">
                  <input className="border p-1 flex-1" placeholder="Email" value={m.email} onChange={e => updateMember(idx, 'email', e.target.value)} />
                  <input className="border p-1 flex-1" placeholder="Phone" value={m.phone} onChange={e => updateMember(idx, 'phone', e.target.value)} />
                </div>
                <div className="flex justify-between items-center">
                  <label className="flex items-center space-x-1">
                    <input type="radio" name="contact" value={m.id} checked={contactId === m.id} onChange={() => setContactId(m.id)} />
                    <span className="text-sm">Contact</span>
                  </label>
                  <button type="button" className="text-sm text-red-600" onClick={() => removeMember(idx)}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <button className="bg-green-600 text-white px-4 py-2 rounded" type="submit">Save</button>
      </form>

      {editing && (
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Campaigns</h3>
              <AddItemForm onAdd={addCampaign} placeholder="Campaign name" />
            </div>
            <ul className="space-y-1 mt-2">
              {campaigns.map(c => (
                <li key={c.id} className="flex justify-between border p-2">
                  <span>{c.name}</span>
                  <button className="text-red-600" onClick={() => removeCampaign(c.id)}>Delete</button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Phone Numbers</h3>
              <AddItemForm onAdd={addNumber} placeholder="Number" />
            </div>
            <ul className="space-y-1 mt-2">
              {numbers.map(n => (
                <li key={n.id} className="flex justify-between border p-2">
                  <span>{n.number}</span>
                  <button className="text-red-600" onClick={() => removeNumber(n.id)}>Delete</button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function AddItemForm({ onAdd, placeholder }) {
  const [value, setValue] = useState('');
  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        if (!value.trim()) return;
        onAdd(value.trim());
        setValue('');
      }}
      className="flex space-x-2"
    >
      <input
        className="border p-1 flex-1"
        value={value}
        placeholder={placeholder}
        onChange={e => setValue(e.target.value)}
      />
      <button className="bg-blue-600 text-white px-2 rounded" type="submit">
        Add
      </button>
    </form>
  );
}
