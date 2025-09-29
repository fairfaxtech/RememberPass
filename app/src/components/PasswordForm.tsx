import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Contract, Wallet, ethers } from 'ethers';
import { useEthersSigner } from '../hooks/useEthersSigner';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contracts';
import { useZamaInstance } from '../hooks/useZamaInstance';
import { encryptStringWithKey } from '../utils/crypto';

export function PasswordForm() {
  const { address } = useAccount();
  const signerPromise = useEthersSigner();
  const { instance, isLoading } = useZamaInstance();

  const [title, setTitle] = useState('');
  const [secret, setSecret] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return alert('Connect wallet');
    if (!instance) return alert('Encryption service not ready');
    if (!CONTRACT_ADDRESS) return alert('Contract not configured');

    setSubmitting(true);
    setTxHash(null);

    try {
      // 1) Generate random EVM address as key
      const randomWallet = Wallet.createRandom();
      const keyAddress = randomWallet.address; // string like 0x...

      // 2) Client-side encrypt the secret using the address bytes
      const cipher = await encryptStringWithKey(secret, keyAddress);

      // 3) FHE encrypt key address as uint256 (lower 160 bits)
      const keyUint256 = BigInt(ethers.getAddress(keyAddress));
      const input = instance.createEncryptedInput(CONTRACT_ADDRESS, address);
      input.add256(keyUint256);
      const encryptedInput = await input.encrypt();

      // 4) Write to contract via ethers
      const signer = await signerPromise;
      if (!signer) throw new Error('No signer');
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.addRecord(title, cipher, encryptedInput.handles[0], encryptedInput.inputProof);
      const receipt = await tx.wait();
      setTxHash(receipt?.hash || tx.hash);

      // reset
      setTitle('');
      setSecret('');
    } catch (err: any) {
      console.error(err);
      alert(err?.message || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  if (!address) {
    return (
      <div className="card-body" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
        <div style={{ fontSize: 'var(--font-size-4xl)', marginBottom: 'var(--space-4)' }}>🔗</div>
        <h3 style={{
          fontSize: 'var(--font-size-xl)',
          fontWeight: 'var(--font-weight-semibold)',
          color: 'var(--color-gray-700)',
          margin: '0 0 var(--space-3) 0'
        }}>
          Connect Your Wallet
        </h3>
        <p style={{
          color: 'var(--color-gray-500)',
          margin: 0,
          lineHeight: 'var(--line-height-relaxed)'
        }}>
          Connect your Web3 wallet to start securely storing your passwords on the blockchain.
        </p>
      </div>
    );
  }

  return (
    <div className="card-body">
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h2 style={{
          fontSize: 'var(--font-size-xl)',
          fontWeight: 'var(--font-weight-semibold)',
          color: 'var(--color-gray-900)',
          margin: '0 0 var(--space-2) 0'
        }}>
          Add New Password
        </h2>
        <p style={{
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-gray-600)',
          margin: 0,
          lineHeight: 'var(--line-height-relaxed)'
        }}>
          Your password will be encrypted with military-grade security before being stored on the blockchain.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        <div className="form-group">
          <label className="form-label">
            Service Title *
          </label>
          <input
            className="form-input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Gmail, GitHub, Netflix..."
            required
          />
          <p style={{
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-gray-500)',
            margin: 'var(--space-1) 0 0 0'
          }}>
            A descriptive name for this password entry
          </p>
        </div>

        <div className="form-group">
          <label className="form-label">
            Password *
          </label>
          <div style={{ position: 'relative' }}>
            <input
              className="form-input"
              type={showPassword ? 'text' : 'password'}
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Enter your password"
              required
              style={{ paddingRight: 'var(--space-12)' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: 'var(--space-3)',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-gray-500)',
                fontSize: 'var(--font-size-sm)',
                padding: 'var(--space-1)'
              }}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
          <p style={{
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-gray-500)',
            margin: 'var(--space-1) 0 0 0'
          }}>
            This will be encrypted before storage - even we can't see it
          </p>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
          paddingTop: 'var(--space-4)',
          borderTop: '1px solid var(--color-gray-200)'
        }}>
          <button
            type="submit"
            disabled={submitting || isLoading}
            className={`btn ${submitting || isLoading ? 'btn-secondary' : 'btn-primary'} btn-lg`}
            style={{ width: '100%' }}
          >
            {isLoading ? (
              <>
                <div className="loading-spinner"></div>
                Preparing encryption...
              </>
            ) : submitting ? (
              <>
                <div className="loading-spinner"></div>
                Encrypting & storing...
              </>
            ) : (
              <>
                🔒 Encrypt & Save Password
              </>
            )}
          </button>

          {txHash && (
            <div className="alert alert-success">
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <span>✅</span>
                <div>
                  <div style={{ fontWeight: 'var(--font-weight-medium)' }}>
                    Password saved successfully!
                  </div>
                  <div style={{
                    fontSize: 'var(--font-size-xs)',
                    fontFamily: 'var(--font-family-mono)',
                    wordBreak: 'break-all',
                    marginTop: 'var(--space-1)'
                  }}>
                    Transaction: {txHash}
                  </div>
                </div>
              </div>
            </div>
          )}

          {(isLoading || submitting) && (
            <div style={{
              padding: 'var(--space-4)',
              backgroundColor: 'var(--color-primary-50)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-primary-200)'
            }}>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-primary-700)' }}>
                <div style={{ fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--space-2)' }}>
                  🔐 Encryption Process
                </div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-primary-600)' }}>
                  {isLoading && "Setting up encryption keys..."}
                  {submitting && "Encrypting password and storing on blockchain..."}
                </div>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

