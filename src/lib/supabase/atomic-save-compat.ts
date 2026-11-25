export function isMissingAtomicSaveRpcError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : typeof error === "string" ? error : "";
  if (!/save_opportunity_to_workspace/i.test(message)) return false;

  return /PGRST202|could not find|does not exist|schema cache/i.test(message);
}
