import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// 초대 링크 합류: 비로그인 → 로그인 후 복귀, 로그인 → 토큰으로 멤버 합류 후 보드로.
export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?redirect=/invite/${token}`);
  }

  const { data: boardId, error } = await supabase.rpc("join_board_via_token", {
    p_token: token,
  });

  if (error || !boardId) {
    redirect(`/boards?invite=invalid`);
  }

  redirect(`/boards/${boardId}`);
}
