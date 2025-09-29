import { useMemo, useState } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contracts';
import { useZamaInstance } from '../hooks/useZamaInstance';
import { useEthersSigner } from '../hooks/useEthersSigner';
import { decryptStringWithKey } from '../utils/crypto';

type ChainRecord = [string, string, string]; // title, cipher, key handle (bytes32 string)

export function PasswordList() {
  const { address } = useAccount();
  const { instance } = useZamaInstance();
  const signerPromise = useEthersSigner();

  const { data } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getAllRecords',
    args: address && CONTRACT_ADDRESS ? [address] : undefined,
    query: { enabled: !!address && !!CONTRACT_ADDRESS },
  });

  const items = useMemo(() => {
    if (!data) return [] as ChainRecord[];
    const titles = data[0] as string[];
    const ciphers = data[1] as string[];
    const keys = data[2] as string[]; // euint256 handles bytes32
    return titles.map((t, i) => [t, ciphers[i], keys[i]] as ChainRecord);
  }, [data]);

  const [decValues, setDecValues] = useState<Record<number, string>>({});
  const [busy, setBusy] = useState<number | null>(null);
  const [copySuccess, setCopySuccess] = useState<number | null>(null);

  const onDecrypt = async (idx: number, rec: ChainRecord) => {
    if (!instance || !address) return alert('Missing instance or wallet');
    setBusy(idx);
    try {
      // 1) Prepare handles for user decryption
      const handleContractPairs = [
        { handle: rec[2], contractAddress: CONTRACT_ADDRESS }
      ];
      const start = Math.floor(Date.now() / 1000).toString();
      const durationDays = '10';
      const contractAddresses = [CONTRACT_ADDRESS];

      const keypair = instance.generateKeypair();
      const eip712 = instance.createEIP712(keypair.publicKey, contractAddresses, start, durationDays);
      const signer = await signerPromise;
      if (!signer) throw new Error('No signer');
      const sig = await signer.signTypedData(
        eip712.domain,
        { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
        eip712.message,
      );

      const result = await instance.userDecrypt(
        handleContractPairs,
        keypair.privateKey,
        keypair.publicKey,
        sig.replace('0x', ''),
        contractAddresses,
        address,
        start,
        durationDays,
      );

      const keyUint256Str = result[rec[2]] as string; // decimal string
      // Convert uint256 decimal to hex address (lower 160 bits)
      const big = BigInt(keyUint256Str);
      const hex = '0x' + (big & ((1n << 160n) - 1n)).toString(16).padStart(40, '0');

      const plain = await decryptStringWithKey(rec[1], hex);
      setDecValues((prev) => ({ ...prev, [idx]: plain }));
    } catch (e: any) {
      console.error(e);
      alert(e?.message || 'Decrypt failed');
    } finally {
      setBusy(null);
    }
  };

  const copyToClipboard = async (password: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(password);
      setCopySuccess(idx);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
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
          Connect your Web3 wallet to view your encrypted passwords.
        </p>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="card-body" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
        <div style={{ fontSize: 'var(--font-size-4xl)', marginBottom: 'var(--space-4)' }}>📭</div>
        <h3 style={{
          fontSize: 'var(--font-size-xl)',
          fontWeight: 'var(--font-weight-semibold)',
          color: 'var(--color-gray-700)',
          margin: '0 0 var(--space-3) 0'
        }}>
          No Passwords Yet
        </h3>
        <p style={{
          color: 'var(--color-gray-500)',
          margin: 0,
          lineHeight: 'var(--line-height-relaxed)'
        }}>
          Add your first password to get started with secure blockchain storage.
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
          Your Passwords
        </h2>
        <p style={{
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-gray-600)',
          margin: 0,
          lineHeight: 'var(--line-height-relaxed)'
        }}>
          {items.length} password{items.length !== 1 ? 's' : ''} stored securely on the blockchain
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {items.map((rec, idx) => (
          <div key={idx} className="card" style={{
            padding: 'var(--space-5)',
            transition: 'all var(--transition-fast)',
            cursor: 'pointer'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: 'var(--space-3)'
            }}>
              <div>
                <h3 style={{
                  fontSize: 'var(--font-size-lg)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--color-gray-900)',
                  margin: 0,
                  marginBottom: 'var(--space-1)'
                }}>
                  {rec[0]}
                </h3>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-gray-500)'
                }}>
                  <span className="badge badge-primary">🔐 Encrypted</span>
                </div>
              </div>

              {decValues[idx] && (
                <button
                  onClick={() => copyToClipboard(decValues[idx], idx)}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}
                >
                  {copySuccess === idx ? (
                    <>
                      ✅ <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      📋 <span>Copy</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <div style={{
              padding: 'var(--space-4)',
              backgroundColor: 'var(--color-gray-50)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-gray-200)'
            }}>
              {decValues[idx] ? (
                <div>
                  <div style={{
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-gray-600)',
                    marginBottom: 'var(--space-2)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Decrypted Password
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-family-mono)',
                    fontSize: 'var(--font-size-base)',
                    color: 'var(--color-gray-900)',
                    backgroundColor: 'white',
                    padding: 'var(--space-3)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-gray-300)',
                    wordBreak: 'break-all'
                  }}>
                    {decValues[idx]}
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-gray-600)',
                    marginBottom: 'var(--space-2)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Password Preview
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-family-mono)',
                    fontSize: 'var(--font-size-base)',
                    color: 'var(--color-gray-400)',
                    backgroundColor: 'white',
                    padding: 'var(--space-3)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-gray-300)',
                    letterSpacing: '0.1em'
                  }}>
                    ••••••••••••••••
                  </div>
                </div>
              )}
            </div>

            <div style={{
              marginTop: 'var(--space-4)',
              display: 'flex',
              gap: 'var(--space-3)'
            }}>
              {!decValues[idx] ? (
                <button
                  onClick={() => onDecrypt(idx, rec)}
                  disabled={busy === idx}
                  className={`btn ${busy === idx ? 'btn-secondary' : 'btn-primary'}`}
                  style={{ flex: 1 }}
                >
                  {busy === idx ? (
                    <>
                      <div className="loading-spinner"></div>
                      Decrypting...
                    </>
                  ) : (
                    <>
                      🔓 Decrypt Password
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={() => setDecValues(prev => {
                    const newValues = { ...prev };
                    delete newValues[idx];
                    return newValues;
                  })}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  🔒 Hide Password
                </button>
              )}
            </div>

            {busy === idx && (
              <div style={{
                marginTop: 'var(--space-4)',
                padding: 'var(--space-4)',
                backgroundColor: 'var(--color-primary-50)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-primary-200)'
              }}>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-primary-700)' }}>
                  <div style={{ fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--space-2)' }}>
                    🔐 Decryption Process
                  </div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-primary-600)' }}>
                    Retrieving and decrypting your password from the blockchain...
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

