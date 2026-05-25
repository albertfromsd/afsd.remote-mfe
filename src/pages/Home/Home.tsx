import { Link } from 'react-router-dom';
import Page from '@/components/Page';

export default function Home() {
  return (
    <Page
      eyebrow="Remote MFE"
      title="Home"
      description="This view belongs to the remote app and is served via Module Federation."
    >
      <ul>
        <li>
          <Link to="details">Details</Link>
        </li>
        <li>
          <Link to="settings">Settings</Link>
        </li>
        <li>
          <Link to="gallery">Gallery (cart demo)</Link>
        </li>
      </ul>
    </Page>
  );
}
