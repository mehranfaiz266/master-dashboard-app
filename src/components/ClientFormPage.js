import React, { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';

export default function ClientFormPage({ client, numbers = [], campaigns = [], onSave, onCancel }) {
  const { register, handleSubmit, setValue, control } = useForm({
    defaultValues: {
      clientName: '',
      companyName: '',
      contactEmail: '',
      contactPhone: '',
      contactPerson: '',
      numbers: [],
      campaigns: [],
      members: []
    }
  });

  const { fields: memberFields, append: addMember, remove: removeMember } = useFieldArray({ control, name: 'members' });

  useEffect(() => {
    if (client) {
      setValue('clientName', client.contactFullName || client.clientName || '');
      setValue('companyName', client.companyName || '');
      setValue('contactEmail', client.contactEmail || '');
      setValue('contactPhone', client.contactPhone || '');
      if (client.contactPerson) setValue('contactPerson', client.contactPerson);
      if (client.numbers) setValue('numbers', client.numbers);
      if (client.campaigns) setValue('campaigns', client.campaigns);
      if (client.members) setValue('members', client.members);
    }
  }, [client, setValue]);



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
            <input {...register('contactPerson')} className="mt-1 w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg" />
          </div>
        </section>

        <section className="bg-gray-800 p-6 rounded-xl border border-gray-700 space-y-4">
          <h3 className="text-xl text-white font-semibold">JustCall Number Management</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {numbers.map(num => (
              <label key={num.id} className="text-gray-300 flex items-center space-x-2">
                <input
                  type="checkbox"
                  value={num.id}
                  {...register('numbers')}
                  disabled={num.clientId && num.clientId !== client?.id}
                  className="form-checkbox"
                />
                <span>{num.number}{num.clientId && num.clientId !== client?.id ? ' (assigned)' : ''}</span>
              </label>
            ))}
          </div>
        </section>

        <section className="bg-gray-800 p-6 rounded-xl border border-gray-700 space-y-4">
          <h3 className="text-xl text-white font-semibold">Campaigns Management</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {campaigns.map(c => (
              <label key={c.id} className="text-gray-300 flex items-center space-x-2">
                <input
                  type="checkbox"
                  value={c.id}
                  {...register('campaigns')}
                  disabled={c.clientId && c.clientId !== client?.id}
                  className="form-checkbox"
                />
                <span>{c.name}{c.clientId && c.clientId !== client?.id ? ' (assigned)' : ''}</span>
              </label>
            ))}
          </div>
        </section>

        <section className="bg-gray-800 p-6 rounded-xl border border-gray-700 space-y-4">
          <h3 className="text-xl text-white font-semibold">Members Management</h3>
          <div className="space-y-2">
            {memberFields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end">
                <input
                  placeholder="First Name"
                  {...register(`members.${index}.firstName`)}
                  className="px-2 py-1 bg-gray-700 text-white border border-gray-600 rounded-lg"
                />
                <input
                  placeholder="Last Name"
                  {...register(`members.${index}.lastName`)}
                  className="px-2 py-1 bg-gray-700 text-white border border-gray-600 rounded-lg"
                />
                <input
                  placeholder="Phone"
                  {...register(`members.${index}.phone`)}
                  className="px-2 py-1 bg-gray-700 text-white border border-gray-600 rounded-lg"
                />
                <input
                  placeholder="Email"
                  {...register(`members.${index}.email`)}
                  className="px-2 py-1 bg-gray-700 text-white border border-gray-600 rounded-lg"
                />
                <button type="button" onClick={() => removeMember(index)} className="text-red-400 hover:underline">Remove</button>
              </div>
            ))}
            <button type="button" onClick={() => addMember({ firstName: '', lastName: '', phone: '', email: '' })} className="text-indigo-400 hover:underline mt-2">Add Member</button>
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
