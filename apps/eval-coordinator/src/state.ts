/**
 * On-disk resumable state. The coordinator restarts cheaply by remembering
 * which forges it has already submitted scores for, and the highest block
 * we've scanned.
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import type { Address } from "viem";

export interface CoordinatorState {
  lastBlock: string; // bigint as string
  submitted: Address[];
}

export function loadState(path: string): CoordinatorState {
  if (!existsSync(path)) {
    return { lastBlock: "0", submitted: [] };
  }
  return JSON.parse(readFileSync(path, "utf-8")) as CoordinatorState;
}

export function saveState(path: string, state: CoordinatorState): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(state, null, 2));
}
