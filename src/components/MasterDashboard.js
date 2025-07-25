import React, { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import ClientFormPage from './ClientFormPage';
import LeadModal from './LeadModal';
import CallNumberModal from './CallNumberModal';
import CampaignModal from './CampaignModal';
import KpiCard from './KpiCard';
import Notification from './Notification';
import NavLink from './NavLink';
import { auth, functions } from '../firebase';
import { ChartBarIcon, UsersIcon, ClipboardIcon, HashtagIcon, PhoneIcon, PencilIcon } from './icons';

export default function MasterDashboard({ user }) {
  const [activeView, setActiveView] = useState('clients');
  const [editingClient, setEditingClient] = useState(null);
  const [clients, setClients] = useState([]);
  const [callNumbers, setCallNumbers] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [globalKpis, setGlobalKpis] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const getData = httpsCallable(functions, 'getMasterData');
        const res = await getData();
        setClients(res.data.clients || []);
        setCallNumbers(res.data.callNumbers || []);
        setCampaigns(res.data.campaigns || []);

        const getKpis = httpsCallable(functions, 'getGlobalKpis');
        const kpiRes = await getKpis();
        setGlobalKpis(kpiRes.data);
      } catch (err) {
        console.error('Failed to load data from BigQuery', err);
      }
      setDataLoading(false);
    }
    fetchData();
  }, []);

  const addNumber = async (number, clientId) => {
    try {
      const fn = httpsCallable(functions, 'createCallNumber');
      const res = await fn({ number, clientId });
      const id = res.data.id;
      setCallNumbers(prev => [...prev, { id, number, clientId }]);
      setNotification({ type: 'success', text: 'Number created successfully.' });
    } catch (err) {
      const message = err && err.message ? err.message : String(err);
      setNotification({ type: 'error', text: `Failed to create number: ${message}` });
    }
  };

  const addCampaign = async (campaign) => {
    try {
      const fn = httpsCallable(functions, 'createCampaign');
      const res = await fn({
        clientId: campaign.clientId,
        name: campaign.name,
        callNumber: campaign.callNumber,
      });
      const id = res.data.campaignId;
      setCampaigns(prev => [...prev, { id, ...campaign }]);
      setNotification({ type: 'success', text: 'Campaign created successfully.' });
    } catch (err) {
      const message = err && err.message ? err.message : String(err);
      setNotification({ type: 'error', text: `Failed to create campaign: ${message}` });
    }
  };

  const updateNumber = (updated) => {
    setCallNumbers(prev => prev.map(n => (n.id === updated.id ? updated : n)));
  };

  const deleteNumber = (id) => {
    setCallNumbers(prev => prev.filter(n => n.id !== id));
  };

  const handleLogout = () => {
    signOut(auth);
  };

  const handleOpenCreateForm = () => {
    setEditingClient(null);
    setActiveView('clientForm');
  };

  const handleOpenEditForm = (client) => {
    setEditingClient(client);
    setActiveView('clientForm');
  };

  const handleTestBigQuery = async () => {
    try {
      const testFn = httpsCallable(functions, 'testBigQueryConnection');
      await testFn();
      setNotification({ type: 'success', text: 'BigQuery connection successful.' });
    } catch (err) {
      const message = err && err.message ? err.message : String(err);
      setNotification({ type: 'error', text: `BigQuery test failed: ${message}` });
    }
  };

  const handleSaveClient = async (data) => {
    if (!editingClient) {
      try {
        // createClient is implemented as an HTTP function, not a callable one
        const projectId = process.env.REACT_APP_FIREBASE_PROJECT_ID;
        const url = `https://us-central1-${projectId}.cloudfunctions.net/createClient`;
        const resp = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            companyName: data.companyName,
            contactFullName: data.clientName,
            contactEmail: data.contactEmail,
          }),
        });
        if (!resp.ok) {
          const text = await resp.text();
          throw new Error(text || `Request failed with status ${resp.status}`);
        }

        const getData = httpsCallable(functions, 'getMasterData');
        const res = await getData();
        setClients(res.data.clients || []);
        setCallNumbers(res.data.callNumbers || []);
        setCampaigns(res.data.campaigns || []);
        setNotification({ type: 'success', text: 'Client created successfully.' });
      } catch (err) {
        console.error('Failed to create client', err);
        const message = err && err.message ? err.message : String(err);
        setNotification({ type: 'error', text: `Failed to create client: ${message}` });
      }
    }
    setActiveView('clients');
  };

  const renderView = () => {
    switch (activeView) {
      case 'overview':
        return <OverviewTab kpis={globalKpis} onTestBigQuery={handleTestBigQuery} />;
      case 'clientForm':
        return <ClientFormPage client={editingClient} numbers={callNumbers} campaigns={campaigns} onSave={handleSaveClient} onCancel={() => setActiveView('clients')} />;
      case 'clients':
        return <ClientManagementTab clients={clients} onOpenCreateModal={handleOpenCreateForm} onOpenEditModal={handleOpenEditForm} />;
      case 'numbers':
        return <CallNumberManagementTab clients={clients} numbers={callNumbers} onAdd={addNumber} onEdit={updateNumber} onDelete={deleteNumber} />;
      case 'leads':
        return <LeadManagementTab clients={clients} campaigns={campaigns} />;
      case 'campaigns':
        return (
          <CampaignManagementTab
            campaigns={campaigns}
            clients={clients}
            numbers={callNumbers}
            onAdd={addCampaign}
            onOpen={() => { setEditingCampaign(null); setCampaignModalOpen(true); }}
          />
        );
      default:
        return <ClientManagementTab clients={clients} onOpenCreateModal={handleOpenCreateForm} onOpenEditModal={handleOpenEditForm} />;
    }
  };

  if (dataLoading) {
    return <div className="p-8 text-white">Loading data...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-900 text-gray-200 font-sans">
      <aside className="w-64 flex-shrink-0 bg-gray-800 p-4 flex flex-col">
        <div className="px-2 py-4">
          <img src="https://storage.googleapis.com/gemini-generative-ai-docs/images/getconnects_logo.png" alt="GetConnects Logo" className="h-16 w-auto" />
          <p className="text-xs text-gray-400 mt-2">Master Dashboard</p>
        </div>
        <nav className="flex flex-col space-y-2 mt-8">
          <NavLink icon={<ChartBarIcon />} text="Global Overview" isActive={activeView === 'overview'} onClick={() => setActiveView('overview')} />
          <NavLink icon={<UsersIcon />} text="Client Management" isActive={activeView === 'clients'} onClick={() => setActiveView('clients')} />
          <NavLink icon={<ClipboardIcon />} text="Campaign Management" isActive={activeView === 'campaigns'} onClick={() => setActiveView('campaigns')} />
          <NavLink icon={<HashtagIcon />} text="Call Numbers" isActive={activeView === 'numbers'} onClick={() => setActiveView('numbers')} />
          <NavLink icon={<PhoneIcon />} text="Lead Management" isActive={activeView === 'leads'} onClick={() => setActiveView('leads')} />
        </nav>
        <div className="flex-grow" />
        <div>
          <p className="text-sm font-semibold text-white truncate">{user.email}</p>
          <button onClick={handleLogout} className="text-xs text-indigo-400 hover:underline">Logout</button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        <Notification message={notification} onClose={() => setNotification(null)} />
        {renderView()}
      </main>
    </div>
  );
}

function OverviewTab({ kpis, onTestBigQuery }) {
  return (
    <div>
      <h2 className="text-3xl font-bold text-white mb-6">Global Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard title="Total Calls (30d)" value={kpis?.totalCalls?.toLocaleString() || '0'} />
        <KpiCard title="Total Leads (30d)" value={kpis?.totalLeads?.toLocaleString() || '0'} />
        <KpiCard title="Active Clients" value={kpis?.activeClients || 0} />
        <KpiCard title="System Health" value={kpis?.systemHealth || 'Unknown'} statusColor="text-green-400" />
      </div>
      <div className="mt-8 bg-gray-800 p-6 rounded-xl border border-gray-700">
        <h3 className="text-lg font-medium text-white">More charts and global analytics would go here.</h3>
      </div>
      <button onClick={onTestBigQuery} className="mt-6 bg-indigo-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-indigo-700">
        Test BigQuery Setup
      </button>
    </div>
  );
}

function ClientManagementTab({ clients, onOpenCreateModal, onOpenEditModal }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white">Client Management</h2>
        <button onClick={onOpenCreateModal} className="bg-indigo-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-indigo-700 transition-colors shadow-lg">
          Create New Client
        </button>
      </div>
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-900">
            <tr>
              <th className="p-4 text-xs font-semibold uppercase text-gray-400">Client Name</th>
              <th className="p-4 text-xs font-semibold uppercase text-gray-400">Status</th>
              <th className="p-4 text-xs font-semibold uppercase text-gray-400">Leads (30d)</th>
              <th className="p-4 text-xs font-semibold uppercase text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {clients.map(client => (
              <tr key={client.id} className="hover:bg-gray-700/50">
                <td className="p-4 font-medium text-white">{client.companyName}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${client.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{client.status}</span>
                </td>
                <td className="p-4 text-white">{client.leads}</td>
                <td className="p-4 flex items-center space-x-4">
                  <a href="#" className="text-indigo-400 hover:underline font-medium">View</a>
                  <button onClick={() => onOpenEditModal(client)} className="text-gray-400 hover:text-white flex items-center space-x-1">
                    <PencilIcon />
                    <span>Edit</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CampaignManagementTab({ campaigns, clients, numbers, onAdd, onOpen }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleSave = (campaign) => {
    onAdd(campaign);
    setIsModalOpen(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white">Campaign Management</h2>
        <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-indigo-700 transition-colors shadow-lg">Add Campaign</button>
      </div>
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-900">
            <tr>
              <th className="p-4 text-xs font-semibold uppercase text-gray-400">Campaign</th>
              <th className="p-4 text-xs font-semibold uppercase text-gray-400">Client</th>
              <th className="p-4 text-xs font-semibold uppercase text-gray-400">Call Number</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {campaigns.map(c => (
              <tr key={c.id} className="hover:bg-gray-700/50">
                <td className="p-4 font-medium text-white">{c.name}</td>
                <td className="p-4 text-white">{clients.find(cl => String(cl.clientId || cl.id) === String(c.clientId))?.companyName || 'Unassigned'}</td>
                <td className="p-4 text-white">{c.callNumber}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <CampaignModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        campaignData={null}
        clients={clients}
        numbers={numbers}
        onSave={handleSave}
      />
    </div>
  );
}

function CallNumberManagementTab({ clients, numbers, onAdd, onEdit, onDelete }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNumber, setEditingNumber] = useState(null);

  const handleSave = (num) => {
    if (editingNumber) {
      onEdit(num);
    } else {
      onAdd(num.number, num.clientId);
    }
    setIsModalOpen(false);
    setEditingNumber(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white">Call Numbers</h2>
        <button onClick={() => { setEditingNumber(null); setIsModalOpen(true); }} className="bg-indigo-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-indigo-700 transition-colors shadow-lg">Add Number</button>
      </div>
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-900">
            <tr>
              <th className="p-4 text-xs font-semibold uppercase text-gray-400">Number</th>
              <th className="p-4 text-xs font-semibold uppercase text-gray-400">Assigned Client</th>
              <th className="p-4 text-xs font-semibold uppercase text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {numbers.map(num => (
              <tr key={num.id} className="hover:bg-gray-700/50">
                <td className="p-4 font-medium text-white">{num.number}</td>
                <td className="p-4 text-white">{num.clientId ? clients.find(c => c.id === num.clientId)?.companyName : 'Unassigned'}</td>
                <td className="p-4 space-x-3">
                  <button onClick={() => { setEditingNumber(num); setIsModalOpen(true); }} className="text-indigo-400 hover:underline">Edit</button>
                  <button onClick={() => onDelete(num.id)} className="text-red-400 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <CallNumberModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingNumber(null); }} numberData={editingNumber} clients={clients} onSave={handleSave} />
    </div>
  );
}

function LeadManagementTab({ clients, campaigns }) {
  const [search, setSearch] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const [campaignFilter, setCampaignFilter] = useState('');
  const [leads, setLeads] = useState([]);
  const [editingLead, setEditingLead] = useState(null);

  useEffect(() => {
    async function fetchLeads() {
      try {
        const getData = httpsCallable(functions, 'getMasterData');
        const res = await getData();
        setLeads(res.data.leads || []);
      } catch (err) {
        console.error('Failed to load leads', err);
      }
    }
    fetchLeads();
  }, []);

  const enrichedLeads = leads.map(l => ({
    ...l,
    clientName: clients.find(c => c.clientId === String(l.clientId))?.companyName || '',
    campaign: campaigns.find(c => c.id === l.campaignId)?.name || '',
  }));

  const filteredLeads = enrichedLeads.filter(lead => {
    const matchesSearch = lead.phoneNumber.toLowerCase().includes(search.toLowerCase());
    const matchesClient = clientFilter ? lead.clientName === clientFilter : true;
    const matchesCampaign = campaignFilter ? lead.campaign === campaignFilter : true;
    return matchesSearch && matchesClient && matchesCampaign;
  });

  const handleSave = (updatedLead) => {
    setLeads(prev => prev.map(l => (l.id === updatedLead.id ? updatedLead : l)));
    setEditingLead(null);
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-white mb-6">Lead Management</h2>
      <div className="mb-4 space-y-2">
        <input
          type="text"
          placeholder="Search by phone number"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select value={clientFilter} onChange={e => setClientFilter(e.target.value)} className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg">
            <option value="">All Clients</option>
            {clients.map(c => (
              <option key={c.id} value={c.companyName}>{c.companyName}</option>
            ))}
          </select>
          <select value={campaignFilter} onChange={e => setCampaignFilter(e.target.value)} className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg">
            <option value="">All Campaigns</option>
            {campaigns.map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-900">
            <tr>
              <th className="p-4 text-xs font-semibold uppercase text-gray-400">Phone</th>
              <th className="p-4 text-xs font-semibold uppercase text-gray-400">Client</th>
              <th className="p-4 text-xs font-semibold uppercase text-gray-400">Campaign</th>
              <th className="p-4 text-xs font-semibold uppercase text-gray-400">Disposition</th>
              <th className="p-4 text-xs font-semibold uppercase text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {filteredLeads.map(lead => (
              <tr key={lead.id} className="hover:bg-gray-700/50">
                <td className="p-4 font-medium text-white">{lead.phoneNumber}</td>
                <td className="p-4 text-white">{lead.clientName}</td>
                <td className="p-4 text-white">{lead.campaign}</td>
                <td className="p-4 text-white">{lead.disposition}</td>
                <td className="p-4 text-white">
                  <button onClick={() => setEditingLead(lead)} className="text-indigo-400 hover:underline">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <LeadModal lead={editingLead} onClose={() => setEditingLead(null)} onSave={handleSave} />
    </div>
  );
}
