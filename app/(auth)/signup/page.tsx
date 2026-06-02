import { Suspense } from "react";
import { LoginScreen } from "../LoginScreen";

export default function SignupPage() {
  return (
    <main style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Suspense>
        <LoginScreen mode="signup" />
      </Suspense>
    </main>
  );
}
