import { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { PasswordForm } from './PasswordForm';
import { PasswordList } from './PasswordList';

export function PasswordApp() {
  const [activeTab, setActiveTab] = useState<'add' | 'list'>('add');

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>RememberPass</h1>
        <ConnectButton />
      </div>

      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('add')}
          style={{ padding: '0.5rem 1rem', borderRadius: 6, border: '1px solid #ddd', background: activeTab === 'add' ? '#e5e7eb' : '#fff' }}
        >
          Add Password
        </button>
        <button
          onClick={() => setActiveTab('list')}
          style={{ padding: '0.5rem 1rem', borderRadius: 6, border: '1px solid #ddd', background: activeTab === 'list' ? '#e5e7eb' : '#fff' }}
        >
          My Passwords
        </button>
      </div>

      <div style={{ marginTop: '1rem' }}>
        {activeTab === 'add' ? <PasswordForm /> : <PasswordList />}
      </div>
    </div>
  );
}

