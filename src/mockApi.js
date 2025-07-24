export function getCampaigns() {
  return Promise.resolve([
    { id: 1, name: 'Q3 Investor Outreach', clientId: 1 },
    { id: 2, name: 'New Homebuyer Leads', clientId: 2 },
    { id: 3, name: 'July Listings', clientId: 3 },
    { id: 4, name: 'Expired Listings', clientId: null }
  ]);
}

export function getJustCallNumbers() {
  return Promise.resolve([
    { id: 1, number: '555-888-1111', clientId: 1 },
    { id: 2, number: '555-888-2222', clientId: 2 },
    { id: 3, number: '555-888-3333', clientId: 3 },
    { id: 4, number: '555-888-4444', clientId: null },
    { id: 5, number: '555-888-5555', clientId: null }
  ]);
}

export function getMembers() {
  return Promise.resolve([
    { id: 1, firstName: 'Alice', lastName: 'Johnson', phone: '555-111-0001', email: 'alice@example.com' },
    { id: 2, firstName: 'Bob', lastName: 'Smith', phone: '555-111-0002', email: 'bob@example.com' },
    { id: 3, firstName: 'Carol', lastName: 'Lee', phone: '555-111-0003', email: 'carol@example.com' }
  ]);
}
