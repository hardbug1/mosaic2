"use client";
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { deriveInitials, pickColor } from "@/lib/profile";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const params = useSearchParams();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError(null);
    const supabase = createClient();
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { name, initials: deriveInitials(name), color: pickColor(email) } },
      });
      if (error) { setError(error.message); setBusy(false); return; }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setError(error.message); setBusy(false); return; }
    }
    // 내부 경로만 허용 (오픈 리다이렉트 방지)
    const redirect = params.get("redirect");
    router.push(redirect && redirect.startsWith("/") ? redirect : "/boards");
    router.refresh();
  };

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16, width: 360 }}>
      <h1 className="md-headline-small">{mode === "signup" ? "모자이크 가입" : "모자이크 로그인"}</h1>
      {mode === "signup" && (
        <input required placeholder="이름" value={name} onChange={(e) => setName(e.target.value)} />
      )}
      <input required type="email" placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input required type="password" placeholder="비밀번호 (6자 이상)" value={password} onChange={(e) => setPassword(e.target.value)} />
      {error && <div style={{ color: "var(--md-sys-color-error)" }}>{error}</div>}
      <button disabled={busy} type="submit">{busy ? "처리 중…" : (mode === "signup" ? "가입" : "로그인")}</button>
      <a href={mode === "signup" ? "/login" : "/signup"}>
        {mode === "signup" ? "이미 계정이 있나요? 로그인" : "계정이 없나요? 가입"}
      </a>
    </form>
  );
}
