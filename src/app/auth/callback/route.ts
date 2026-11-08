import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeNext } from "@/lib/auth-utils";

// Google (via Supabase) sends the browser back here with a one-time code, for both
// "Continue with Google" and "Connect Google" in Settings. The code is swapped for a
// session cookie (PKCE), then the user goes on to `next`, which must be a local path.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const next = safeNext(searchParams.get("next"));
  const back = next.startsWith("/app/settings") ? next.split("?")[0] : "/login";

  if (searchParams.get("error")) {
    // The user cancelled on Google's screen, or the provider refused.
    return NextResponse.redirect(`${origin}${back}?oauth=cancelled`);
  }
  const code = searchParams.get("code");
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }
  return NextResponse.redirect(`${origin}${back}?oauth=failed`);
}
