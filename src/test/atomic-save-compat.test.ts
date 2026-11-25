import { describe, expect, it } from "vitest";
import { isMissingAtomicSaveRpcError } from "@/lib/supabase/atomic-save-compat";

describe("isMissingAtomicSaveRpcError", () => {
  it("recognizes a missing RPC in the PostgREST schema cache", () => {
    expect(
      isMissingAtomicSaveRpcError(
        new Error(
          "Could not find the function public.save_opportunity_to_workspace(p_workspace_id, p_opportunity_id) in the schema cache",
        ),
      ),
    ).toBe(true);
  });

  it("recognizes a PGRST202 response that names the expected function", () => {
    expect(
      isMissingAtomicSaveRpcError(
        "PGRST202: save_opportunity_to_workspace is not present in the schema cache",
      ),
    ).toBe(true);
  });

  it("does not hide authorization, validation or network failures", () => {
    expect(
      isMissingAtomicSaveRpcError(
        new Error("permission denied for function save_opportunity_to_workspace"),
      ),
    ).toBe(false);
    expect(
      isMissingAtomicSaveRpcError(new Error("The opportunity is not currently available to save.")),
    ).toBe(false);
    expect(isMissingAtomicSaveRpcError(new Error("Network request failed"))).toBe(false);
  });
});
