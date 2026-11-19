import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const clientConfigPath = path.join(root, "src/lib/supabase/client.ts");
const bundleRoot = path.join(root, ".output/public");
const allowedEnv = ["VITE_SUPABASE_PUBLISHABLE_KEY", "VITE_SUPABASE_URL"].sort();
const forbiddenNames = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "VITE_SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_SECRET_KEY",
  "VITE_SUPABASE_SECRET_KEY",
  "SUPABASE_DB_PASSWORD",
  "SUPABASE_ACCESS_TOKEN",
];
const forbiddenNamePattern = new RegExp("\\b(?:" + forbiddenNames.join("|") + ")\\b", "i");
const secretKeyPattern = /\bsb_secret_[A-Za-z0-9_-]+\b/i;
const jwtPattern = /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g;

function fail(message) {
  console.error("Nextdoor Plus public-bundle security check failed: " + message);
  process.exitCode = 1;
}

async function collectTextFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectTextFiles(fullPath)));
    } else if (/\.(?:[cm]?js|json|map|html|css|txt)$/i.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

function containsServiceRoleJwt(content) {
  for (const match of content.matchAll(jwtPattern)) {
    try {
      const claims = JSON.parse(Buffer.from(match[0].split(".")[1], "base64url").toString("utf8"));
      if (claims.role === "service_role") return true;
    } catch {
      // Ignore non-JWT strings that happen to match the token shape.
    }
  }
  return false;
}

try {
  const source = await readFile(clientConfigPath, "utf8");
  const references = [
    ...source.matchAll(
      /import\.meta\.env(?:\s*\.\s*([A-Za-z_$][\w$]*)|\s*\[\s*["']([^"']+)["']\s*\])/g,
    ),
  ]
    .map((match) => match[1] ?? match[2])
    .sort();

  if (JSON.stringify(references) !== JSON.stringify(allowedEnv)) {
    fail(
      "the browser Supabase client must read only " +
        allowedEnv.join(" and ") +
        "; found " +
        (references.join(", ") || "no explicit public env references") +
        ".",
    );
  }
  if (/\b(?:process\.env|Deno\.env)\b/.test(source)) {
    fail("the browser Supabase client must not read server-side environment APIs.");
  }

  const bundleStat = await stat(bundleRoot).catch(() => null);
  if (!bundleStat?.isDirectory()) {
    fail("the Nitro public output directory .output/public was not found; run the production build before this check.");
  } else {
    const files = await collectTextFiles(bundleRoot);
    if (files.length === 0) fail("no readable public client assets were found in .output/public.");
    for (const file of files) {
      const content = await readFile(file, "utf8");
      if (
        forbiddenNamePattern.test(content) ||
        secretKeyPattern.test(content) ||
        containsServiceRoleJwt(content)
      ) {
        fail(
          "possible Supabase server credential material was found in " +
            path.relative(root, file) +
            "; values are intentionally not printed.",
        );
      }
    }
    if (files.length > 0 && process.exitCode !== 1) {
      console.log(
        "Checked " +
          references.length +
          " public Supabase environment references and " +
          files.length +
          " built public assets; no service-role or secret-key material detected.",
      );
    }
  }
} catch (error) {
  fail(error instanceof Error ? error.message : "an unknown error occurred.");
}
