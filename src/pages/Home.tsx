import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <section className="remote-page">
      <h1>Remote MFE — Home</h1>
      <p>This view belongs to the remote app and is served via Module Federation.</p>
      <ul>
        <li>
          <Link to="details">Details</Link>
        </li>
        <li>
          <Link to="settings">Settings</Link>
        </li>
      </ul>
    </section>
  );
}
