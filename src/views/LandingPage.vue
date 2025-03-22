<template>
  <ScrollContainer>
    <div class="landing-page">
      <!-- Professional Navigation Bar -->
      <nav class="landing-nav glass-panel">
        <div class="logo">
          <img src="/template-icon.svg" alt="Logo" />
          <span>Template Builder</span>
        </div>
        <div class="nav-links">
          <a href="#features" class="nav-link">Features</a>
          <a href="#pricing" class="nav-link">Pricing</a>
          <a href="#templates" class="nav-link">Templates</a>
          <router-link to="/login" class="nav-link">Login</router-link>
          <router-link to="/signup" class="cta-button">Sign Up</router-link>
        </div>
      </nav>

      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-content">
          <h1 class="hero-title">
            Effortlessly Create Powerful Obsidian Templates
          </h1>
          <p class="hero-subtitle">
            Real-time previews, drag-and-drop simplicity, ready-made components.
            Everything you need to supercharge your Obsidian workflow.
          </p>
          <div class="hero-cta">
            <router-link to="/editor" class="primary-cta"
              >Start Creating</router-link
            >
            <router-link to="/templates" class="secondary-cta"
              >Browse Templates</router-link
            >
          </div>
        </div>
        <div class="hero-image">
          <!-- Use existing app screenshot or add a new one -->
          <img src="/template-icon.svg" alt="Template Builder Interface" />
        </div>
      </section>

      <!-- Features Section -->
      <section id="features" class="features-section">
        <h2 class="section-title">Features That Boost Your Productivity</h2>

        <div class="feature-cards">
          <div class="feature-card glass-card">
            <div class="feature-icon">
              <i class="fas fa-sync-alt"></i>
            </div>
            <h3>Real-Time Editing</h3>
            <p>Instantly see your changes with a live Markdown preview.</p>
          </div>

          <div class="feature-card glass-card">
            <div class="feature-icon">
              <i class="fas fa-grip-horizontal"></i>
            </div>
            <h3>Drag-and-Drop Builder</h3>
            <p>Build templates effortlessly—no coding needed.</p>
          </div>

          <div class="feature-card glass-card">
            <div class="feature-icon">
              <i class="fas fa-puzzle-piece"></i>
            </div>
            <h3>Full Plugin Compatibility</h3>
            <p>Perfect exports for Dataview, Templater, Kanban, and more.</p>
          </div>

          <div class="feature-card glass-card">
            <div class="feature-icon">
              <i class="fas fa-cloud"></i>
            </div>
            <h3>Cloud Save & Sync</h3>
            <p>Access your templates from anywhere, share them easily.</p>
          </div>
        </div>
      </section>

      <!-- Testimonials Section -->
      <section class="testimonials-section">
        <h2 class="section-title">What Our Users Say</h2>

        <div class="rating-badge">
          <i class="fas fa-star"></i>
          <i class="fas fa-star"></i>
          <i class="fas fa-star"></i>
          <i class="fas fa-star"></i>
          <i class="fas fa-star"></i>
          <span>Rated by Obsidian community</span>
        </div>

        <div class="testimonials">
          <div class="testimonial-card glass-card">
            <p class="testimonial-text">
              "Best Obsidian tool ever—saves me hours weekly!"
            </p>
            <div class="testimonial-author">
              <img src="@/assets/vue.svg" alt="User Avatar" />
              <span>Alex Johnson</span>
            </div>
          </div>

          <div class="testimonial-card glass-card">
            <p class="testimonial-text">
              "Organizing my notes has never been easier!"
            </p>
            <div class="testimonial-author">
              <img src="@/assets/vue.svg" alt="User Avatar" />
              <span>Maria Garcia</span>
            </div>
          </div>

          <div class="testimonial-card glass-card">
            <p class="testimonial-text">
              "Incredibly intuitive and powerful—highly recommend!"
            </p>
            <div class="testimonial-author">
              <img src="@/assets/vue.svg" alt="User Avatar" />
              <span>Ryan Chen</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Pricing Section -->
      <section id="pricing" class="pricing-section">
        <h2 class="section-title">Clear Pricing, Unlimited Templates</h2>
        <p class="pricing-subtitle">Simple plans that grow with your needs</p>

        <div class="pricing-options">
          <div class="pricing-card glass-card">
            <h3 class="pricing-title">Monthly</h3>
            <div class="pricing-amount">
              <span class="currency">$</span>
              <span class="amount">9</span>
              <span class="period">/month</span>
            </div>
            <ul class="pricing-features">
              <li><i class="fas fa-check"></i> Unlimited Templates</li>
              <li><i class="fas fa-check"></i> Premium Components & Plugins</li>
              <li><i class="fas fa-check"></i> Cloud Backup & Sync</li>
              <li><i class="fas fa-check"></i> Priority Support</li>
            </ul>
            <button class="pricing-cta">Start Free Trial</button>
          </div>

          <div class="pricing-card glass-card featured">
            <div class="best-value-tag">Best Value</div>
            <h3 class="pricing-title">Annual</h3>
            <div class="pricing-amount">
              <span class="currency">$</span>
              <span class="amount">90</span>
              <span class="period">/year</span>
            </div>
            <div class="pricing-save">Save 17%</div>
            <ul class="pricing-features">
              <li><i class="fas fa-check"></i> Unlimited Templates</li>
              <li><i class="fas fa-check"></i> Premium Components & Plugins</li>
              <li><i class="fas fa-check"></i> Cloud Backup & Sync</li>
              <li><i class="fas fa-check"></i> Priority Support</li>
            </ul>
            <button class="pricing-cta">Start Free Trial</button>
          </div>
        </div>

        <div class="pricing-guarantee">
          <i class="fas fa-shield-alt"></i>
          <p>30-day money-back guarantee. No questions asked.</p>
        </div>
      </section>

      <!-- FAQ Section -->
      <section class="faq-section">
        <h2 class="section-title">Frequently Asked Questions</h2>

        <div class="faq-container">
          <div class="faq-item glass-card">
            <div class="faq-question">
              <h3>Can I cancel anytime?</h3>
              <i class="fas fa-chevron-down"></i>
            </div>
            <div class="faq-answer">
              <p>Absolutely—flexibility is key. Cancel at any time.</p>
            </div>
          </div>

          <div class="faq-item glass-card">
            <div class="faq-question">
              <h3>Does this replace Obsidian plugins?</h3>
              <i class="fas fa-chevron-down"></i>
            </div>
            <div class="faq-answer">
              <p>
                No, it perfectly complements your existing Obsidian workflow,
                making plugins even more powerful.
              </p>
            </div>
          </div>

          <div class="faq-item glass-card">
            <div class="faq-question">
              <h3>Do I need coding experience?</h3>
              <i class="fas fa-chevron-down"></i>
            </div>
            <div class="faq-answer">
              <p>
                Not at all. Our drag-and-drop builder means zero coding is
                required.
              </p>
            </div>
          </div>

          <div class="faq-item glass-card">
            <div class="faq-question">
              <h3>What happens if my subscription expires?</h3>
              <i class="fas fa-chevron-down"></i>
            </div>
            <div class="faq-answer">
              <p>
                Your templates remain yours forever. Renew anytime for continued
                cloud sync and new features.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="landing-footer">
        <div class="footer-content">
          <div class="footer-logo">
            <img src="/template-icon.svg" alt="Logo" />
            <span>Template Builder</span>
          </div>

          <div class="footer-links">
            <div class="footer-column">
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#pricing">Pricing</a>
              <a href="#templates">Templates</a>
            </div>

            <div class="footer-column">
              <h4>Company</h4>
              <a href="/about">About Us</a>
              <a href="/contact">Contact</a>
              <a href="/blog">Blog</a>
            </div>

            <div class="footer-column">
              <h4>Legal</h4>
              <a href="/privacy">Privacy Policy</a>
              <a href="/terms">Terms of Service</a>
            </div>

            <div class="footer-column">
              <h4>Community</h4>
              <div class="social-icons">
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <i class="fab fa-reddit"></i>
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <i class="fab fa-discord"></i>
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <i class="fab fa-twitter"></i>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div class="footer-bottom">
          <p>&copy; 2025 Template Builder. All rights reserved.</p>
        </div>
      </footer>
    </div>
  </ScrollContainer>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { usePreferencesStore } from "../stores";
import ScrollContainer from "@/components/UI/ScrollContainer.vue";

// Navigation dropdowns
const showViewModeMenu = ref(false);
const showProfileMenu = ref(false);
const showPluginMenu = ref(false);

// Toggle functions
const toggleViewModeMenu = () => {
  showViewModeMenu.value = !showViewModeMenu.value;
  showProfileMenu.value = false;
  showPluginMenu.value = false;
};

const toggleProfileMenu = () => {
  showProfileMenu.value = !showProfileMenu.value;
  showViewModeMenu.value = false;
  showPluginMenu.value = false;
};

const togglePluginMenu = () => {
  showPluginMenu.value = !showPluginMenu.value;
  showViewModeMenu.value = false;
  showProfileMenu.value = false;
};

// Get the preferences store
const preferenceStore = usePreferencesStore();

// Set the last visited view to 'landing'
onMounted(() => {
  preferenceStore.setLastVisitedView("landing");

  // FAQ toggle functionality
  const faqItems = document.querySelectorAll(".faq-question");
  faqItems.forEach((item) => {
    item.addEventListener("click", () => {
      const answer = item.nextElementSibling as HTMLElement | null;
      if (!answer) return;
      const icon = item.querySelector("i") as HTMLElement | null;

      if (!answer || !icon) return;

      // Toggle the answer visibility
      if (answer.style.maxHeight) {
        answer.style.maxHeight = ""; // Clear maxHeight to collapse the answer
        icon.classList.replace("fa-chevron-up", "fa-chevron-down");
      } else {
        answer.style.maxHeight = answer.scrollHeight + "px";
        icon.classList.replace("fa-chevron-down", "fa-chevron-up");
      }
    });
  });

  // Click outside to close menus
  document.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    if (!target.closest(".dropdown")) {
      showViewModeMenu.value = false;
      showProfileMenu.value = false;
      showPluginMenu.value = false;
    }
  });
});
</script>

<style scoped>
/* Landing page container */
.landing-page {
  min-height: 100vh;
  overflow-y: auto;
}

/* Glassmorphism theme */
.glass-panel {
  background: rgba(30, 30, 46, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--glass-border);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

/* Navigation styling */
.landing-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(20, 21, 30, 0.8);
  backdrop-filter: blur(10px);
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo img {
  width: 36px;
  height: 36px;
}

.logo span {
  font-size: 1.25rem;
  font-weight: 600;
  background: linear-gradient(
    to right,
    var(--color-primary-light),
    var(--color-primary)
  );
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.nav-link {
  color: var(--color-text);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.nav-link:hover {
  color: var(--color-primary);
}

.cta-button {
  background-color: var(--color-primary);
  color: var(--color-text);
  font-weight: 600;
  padding: 0.5rem 1.5rem;
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  display: inline-block;
  text-align: center;
}

.cta-button:hover {
  background-color: var(--color-primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(136, 102, 233, 0.4);
}

/* Hero section */
.hero-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6rem 2rem 4rem;
  max-width: 1200px;
  margin: 0 auto;
  gap: 2rem;
}

.hero-content {
  flex: 1;
  max-width: 600px;
}

.hero-title {
  font-size: 3rem;
  margin-bottom: 1rem;
  background: linear-gradient(
    to right,
    var(--color-primary-light),
    var(--color-primary)
  );
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: var(--color-text-secondary);
  margin-bottom: 2rem;
  line-height: 1.6;
}

.hero-cta {
  display: flex;
  gap: 1rem;
}

.primary-cta {
  background-color: var(--color-primary);
  color: var(--color-text);
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  display: inline-block;
  text-align: center;
}

.primary-cta:hover {
  background-color: var(--color-primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(136, 102, 233, 0.4);
}

.secondary-cta {
  background-color: rgba(136, 102, 233, 0.1);
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  display: inline-block;
  text-align: center;
}

.secondary-cta:hover {
  background-color: rgba(136, 102, 233, 0.2);
  transform: translateY(-2px);
}

.hero-image {
  flex: 1;
  display: flex;
  justify-content: center;
}

.hero-image img {
  max-width: 100%;
  max-height: 400px;
  filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.2));
}

/* Features section */
.features-section {
  padding: 5rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  font-size: 2.25rem;
  margin-bottom: 1.5rem;
  text-align: center;
  background: linear-gradient(
    to right,
    var(--color-text),
    var(--color-primary-light)
  );
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.feature-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
}

.feature-card {
  padding: 2rem;
  text-align: center;
}

.feature-icon {
  font-size: 2.5rem;
  color: var(--color-primary);
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
}

/* Testimonials section */
.testimonials-section {
  padding: 5rem 2rem;
  background: linear-gradient(
    180deg,
    rgba(20, 21, 30, 0) 0%,
    rgba(20, 21, 30, 0.5) 100%
  );
  max-width: 1200px;
  margin: 0 auto;
}

.testimonials {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
}

.testimonial-card {
  padding: 2rem;
}

.testimonial-text {
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  font-style: italic;
  color: var(--color-text);
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.testimonial-author img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.rating-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  margin-bottom: 2rem;
  color: #ffd700;
  font-size: 1.25rem;
}

.rating-badge span {
  color: var(--color-text);
  margin-left: 0.5rem;
  font-size: 0.875rem;
}

/* Pricing section */
.pricing-section {
  padding: 5rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.pricing-subtitle {
  font-size: 1.1rem;
  text-align: center;
  color: var(--color-text-secondary);
  margin-bottom: 2rem;
}

.pricing-options {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 3rem;
  flex-wrap: wrap;
}

.pricing-card {
  padding: 2.5rem;
  min-width: 320px;
  text-align: center;
  position: relative;
}

.pricing-card.featured {
  border: 1px solid var(--color-primary);
  transform: scale(1.05);
}

.best-value-tag {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--color-primary);
  color: white;
  padding: 0.25rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
}

.pricing-title {
  font-size: 1.5rem;
  color: var(--color-text);
  margin-bottom: 1rem;
}

.pricing-amount {
  font-size: 3rem;
  color: var(--color-text);
  margin: 1.5rem 0;
  display: flex;
  justify-content: center;
  align-items: baseline;
}

.currency {
  font-size: 1.5rem;
  vertical-align: super;
}

.period {
  font-size: 1rem;
  color: var(--color-text-secondary);
}

.pricing-save {
  font-size: 0.9rem;
  color: var(--color-primary);
  margin-bottom: 1rem;
}

.pricing-features {
  list-style: none;
  padding: 0;
  margin: 2rem 0;
  text-align: left;
}

.pricing-features li {
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
}

.pricing-features i {
  color: var(--color-primary);
  margin-right: 0.75rem;
}

.pricing-cta {
  background-color: var(--color-primary);
  color: var(--color-text);
  font-weight: 600;
  padding: 0.75rem 2rem;
  width: 100%;
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pricing-cta:hover {
  background-color: var(--color-primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(136, 102, 233, 0.4);
}

.pricing-guarantee {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 3rem;
  color: var(--color-text-secondary);
}

/* FAQ section */
.faq-section {
  padding: 5rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.faq-container {
  max-width: 800px;
  margin: 3rem auto 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.faq-item {
  overflow: hidden;
}

.faq-question {
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.faq-question h3 {
  margin: 0;
  font-size: 1.125rem;
}

.faq-answer {
  padding: 0 1.5rem 1.5rem;
  color: var(--color-text-secondary);
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

/* Footer */
.landing-footer {
  background: rgba(20, 21, 30, 0.95);
  padding: 4rem 2rem 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.footer-content {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 3rem;
  max-width: 1200px;
  margin: 0 auto 4rem;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.footer-logo img {
  width: 36px;
  height: 36px;
}

.footer-logo span {
  font-size: 1.25rem;
  font-weight: 600;
  background: linear-gradient(
    to right,
    var(--color-primary-light),
    var(--color-primary)
  );
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.footer-links {
  display: flex;
  flex-wrap: wrap;
  gap: 3rem;
}

.footer-column h4 {
  margin-bottom: 1.5rem;
  color: var(--color-text);
}

.footer-column a {
  display: block;
  margin-bottom: 0.75rem;
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: color 0.2s;
}

.footer-column a:hover {
  color: var(--color-primary);
}

.social-icons {
  display: flex;
  gap: 1rem;
}

.social-icons a {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.05);
  color: var(--color-text);
  font-size: 1.25rem;
  margin-bottom: 0;
}

.social-icons a:hover {
  background-color: var(--color-primary);
  color: white;
}

.footer-bottom {
  text-align: center;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* Responsive styles */
@media (max-width: 1024px) {
  .hero-section {
    flex-direction: column;
    padding: 3rem 1.5rem;
  }

  .hero-content {
    text-align: center;
    max-width: 100%;
  }

  .hero-cta {
    justify-content: center;
  }

  .hero-image {
    margin-top: 2rem;
    width: 100%;
  }

  .pricing-options {
    flex-direction: column;
    align-items: center;
  }

  .pricing-card.featured {
    transform: scale(1);
  }
}

@media (max-width: 768px) {
  .landing-nav {
    flex-direction: column;
    padding: 1rem;
  }

  .logo {
    margin-bottom: 1rem;
  }

  .nav-links {
    flex-wrap: wrap;
    justify-content: center;
    gap: 1rem;
  }

  .hero-title {
    font-size: 2rem;
  }

  .feature-cards {
    grid-template-columns: 1fr;
  }

  .testimonials {
    grid-template-columns: 1fr;
  }

  .footer-content {
    flex-direction: column;
    gap: 2rem;
  }

  .footer-links {
    flex-direction: column;
    gap: 2rem;
  }
}
</style>
