import Link from "next/link";
import { Brand } from "@/components/brand";
export default function Home() {
  return (
    <div className="landing">
      <header className="topbar">
        <Brand />
        <nav aria-label="Main navigation">
          <a href="#approach">The approach</a>
          <Link href="/dashboard" className="pill">
            Explore demo <span aria-hidden>↗</span>
          </Link>
        </nav>
      </header>
      <main id="main">
        <section className="hero">
          <p className="eyebrow">
            <span className="dot" /> YOUR PERSONAL AI CAREER CONCIERGE
          </p>
          <h1>
            Your ambition.
            <br />
            <em>A clearer direction.</em>
          </h1>
          <p className="intro">
            Connect who you are with who you want to become.
            <br />
            One thoughtful next step at a time.
          </p>
          <div className="actions">
            <Link className="button primary" href="/dashboard">
              Find your next move <span aria-hidden>↗</span>
            </Link>
            <a className="button secondary" href="#approach">
              Meet your concierge <span aria-hidden>↓</span>
            </a>
          </div>
          <p className="caption">
            A guided preview · No sign-up or API key needed
          </p>
        </section>
        <section className="preview" aria-label="Career concierge preview">
          <div className="preview-top">
            <span>YOUR CAREER, IN FOCUS</span>
            <span className="status">
              <span className="dot" /> DEMO WORKSPACE
            </span>
          </div>
          <div className="preview-body">
            <div>
              <p className="eyebrow">01 / THE NEXT RIGHT STEP</p>
              <h2>
                Less searching.
                <br />
                <em>More becoming.</em>
              </h2>
              <p className="muted">
                Your skills, goals, and opportunities.
                <br />
                Finally, part of the same conversation.
              </p>
            </div>
            <article className="recommendation">
              <div className="mini-label">✦ &nbsp; CONCIERGE INSIGHT</div>
              <h3>
                Turn your React skills
                <br />
                into something real.
              </h3>
              <p>
                Build a small project, practice the fundamentals, and move
                closer to your first frontend role.
              </p>
              <div className="divider" />
              <div className="card-foot">
                <span>Designed around your goal</span>
                <Link href="/dashboard" aria-label="Open demo workspace">
                  ↗
                </Link>
              </div>
            </article>
          </div>
        </section>
        <section id="approach" className="approach">
          <p className="eyebrow">A LITTLE CLARITY GOES A LONG WAY</p>
          <h2>
            Know me. Guide me.
            <br />
            <em>Grow with me.</em>
          </h2>
          <div className="steps">
            {[
              [
                "01",
                "Understand you",
                "Bring your skills, experience, and ambitions into one career profile.",
              ],
              [
                "02",
                "Connect the dots",
                "See how your strengths connect to roles, and what is still missing.",
              ],
              [
                "03",
                "Make your next move",
                "Follow a focused plan that evolves as you learn and build.",
              ],
            ].map(([n, title, body]) => (
              <article key={n}>
                <span className="step-number">{n}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <footer>
        <Brand />
        <span>Know me. Guide me. Grow with me.</span>
        <span>Prototype foundation / 2026</span>
      </footer>
    </div>
  );
}
