import { useState } from 'react';
import { Header } from './Header';
import { PasswordForm } from './PasswordForm';
import { PasswordList } from './PasswordList';

export function PasswordApp() {
  const [activeTab, setActiveTab] = useState<'add' | 'list'>('add');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-gray-50)' }}>
      <Header />

      <main className="container-md" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-8)' }}>
        {/* Hero Section */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            backgroundColor: 'var(--color-primary-50)',
            color: 'var(--color-primary-700)',
            padding: 'var(--space-2) var(--space-4)',
            borderRadius: 'var(--radius-xl)',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-weight-medium)',
            marginBottom: 'var(--space-6)',
            border: '1px solid var(--color-primary-200)'
          }}>
            🛡️ Zero-knowledge encryption powered by FHEVM
          </div>

          <h2 style={{
            fontSize: 'var(--font-size-3xl)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--color-gray-900)',
            margin: '0 0 var(--space-4) 0',
            lineHeight: 'var(--line-height-tight)'
          }}>
            Your passwords, completely private
          </h2>

          <p style={{
            fontSize: 'var(--font-size-lg)',
            color: 'var(--color-gray-600)',
            margin: 0,
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto',
            lineHeight: 'var(--line-height-relaxed)'
          }}>
            Store and manage your passwords with military-grade encryption. Even we can't see your data.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="nav-tabs" style={{ justifyContent: 'center' }}>
          <button
            className={`nav-tab ${activeTab === 'add' ? 'active' : ''}`}
            onClick={() => setActiveTab('add')}
          >
            <span style={{ marginRight: 'var(--space-2)' }}>➕</span>
            Add Password
          </button>
          <button
            className={`nav-tab ${activeTab === 'list' ? 'active' : ''}`}
            onClick={() => setActiveTab('list')}
          >
            <span style={{ marginRight: 'var(--space-2)' }}>📋</span>
            My Passwords
          </button>
        </div>

        {/* Content Area */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--color-gray-200)',
          overflow: 'hidden'
        }}>
          {activeTab === 'add' ? <PasswordForm /> : <PasswordList />}
        </div>

        {/* Security Notice */}
        <div style={{
          marginTop: 'var(--space-8)',
          padding: 'var(--space-6)',
          backgroundColor: 'var(--color-amber-50)',
          border: '1px solid var(--color-amber-200)',
          borderRadius: 'var(--radius-lg)',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: 'var(--font-size-2xl)',
            marginBottom: 'var(--space-3)'
          }}>
            ⚠️
          </div>
          <h3 style={{
            fontSize: 'var(--font-size-lg)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--color-amber-800)',
            margin: '0 0 var(--space-2) 0'
          }}>
            Security Notice
          </h3>
          <p style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-amber-700)',
            margin: 0,
            lineHeight: 'var(--line-height-relaxed)'
          }}>
            This is experimental software. Please use only test passwords and ensure you have backup access to your accounts.
          </p>
        </div>
      </main>
    </div>
  );
}

