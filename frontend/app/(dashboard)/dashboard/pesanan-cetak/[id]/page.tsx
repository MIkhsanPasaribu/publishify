"use client";

import { redirect } from "next/navigation";

export default function DetailPesananCetakPage({ params }: { params: { id: string } }) {
  // Redirect ke halaman penulis percetakan pesanan
  redirect(`/dashboard/penulis/percetakan/pesanan/${params.id}`);
}