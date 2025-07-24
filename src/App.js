import React, { useState, useEffect } from 'react';
import { auth, functions } from './firebase';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { httpsCallable } from 'firebase/functions';
import Login from './components/Login';


// --- ICONS (as simple SVG components for self-containment) ---
const ChartBarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);
const UsersIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197m0 0A5.995 5.995 0 003 21m12-6v-1a6 6 0 00-9-5.197" />
    </svg>
);
const PencilIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" />
    </svg>
);

const PhoneIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.586a1 1 0 01.707.293l2.414 2.414a1 1 0 010 1.414L9.414 8.414a16.016 16.016 0 006.172 6.172l1.293-1.293a1 1 0 011.414 0l2.414 2.414a1 1 0 01.293.707V19a2 2 0 01-2 2h-1C9.94 21 3 14.06 3 5V5z" />
    </svg>
);

const ClipboardIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 2h6a2 2 0 012 2v2h2a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h2V4a2 2 0 012-2z" />
    </svg>
);

const HashtagIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 9h10M5 15h10m2-10l-2 12m-6-12l-2 12" />
    </svg>
);


// --- Mock Data (to be replaced with API calls) ---
const mockGlobalKpis = {
    totalCalls: 87430,
    totalLeads: 1982,
    activeClients: 3,
    systemHealth: 'Normal'
};

const mockClientListData = [
    { id: 1, companyName: 'The Modern Agent', contactFullName: 'Stephanie Molenaar', contactEmail: 'steph@tma.com', contactPhone: '555-111-2222', initialCampaign: 'Q3 Investor Outreach', status: 'Active', leads: 482 },
    { id: 2, companyName: 'Mortgage Broker Inc.', contactFullName: 'Josh Fairhurst', contactEmail: 'josh@mortgage.com', contactPhone: '555-333-4444', initialCampaign: 'New Homebuyer Leads', status: 'Active', leads: 312 },
    { id: 3, companyName: 'Real Estate Group', contactFullName: 'Braden Smith', contactEmail: 'braden@regroup.com', contactPhone: '555-555-6666', initialCampaign: 'July Listings', status: 'Needs Review', leads: 199 }
];

const mockLeadData = [
    {
        id: 1,
        phoneNumber: '555-123-4567',
        clientName: 'The Modern Agent',
        campaign: 'Q3 Investor Outreach',
        disposition: 'Hot'
    },
    {
        id: 2,
        phoneNumber: '555-987-6543',
        clientName: 'Mortgage Broker Inc.',
        campaign: 'New Homebuyer Leads',
        disposition: 'Warm'
    },
    {
        id: 3,
        phoneNumber: '555-222-3333',
        clientName: 'Real Estate Group',
        campaign: 'July Listings',
        disposition: 'Cold'
    }
];

const mockCampaignData = [
    { id: 1, name: 'Q3 Investor Outreach', clientId: 1, clientName: 'The Modern Agent', callNumber: '555-888-1111', status: 'Active' },
    { id: 2, name: 'New Homebuyer Leads', clientId: 2, clientName: 'Mortgage Broker Inc.', callNumber: '555-888-2222', status: 'Active' },
    { id: 3, name: 'July Listings', clientId: 3, clientName: 'Real Estate Group', callNumber: '555-888-3333', status: 'Paused' },
];

// Call tracking numbers that can be assigned to clients
const mockCallNumberData = [
    { id: 1, number: '555-888-1111', clientId: 1 },
    { id: 2, number: '555-888-2222', clientId: 2 },
    { id: 3, number: '555-888-3333', clientId: 3 },
    { id: 4, number: '555-888-4444', clientId: null },
];

// --- Reusable Components ---
const KpiCard = ({ title, value, statusColor }) => (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
        <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        <p className={`mt-2 text-3xl font-bold ${statusColor || 'text-white'}`}>{value}</p>
    </div>
);

const NavLink = ({ icon, text, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center space-x-3 w-full text-left p-3 rounded-lg font-semibold transition-colors duration-200 ${isActive ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
    >
        {icon}
        <span>{text}</span>
    </button>
);

// --- Main App Component ---
export default function App() {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, user => {
            setCurrentUser(user);
            setLoading(false);
        });
        return unsubscribe; // Cleanup on unmount
    }, []);

    if (loading) {
        return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>;
    }

    if (!currentUser) {
        return <Login />;
    }

    return <MasterDashboard user={currentUser} />;
}


// --- Master Dashboard Component ---
const MasterDashboard = ({ user }) => {
    const [activeView, setActiveView] = useState('clients');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [callNumbers, setCallNumbers] = useState(mockCallNumberData);

    const addNumber = (number, clientId) => {
        setCallNumbers(prev => [...prev, { id: Date.now(), number, clientId }]);
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
    
    const handleOpenCreateModal = () => {
        setEditingClient(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (client) => {
        setEditingClient(client);
        setIsModalOpen(true);
    };

    const renderView = () => {
        switch (activeView) {
            case 'overview':
                return <OverviewTab />;
            case 'clients':
                return <ClientManagementTab onOpenCreateModal={handleOpenCreateModal} onOpenEditModal={handleOpenEditModal} />;
            case 'numbers':
                return <CallNumberManagementTab clients={mockClientListData} numbers={callNumbers} onAdd={addNumber} onEdit={updateNumber} onDelete={deleteNumber} />;
            case 'leads':
                return <LeadManagementTab />;
            case 'campaigns':
                return <CampaignManagementTab />;
            default:
                return <ClientManagementTab onOpenCreateModal={handleOpenCreateModal} onOpenEditModal={handleOpenEditModal} />;
        }
    };

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
                <div className="flex-grow"></div>
                <div>
                    <p className="text-sm font-semibold text-white truncate">{user.email}</p>
                    <button onClick={handleLogout} className="text-xs text-indigo-400 hover:underline">Logout</button>
                </div>
            </aside>

            <main className="flex-1 p-8 overflow-y-auto">
                {renderView()}
            </main>

            <ClientModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} clientData={editingClient} />
        </div>
    );
};

// --- View Components ---
const OverviewTab = () => (
    <div>
        <h2 className="text-3xl font-bold text-white mb-6">Global Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KpiCard title="Total Calls (30d)" value={mockGlobalKpis.totalCalls.toLocaleString()} />
            <KpiCard title="Total Leads (30d)" value={mockGlobalKpis.totalLeads.toLocaleString()} />
            <KpiCard title="Active Clients" value={mockGlobalKpis.activeClients} />
            <KpiCard title="System Health" value={mockGlobalKpis.systemHealth} statusColor="text-green-400" />
        </div>
        <div className="mt-8 bg-gray-800 p-6 rounded-xl border border-gray-700">
            <h3 className="text-lg font-medium text-white">More charts and global analytics would go here.</h3>
        </div>
    </div>
);

const ClientManagementTab = ({ onOpenCreateModal, onOpenEditModal }) => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate fetching data from an API
        setLoading(true);
        setTimeout(() => {
            setClients(mockClientListData);
            setLoading(false);
        }, 1000); // 1 second delay to simulate network
    }, []);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-white">Client Management</h2>
                <button onClick={onOpenCreateModal} className="bg-indigo-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-indigo-700 transition-colors shadow-lg">
                    Create New Client
                </button>
            </div>
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-400">Loading client data...</div>
                ) : (
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
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${client.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {client.status}
                                        </span>
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
                )}
            </div>
        </div>
    );
};

const CampaignManagementTab = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate API call
        setLoading(true);
        setTimeout(() => {
            setCampaigns(mockCampaignData);
            setLoading(false);
        }, 500);
    }, []);

    return (
        <div>
            <h2 className="text-3xl font-bold text-white mb-6">Campaign Management</h2>
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-400">Loading campaign data...</div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-gray-900">
                            <tr>
                                <th className="p-4 text-xs font-semibold uppercase text-gray-400">Campaign</th>
                                <th className="p-4 text-xs font-semibold uppercase text-gray-400">Client</th>
                                <th className="p-4 text-xs font-semibold uppercase text-gray-400">Call Number</th>
                                <th className="p-4 text-xs font-semibold uppercase text-gray-400">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {campaigns.map(c => (
                                <tr key={c.id} className="hover:bg-gray-700/50">
                                    <td className="p-4 font-medium text-white">{c.name}</td>
                                    <td className="p-4 text-white">{c.clientName}</td>
                                    <td className="p-4 text-white">{c.callNumber}</td>
                                    <td className="p-4 text-white">{c.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

const CallNumberManagementTab = ({ clients, numbers, onAdd, onEdit, onDelete }) => {
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
};

const LeadManagementTab = () => {
    const [search, setSearch] = useState('');
    const [clientFilter, setClientFilter] = useState('');
    const [campaignFilter, setCampaignFilter] = useState('');
    const [leads, setLeads] = useState([]);
    const [editingLead, setEditingLead] = useState(null);

    useEffect(() => {
        // Simulate API call
        setLeads(mockLeadData);
    }, []);

    const filteredLeads = leads.filter(lead => {
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
                        {mockClientListData.map(c => (
                            <option key={c.id} value={c.companyName}>{c.companyName}</option>
                        ))}
                    </select>
                    <select value={campaignFilter} onChange={e => setCampaignFilter(e.target.value)} className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg">
                        <option value="">All Campaigns</option>
                        {mockCampaignData.map(c => (
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
};

// --- Modal Component ---
const ClientModal = ({ isOpen, onClose, clientData }) => {
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (clientData) {
            setFormData(clientData);
        } else {
            setFormData({
                companyName: '',
                contactFullName: '',
                contactEmail: '',
                contactPhone: '',
                initialCampaign: '',
                callNumber: ''
            });
        }
    }, [clientData, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (clientData) {
            alert(`Simulating API call to UPDATE client...\n\nData Sent:\n${JSON.stringify(formData, null, 2)}`);
            onClose();
            return;
        }

        try {
            const createClient = httpsCallable(functions, 'createClient');
            const result = await createClient({
                companyName: formData.companyName,
                contactFullName: formData.contactFullName,
                contactEmail: formData.contactEmail,
            });
            alert(result.data.message);

            if (formData.initialCampaign) {
                const createCampaign = httpsCallable(functions, 'createCampaign');
                await createCampaign({
                    clientId: result.data.clientId,
                    name: formData.initialCampaign,
                    callNumber: formData.callNumber,
                });
            }
        } catch (err) {
            console.error('Error creating client:', err);
            alert('Failed to create client');
        }
        onClose();
    };
    
    if (!isOpen) return null;

    const isEditMode = !!clientData;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
            <form onSubmit={handleSubmit} className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg p-8 border border-gray-700">
                <h2 className="text-2xl font-bold text-white mb-6">{isEditMode ? 'Edit Client' : 'Onboard New Client'}</h2>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-300">Company Name</label>
                        <input name="companyName" type="text" required value={formData.companyName} onChange={handleChange} className="mt-1 w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-300">Primary Contact Full Name</label>
                            <input name="contactFullName" type="text" required value={formData.contactFullName} onChange={handleChange} className="mt-1 w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-300">Primary Contact Phone</label>
                            <input name="contactPhone" type="tel" value={formData.contactPhone} onChange={handleChange} className="mt-1 w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                    </div>
                     <div>
                        <label className="text-sm font-medium text-gray-300">Primary Contact Email</label>
                        <input name="contactEmail" type="email" required value={formData.contactEmail} onChange={handleChange} className="mt-1 w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-300">Initial Campaign Name</label>
                            <input name="initialCampaign" type="text" required value={formData.initialCampaign} onChange={handleChange} className="mt-1 w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-300">Call Tracking Number</label>
                            <input name="callNumber" type="text" value={formData.callNumber} onChange={handleChange} className="mt-1 w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                    </div>
                </div>
                <div className="mt-8 flex justify-end space-x-4">
                    <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg text-gray-300 hover:bg-gray-700">Cancel</button>
                    <button type="submit" className="bg-indigo-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-indigo-700">
                        {isEditMode ? 'Save Changes' : 'Create Client & Provision'}
                    </button>
                </div>
            </form>
        </div>
    );
};

const LeadModal = ({ lead, onClose, onSave }) => {
    const [disposition, setDisposition] = useState('');

    useEffect(() => {
        if (lead) {
            setDisposition(lead.disposition);
        }
    }, [lead]);

    if (!lead) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...lead, disposition });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
            <form onSubmit={handleSubmit} className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-8 border border-gray-700">
                <h2 className="text-2xl font-bold text-white mb-6">Edit Lead</h2>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-300">Phone Number</label>
                        <p className="mt-1 text-white">{lead.phoneNumber}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-300">Disposition</label>
                        <select
                            value={disposition}
                            onChange={e => setDisposition(e.target.value)}
                            className="mt-1 w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="Hot">Hot</option>
                            <option value="Warm">Warm</option>
                            <option value="Cold">Cold</option>
                        </select>
                    </div>
                </div>
                <div className="mt-8 flex justify-end space-x-4">
                    <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg text-gray-300 hover:bg-gray-700">Cancel</button>
                    <button type="submit" className="bg-indigo-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-indigo-700">Save</button>
                </div>
            </form>
        </div>
    );
};

const CallNumberModal = ({ isOpen, onClose, numberData, clients, onSave }) => {
    const [form, setForm] = useState({ number: '', clientId: '' });

    useEffect(() => {
        if (numberData) {
            setForm({ number: numberData.number, clientId: numberData.clientId || '' });
        } else {
            setForm({ number: '', clientId: '' });
        }
    }, [numberData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        const clientId = form.clientId ? parseInt(form.clientId, 10) : null;
        const payload = { id: numberData?.id || Date.now(), number: form.number, clientId };
        onSave(payload);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
            <form onSubmit={handleSubmit} className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-8 border border-gray-700">
                <h2 className="text-2xl font-bold text-white mb-6">{numberData ? 'Edit Number' : 'Add Number'}</h2>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-300">Number</label>
                        <input name="number" type="text" required value={form.number} onChange={e => setForm({ ...form, number: e.target.value })} className="mt-1 w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-300">Assign to Client</label>
                        <select value={form.clientId} onChange={e => setForm({ ...form, clientId: e.target.value })} className="mt-1 w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            <option value="">Unassigned</option>
                            {clients.map(c => (
                                <option key={c.id} value={c.id}>{c.companyName}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="mt-8 flex justify-end space-x-4">
                    <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg text-gray-300 hover:bg-gray-700">Cancel</button>
                    <button type="submit" className="bg-indigo-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-indigo-700">Save</button>
                </div>
            </form>
        </div>
    );
};
