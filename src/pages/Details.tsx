import { Link } from 'react-router-dom';

export default function Details() {
  return (
    <section className="remote-page">
      <h1>Remote MFE — Details</h1>
      <p>An internal route owned by the remote.</p>
      <Link to="..">← back</Link>
    </section>
  );
}
