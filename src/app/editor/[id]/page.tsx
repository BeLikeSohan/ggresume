import { ResumeBuilder } from '@/components/ResumeBuilder';

interface EditorPageProps {
  params: {
    id: string;
  };
}

export default function EditorPage({ params }: EditorPageProps) {
  return <ResumeBuilder resumeId={params.id} />;
}
