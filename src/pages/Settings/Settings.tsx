import { Link } from 'react-router-dom';
import Page from '@/components/Page';

export default function Settings() {
  return (
    <Page
      eyebrow="Remote MFE"
      title="Settings"
      description="Another internal route owned by the remote."
    >
      <Link to="..">← back</Link>
    </Page>
  );
}
