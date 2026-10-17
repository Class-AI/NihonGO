import { notFound } from "next/navigation";
import { units } from "@/data";
import ReviewClient from "./ReviewClient";

export function generateStaticParams() {
  return units.map((u) => ({ unit: String(u.id) }));
}

export default async function ReviewPage({ params }: { params: Promise<{ unit: string }> }) {
  const { unit } = await params;
  const id = Number(unit);
  if (!units.some((u) => u.id === id)) notFound();
  return <ReviewClient unitId={id} />;
}
