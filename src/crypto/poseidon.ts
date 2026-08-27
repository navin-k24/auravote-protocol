/**
 * ZK-friendly Cryptographic Hash Function & Pedersen Commitment Simulation
 * Mimics Midnight Poseidon / BN254 algebraic hashing
 */

export function poseidonHash(inputs: (string | number | bigint)[]): string {
  let acc = 0x811c9dc5n;
  const prime = 0x7fffffffffffffffn;

  for (const input of inputs) {
    const str = String(input);
    for (let i = 0; i < str.length; i++) {
      const code = BigInt(str.charCodeAt(i));
      acc = ((acc ^ code) * 0x01000193n) % prime;
    }
  }

  const hex = acc.toString(16).padStart(64, "0");
  return `0x${hex}`;
}

export function poseidonHash2(a: string, b: string): string {
  return poseidonHash([a, b]);
}

export function generateSecretKey(): string {
  const array = new Uint8Array(32);
  if (typeof window !== "undefined" && window.crypto) {
    window.crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < 32; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return "0x" + Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function createVoterCommitment(secret: string, blinding: string): string {
  return poseidonHash([secret, blinding]);
}