import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { getCampaigns, getJustCallNumbers, getMembers } from '../mockApi';

export default function ClientFormPage({ client, onSave, onCancel }) {
  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      clientName: '',
      companyName: '',
      contactEmail: '',
      contactPhone: '',
      contactPerson: '',
      justCallNumber: '',
      campaigns: [],
      members: []
    }
  });

  const [campaignOptions, setCampaignOptions] = useState([]);
  const [numberOptions, setNumberOptions] = useState([]);
  const [memberOptions, setMemberOptions] = useState([]);

  useEffect(() => {
    getCampaigns().then(setCampaignOptions);
    getJustCallNumbers().then(setNumberOptions);
    getMembers().then(setMemberOptions);
  }, []);

  useEffect(() => {
    if (client) {
      setValue('clientName', client.contactFullName || client.clientName || '');
      setValue('companyName', client.companyName || '');
      setValue('contactEmail', client.contactEmail || '');
      setValue('contactPhone', client.contactPhone || '');
      if (client.contactPerson) setValue('contactPerson', client.contactPerson);
      if (client.justCallNumber) setValue('justCallNumber', client.justCallNumber);
      if (client.campaigns) setValue('campaigns', client.campaigns);
      if (client.members) setValue('members', client.members);
    }
  }, [client, setValue]);

  const assignedNumber = watch('justCallNumber');

  const onSubmit = (data) => {
    const payload = { id: client?.id || Date.now(), status: client?.status || 'Active', leads: client?.leads || 0, ...data };
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
            <select {...register('contactPerson')} className="mt-1 w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg">
              <option value="">Select member</option>
              {memberOptions.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
        </section>

        <section className="bg-gray-800 p-6 rounded-xl border border-gray-700 space-y-4">
          <h3 className="text-xl text-white font-semibold">JustCall Number Management</h3>
          {assignedNumber && <p className="text-gray-300">Assigned Number: {numberOptions.find(n => String(n.id) === String(assignedNumber))?.number}</p>}
          <div className="flex space-x-4 items-end">
            <select {...register('justCallNumber')} className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg">
              <option value="">Unassigned</option>
              {numberOptions.map(num => (
                <option key={num.id} value={num.id}>{num.number}</option>
              ))}
            </select>
            {assignedNumber && <button type="button" onClick={() => setValue('justCallNumber', '')} className="py-2 px-4 rounded-lg text-gray-300 hover:bg-gray-700">Remove</button>}
          </div>
        </section>

        <section className="bg-gray-800 p-6 rounded-xl border border-gray-700 space-y-4">
          <h3 className="text-xl text-white font-semibold">Campaigns Management</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {campaignOptions.map(c => (
              <label key={c.id} className="text-gray-300 flex items-center space-x-2">
                <input type="checkbox" value={c.id} {...register('campaigns')} className="form-checkbox" />
                <span>{c.name}</span>
              </label>
            ))}
          </div>
        </section>

        <section className="bg-gray-800 p-6 rounded-xl border border-gray-700 space-y-4">
          <h3 className="text-xl text-white font-semibold">Members Management</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {memberOptions.map(m => (
              <label key={m.id} className="text-gray-300 flex items-center space-x-2">
                <input type="checkbox" value={m.id} {...register('members')} className="form-checkbox" />
                <span>{m.name}</span>
              </label>
            ))}
          </div>
        </section>

        <div className="flex justify-end space-x-4">
          <button type="button" onClick={onCancel} className="py-2 px-4 rounded-lg text-gray-300 hover:bg-gray-700">Cancel</button>
          <button type="submit" className="bg-indigo-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-indigo-700">Save</button>
        </div>
      </form>
    </div>
  );
}
