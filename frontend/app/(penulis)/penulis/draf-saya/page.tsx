"use client";

import { redirect } from "next/navigation";

export default function DrafSayaPage() {
  // Redirect ke /penulis/draf (halaman yang sudah ada)
  redirect("/penulis/draf");
}
