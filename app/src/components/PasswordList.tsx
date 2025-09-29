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

  if (!address) {
    return <div style={{ padding: '1rem' }}>Connect wallet to view your passwords.</div>;
  }

  if (!items.length) {
    return <div style={{ padding: '1rem' }}>No passwords found.</div>;
  }

  return (
    <div style={{ display: 'grid', gap: '0.75rem' }}>
      {items.map((rec, idx) => (
        <div key={idx} style={{ border: '1px solid #eee', borderRadius: 8, padding: '0.75rem', background: '#fff' }}>
          <div style={{ fontWeight: 600 }}>{rec[0]}</div>
          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>Encrypted: {rec[1].slice(0, 32)}...</div>
          <div style={{ marginTop: 8 }}>
            {decValues[idx] ? (
              <div>
                <span style={{ fontWeight: 600 }}>Password: </span>
                <span>{decValues[idx]}</span>
              </div>
            ) : (
              <button onClick={() => onDecrypt(idx, rec)} disabled={busy === idx} style={{ padding: '0.4rem 0.8rem', border: '1px solid #ddd', borderRadius: 6 }}>
                {busy === idx ? 'Decrypting...' : 'Decrypt'}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

