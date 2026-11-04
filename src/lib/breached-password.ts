import "server-only";
import { createHash } from "node:crypto";

/**
 * True when the password appears in a public breach corpus (Have I Been Pwned's range API).
 * k-anonymity: only the first 5 hex chars of the SHA-1 leave the server, never the password.
 * Fails open (returns false) when the service is slow or down, so sign-up never blocks on it.
 */
export async function isBreachedPassword(password: string): Promise<boolean> {
  const sha1 = createHash("sha1").update(password).digest("hex").toUpperCase();
  const prefix = sha1.slice(0, 5);
  const suffix = sha1.slice(5);
  try {
    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: { "add-padding": "true" },
      signal: AbortSignal.timeout(2500),
    });
    if (!res.ok) return false;
    const body = await res.text();
    return body.split("\n").some((line) => {
      const [hash, count] = line.trim().split(":");
      return hash === suffix && Number(count) > 0;
    });
  } catch {
    return false;
  }
}
