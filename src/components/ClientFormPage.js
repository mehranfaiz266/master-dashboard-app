import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';

export default function ClientFormPage({ client, numbers, campaigns, onSave, onCancel }) {
  const { register, control, handleSubmit, setValue } = useForm({
    defaultValues: {
      clientName: '',
      companyName: '',
      contactEmail: '',
      contactPhone: '',
      contactPerson: '',
      members: []
    }
  });
  const { fields: memberFields, append, remove } = useFieldArray({ control, name: 'members' });

  const [assignedNumbers, setAssignedNumbers] = useState([]);
  const [assignedCampaigns, setAssignedCampaigns] = useState([]);
  const [newNumber, setNewNumber] = useState('');
  const [newCampaign, setNewCampaign] = useState('');

  useEffect(() => {
    if (client) {
      setValue('clientName', client.contactFullName || client.clientName || '');
      setValue('companyName', client.companyName || '');
      setValue('contactEmail', client.contactEmail || '');
      setValue('contactPhone', client.contactPhone || '');
      if (client.contactPerson) setValue('contactPerson', client.contactPerson);
      if (client.members) {
        setValue('members', client.members);
      }
      setAssignedNumbers(numbers.filter(n => n.clientId === client.id).map(n => n.id));
      setAssignedCampaigns(campaigns.filter(c => c.clientId === client.id).map(c => c.id));
    }
  }, [client, setValue, numbers, campaigns]);

  // numbers and campaigns available for assignment (include ones already assigned to this client)
  const availableNumbers = numbers.filter(
    n => (n.clientId === null || n.clientId === client?.id) && !assignedNumbers.includes(n.id)
  );
  const availableCampaigns = campaigns.filter(
    c => (c.clientId === null || c.clientId === client?.id) && !assignedCampaigns.includes(c.id)
  );

  const addNumber = () => {
    if (newNumber && !assignedNumbers.includes(parseInt(newNumber, 10))) {
      setAssignedNumbers(prev => [...prev, parseInt(newNumber, 10)]);
      setNewNumber('');
    }
  };

  const addCampaign = () => {
    if (newCampaign && !assignedCampaigns.includes(parseInt(newCampaign, 10))) {
      setAssignedCampaigns(prev => [...prev, parseInt(newCampaign, 10)]);
      setNewCampaign('');
    }
  };

  const onSubmit = (data) => {
    const payload = {
      id: client?.id || Date.now(),
      status: client?.status || 'Active',
      leads: client?.leads || 0,
      ...data,
      members: data.members,
      numbers: assignedNumbers,
      campaigns: assignedCampaigns
    };
    onSave(payload);
  };

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold text-white mb-6">{client ? 'Edit Client' : 'Create Client'}</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <section className="bg-gray-800 p-6 rounded-xl border border-gray-700 space-y-4">
          <h3 className="text-xl text-white font-semibold">Contact Information</h3>
          <div>
            <label className="text-sm font-medium text-gray-300">Client Name</label>
            <input {...register('clientName', { required: true })} className="mt-1 w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-300">Company Name</label>
            <input {...register('companyName', { required: true })} className="mt-1 w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-300">Contact Email</label>
              <input type="email" {...register('contactEmail', { required: true })} className="mt-1 w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300">Contact Phone</label>
              <input type="tel" {...register('contactPhone')} className="mt-1 w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-300">Assigned Contact Person</label>
            <input {...register('contactPerson')} className="mt-1 w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg" />
          </div>
        </section>

        <section className="bg-gray-800 p-6 rounded-xl border border-gray-700 space-y-4">
          <h3 className="text-xl text-white font-semibold">JustCall Number Management</h3>
          <div className="space-y-2">
            {assignedNumbers.map(id => (
              <div key={id} className="flex items-center justify-between bg-gray-700 p-2 rounded-lg">
                <span className="text-white">{numbers.find(n => n.id === id)?.number}</span>
                <button type="button" onClick={() => setAssignedNumbers(prev => prev.filter(n => n !== id))} className="text-red-400 hover:underline">Remove</button>
              </div>
            ))}
          </div>
          <div className="flex space-x-2 items-end">
            <select value={newNumber} onChange={e => setNewNumber(e.target.value)} className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg">
              <option value="">Select number</option>
              {availableNumbers.map(num => (
                <option key={num.id} value={num.id}>{num.number}</option>
              ))}
            </select>
            <button type="button" onClick={addNumber} className="py-2 px-4 rounded-lg text-gray-300 hover:bg-gray-700">Add</button>
          </div>
        </section>

        <section className="bg-gray-800 p-6 rounded-xl border border-gray-700 space-y-4">
          <h3 className="text-xl text-white font-semibold">Campaigns Management</h3>
          <div className="space-y-2">
            {assignedCampaigns.map(id => (
              <div key={id} className="flex items-center justify-between bg-gray-700 p-2 rounded-lg">
                <span className="text-white">{campaigns.find(c => c.id === id)?.name}</span>
                <button type="button" onClick={() => setAssignedCampaigns(prev => prev.filter(c => c !== id))} className="text-red-400 hover:underline">Remove</button>
              </div>
            ))}
          </div>
          <div className="flex space-x-2 items-end">
            <select value={newCampaign} onChange={e => setNewCampaign(e.target.value)} className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg">
              <option value="">Select campaign</option>
              {availableCampaigns.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <button type="button" onClick={addCampaign} className="py-2 px-4 rounded-lg text-gray-300 hover:bg-gray-700">Add</button>
          </div>
        </section>

        <section className="bg-gray-800 p-6 rounded-xl border border-gray-700 space-y-4">
          <h3 className="text-xl text-white font-semibold">Members Management</h3>
          {memberFields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end bg-gray-700 p-2 rounded-lg">
              <input {...register(`members.${index}.firstName`)} placeholder="First" className="px-2 py-1 bg-gray-600 text-white border border-gray-500 rounded" />
              <input {...register(`members.${index}.lastName`)} placeholder="Last" className="px-2 py-1 bg-gray-600 text-white border border-gray-500 rounded" />
              <input {...register(`members.${index}.phone`)} placeholder="Phone" className="px-2 py-1 bg-gray-600 text-white border border-gray-500 rounded" />
              <input {...register(`members.${index}.email`)} placeholder="Email" className="px-2 py-1 bg-gray-600 text-white border border-gray-500 rounded" />
              <button type="button" onClick={() => remove(index)} className="text-red-400 hover:underline md:col-span-4 text-left">Remove</button>
            </div>
          ))}
          <button type="button" onClick={() => append({ firstName: '', lastName: '', phone: '', email: '' })} className="py-2 px-4 rounded-lg text-gray-300 hover:bg-gray-700">Add Member</button>
        </section>

        <div className="flex justify-end space-x-4">
          <button type="button" onClick={onCancel} className="py-2 px-4 rounded-lg text-gray-300 hover:bg-gray-700">Cancel</button>
          <button type="submit" className="bg-indigo-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-indigo-700">Save</button>
        </div>
      </form>
    </div>
  );
}
