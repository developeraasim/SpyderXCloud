import { useState } from 'react';
import { CheckCircle2, MessageSquareQuote, Pause, Play, ShieldCheck } from 'lucide-react';

const REVIEW_STATES = [
  {
    title: 'Verified purchase reviews',
    text: 'Customer feedback is published only after a confirmed purchase, so every review can be tied to a genuine experience.',
    icon: CheckCircle2,
  },
  {
    title: 'No verified reviews yet',
    text: 'We have not received customer feedback that is ready to publish. New reviews will appear here after verification.',
    icon: MessageSquareQuote,
  },
  {
    title: 'Honest feedback, always',
    text: 'We do not invent customer names, ratings, or testimonials. Transparency comes before filling the slider.',
    icon: ShieldCheck,
  },
];

export default function CustomerFeedbackRail() {
  const [paused, setPaused] = useState(false);
  const items = [...REVIEW_STATES, ...REVIEW_STATES];
  const MotionIcon = paused ? Play : Pause;

  return <section className="feedback-section" aria-labelledby="feedback-title">
    <div className="container">
      <div className="feedback-heading">
        <div>
          <span className="eyebrow">Customer feedback</span>
          <h2 id="feedback-title">Real voices. Verified only.</h2>
          <p>Reviews are shown only after a confirmed purchase. No placeholder testimonials or fabricated ratings.</p>
        </div>
        <button className="feedback-toggle" type="button" aria-label={paused ? 'Play customer feedback slider' : 'Pause customer feedback slider'} aria-pressed={paused} onClick={() => setPaused(value => !value)}>
          <MotionIcon size={16} aria-hidden="true" /> <span>{paused ? 'Play' : 'Pause'} slider</span>
        </button>
      </div>
      <div className={`feedback-window ${paused ? 'is-paused' : ''}`}>
        <div className="feedback-track" aria-live="off">
          {items.map(({ title, text, icon: Icon }, index) => <article className="feedback-card" key={`${title}-${index}`} aria-hidden={index >= REVIEW_STATES.length}>
            <div className="feedback-card-icon"><Icon size={20} aria-hidden="true" /></div>
            <span className="feedback-label">REVIEW STATUS</span>
            <h3>{title}</h3>
            <p>{text}</p>
            <div className="feedback-card-footer"><span className="feedback-status-dot" /> Verified-review policy</div>
          </article>)}
        </div>
      </div>
      <p className="feedback-note">The moving cards explain our review policy; they are not customer testimonials.</p>
    </div>
  </section>;
}
