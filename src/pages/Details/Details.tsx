import { Link } from 'react-router-dom';
import Page from '@/components/Page';

export default function Details() {
  return (
    <Page eyebrow="Remote MFE" title="Details" description="An internal route owned by the remote.">
      <Link to="..">← back</Link>
    </Page>
  );
}
