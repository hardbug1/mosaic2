import { createClient, SupabaseClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function anonClient(): SupabaseClient {
  return createClient(URL, ANON, { auth: { persistSession: false } });
}

// 고유 이메일로 가입 후 로그인된 클라이언트 반환
export async function signUpUser(name: string): Promise<{ client: SupabaseClient; id: string }> {
  const client = anonClient();
  const email = `u_${Date.now()}_${Math.floor(Math.random() * 1e6)}@mosaictest.dev`;
  const { data, error } = await client.auth.signUp({
    email, password: "password123",
    options: { data: { name, initials: name.slice(-2), color: "#6750A4" } },
  });
  if (error) throw error;
  return { client, id: data.user!.id };
}
