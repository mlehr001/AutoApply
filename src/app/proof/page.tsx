"use client";

import { useEffect } from "react";
import "./page.css";

export default function ProofPage() {
  // Scroll-reveal animation for timeline items
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll(".tl-item").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* NAV */}
      <nav className="proof-nav">
        <a href="#" className="proof-nav-logo">Marc Lehrmann<span style={{ color: "#fff", opacity: 0.4 }}>.</span></a>
        <ul className="proof-nav-links">
          <li><a href="#about">About</a></li>
          <li><a href="#experience">Experience</a></li>
          <li><a href="#skills">Skills</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
        <a href="#contact" className="proof-nav-cta">Book a Call</a>
      </nav>

      <div className="proof-page">

        {/* ── SIDEBAR ── */}
        <aside className="proof-sidebar">

          <div className="photo-wrap">
            <div className="photo-circle">
              <div className="photo-placeholder-inner">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>
                <span>Add photo</span>
              </div>
            </div>
          </div>

          <div className="sidebar-identity">
            <div className="si-name">Marc Lehrmann</div>
            <div className="si-title">Strategic Partnerships<br />Enterprise Sales</div>
          </div>

          <div className="status-badge">
            <span className="status-dot" />
            Open to New Roles
          </div>

          {/* Contact */}
          <div className="sb-section">
            <div className="sb-heading">Contact</div>
            <div className="sb-item">
              <div className="sb-item-label">Phone</div>
              <div className="sb-item-value">909-573-5840</div>
            </div>
            <div className="sb-item">
              <div className="sb-item-label">Email</div>
              <div className="sb-item-value">
                <a href="mailto:mlehr001@gmail.com">mlehr001@gmail.com</a>
              </div>
            </div>
            <div className="sb-item">
              <div className="sb-item-label">LinkedIn</div>
              <div className="sb-item-value">
                <a href="https://linkedin.com/in/marclehrmann" target="_blank" rel="noreferrer">linkedin.com/in/marclehrmann</a>
              </div>
            </div>
            <div className="sb-item">
              <div className="sb-item-label">GitHub</div>
              <div className="sb-item-value">
                <a href="https://github.com/mlehr001" target="_blank" rel="noreferrer">github.com/mlehr001</a>
              </div>
            </div>
            <div className="sb-item">
              <div className="sb-item-label">Location</div>
              <div className="sb-item-value">Southern California<br />Open to Remote &amp; Hybrid</div>
            </div>
          </div>

          {/* Stats */}
          <div className="sb-section">
            <div className="sb-heading">By the Numbers</div>
            <div className="stat-row">
              <div className="stat-box"><div className="stat-num">$25M+</div><div className="stat-label">Career Revenue</div></div>
              <div className="stat-box"><div className="stat-num">10+</div><div className="stat-label">Yrs Enterprise</div></div>
              <div className="stat-box"><div className="stat-num">7</div><div className="stat-label">Apps Built</div></div>
              <div className="stat-box"><div className="stat-num">3</div><div className="stat-label">Industries</div></div>
            </div>
          </div>

          {/* Education */}
          <div className="sb-section">
            <div className="sb-heading">Education</div>
            <div className="edu-year">2012</div>
            <div className="edu-degree">Bachelor of Arts: Economics</div>
            <div className="edu-school">University of California, Riverside</div>
          </div>

          {/* Skills */}
          <div className="sb-section">
            <div className="sb-heading">Skills</div>
            <ul className="proof-skills-list">
              <li>New Business Development</li>
              <li>Strategic Partnerships</li>
              <li>Enterprise Sales Motion</li>
              <li>Channel &amp; Distributor Programs</li>
              <li>CRM Management</li>
              <li>Negotiation &amp; Deal Structuring</li>
              <li>Solution Selling</li>
              <li>AI Platform Fluency</li>
              <li>Product Development</li>
              <li>Industrial IoT / OT-IT Convergence</li>
              <li>Data Analysis / Excel</li>
            </ul>
          </div>

          {/* Book call */}
          <div className="sb-section">
            <div className="sb-heading">Let&apos;s Connect</div>
            <a href="https://calendly.com/yourlink" target="_blank" rel="noreferrer" className="sb-cta">
              Book a 30-Min Call →
            </a>
          </div>

        </aside>

        {/* ── MAIN ── */}
        <main className="proof-main">

          {/* Hero */}
          <div className="hero-banner">
            <div className="hero-name-row">
              <span className="hero-first">Marc </span><span className="hero-last">Lehrmann</span>
            </div>
            <div className="hero-title-line">Strategic Partnerships &nbsp;·&nbsp; Business Development &nbsp;·&nbsp; Enterprise Sales</div>
            <p className="hero-summary">
              A seasoned enterprise sales leader with a demonstrated track record of driving revenue growth across <strong>industrial software, satellite communications, edge computing, and storage technology</strong>. I specialize in complex multi-stakeholder deals, long-cycle relationship management, and channel partner development — now <strong>bridging operational technology and AI</strong>, bringing operator-level credibility to the next generation of data infrastructure.
            </p>
          </div>

          {/* About */}
          <div className="content-section" id="about">
            <h2 className="section-title">The OT-to-AI Bridge</h2>
            <div className="narrative-grid">
              <div className="nar-card">
                <div className="nar-num">01</div>
                <div className="nar-label">Where I&apos;ve Been</div>
                <div className="nar-text">Spent 10+ years selling to the physical world — SCADA, HMI, PI System, satellite comms, and industrial IoT to energy, water, defense, and manufacturing enterprises. Deals where a wrong move resets a 9-month relationship. Built $25M+ in career revenue doing exactly that.</div>
              </div>
              <div className="nar-card">
                <div className="nar-num">02</div>
                <div className="nar-label">What I Know</div>
                <div className="nar-text">How enterprise decisions actually get made. How to navigate procurement, earn multi-stakeholder trust, and close in environments where urgency doesn&apos;t exist until you create it. Plus 7 apps in active development — I speak product as fluently as pipeline.</div>
              </div>
              <div className="nar-card full">
                <div className="nar-num">03</div>
                <div className="nar-label">Where I&apos;m Going</div>
                <div className="nar-text">AI platforms. Data infrastructure. Cloud. AdTech. Entertainment tech. Companies that need a strategic seller who can walk into an industrial enterprise, speak their language, and close the deal nobody else could. The OT sector is AI&apos;s next major acquisition — I&apos;m the person who can open that door.</div>
              </div>
            </div>
          </div>

          {/* Experience */}
          <div className="content-section" id="experience">
            <h2 className="section-title">Experience</h2>
            <div className="proof-timeline">

              <div className="tl-item">
                <div className="tl-left">
                  <div className="tl-date">2018 – Present</div>
                  <div className="tl-company">AVEVA Select CA<br />Irvine, CA</div>
                </div>
                <div className="tl-right">
                  <div className="tl-role">Assistant Sales Manager</div>
                  <ul className="tl-bullets">
                    <li>Sole California distributor for AVEVA&apos;s full industrial software suite — SCADA, HMI, PI System, and IIoT — managing enterprise and municipal accounts across energy, water, and manufacturing verticals.</li>
                    <li>Navigated complex multi-stakeholder procurement cycles, building trust at the executive, operations, and IT levels simultaneously to close long-cycle deals.</li>
                    <li>Drove consistent revenue growth through solution-based selling, customer success management, and strategic upsell into existing accounts.</li>
                    <li>Developed deep technical fluency across AVEVA&apos;s portfolio to deliver credible, value-led presentations to both OT engineers and C-suite buyers.</li>
                  </ul>
                </div>
              </div>

              <div className="tl-item">
                <div className="tl-left">
                  <div className="tl-date">Jan – Mar 2024</div>
                  <div className="tl-company">Radeus Labs<br />San Diego, CA</div>
                </div>
                <div className="tl-right">
                  <div className="tl-role">Business Development</div>
                  <ul className="tl-bullets">
                    <li>Satellite communications and advanced antenna systems for defense, aerospace, and government sectors.</li>
                    <li>Consultative enterprise selling into highly technical procurement environments with multi-stakeholder approval cycles.</li>
                  </ul>
                </div>
              </div>

              <div className="tl-item">
                <div className="tl-left">
                  <div className="tl-date">May 2021 – Oct 2023</div>
                  <div className="tl-company">Advantech USA<br />Irvine, CA</div>
                </div>
                <div className="tl-right">
                  <div className="tl-role">Business Development Manager</div>
                  <ul className="tl-bullets">
                    <li>Industrial IoT hardware, edge computing, and embedded systems — managing OEM and VAR channel partnerships across manufacturing, energy, and transportation verticals.</li>
                    <li>Built and expanded partner ecosystem driving consistent revenue growth in OT-adjacent markets.</li>
                    <li>Leveraged deep OT domain knowledge to position Advantech solutions within industrial digital transformation initiatives.</li>
                  </ul>
                </div>
              </div>

              <div className="tl-item">
                <div className="tl-left">
                  <div className="tl-date">Apr 2020 – May 2021</div>
                  <div className="tl-company">Dexxxon Digital Storage<br />Remote</div>
                </div>
                <div className="tl-right">
                  <div className="tl-role">Key Account Manager</div>
                  <ul className="tl-bullets">
                    <li>Managed and expanded key accounts for consumer flash memory brands (EMTEC, Kodak, Phillips) and LTO-Tape digital storage brands (IBM, Quantum, HP).</li>
                    <li>Spearheaded strategic initiatives to unlock account potential, surpass sales targets, and amplify market presence through disciplined account planning.</li>
                    <li>Leveraged negotiation skills to deliver compelling proposals and consistently close deals that fostered long-term partnerships.</li>
                  </ul>
                </div>
              </div>

              <div className="tl-item">
                <div className="tl-left">
                  <div className="tl-date">Feb 2014 – Mar 2020</div>
                  <div className="tl-company">Transcend Information<br />Orange, CA</div>
                </div>
                <div className="tl-right">
                  <div className="tl-role">Channel Account Manager</div>
                  <ul className="tl-bullets">
                    <li>Spearheaded strategic partnerships with Ingram Micro and Synnex Corporation, growing annual revenue to $3 million through disciplined channel development.</li>
                    <li>Achieved 30% year-over-year revenue increase by identifying market entry opportunities and executing effective co-marketing programs.</li>
                    <li>Drove 100% YoY sales growth for Apple embedded solutions and military-grade body cameras, managing the full sales cycle from partner training to close.</li>
                    <li>Collaborated with vendor and partnership managers to develop sales campaigns across a network of 200+ resellers and channel partners nationwide.</li>
                  </ul>
                </div>
              </div>

            </div>
          </div>

          {/* Skills */}
          <div className="content-section" id="skills">
            <h2 className="section-title">Core Capabilities</h2>
            <div className="skills-main-grid">
              <div className="skill-card">
                <div className="skill-card-title">Enterprise Sales</div>
                <ul className="skill-card-items">
                  <li>Multi-stakeholder deal management</li><li>Long-cycle relationship mgmt</li>
                  <li>Executive-level engagement</li><li>Procurement navigation</li><li>Territory ownership</li>
                </ul>
              </div>
              <div className="skill-card">
                <div className="skill-card-title">Strategic Partnerships</div>
                <ul className="skill-card-items">
                  <li>Channel &amp; distributor programs</li><li>Partner ecosystem development</li>
                  <li>Co-sell motion design</li><li>Revenue share structuring</li><li>SI &amp; ISV relationships</li>
                </ul>
              </div>
              <div className="skill-card">
                <div className="skill-card-title">OT / Industrial Domain</div>
                <ul className="skill-card-items">
                  <li>SCADA &amp; HMI platforms</li><li>PI System / OSIsoft</li>
                  <li>Industrial IoT &amp; edge computing</li><li>AVEVA portfolio</li><li>Energy, water, manufacturing</li>
                </ul>
              </div>
              <div className="skill-card">
                <div className="skill-card-title">AI &amp; Data Literacy</div>
                <ul className="skill-card-items">
                  <li>LLM platforms (Claude, GPT-4)</li><li>Data pipeline concepts</li>
                  <li>Supabase / pgvector</li><li>Next.js / React / TypeScript</li><li>7 apps in active development</li>
                </ul>
              </div>
              <div className="skill-card">
                <div className="skill-card-title">Business Development</div>
                <ul className="skill-card-items">
                  <li>Pipeline generation</li><li>Outbound motion design</li>
                  <li>Competitive positioning</li><li>Deal structuring &amp; negotiation</li><li>Forecasting &amp; CRM</li>
                </ul>
              </div>
              <div className="skill-card">
                <div className="skill-card-title">Builder Mindset</div>
                <ul className="skill-card-items">
                  <li>7 apps in active development</li><li>Product thinking &amp; roadmapping</li>
                  <li>AI-native workflow design</li><li>Rapid prototyping</li><li>Execution under ambiguity</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="content-section" id="contact">
            <h2 className="section-title">Get in Touch</h2>
            <div className="contact-grid">
              <div>
                <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.75, marginBottom: 20 }}>
                  If you&apos;re building something in AI, data infrastructure, cloud, or enterprise tech and need a strategic seller who can open doors in industrial markets — let&apos;s find 30 minutes.
                </p>
                <div className="contact-links-list">
                  <a href="tel:9095735840" className="contact-row">
                    <span className="cr-label">Phone</span>
                    <span className="cr-value">909-573-5840</span>
                    <span className="cr-arrow">↗</span>
                  </a>
                  <a href="mailto:mlehr001@gmail.com" className="contact-row">
                    <span className="cr-label">Email</span>
                    <span className="cr-value">mlehr001@gmail.com</span>
                    <span className="cr-arrow">↗</span>
                  </a>
                  <a href="https://linkedin.com/in/marclehrmann" target="_blank" rel="noreferrer" className="contact-row">
                    <span className="cr-label">LinkedIn</span>
                    <span className="cr-value">linkedin.com/in/marclehrmann</span>
                    <span className="cr-arrow">↗</span>
                  </a>
                  <a href="https://github.com/mlehr001" target="_blank" rel="noreferrer" className="contact-row">
                    <span className="cr-label">GitHub</span>
                    <span className="cr-value">github.com/mlehr001</span>
                    <span className="cr-arrow">↗</span>
                  </a>
                </div>
              </div>
              <div className="calendly-panel">
                <div className="cal-eyebrow">Schedule a Meeting</div>
                <div className="cal-heading">30-Minute Intro Call</div>
                <div className="cal-body">No pitch, no pressure. Let&apos;s see if there&apos;s a fit. Pick a time that works and I&apos;ll be there.</div>
                <a href="https://calendly.com/yourlink" target="_blank" rel="noreferrer" className="btn-cal">Book on Calendly →</a>
                <div className="cal-note">Usually responds within 24 hours</div>
              </div>
            </div>
          </div>

        </main>

        <footer className="proof-footer">
          Marc Lehrmann &nbsp;·&nbsp; Southern California &nbsp;·&nbsp; Open to Remote &amp; Hybrid &nbsp;·&nbsp;{" "}
          <span><a href="mailto:mlehr001@gmail.com" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>mlehr001@gmail.com</a></span>
        </footer>

      </div>
    </>
  );
}
