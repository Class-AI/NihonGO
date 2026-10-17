import { notFound } from "next/navigation";
import { allGrammar, getGrammar } from "@/data";
import GrammarLesson from "./GrammarLesson";

export function generateStaticParams() {
  return allGrammar.map((g) => ({ id: g.id }));
}

export default async function GrammarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const g = getGrammar(id);
  if (!g) notFound();
  const next = allGrammar[g.index + 1];
  const isLastInUnit = !next || next.unit !== g.unit;
  return <GrammarLesson id={g.id} nextHref={isLastInUnit ? `/review/${g.unit}` : `/grammar/${next.id}`} nextLabel={isLastInUnit ? `Set ${g.unit} combined exam` : next.title} />;
}
