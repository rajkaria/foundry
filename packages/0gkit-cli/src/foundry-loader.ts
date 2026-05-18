export interface FoundryPlugin {
  name: string;
  version: string;
}

export async function loadFoundry(): Promise<FoundryPlugin | null> {
  return null;
}
