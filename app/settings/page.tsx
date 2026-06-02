import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SettingsClient } from "./SettingsClient";

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, initials, color, bio")
    .eq("id", user.id)
    .single();

  const userName =
    profile?.name ??
    user.user_metadata?.name ??
    user.email?.split("@")[0] ??
    "사용자";

  return (
    <SettingsClient
      userId={user.id}
      initialName={userName}
      initialInitials={profile?.initials ?? userName.slice(-2)}
      initialColor={profile?.color ?? "#6750A4"}
      initialBio={profile?.bio ?? ""}
      email={user.email ?? ""}
    />
  );
}
