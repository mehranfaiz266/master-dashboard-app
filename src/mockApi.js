export function getCampaigns() {
  return Promise.resolve([
    { id: 1, name: 'Q3 Investor Outreach' },
    { id: 2, name: 'New Homebuyer Leads' },
    { id: 3, name: 'July Listings' }
  ]);
}

export function getJustCallNumbers() {
  return Promise.resolve([
    { id: 1, number: '555-888-1111' },
    { id: 2, number: '555-888-2222' },
    { id: 3, number: '555-888-3333' },
    { id: 4, number: '555-888-4444' }
  ]);
}

export function getMembers() {
  return Promise.resolve([
    { id: 1, name: 'Alice Johnson' },
    { id: 2, name: 'Bob Smith' },
    { id: 3, name: 'Carol Lee' }
  ]);
}
