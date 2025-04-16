<!-- landing page v2 -->
<template>
  <ScrollContainer>
    <div class="landing-page">
      <!-- Navigation Bar -->
      <nav class="landing-nav glass-pane">
        <div class="nav-container">
          <router-link to="/" class="logo">
            <img
              src="/template-icon.svg"
              alt="Template Builder Logo"
              class="logo-icon"
            />
            <span class="logo-text">Kuro</span>
          </router-link>
          <div class="nav-links">
            <a href="#features" class="nav-link">Features</a>
            <a href="#how-it-works" class="nav-link">How It Works</a>
            <!-- <a href="#templates" class="nav-link">Templates</a> Removed for brevity, can add back -->
            <a href="#pricing" class="nav-link">Pricing</a>
            <router-link to="/login" class="nav-link">Login</router-link>
            <router-link to="/editor" class="cta-button nav-cta"
              >Try the Editor</router-link
            >
          </div>
          <!-- Mobile Menu Button (Example - requires implementation) -->
          <button class="mobile-menu-toggle" aria-label="Toggle menu">☰</button>
        </div>
      </nav>

      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-visual">
          <div class="visual-placeholder glass-card">
            <i class="fas fa-laptop-code placeholder-icon"></i>
            <span>App Preview Area</span>
            <p>(Three-pane editor with live Obsidian preview)</p>
          </div>
        </div>

        <!-- Device Mockup -->
        <!-- <div class="hero-visual">
          <div class="device-mockup">
            <div class="device-frame">
              <img
                src="/Users/brianrichardson/Desktop/Personal Projects/obsidian-template-creator/src/assets/hero-screenshot2.png"
                alt="Template Builder interface"
                class="device-screen"
              />
            </div>
          </div>
        </div> -->

        <div class="hero-content">
          <h1 class="hero-title">
            Build Powerful Obsidian Templates<br />
            <span class="highlight">Without Writing Code</span>
          </h1>
          <p class="hero-subtitle">
            Finally, a way to use Obsidian's best plugins — without learning a
            single line of code.
          </p>
          <div class="hero-cta">
            <router-link to="/editor" class="primary-cta">
              <i class="fas fa-magic"></i> Build With Kuro
            </router-link>
            <a href="#how-it-works" class="secondary-cta">
              <i class="fas fa-eye"></i> See How It Works
            </a>
          </div>
          <p class="hero-note">
            From simple daily notes to advanced knowledge systems — no coding
            required.
          </p>
        </div>
      </section>

      <!-- Feature Highlights Section -->
      <section id="features" class="feature-highlights">
        <h2 class="section-title">Make Obsidian Work For You</h2>
        <p class="section-subtitle">
          Create the templates you've always wanted, without the technical
          barriers.
        </p>
        <div class="features-grid">
          <div class="feature-item glass-card">
            <div class="feature-icon-wrapper">
              <i class="fas fa-code-branch"></i>
            </div>
            <h3>Templater Without The Syntax</h3>
            <p>
              Create dynamic dates, user prompts, and conditional content
              through intuitive modules. Let us handle the JavaScript behind the
              scenes.
            </p>
          </div>
          <div class="feature-item glass-card">
            <div class="feature-icon-wrapper">
              <i class="fas fa-database"></i>
            </div>
            <h3>Dataview Made Visual</h3>
            <p>
              Build powerful queries and data relationships without learning
              query syntax. Create dashboards, indexes, and dynamic content with
              a few clicks.
            </p>
          </div>
          <div class="feature-item glass-card">
            <div class="feature-icon-wrapper">
              <i class="fas fa-eye"></i>
            </div>
            <h3>What You See Is What You Get</h3>
            <p>
              Our true-to-Obsidian preview shows exactly how your template will
              render. No more guessing or jumping between apps to verify your
              work.
            </p>
          </div>
          <div class="feature-item glass-card">
            <div class="feature-icon-wrapper"><i class="fas fa-plug"></i></div>
            <h3>Direct Vault Integration</h3>
            <p>
              Push templates directly to your Obsidian vault with one click. No
              copying and pasting or manual file management required.
            </p>
          </div>
        </div>
      </section>

      <!-- How It Works Section -->
      <section id="how-it-works" class="how-it-works-section">
        <h2 class="section-title">Three Steps to Better Templates</h2>
        <div class="steps-container">
          <div class="step-card glass-card">
            <div class="step-number">1</div>
            <div class="step-icon"><i class="fas fa-plus-circle"></i></div>
            <h3>Select Modules</h3>
            <p>
              Choose from our library of building blocks – from basic headers to
              dynamic Templater functions and Dataview queries.
            </p>
          </div>
          <div class="step-connector"><i class="fas fa-arrow-right"></i></div>
          <div class="step-card glass-card">
            <div class="step-number">2</div>
            <div class="step-icon"><i class="fas fa-sliders-h"></i></div>
            <h3>Configure Visually</h3>
            <p>
              Use simple controls to configure each module. The app generates
              the complex code and syntax automatically.
            </p>
          </div>
          <div class="step-connector"><i class="fas fa-arrow-right"></i></div>
          <div class="step-card glass-card">
            <div class="step-number">3</div>
            <div class="step-icon"><i class="fas fa-file-export"></i></div>
            <h3>Export or Send to Vault</h3>
            <p>
              Preview the result in real-time, then push directly to your
              Obsidian vault or export as a markdown file.
            </p>
          </div>
        </div>
      </section>

      <!-- Testimonials Section -->
      <section class="testimonials-section">
        <h2 class="section-title">From Obsidian Users Like You</h2>
        <div class="testimonials-grid">
          <div class="testimonial-card glass-card">
            <blockquote>
              "I've tried to learn Templater three times and gave up. With this
              app, I created my first dynamic template in minutes. Now my
              journal entries and project notes are exactly how I want them."
            </blockquote>
            <div class="testimonial-author">
              <img src="https://i.pravatar.cc/48?img=32" alt="User Avatar" />
              <span>Maya Desai – Content Creator</span>
            </div>
          </div>
          <div class="testimonial-card glass-card">
            <blockquote>
              "The module system is brilliant. I can see and understand what
              each part of my template does, and the live preview means I never
              have to guess if it's working correctly."
            </blockquote>
            <div class="testimonial-author">
              <img src="https://i.pravatar.cc/48?img=55" alt="User Avatar" />
              <span>Leo Kim – Product Manager</span>
            </div>
          </div>
          <div class="testimonial-card glass-card">
            <blockquote>
              "As a researcher, I need structured notes with consistent
              metadata. This app lets me create templates that prompt for
              important fields and automatically link to related notes without
              writing a line of code."
            </blockquote>
            <div class="testimonial-author">
              <img src="https://i.pravatar.cc/48?img=42" alt="User Avatar" />
              <span>Chloe Dubois – PhD Researcher</span>
            </div>
          </div>
        </div>
      </section>

      <!-- User Type Callout (Replaces Use Cases Section) -->
      <section class="use-cases-section">
        <h2 class="section-title">Who This Is Really Built For</h2>
        <p class="section-subtitle">
          Whether you're new to Obsidian or just tired of dealing with plugin
          syntax, Template Builder makes it easy to build templates that
          actually work.
        </p>
        <div class="use-cases-grid">
          <div class="use-case-card glass-card">
            <div class="use-case-icon"><i class="fas fa-user-plus"></i></div>
            <h3>New Obsidian Users</h3>
            <p>
              Just getting started? Skip the confusion and build your first
              working template in minutes — no syntax, no setup, no overwhelm.
            </p>
          </div>
          <div class="use-case-card glass-card">
            <div class="use-case-icon"><i class="fas fa-tools"></i></div>
            <h3>Non-Technical Power Users</h3>
            <p>
              You want to take advantage of plugins like Templater and Dataview,
              but without the code. We make powerful workflows visual and
              intuitive.
            </p>
          </div>
          <div class="use-case-card glass-card">
            <div class="use-case-icon"><i class="fas fa-pencil-alt"></i></div>
            <h3>Writers, Students, Professionals</h3>
            <p>
              Whether you're journaling, studying, or managing work — build the
              exact structure you need and reuse it without technical headaches.
            </p>
          </div>
          <div class="use-case-card glass-card">
            <div class="use-case-icon">
              <i class="fas fa-exclamation-triangle"></i>
            </div>
            <h3>Sick of Syntax Errors</h3>
            <p>
              You've tried building templates before, but got stuck on YAML,
              brackets, or plugin quirks. This is your shortcut to clean,
              working templates.
            </p>
          </div>
        </div>
      </section>

      <!-- Pricing Section -->
      <section id="pricing" class="pricing-section">
        <h2 class="section-title">Simple, Transparent Pricing</h2>
        <p class="section-subtitle">Start building better templates today.</p>

        <div class="pricing-options">
          <!-- Free Plan -->
          <div class="pricing-card glass-card">
            <h3 class="pricing-tier">Free</h3>
            <div class="pricing-price">
              <span class="currency">$</span>0<span class="period">/mo</span>
            </div>
            <p class="pricing-billing-note">Always Free</p>
            <ul class="pricing-features">
              <li>
                <i class="fas fa-check"></i> Basic Template Builder Modules
              </li>
              <li><i class="fas fa-check"></i> Unlimited Templates</li>
              <li><i class="fas fa-check"></i> Markdown Export</li>
              <li><i class="fas fa-check"></i> Community Support</li>
            </ul>
            <router-link to="/signup?plan=free" class="pricing-cta"
              >Sign Up Free</router-link
            >
          </div>

          <!-- Pro Plan -->
          <div class="pricing-card glass-card featured">
            <div class="featured-badge">Most Popular</div>
            <h3 class="pricing-tier">Pro</h3>

            <!-- Pricing Toggle -->
            <div class="pricing-toggle">
              <button class="toggle-btn active" data-plan="monthly">
                Monthly
              </button>
              <button class="toggle-btn" data-plan="annual">Annual</button>
            </div>

            <!-- Price Display -->
            <div class="pricing-price">
              <span class="currency" id="pro-price-currency">$</span>
              <span id="pro-price-value">4.99</span>
              <span class="period" id="pro-price-period">/mo</span>
            </div>
            <p class="pricing-billing-note" id="pro-billing-note">
              Billed monthly, cancel anytime
            </p>

            <ul class="pricing-features">
              <li><i class="fas fa-check"></i> Everything in Free</li>
              <li><i class="fas fa-star"></i> Templater & Dataview Modules</li>
              <li>
                <i class="fas fa-star"></i> Direct Obsidian Vault Integration
              </li>
              <li><i class="fas fa-star"></i> Real-Time Preview</li>
              <li><i class="fas fa-star"></i> Template Library Access</li>
              <li><i class="fas fa-star"></i> Priority Support</li>
            </ul>

            <router-link
              to="/signup?plan=monthly"
              id="pro-pricing-cta"
              class="pricing-cta primary"
            >
              Upgrade to Pro
            </router-link>
          </div>
        </div>

        <div class="pricing-footer">
          <i class="fas fa-shield-alt"></i> Upgrade, downgrade, or cancel
          anytime.
        </div>
      </section>

      <!-- FAQ Section -->
      <section class="faq-section">
        <h2 class="section-title">Common Questions</h2>
        <div class="faq-container">
          <div class="faq-item glass-card" @click="toggleFaq">
            <div class="faq-question">
              <span>Do I need to know JavaScript or query syntax?</span>
              <i class="fas fa-chevron-down"></i>
            </div>
            <div class="faq-answer">
              <p>
                Not at all! That's exactly why we built this tool. Our visual
                modules generate all the necessary code behind the scenes, so
                you can create dynamic templates without learning JavaScript or
                Dataview query syntax.
              </p>
            </div>
          </div>
          <div class="faq-item glass-card" @click="toggleFaq">
            <div class="faq-question">
              <span>Do I need Templater and Dataview installed?</span>
              <i class="fas fa-chevron-down"></i>
            </div>
            <div class="faq-answer">
              <p>
                Yes. Our app helps you build templates using these plugins'
                capabilities without knowing their syntax. You'll need the
                plugins installed in your Obsidian vault for the templates to
                function properly when used.
              </p>
            </div>
          </div>
          <div class="faq-item glass-card" @click="toggleFaq">
            <div class="faq-question">
              <span>How does the Obsidian vault integration work?</span>
              <i class="fas fa-chevron-down"></i>
            </div>
            <div class="faq-answer">
              <p>
                Our app can connect directly to your local Obsidian vault
                folders. Once connected, you can push templates directly to your
                vault's template folder with one click. This connection is local
                and secure – your vault contents are never uploaded to our
                servers.
              </p>
            </div>
          </div>
          <div class="faq-item glass-card" @click="toggleFaq">
            <div class="faq-question">
              <span
                >What if I want to expand beyond what the modules offer?</span
              >
              <i class="fas fa-chevron-down"></i>
            </div>
            <div class="faq-answer">
              <p>
                The template builder generates standard Templater and Dataview
                code that you can extend. Advanced users can always edit the
                generated code directly or add custom JavaScript. Our goal is to
                make the basics accessible while allowing for growth as your
                skills develop.
              </p>
            </div>
          </div>
          <div class="faq-item glass-card" @click="toggleFaq">
            <div class="faq-question">
              <span>What happens to my templates if I cancel?</span>
              <i class="fas fa-chevron-down"></i>
            </div>
            <div class="faq-answer">
              <p>
                Any templates you've exported or pushed to your vault remain
                yours permanently. You'll lose access to cloud storage of
                templates and the ability to edit them in our app after your
                subscription ends, but all your created templates will continue
                to work in Obsidian.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Call to Action Section (NEW) -->
      <section class="cta-section glass-card">
        <h2>Stop Struggling With Obsidian Templates</h2>
        <p>
          Whether you're journaling, managing projects, or building your second
          brain — Template Builder helps you start fast, stay consistent, and
          skip the syntax.
        </p>

        <div class="cta-buttons">
          <router-link to="/editor" class="cta-primary"
            >Try The Editor Now</router-link
          >
          <router-link to="/signup" class="cta-secondary"
            >Start Your Free Trial</router-link
          >
        </div>
      </section>

      <!-- Footer -->
      <footer class="landing-footer">
        <div class="footer-container">
          <div class="footer-main">
            <div class="footer-branding">
              <router-link to="/" class="logo">
                <img
                  src="/template-icon.svg"
                  alt="Template Builder Logo"
                  class="logo-icon"
                />
                <span class="logo-text">Template Builder</span>
              </router-link>
              <p class="footer-tagline">
                Powerful templates. No code required.
              </p>
            </div>
            <div class="footer-links-group">
              <div class="footer-column">
                <h4>Product</h4>
                <a href="#features">Features</a>
                <a href="#how-it-works">How It Works</a>
                <a href="#pricing">Pricing</a>
                <router-link to="/changelog">Changelog</router-link>
              </div>
              <div class="footer-column">
                <h4>Resources</h4>
                <a href="/blog">Template Guides</a>
                <a href="/examples">Example Templates</a>
                <a href="/tutorials">Video Tutorials</a>
                <a href="#faq">FAQ</a>
              </div>
              <div class="footer-column">
                <h4>Company</h4>
                <a href="/about">About</a>
                <a href="/contact">Contact</a>
                <a href="/privacy">Privacy Policy</a>
                <a href="/terms">Terms of Service</a>
              </div>
            </div>
          </div>
          <div class="footer-bottom">
            <p>
              © {{ new Date().getFullYear() }} Template Builder. All rights
              reserved.
            </p>
            <div class="footer-socials">
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                ><i class="fab fa-twitter"></i
              ></a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Discord"
                ><i class="fab fa-discord"></i
              ></a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                ><i class="fab fa-github"></i
              ></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  </ScrollContainer>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import ScrollContainer from "@/components/UI/ScrollContainer.vue";

// Simple FAQ Toggle Logic
const toggleFaq = (event: MouseEvent) => {
  const faqItem = (event.currentTarget as HTMLElement)?.closest(".faq-item");
  if (faqItem) {
    faqItem.classList.toggle("active");
    const answer = faqItem.querySelector(".faq-answer") as HTMLElement | null;
    const icon = faqItem.querySelector(".faq-question i") as HTMLElement | null;

    if (answer && icon) {
      if (faqItem.classList.contains("active")) {
        answer.style.maxHeight = answer.scrollHeight + "px";
        icon.classList.replace("fa-chevron-down", "fa-chevron-up");
      } else {
        answer.style.maxHeight = ""; // Use null or empty string to collapse
        icon.classList.replace("fa-chevron-up", "fa-chevron-down");
      }
    }
  }
};

onMounted(() => {
  const monthlyBtn = document.querySelector(
    '[data-plan="monthly"]'
  ) as HTMLElement;
  const annualBtn = document.querySelector(
    '[data-plan="annual"]'
  ) as HTMLElement;
  const proPriceValue = document.getElementById(
    "pro-price-value"
  ) as HTMLElement;
  const proPricePeriod = document.getElementById(
    "pro-price-period"
  ) as HTMLElement;
  const proBillingNote = document.getElementById(
    "pro-billing-note"
  ) as HTMLElement;
  const proPricingCta = document.getElementById(
    "pro-pricing-cta"
  ) as HTMLAnchorElement;

  const setPricingPlan = (plan: "monthly" | "annual") => {
    if (plan === "monthly") {
      monthlyBtn.classList.add("active");
      annualBtn.classList.remove("active");
      proPriceValue.textContent = "4.99";
      proPricePeriod.textContent = "/mo";
      proBillingNote.textContent = "Billed monthly, cancel anytime";
      proPricingCta.href = "/signup?plan=monthly";
    } else {
      annualBtn.classList.add("active");
      monthlyBtn.classList.remove("active");
      proPriceValue.textContent = "48";
      proPricePeriod.textContent = "/year";
      proBillingNote.textContent = "Billed annually (Save 20%)";
      proPricingCta.href = "/signup?plan=annual";
    }
  };

  monthlyBtn.addEventListener("click", () => setPricingPlan("monthly"));
  annualBtn.addEventListener("click", () => setPricingPlan("annual"));

  // Default state
  setPricingPlan("monthly");
});
</script>

<style scoped>
/* Import Font Awesome if not globally included */
/* @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'); */

/* --- Base & Variables --- */
:root {
  /* Using your app's color variables is ideal */
  --color-primary: #8866e9; /* Example Purple */
  --color-primary-light: #a184f0;
  --color-primary-dark: #6a4fcc;
  --color-text: #e0e0e0;
  --color-text-secondary: #b0b0b0;
  --color-text-muted: #888;
  --color-background: #14151e; /* Dark background */
  --color-background-darker: #0f1018;
  --color-surface: #1e1f2e; /* Slightly lighter dark */
  --glass-bg: rgba(30, 31, 46, 0.7); /* Glass background */
  --glass-border-color: rgba(255, 255, 255, 0.1);
  --glass-blur: 10px;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-xxl: 64px;
  --transition-speed: 0.3s;
}

.landing-page {
  color: var(--color-text);
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  line-height: 1.6;
  overflow-x: hidden; /* Prevent horizontal scroll */
}

.glass-pane {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border-bottom: 1px solid var(--glass-border-color);
}

.glass-card {
  background: rgba(255, 255, 255, 0.05); /* Subtle card background */
  border: 1px solid var(--glass-border-color);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg) var(--spacing-xl);
  transition: transform var(--transition-speed) ease,
    box-shadow var(--transition-speed) ease;
}

.glass-card:hover {
  /* Subtle lift effect */
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

/* --- Typography & Common Elements --- */
h1,
h2,
h3 {
  color: var(--color-text);
  font-weight: 600;
  line-height: 1.3;
  margin-bottom: var(--spacing-md);
}

h1 {
  font-size: clamp(2.5rem, 5vw, 3.5rem);
}
h2 {
  font-size: clamp(1.8rem, 4vw, 2.5rem);
}
h3 {
  font-size: clamp(1.2rem, 3vw, 1.5rem);
}

p {
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-md);
}

a {
  color: var(--color-primary);
  text-decoration: none;
  transition: color var(--transition-speed) ease;
}
a:hover {
  color: var(--color-primary-light);
}

.section-title {
  text-align: center;
  margin-bottom: var(--spacing-md);
  background: linear-gradient(
    90deg,
    var(--color-primary-light),
    var(--color-primary)
  );
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.section-subtitle {
  text-align: center;
  color: var(--color-text-secondary);
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: var(--spacing-xl);
  font-size: 1.1rem;
}

.highlight {
  color: var(--color-primary);
}

.cta-button,
.primary-cta,
.secondary-cta,
.pricing-cta,
.cta-primary,
.cta-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: 12px 24px;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-speed) ease;
  text-align: center;
  border: none;
}

.cta-button,
.primary-cta,
.pricing-cta.primary,
.cta-primary {
  background-color: var(--color-primary);
  color: white;
}
.cta-button:hover,
.primary-cta:hover,
.pricing-cta.primary:hover,
.cta-primary:hover {
  background-color: var(--color-primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(var(--color-primary-rgb, 136, 102, 233), 0.4);
}

.secondary-cta,
.cta-secondary {
  background-color: transparent;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
}
.secondary-cta:hover,
.cta-secondary:hover {
  background-color: rgba(var(--color-primary-rgb, 136, 102, 233), 0.1);
  transform: translateY(-2px);
}

.pricing-cta {
  background-color: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--glass-border-color);
  width: 100%;
  margin-top: var(--spacing-lg);
}
.pricing-cta:hover:not(.primary) {
  background-color: var(--color-primary);
  color: white;
  border-color: transparent;
  transform: translateY(-2px);
}

/* --- Navigation --- */
.landing-nav {
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  padding: var(--spacing-md) 0;
}

.nav-container {
  max-width: 1300px;
  margin: 0 auto;
  padding: 0 var(--spacing-xl);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}
.logo-icon {
  width: 32px;
  height: 32px;
}
.logo-text {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--color-text);
}

.nav-links {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}
.nav-link {
  color: var(--color-text-secondary);
  font-weight: 500;
}
.nav-link:hover,
.nav-link.router-link-active {
  color: var(--color-text);
}
.nav-cta {
  padding: 8px 18px;
  font-size: 0.9rem;
}

.mobile-menu-toggle {
  /* Basic style, needs JS for functionality */
  display: none;
  background: none;
  border: none;
  color: var(--color-text);
  font-size: 1.5rem;
  cursor: pointer;
}

/* --- Hero Section --- */
.hero-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  max-width: 1300px;
  margin: 0 auto;
  padding: var(--spacing-xxl) var(--spacing-xl);
  gap: var(--spacing-xl); /* Reduce from spacing-xxl for balance */
  min-height: 80vh;
}

.hero-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.hero-title {
  margin-bottom: var(--spacing-lg);
}
.hero-subtitle {
  font-size: 1.15rem;
  margin-bottom: var(--spacing-xl);
  max-width: 550px;
}
.hero-cta {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  flex-wrap: wrap;
}
.hero-note {
  font-size: 0.9rem;
  color: var(--color-text-muted);
}

.hero-visual {
  display: flex;
  justify-content: center;
  align-items: center;
}
.visual-placeholder {
  width: 100%;
  aspect-ratio: 16 / 10; /* Adjust aspect ratio */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: var(--spacing-xl);
  font-size: 1.1rem;
  color: var(--color-text-muted);
}
.placeholder-icon {
  font-size: 4rem;
  margin-bottom: var(--spacing-md);
  color: var(--color-primary);
  opacity: 0.5;
}
.visual-placeholder span {
  font-weight: 500;
  margin-bottom: var(--spacing-sm);
}
.visual-placeholder p {
  font-size: 0.9rem;
  margin: 0;
}

/* --- Feature Highlights --- */
.feature-highlights {
  padding: var(--spacing-xxl) var(--spacing-xl);
  max-width: 1300px;
  margin: 0 auto;
}
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-xl);
  margin-top: var(--spacing-xl);
}
.feature-item {
  text-align: center;
  padding: var(--spacing-xl);
}
.feature-icon-wrapper {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(var(--color-primary-rgb, 136, 102, 233), 0.1);
  color: var(--color-primary);
  display: inline-flex;
  justify-content: center;
  align-items: center;
  font-size: 1.8rem;
  margin-bottom: var(--spacing-lg);
}
.feature-item h3 {
  margin-bottom: var(--spacing-sm);
  font-size: 1.25rem;
}
.feature-item p {
  font-size: 0.95rem;
  color: var(--color-text-secondary);
}

/* --- How It Works --- */
.how-it-works-section {
  padding: var(--spacing-xxl) var(--spacing-xl);
  background: var(--color-background-darker); /* Slight background change */
  max-width: 1300px;
  margin: 0 auto;
}
.steps-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-start; /* Align cards top */
  gap: var(--spacing-lg);
  margin-top: var(--spacing-xl);
  flex-wrap: wrap; /* Allow wrapping on smaller screens */
}
.step-card {
  flex: 1;
  min-width: 250px; /* Ensure minimum width */
  text-align: center;
  padding: var(--spacing-xl);
  position: relative;
}
.step-number {
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-primary);
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 600;
  font-size: 0.9rem;
}
.step-icon {
  font-size: 2.5rem;
  color: var(--color-primary);
  margin-bottom: var(--spacing-md);
  margin-top: var(--spacing-md); /* Space below number */
}
.step-card h3 {
  font-size: 1.2rem;
  margin-bottom: var(--spacing-sm);
}
.step-card p {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.step-connector {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: var(--color-text-muted);
  align-self: center; /* Center arrow vertically */
  margin: 0 var(--spacing-md);
  padding-top: var(--spacing-xl); /* Align roughly with card content */
}

/* --- Testimonials --- */
.testimonials-section {
  padding: var(--spacing-xxl) var(--spacing-xl);
  max-width: 1200px;
  margin: 0 auto;
}
.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-xl);
  margin-top: var(--spacing-xl);
}
.testimonial-card {
  padding: var(--spacing-xl);
}
.testimonial-card blockquote {
  margin: 0 0 var(--spacing-lg) 0;
  font-style: italic;
  color: var(--color-text);
  border-left: 3px solid var(--color-primary);
  padding-left: var(--spacing-md);
  line-height: 1.7;
}
.testimonial-author {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}
.testimonial-author img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  background: var(--color-surface);
} /* Placeholder bg */
.testimonial-author span {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  font-weight: 500;
}

/* --- Use Cases Section --- */
.use-cases-section {
  padding: var(--spacing-xxl) var(--spacing-xl);
  max-width: 1300px;
  margin: 0 auto;
}

.use-cases-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-xl);
  margin-top: var(--spacing-xl);
}

.use-case-card {
  text-align: center;
  padding: var(--spacing-xl);
}

.use-case-icon {
  font-size: 2.5rem;
  color: var(--color-primary);
  margin-bottom: var(--spacing-lg);
}

.use-case-card h3 {
  margin-bottom: var(--spacing-sm);
  font-size: 1.25rem;
}

.use-case-card p {
  font-size: 0.95rem;
  color: var(--color-text-secondary);
}

/* --- Pricing --- */
.pricing-section {
  padding: var(--spacing-xxl) var(--spacing-xl);
  background: var(--color-background-darker); /* Contrast */
  max-width: 1000px; /* Narrower section */
  margin: 0 auto;
}
.pricing-options {
  display: flex;
  justify-content: center;
  align-items: stretch; /* Make cards same height */
  gap: var(--spacing-xl);
  margin-top: var(--spacing-xl);
  flex-wrap: wrap;
}
.pricing-card {
  flex: 1;
  min-width: 300px;
  max-width: 380px; /* Max width for cards */
  padding: var(--spacing-xl);
  text-align: center;
  display: flex;
  flex-direction: column; /* Align content vertically */
  position: relative;
}
.pricing-card.featured {
  border-color: var(--color-primary);
  transform: scale(1.03); /* Slight scale up */
  box-shadow: 0 10px 30px rgba(var(--color-primary-rgb, 136, 102, 233), 0.2);
}
.featured-badge {
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-primary);
  color: white;
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-lg);
  font-size: 0.8rem;
  font-weight: 600;
}
.pricing-tier {
  font-size: 1.3rem;
  margin-bottom: var(--spacing-sm);
  color: var(--color-text);
}
.pricing-price {
  font-size: 2.8rem;
  font-weight: 600;
  color: var(--color-text);
  margin: var(--spacing-sm) 0;
}
.pricing-price .currency {
  font-size: 1.5rem;
  vertical-align: top;
  margin-right: var(--spacing-xs);
  opacity: 0.7;
}
.pricing-price .period {
  font-size: 1rem;
  color: var(--color-text-secondary);
  font-weight: 400;
  margin-left: var(--spacing-xs);
}
.pricing-billing-note {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  margin-bottom: var(--spacing-lg);
}

.pricing-features {
  list-style: none;
  padding: 0;
  margin: var(--spacing-lg) 0;
  text-align: left;
  flex-grow: 1; /* Push button to bottom */
}
.pricing-features li {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
  font-size: 0.95rem;
}
.pricing-features li i {
  color: var(--color-primary);
  font-size: 0.9em;
  width: 16px;
  text-align: center;
}
.pricing-features li i.fa-star {
  color: #ffd700;
} /* Gold star for premium */

.pricing-footer {
  text-align: center;
  margin-top: var(--spacing-xl);
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-sm);
}

/* --- FAQ --- */
.faq-section {
  padding: var(--spacing-xxl) var(--spacing-xl);
  max-width: 900px;
  margin: 0 auto;
}
.faq-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-top: var(--spacing-xl);
}
.faq-item {
  border-radius: var(--radius-md); /* Apply radius here */
  overflow: hidden; /* Needed for max-height transition */
  background: rgba(255, 255, 255, 0.03); /* Slightly different bg */
  border: 1px solid var(--glass-border-color);
}
.faq-question {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  cursor: pointer;
  font-weight: 500;
  color: var(--color-text);
}
.faq-question i {
  transition: transform var(--transition-speed) ease;
  color: var(--color-text-secondary);
}
.faq-answer {
  padding: 0 var(--spacing-lg);
  max-height: 0;
  overflow: hidden;
  transition: max-height var(--transition-speed) ease,
    padding var(--transition-speed) ease;
}
.faq-answer p {
  margin: 0;
  padding-bottom: var(--spacing-lg);
  font-size: 0.95rem;
  color: var(--color-text-secondary);
}

/* Active state for FAQ item */
.faq-item.active .faq-question i {
  transform: rotate(180deg);
  color: var(--color-primary);
}
.faq-item.active .faq-answer {
  /* max-height is set by JS */
  padding-top: var(--spacing-xs); /* Add padding when open */
  padding-bottom: var(--spacing-lg);
}

/* --- CTA Section --- */
.cta-section {
  padding: var(--spacing-xxl) var(--spacing-xl);
  max-width: 900px;
  margin: var(--spacing-xxl) auto;
  text-align: center;
  background: linear-gradient(
    135deg,
    rgba(136, 102, 233, 0.15),
    rgba(136, 102, 233, 0.05)
  );
  border: 1px solid rgba(136, 102, 233, 0.2);
}

.cta-section h2 {
  margin-bottom: var(--spacing-md);
  font-size: 2rem;
}

.cta-section p {
  margin-bottom: var(--spacing-xl);
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.cta-buttons {
  display: flex;
  justify-content: center;
  gap: var(--spacing-lg);
  flex-wrap: wrap;
}

.cta-primary,
.cta-secondary {
  padding: 14px 28px;
  font-size: 1.1rem;
}

/* --- Footer --- */
.landing-footer {
  background: var(--color-background-darker);
  padding: var(--spacing-xxl) var(--spacing-xl) var(--spacing-lg);
  border-top: 1px solid var(--glass-border-color);
  margin-top: var(--spacing-xxl);
}
.footer-container {
  max-width: 1300px;
  margin: 0 auto;
  padding: 0 var(--spacing-xl); /* or fallback */
}

.footer-main {
  display: flex;
  align-items: flex-start;
  justify-content: center; /* ✅ Center the overall group */
  gap: var(--spacing-xxl); /* ✅ Control spacing between branding + links */
  flex-wrap: wrap;
  margin-bottom: var(--spacing-xl);
  margin-top: var(--spacing-xl);
  text-align: left; /* makes branding & links align cleanly again */
}

.footer-branding {
  max-width: 300px;
  margin-right: var(--spacing-lg);
}
.footer-tagline {
  font-size: 0.95rem;
  color: var(--color-text-secondary);
  margin-top: var(--spacing-sm);
}

.footer-links-group {
  display: flex;
  gap: var(--spacing-xxl);
  flex-wrap: wrap;
  margin-left: var(--spacing-lg);
}
.footer-column h4 {
  font-size: 1rem;
  color: var(--color-text);
  margin-bottom: var(--spacing-md);
}
.footer-column a {
  display: block;
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-sm);
  font-size: 0.9rem;
}
.footer-column a:hover {
  color: var(--color-primary);
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--glass-border-color);
  font-size: 0.85rem;
  color: var(--color-text-muted);
  flex-wrap: wrap;
  gap: var(--spacing-md);
}
.footer-socials {
  display: flex;
  gap: var(--spacing-md);
}
.footer-socials a {
  color: var(--color-text-muted);
  font-size: 1.1rem;
}
.footer-socials a:hover {
  color: var(--color-primary);
}

/* device mockup */
.device-mockup {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.device-frame {
  background: #252525;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  border: 1px solid #3a3a3a;
  position: relative;
}

.device-screen {
  width: 100%;
  height: auto;
  border-radius: 4px;
  display: block;
}

/* --- Responsive --- */
@media (max-width: 1024px) {
  .hero-section {
    grid-template-columns: 1fr;
    text-align: center;
    gap: var(--spacing-xl);
  }
  .hero-content {
    order: 2;
  }
  .hero-visual {
    order: 1;
    max-width: 600px;
    margin: 0 auto;
  }
  .hero-subtitle {
    margin-left: auto;
    margin-right: auto;
  }
  .hero-cta {
    justify-content: center;
  }
  .steps-container {
    flex-direction: column;
    align-items: center;
  }
  .step-connector {
    transform: rotate(90deg);
    margin: var(--spacing-md) 0;
    padding-top: 0;
  }

  .cta-buttons {
    flex-direction: column;
    align-items: center;
  }
}

.pricing-section {
  padding: 4rem 1rem;
  max-width: 1100px;
  margin: 0 auto;
  text-align: center;
}

.pricing-options {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.pricing-card {
  flex: 1;
  min-width: 280px;
  max-width: 400px;
  padding: 2rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.featured-badge {
  position: absolute;
  top: -12px;
  background: var(--color-primary);
  color: white;
  border-radius: 20px;
  padding: 0.3rem 1rem;
  font-size: 0.75rem;
}

.pricing-toggle {
  display: inline-flex;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 4px;
  margin: 1rem 0;
}

.toggle-btn {
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: background 0.3s, color 0.3s;
  border-radius: 6px;
}

.toggle-btn.active {
  background: var(--color-primary);
  color: white;
}

.pricing-price {
  font-size: 2.5rem;
  font-weight: bold;
  color: var(--color-text);
  margin: 0.5rem 0;
  display: flex;
  justify-content: center;
  align-items: baseline;
  gap: 0.25rem;
}

.pricing-price .currency,
.pricing-price .period {
  font-size: 1.2rem;
  color: var(--color-text-secondary);
}

.pricing-billing-note {
  color: var(--color-text-muted);
  font-size: 0.85rem;
  margin-bottom: 1.5rem;
}

.pricing-features {
  text-align: left;
  margin-bottom: 2rem;
  padding-left: 0;
  list-style: none;
}

.pricing-features li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.pricing-features li i {
  color: var(--color-primary);
}

.pricing-features li i.fa-star {
  color: #ffd700;
}

.pricing-cta {
  width: 100%;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
}

@media (max-width: 768px) {
  h1 {
    font-size: clamp(2rem, 6vw, 2.8rem);
  }
  h2 {
    font-size: clamp(1.5rem, 5vw, 2rem);
  }
  .section-subtitle {
    font-size: 1rem;
  }

  .nav-links {
    display: none;
  } /* Basic mobile menu hiding */
  .mobile-menu-toggle {
    display: block;
  }
  .nav-container {
    padding: 0 var(--spacing-lg);
  }

  .hero-section {
    padding: 0 var(--spacing-lg);
    margin: var(--spacing-xl) auto;
  }
  .feature-highlights,
  .how-it-works-section,
  .testimonials-section,
  .pricing-section,
  .faq-section,
  .use-cases-section,
  .cta-section {
    padding: var(--spacing-xl) var(--spacing-lg);
  }
  .steps-container {
    gap: var(--spacing-xl);
  }
  .pricing-options {
    flex-direction: column;
    align-items: center;
  }
  .footer-main {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  .footer-links-group {
    justify-content: center;
    gap: var(--spacing-xl);
  }
  .footer-bottom {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
}
</style>
