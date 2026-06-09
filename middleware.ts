import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  if (!user) {
    if (pathname.startsWith("/parent") && !pathname.startsWith("/parent/login")) {
      return NextResponse.redirect(new URL("/parent/login", request.url));
    }
    if (pathname.startsWith("/player") && !pathname.startsWith("/player/login")) {
      return NextResponse.redirect(new URL("/player/login", request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/parent/:path*", "/player/:path*"],
};
