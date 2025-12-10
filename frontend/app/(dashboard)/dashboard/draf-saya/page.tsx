"use client";

import { redirect } from "next/navigation";

export default function DrafSayaPage() {
  // Redirect ke /dashboard/draf (halaman yang sudah ada)
  redirect("/dashboard/draf");
}
