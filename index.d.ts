interface Window {
  ethereum: any;
  vultiConnect: { getVaults: () => Promise<VaultProps[]> };
}
