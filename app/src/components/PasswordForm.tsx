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

  return (
    <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 8, padding: '1rem' }}>
      <h2 style={{ marginTop: 0 }}>Add Password</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: '1rem' }}>
          <label>Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required style={{ padding: 8, border: '1px solid #ddd', borderRadius: 6 }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: '1rem' }}>
          <label>Password</label>
          <input value={secret} onChange={(e) => setSecret(e.target.value)} required style={{ padding: 8, border: '1px solid #ddd', borderRadius: 6 }} />
        </div>
        <button type="submit" disabled={submitting || isLoading} style={{ padding: '0.5rem 1rem', borderRadius: 6, border: '1px solid #ddd' }}>
          {isLoading ? 'Preparing...' : submitting ? 'Submitting...' : 'Save'}
        </button>
        {txHash && (
          <div style={{ marginTop: '0.5rem', fontSize: 12, color: '#4b5563' }}>Sent: {txHash}</div>
        )}
      </form>
    </div>
  );
}

