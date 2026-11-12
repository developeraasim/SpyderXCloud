import { useState } from 'react';
import { createUserWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { ArrowLeft, ArrowRight, Eye, EyeOff, MailCheck, ShieldCheck } from 'lucide-react';
import { Link } from '../components/Ui.jsx';
import { auth, authPersistenceReady, firebaseReady } from '../app/firebaseClient.js';

const messages = {
  'auth/invalid-credential': 'Email or password is incorrect.',
  'auth/user-not-found': 'Email or password is incorrect.',
  'auth/wrong-password': 'Email or password is incorrect.',
  'auth/email-already-in-use': 'Could not create an account with those details. If you already registered, try signing in.',
  'auth/weak-password': 'Choose a password with at least 8 characters.',
  'auth/too-many-requests': 'Too many attempts. Wait a little and try again.',
  'auth/network-request-failed': 'Network issue. Check your connection and try again.',
  'auth/invalid-email': 'Enter a valid email address.',
};

function friendlyError(error) {
  if (error?.code === 'auth/operation-not-allowed') return 'Email/password sign-in is disabled in Firebase Console. Enable it under Authentication → Sign-in method.';
  return messages[error?.code] || 'We could not complete that request. Check the details and try again.';
}

export default function AuthPage({ mode = 'login', onAuthenticated }) {
  const [formMode, setFormMode] = useState(mode);
  const [status, setStatus] = useState('');
  const [statusType, setStatusType] = useState('info');
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const setMessage = (message, type = 'info') => { setStatus(message); setStatusType(type); };

  async function handleSubmit(event) {
    event.preventDefault();
    if (!firebaseReady || !auth) return setMessage('Firebase is not configured. Add the Firebase web-app values to .env and restart the app.', 'error');
    setBusy(true);
    setStatus('');
    const form = new FormData(event.currentTarget);
    const name = String(form.get('name') || '').trim();
    const email = String(form.get('email') || '').trim();
    const password = String(form.get('password') || '');

    try {
      await authPersistenceReady;
      if (formMode === 'register') {
        if (name.length < 2) throw new Error('Enter your full name.');
        if (password !== String(form.get('confirmPassword') || '')) throw new Error('Passwords do not match.');
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(credential.user, { displayName: name });
        await sendEmailVerification(credential.user);
        await signOut(auth);
        setMessage('Account created. Check your inbox and verify your email before signing in.', 'success');
        setFormMode('login');
      } else if (formMode === 'login') {
        const credential = await signInWithEmailAndPassword(auth, email, password);
        await credential.user.reload();
        if (!credential.user.emailVerified) {
          await signOut(auth);
          setMessage('Verify your email before signing in. Check your inbox for the Firebase verification link.', 'error');
          return;
        }
        await credential.user.getIdToken(true);
        onAuthenticated();
      } else {
        await sendPasswordResetEmail(auth, email);
        setMessage('If an account exists for this address, a password-reset link has been sent.', 'success');
      }
    } catch (error) {
      setMessage(error?.message && !error.code ? error.message : friendlyError(error), 'error');
    } finally {
      setBusy(false);
    }
  }

  async function resendVerification(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget.form);
    const email = String(form.get('email') || '').trim();
    const password = String(form.get('password') || '');
    if (!email || !password) return setMessage('Enter your email and password, then choose resend verification.', 'error');
    setBusy(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      await credential.user.reload();
      if (credential.user.emailVerified) {
        await signOut(auth);
        return setMessage('This email is already verified. You can sign in now.', 'success');
      }
      await sendEmailVerification(credential.user);
      await signOut(auth);
      setMessage('Verification email sent. Check your inbox and spam folder.', 'success');
    } catch (error) {
      setMessage(friendlyError(error), 'error');
    } finally {
      setBusy(false);
    }
  }

  return <section className="auth-screen">
    <div className="auth-visual"><div className="auth-visual-grid"/><div className="auth-visual-content"><a href="#/" className="auth-brand"><span className="auth-brand-mark"><ShieldCheck size={21}/></span><span><strong>SPYDER X CLOUD</strong><small>SECURE CLIENT ACCESS</small></span></a><div className="auth-promo"><span className="eyebrow">Protected workspace</span><h1>Your services.<br/><span>Your control.</span></h1><p>Sign in with a verified email to reach your private client dashboard.</p><div className="auth-promo-badges"><span><ShieldCheck size={15}/> Verified email required</span><span><MailCheck size={15}/> Firebase authentication</span></div></div><div className="auth-visual-foot">Secure access to the SPYDER X CLOUD client area.</div></div></div>
    <div className="auth-panel"><div className="auth-panel-top"><a href="#/" className="auth-back"><ArrowLeft size={15}/> Website home</a><span className="auth-encryption"><span/> Secure connection</span></div>
      <div className="auth-form-wrap"><div className="auth-form-content" key={formMode}><span className="eyebrow">{formMode === 'register' ? 'Create account' : formMode === 'forgot' ? 'Account recovery' : 'Client portal'}</span><h2>{formMode === 'register' ? 'Create your account' : formMode === 'forgot' ? 'Reset your password' : 'Welcome back'}</h2><p className="auth-form-intro">{formMode === 'register' ? 'Create an account, then verify your email to activate sign-in.' : formMode === 'forgot' ? 'We’ll send a secure password reset link to your email.' : 'Enter your credentials to continue to your dashboard.'}</p>
        {!firebaseReady && <div className="auth-status error" role="status">Firebase configuration is missing. Add the required VITE_FIREBASE_* values in .env.local, then restart Vite.</div>}
        <form className="form auth-fields" onSubmit={handleSubmit}>
          {formMode === 'register' && <div className="field"><label htmlFor="auth-name">Full name</label><input id="auth-name" name="name" type="text" placeholder="Your name" autoComplete="name" minLength={2} required disabled={busy}/></div>}
          <div className="field"><label htmlFor="auth-email">Email address</label><input id="auth-email" name="email" type="email" placeholder="you@example.com" autoComplete="email" required disabled={busy}/></div>
          {formMode !== 'forgot' && <div className="field"><div className="field-label-row"><label htmlFor="auth-password">Password</label>{formMode === 'login' && <button className="auth-inline-link" type="button" onClick={() => {setFormMode('forgot');setStatus('');}}>Forgot password?</button>}</div><div className="password-input-wrap"><input id="auth-password" name="password" type={showPassword ? 'text' : 'password'} placeholder={formMode === 'register' ? 'At least 8 characters' : 'Enter your password'} autoComplete={formMode === 'register' ? 'new-password' : 'current-password'} minLength={8} required disabled={busy}/><button type="button" className="password-toggle" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(value => !value)}>{showPassword ? <EyeOff size={17}/> : <Eye size={17}/>}</button></div></div>}
          {formMode === 'register' && <div className="field"><label htmlFor="auth-confirm">Confirm password</label><input id="auth-confirm" name="confirmPassword" type={showPassword ? 'text' : 'password'} placeholder="Repeat your password" autoComplete="new-password" minLength={8} required disabled={busy}/></div>}
          <button className="btn btn-primary btn-block auth-submit" type="submit" disabled={busy || !firebaseReady}>{busy ? 'Please wait…' : formMode === 'register' ? 'Create account' : formMode === 'forgot' ? 'Send reset link' : 'Sign in securely'} <ArrowRight size={16}/></button>
          {formMode === 'login' && <button className="auth-resend" type="button" disabled={busy || !firebaseReady} onClick={(event) => resendVerification(event)}><MailCheck size={15}/> Resend verification email</button>}
          {status && <div className={`auth-status ${statusType}`} role="status">{status}</div>}
        </form>
        <div className="auth-switch">{formMode === 'register' ? <>Already registered? <button type="button" onClick={() => {setFormMode('login');setStatus('');}}>Sign in</button></> : formMode === 'forgot' ? <>Remembered it? <button type="button" onClick={() => {setFormMode('login');setStatus('');}}>Back to sign in</button></> : <>New to SPYDER X CLOUD? <button type="button" onClick={() => {setFormMode('register');setStatus('');}}>Create account</button></>}</div>
        <p className="auth-policy-note"><ShieldCheck size={14}/> Email verification is required. Dashboard access is checked from Firebase Auth state, not the URL.</p>
      </div></div>
      <footer className="auth-panel-footer"><span>© {new Date().getFullYear()} SPYDER X CLOUD</span><Link to="privacy">Privacy</Link><Link to="terms">Terms</Link></footer>
    </div>
  </section>;
}
