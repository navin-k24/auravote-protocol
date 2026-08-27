import { poseidonHash2 } from "./poseidon";

export interface MerkleProof {
  path: string[];
  indices: boolean[]; // true = right sibling, false = left sibling
  root: string;
}

export class MerkleTree {
  private depth: number;
  private leaves: string[];
  private layers: string[][];

  constructor(depth: number = 8, initialLeaves: string[] = []) {
    this.depth = depth;
    this.leaves = [...initialLeaves];
    this.layers = [];
    this.buildTree();
  }

  private getZeroHash(level: number): string {
    let hash = "0x0000000000000000000000000000000000000000000000000000000000000000";
    for (let i = 0; i < level; i++) {
      hash = poseidonHash2(hash, hash);
    }
    return hash;
  }

  private buildTree(): void {
    const totalLeaves = 1 << this.depth;
    const currentLayer: string[] = [];

    for (let i = 0; i < totalLeaves; i++) {
      currentLayer.push(this.leaves[i] || this.getZeroHash(0));
    }

    this.layers = [currentLayer];

    for (let d = 0; d < this.depth; d++) {
      const prevLayer = this.layers[d];
      const nextLayer: string[] = [];

      for (let i = 0; i < prevLayer.length; i += 2) {
        const left = prevLayer[i];
        const right = prevLayer[i + 1] || this.getZeroHash(d);
        nextLayer.push(poseidonHash2(left, right));
      }

      this.layers.push(nextLayer);
    }
  }

  public getRoot(): string {
    return this.layers[this.depth][0];
  }

  public insertLeaf(leaf: string): number {
    const index = this.leaves.length;
    if (index >= (1 << this.depth)) {
      throw new Error("Merkle tree capacity exceeded");
    }
    this.leaves.push(leaf);
    this.buildTree();
    return index;
  }

  public getProof(index: number): MerkleProof {
    if (index < 0 || index >= (1 << this.depth)) {
      throw new Error("Index out of bounds");
    }

    const path: string[] = [];
    const indices: boolean[] = [];
    let currentIndex = index;

    for (let d = 0; d < this.depth; d++) {
      const isRight = currentIndex % 2 === 1;
      const siblingIndex = isRight ? currentIndex - 1 : currentIndex + 1;
      const sibling = this.layers[d][siblingIndex] || this.getZeroHash(d);

      path.push(sibling);
      indices.push(isRight);
      currentIndex = Math.floor(currentIndex / 2);
    }

    return {
      path,
      indices,
      root: this.getRoot()
    };
  }

  public static verifyProof(leaf: string, proof: MerkleProof): boolean {
    let current = leaf;
    for (let i = 0; i < proof.path.length; i++) {
      const sibling = proof.path[i];
      const isRight = proof.indices[i];
      if (isRight) {
        current = poseidonHash2(sibling, current);
      } else {
        current = poseidonHash2(current, sibling);
      }
    }
    return current === proof.root;
  }
}