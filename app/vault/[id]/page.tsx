import { VaultDetailView } from "@/components/vault/vault-detail-view";

type VaultPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function VaultPage({ params }: VaultPageProps) {
  const { id } = await params;

  return <VaultDetailView id={id} />;
}
