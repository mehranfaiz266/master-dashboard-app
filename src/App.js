import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from "firebase/auth";
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


// --- Mock Data (to be replaced with API calls) ---
const mockGlobalKpis = {
    totalCalls: 87430,
    totalLeads: 1982,
    activeClients: 3,
    systemHealth: 'Normal'
};

const mockClientListData = [
    { id: 1, companyName: 'The Modern Agent', contactFullName: 'Stephanie Molenaar', contactEmail: 'steph@tma.com', contactPhone: '555-111-2222', subscriptionPlan: 'enterprise', initialCampaign: 'Q3 Investor Outreach', status: 'Active', leads: 482 },
    { id: 2, companyName: 'Mortgage Broker Inc.', contactFullName: 'Josh Fairhurst', contactEmail: 'josh@mortgage.com', contactPhone: '555-333-4444', subscriptionPlan: 'pro', initialCampaign: 'New Homebuyer Leads', status: 'Active', leads: 312 },
    { id: 3, companyName: 'Real Estate Group', contactFullName: 'Braden Smith', contactEmail: 'braden@regroup.com', contactPhone: '555-555-6666', subscriptionPlan: 'pro', initialCampaign: 'July Listings', status: 'Needs Review', leads: 199 }
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
                subscriptionPlan: 'pro',
                initialCampaign: ''
            });
        }
    }, [clientData, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (clientData) {
            alert(`Simulating API call to UPDATE client...\n\nData Sent:\n${JSON.stringify(formData, null, 2)}`);
        } else {
            alert(`Simulating API call to CREATE client...\n\nData Sent:\n${JSON.stringify(formData, null, 2)}`);
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
                            <label className="text-sm font-medium text-gray-300">Subscription Plan</label>
                            <select name="subscriptionPlan" required value={formData.subscriptionPlan} onChange={handleChange} className="mt-1 w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                <option value="pro">Pro Plan</option>
                                <option value="enterprise">Enterprise Plan</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-300">Initial Campaign Name</label>
                            <input name="initialCampaign" type="text" required value={formData.initialCampaign} onChange={handleChange} className="mt-1 w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
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
