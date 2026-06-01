import { Suspense } from "react";
import { AuthForm } from "../AuthForm";

export default function SignupPage() {
  return (
    <main style={{ display: "grid", placeItems: "center", height: "100%" }}>
      <Suspense><AuthForm mode="signup" /></Suspense>
    </main>
  );
}
