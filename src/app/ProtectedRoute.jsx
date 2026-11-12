import { Link } from '../components/Ui.jsx';
import { useAuth } from './AuthContext.jsx';

export default function ProtectedRoute({ children, onGoToLogin }) {
  const { user, loading } = useAuth();
  if (loading) return <section className="state-page"><div><div className="state-code">…</div><h1>Checking your session</h1><p>Please wait while Firebase verifies your sign-in.</p></div></section>;
  if (!user || !user.emailVerified) return <section className="state-page"><div><div className="state-code">🔒</div><h1>Verified login required</h1><p>Sign in with a verified email address to access the client dashboard and active services.</p><button className="btn btn-primary" onClick={onGoToLogin}>Sign in to continue</button><div className="protected-home-link"><Link to="home">Return to website</Link></div></div></section>;
  return children;
}
