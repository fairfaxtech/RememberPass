import { ConnectButton } from '@rainbow-me/rainbowkit';

export function Header() {
  return (
    <header style={{
      background: 'white',
      borderBottom: '1px solid var(--color-gray-200)',
      position: 'sticky',
      top: 0,
      zIndex: 10,
      backdropFilter: 'blur(8px)',
      backgroundColor: 'rgba(255, 255, 255, 0.95)'
    }}>
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 'var(--space-4) var(--space-4)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div style={{
            width: '32px',
            height: '32px',
            background: 'linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: 'var(--font-size-lg)',
            fontWeight: 'var(--font-weight-bold)'
          }}>
            🔐
          </div>
          <div>
            <h1 style={{
              margin: 0,
              fontSize: 'var(--font-size-xl)',
              fontWeight: 'var(--font-weight-bold)',
              background: 'linear-gradient(135deg, var(--color-primary-600), var(--color-primary-700))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              RememberPass
            </h1>
            <p style={{
              margin: 0,
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-gray-500)',
              fontWeight: 'var(--font-weight-medium)'
            }}>
              Privacy-first password manager
            </p>
          </div>
        </div>
        <ConnectButton />
      </div>
    </header>
  );
}