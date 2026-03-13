"use client";

import { WriteEditor } from "@/components/redread/WriteEditor";
import { useAuthSafe } from "@/hooks/useAuthSafe";
import { useRouter } from "next/navigation";

export default function WritePage() {
  const userId = useAuthSafe();
  const router = useRouter();

  return <WriteEditor onExit={() => router.back()} userId={userId} />;
}
