import { Link } from 'react-router-dom';

export default function Settings() {
  return (
    <section className="remote-page">
      <h1>Remote MFE — Settings</h1>
      <p>Another internal route owned by the remote.</p>
      <Link to="..">← back</Link>
    </section>
  );
}
