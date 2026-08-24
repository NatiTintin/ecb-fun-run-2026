import { CheckinPanel } from '@/components/admin/CheckinPanel';

export default function VerifyQrPage({ params }: { params: { token: string } }) {
  return <CheckinPanel initialToken={params.token} />;
}
