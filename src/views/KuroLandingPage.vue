<template>
  <ScrollContainer>
    <div class="landing-page">
      <!-- Navigation Bar -->
      <nav class="app-header" :class="{ scrolled: isScrolled }">
        <div class="container">
          <router-link to="/" class="logo">
            <img
              src="@/assets/kuro-icon-mark.png"
              alt="Kuro"
              class="logo-icon"
            />
            <span class="logo-text">Kuro</span>
          </router-link>

          <div class="nav-links" :class="{ 'nav-open': isNavOpen }">
            <a
              v-for="item in navigationItems"
              :key="item.label"
              :href="item.link"
              class="nav-link"
              @click="closeNav"
            >
              {{ item.label }}
            </a>
            <router-link to="/login" class="nav-link" @click="closeNav"
              >Login</router-link
            >
            <router-link
              to="/editor"
              class="btn btn-primary nav-cta"
              @click="closeNav"
              >Try Editor</router-link
            >
          </div>

          <button
            class="menu-toggle"
            @click="toggleNav"
            aria-label="Toggle Navigation"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      <!-- Hero Section -->
      <section class="hero-section">
        <div class="container">
          <div class="hero-image">
            <img
              alt="Kuro Obsidian Template Builder Interface"
              class="preview-image"
            />
            <div class="glow-effect"></div>
          </div>

          <div class="hero-content">
            <h1 class="hero-title">
              Build Obsidian Templates
              <span class="accent">Without Writing Code</span>
            </h1>

            <p class="hero-description">
              Unlock the full power of Obsidian with intuitive template
              building. Create interactive notes, dynamic dashboards, and
              powerful workflows—all without learning syntax or code.
            </p>

            <div class="hero-buttons">
              <router-link to="/editor" class="btn btn-primary btn-lg">
                <span>Try Kuro Editor</span>
                <i class="icon-arrow-right"></i>
              </router-link>

              <a href="#workflow" class="btn btn-outline btn-lg">
                <span>How It Works</span>
                <i class="icon-chevron-down"></i>
              </a>
            </div>

            <div class="hero-badges">
              <div class="badge">
                <i class="icon-lightning"></i>
                <span>No Coding Required</span>
              </div>
              <div class="badge">
                <i class="icon-plugin"></i>
                <span>Works with Popular Plugins</span>
              </div>
              <div class="badge">
                <i class="icon-obsidian"></i>
                <span>Instant Vault Integration</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Feature Highlights Section -->
      <section id="features" class="features-section">
        <div class="container">
          <div class="section-heading">
            <h2 class="section-title">Make Obsidian Work For You</h2>
            <p class="section-subtitle">
              Create powerful templates without technical barriers
            </p>
          </div>

          <div class="features-grid">
            <div
              v-for="(feature, index) in features"
              :key="feature.title"
              class="feature-card"
            >
              <div class="feature-icon">
                <i :class="feature.icon"></i>
              </div>
              <h3>{{ feature.title }}</h3>
              <p>{{ feature.description }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- How It Works Section -->
      <section id="workflow" class="workflow-section">
        <div class="container">
          <div class="section-heading">
            <h2 class="section-title">Effortless Template Creation</h2>
            <p class="section-subtitle">
              Three steps to better templates—no code required
            </p>
          </div>

          <div class="workflow-steps">
            <div
              v-for="(step, index) in workflowSteps"
              :key="step.title"
              class="workflow-step"
            >
              <div class="step-number">{{ index + 1 }}</div>
              <div class="step-icon">
                <i :class="step.icon"></i>
              </div>
              <h3>{{ step.title }}</h3>
              <p>{{ step.description }}</p>
            </div>
          </div>

          <div class="workflow-demo">
            <div class="workflow-tabs">
              <button
                v-for="(tab, index) in tabs"
                :key="tab.name"
                class="workflow-tab"
                :class="{ active: activeTab === index }"
                @click="activeTab = index"
              >
                <i :class="tab.icon"></i>
                <span>{{ tab.name }}</span>
              </button>
            </div>

            <div class="workflow-display">
              <transition name="fade" mode="out-in">
                <div :key="activeTab" class="workflow-screen">
                  <img
                    :src="`/assets/workflow/${tabs[activeTab].gif}`"
                    :alt="tabs[activeTab].name"
                    class="workflow-image"
                  />

                  <div class="workflow-caption">
                    <h4>{{ workflowCaptions[activeTab].title }}</h4>
                    <p>{{ workflowCaptions[activeTab].description }}</p>
                  </div>
                </div>
              </transition>
            </div>
          </div>
        </div>
      </section>

      <!-- User Types Section -->
      <section id="user-types" class="user-types-section">
        <div class="container">
          <div class="section-heading">
            <h2 class="section-title">Who Kuro Is Built For</h2>
            <p class="section-subtitle">
              Whether you're new to Obsidian or looking to enhance your
              workflows, Kuro simplifies template creation for everyone
            </p>
          </div>

          <div class="user-types-grid">
            <div
              v-for="userType in userTypes"
              :key="userType.title"
              class="user-type-card"
            >
              <div class="user-type-icon">
                <i :class="userType.icon"></i>
              </div>
              <h3>{{ userType.title }}</h3>
              <p>{{ userType.description }}</p>
            </div>
          </div>

          <div class="use-cases">
            <h3 class="use-cases-title">Perfect for Creating:</h3>
            <div class="use-cases-grid">
              <div
                v-for="useCase in useCases"
                :key="useCase.title"
                class="use-case-card"
              >
                <i :class="useCase.icon"></i>
                <span>{{ useCase.title }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Testimonials Section -->
      <section class="testimonials-section">
        <div class="container">
          <div class="section-heading">
            <h2 class="section-title">From Obsidian Users Like You</h2>
            <p class="section-subtitle">
              See what people are saying about their experience with Kuro
            </p>
          </div>

          <swiper
            :modules="swiperModules"
            :slides-per-view="slidesPerView"
            :space-between="24"
            :pagination="{ clickable: true }"
            :autoplay="{ delay: 5000, disableOnInteraction: false }"
            class="testimonials-swiper"
          >
            <swiper-slide
              v-for="testimonial in testimonials"
              :key="testimonial.author.name"
            >
              <div class="testimonial-card">
                <blockquote>{{ testimonial.quote }}</blockquote>
                <div class="testimonial-author">
                  <img
                    :src="testimonial.author.avatar"
                    :alt="testimonial.author.name"
                  />
                  <div>
                    <h4>{{ testimonial.author.name }}</h4>
                    <p>{{ testimonial.author.role }}</p>
                  </div>
                </div>
              </div>
            </swiper-slide>
          </swiper>
        </div>
      </section>

      <!-- Pricing Section -->
      <section id="pricing" class="pricing-section">
        <div class="container">
          <div class="section-heading">
            <h2 class="section-title">Simple, Transparent Pricing</h2>
            <p class="section-subtitle">
              Start building better templates today with a plan that fits your
              needs
            </p>
          </div>

          <div class="pricing-toggle">
            <span :class="{ active: billingCycle === 'monthly' }">Monthly</span>
            <button
              class="toggle-switch"
              :class="{ toggled: billingCycle === 'annual' }"
              @click="toggleBillingCycle"
              aria-label="Toggle billing cycle"
            >
              <span class="toggle-slider"></span>
            </button>
            <span :class="{ active: billingCycle === 'annual' }">
              Annual
              <span class="discount-badge">Save 20%</span>
            </span>
          </div>

          <div class="pricing-cards">
            <div class="pricing-card">
              <div class="card-header">
                <h3 class="card-title">Free</h3>
                <div class="price">
                  <span class="currency">$</span>
                  <span class="amount">0</span>
                  <span class="period">/forever</span>
                </div>
                <p class="price-subtitle">Always free</p>
              </div>

              <ul class="feature-list">
                <li v-for="feature in freePlanFeatures" :key="feature">
                  <i class="icon-check"></i>
                  <span>{{ feature }}</span>
                </li>
              </ul>

              <router-link
                to="/signup?plan=free"
                class="btn btn-outline btn-block"
              >
                Get Started
              </router-link>
            </div>

            <div class="pricing-card featured">
              <div class="popular-badge">Most Popular</div>
              <div class="card-header">
                <h3 class="card-title">Pro</h3>
                <div class="price">
                  <span class="currency">$</span>
                  <span class="amount">{{ proPlanPrice }}</span>
                  <span class="period">/{{ billingPeriod }}</span>
                </div>
                <p class="price-subtitle">{{ billingNote }}</p>
              </div>

              <ul class="feature-list">
                <li v-for="feature in proPlanFeatures" :key="feature">
                  <i class="icon-check"></i>
                  <span>{{ feature }}</span>
                </li>
              </ul>

              <router-link
                :to="`/signup?plan=${billingCycle}`"
                class="btn btn-primary btn-block"
              >
                Upgrade to Pro
              </router-link>

              <p class="guarantee">
                7-day money-back guarantee, no questions asked
              </p>
            </div>
          </div>

          <div class="pricing-note">
            <i class="icon-shield"></i>
            <p>Upgrade, downgrade, or cancel anytime. No hidden fees.</p>
          </div>
        </div>
      </section>

      <!-- FAQ Section -->
      <section id="faq" class="faq-section">
        <div class="container">
          <div class="section-heading">
            <h2 class="section-title">Frequently Asked Questions</h2>
            <p class="section-subtitle">
              Find answers to common questions about Kuro
            </p>
          </div>

          <div class="faq-container">
            <div
              v-for="(item, index) in faqItems"
              :key="index"
              class="faq-item"
              :class="{ open: activeIndex === index }"
            >
              <div class="faq-question" @click="toggleFaq(index)">
                <h3>{{ item.question }}</h3>
                <i
                  class="icon-chevron"
                  :class="{ rotated: activeIndex === index }"
                ></i>
              </div>
              <div class="faq-answer" :style="getAnswerStyles(index)">
                <div class="answer-content">
                  <p>{{ item.answer }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="more-questions">
            <p>
              Still have questions? We're here to help.
              <router-link to="/contact" class="text-link"
                >Contact Support</router-link
              >
            </p>
          </div>
        </div>
      </section>

      <!-- Call to Action Section -->
      <section class="cta-section">
        <div class="container">
          <div class="cta-card">
            <div class="cta-content">
              <h2>Stop Struggling With Obsidian Templates</h2>
              <p>
                Build powerful templates without writing a line of code. Enhance
                your productivity, create consistent notes, and unlock the full
                potential of Obsidian.
              </p>

              <div class="cta-buttons">
                <router-link to="/editor" class="btn btn-primary btn-lg">
                  <span>Try Kuro Editor</span>
                  <i class="icon-arrow-right"></i>
                </router-link>

                <router-link to="/signup" class="btn btn-outline btn-lg">
                  <span>Create Account</span>
                  <i class="icon-user"></i>
                </router-link>
              </div>
            </div>

            <div class="cta-graphic">
              <img
                src="@/assets/kuro-icon-mark.png"
                alt="Kuro Template Builder"
                class="graphic-image"
              />
            </div>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="app-footer">
        <div class="container">
          <div class="footer-main">
            <div class="footer-brand">
              <router-link to="/" class="logo">
                <img
                  src="@/assets/kuro-icon-mark.png"
                  alt="Kuro"
                  class="logo-icon"
                />
                <span class="logo-text">Kuro</span>
              </router-link>
              <p class="brand-tagline">Powerful templates without code.</p>
              <div class="social-links">
                <a
                  v-for="social in socialLinks"
                  :key="social.name"
                  :href="social.url"
                  :aria-label="social.name"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="social-link"
                >
                  <i :class="'icon-' + social.icon"></i>
                </a>
              </div>
            </div>

            <div class="footer-links">
              <div
                v-for="group in linkGroups"
                :key="group.title"
                class="link-group"
              >
                <h4 class="group-title">{{ group.title }}</h4>
                <ul class="link-list">
                  <li v-for="link in group.links" :key="link.text">
                    <component
                      :is="link.isExternal ? 'a' : 'router-link'"
                      :to="!link.isExternal ? link.url : undefined"
                      :href="link.isExternal ? link.url : undefined"
                      :target="link.isExternal ? '_blank' : undefined"
                      :rel="link.isExternal ? 'noopener noreferrer' : undefined"
                      class="footer-link"
                    >
                      {{ link.text }}
                    </component>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div class="footer-bottom">
            <p class="copyright">
              &copy; {{ currentYear }} Kuro. All rights reserved.
            </p>

            <div class="legal-links">
              <router-link to="/privacy" class="legal-link"
                >Privacy Policy</router-link
              >
              <router-link to="/terms" class="legal-link"
                >Terms of Service</router-link
              >
              <router-link to="/cookies" class="legal-link"
                >Cookie Policy</router-link
              >
            </div>
          </div>
        </div>
      </footer>
    </div>
  </ScrollContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import ScrollContainer from "@/components/UI/ScrollContainer.vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

// Create a ref for the modules
const swiperModules = [Pagination, Autoplay];

// Navigation state and functionality
interface NavItem {
  label: string;
  link: string;
}

const navigationItems = ref<NavItem[]>([
  { label: "Features", link: "#features" },
  { label: "How It Works", link: "#workflow" },
  { label: "For Who", link: "#user-types" },
  { label: "Pricing", link: "#pricing" },
  { label: "FAQ", link: "#faq" },
]);

const isNavOpen = ref(false);
const isScrolled = ref(false);

const toggleNav = (): void => {
  isNavOpen.value = !isNavOpen.value;

  // Prevent body scroll when menu is open on mobile
  document.body.style.overflow = isNavOpen.value ? "hidden" : "";
};

const closeNav = (): void => {
  if (isNavOpen.value) {
    isNavOpen.value = false;
    document.body.style.overflow = "";
  }
};

const handleScroll = (): void => {
  isScrolled.value = window.scrollY > 20;
};

// Features section
interface Feature {
  icon: string;
  title: string;
  description: string;
}

const features = ref<Feature[]>([
  {
    icon: "fas fa-drafting-compass", // Represents drafting and design, fitting for "Templater Without The Syntax"
    title: "Templater Without The Syntax",
    description:
      "Build dynamic templates with dates, user prompts, and conditional content—no JavaScript knowledge required.",
  },
  {
    icon: "fas fa-database", // Represents data and queries, aligning with "Visual Dataview Builder"
    title: "Visual Dataview Builder",
    description:
      "Create powerful queries and dashboards with a visual interface instead of learning complex query syntax.",
  },
  {
    icon: "fas fa-eye", // Represents previewing or viewing, fitting for "True-to-Obsidian Preview"
    title: "True-to-Obsidian Preview",
    description:
      "See exactly how your template will look in Obsidian with our accurate, real-time preview panel.",
  },
  {
    icon: "fas fa-folder-open", // Represents vaults or folders, aligning with "Direct Vault Integration"
    title: "Direct Vault Integration",
    description:
      "Send templates straight to your Obsidian vault with one click—no manual file management needed.",
  },
  {
    icon: "fas fa-tags", // Represents metadata, aligning with "YAML & Frontmatter Builder"
    title: "YAML & Frontmatter Builder",
    description:
      "Easily create and manage metadata fields with our intuitive property editor and visual interface.",
  },
  {
    icon: "fas fa-th-large", // Represents a collection or library, fitting for "Template Library"
    title: "Template Library",
    description:
      "Start with pre-built templates designed for specific workflows like journals, task management, and notes.",
  },
]);

// Workflow section
interface WorkflowStep {
  icon: string;
  title: string;
  description: string;
}

interface WorkflowTab {
  name: string;
  icon: string;
  gif?: string; // Optional property for GIFs
}

interface WorkflowCaption {
  title: string;
  description: string;
}

const workflowSteps = ref<WorkflowStep[]>([
  {
    icon: "fas fa-puzzle-piece", // Represents building blocks and components, suitable for "Select Modules"
    title: "Select Modules",
    description:
      "Choose from our library of building blocks – from basic headers to dynamic Templater functions.",
  },
  {
    icon: "fas fa-sliders-h", // Represents configuration or control, fitting for "Configure Visually"
    title: "Configure Visually",
    description:
      "Use simple controls to configure each module—we generate the complex code automatically.",
  },
  {
    icon: "fas fa-file-export", // Represents exporting files or data, perfect for "Export to Vault"
    title: "Export to Vault",
    description:
      "Preview in real-time, then push directly to your Obsidian vault or export as a markdown file.",
  },
]);

const tabs = ref<WorkflowTab[]>([
  { name: "Select", icon: "fas fa-puzzle-piece", gif: "Configure.gif" },
  { name: "Configure", icon: "fas fa-sliders-h", gif: "configure.gif" },
  { name: "Export", icon: "fas fa-file-export", gif: "Configure.gif" },
]);

const workflowCaptions = ref<WorkflowCaption[]>([
  {
    title: "Select Template Modules",
    description:
      "Choose from a library of pre-built modules—from basic text elements to dynamic Templater functions.",
  },
  {
    title: "Configure Visually",
    description:
      "Use intuitive controls to customize each module—Kuro generates the complex code and syntax automatically.",
  },
  {
    title: "Export to Your Vault",
    description:
      "Preview results in real-time, then export directly to your Obsidian vault or as a standalone markdown file.",
  },
]);

const activeTab = ref(0);

// User Types section
interface UserType {
  icon: string;
  title: string;
  description: string;
}

interface UseCase {
  title: string;
  icon: string;
}

const userTypes = ref<UserType[]>([
  {
    icon: "fas fa-list", // Represents growth, learning, and starting fresh, perfect for "New Obsidian Users"
    title: "New Obsidian Users",
    description:
      "Skip the learning curve and start using powerful Obsidian features right away, without needing to learn complex syntax or plugins.",
  },
  {
    icon: "fas fa-user-cog", // Represents a non-technical person who likes creating advanced but customizable workflows
    title: "Non-Technical Power Users",
    description:
      "Create sophisticated templates and workflows that use Templater and Dataview features without ever touching a line of code.",
  },
  // {
  //   icon: "fas fa-clock", // Represents productivity and time management, fitting for "Productivity Enthusiasts"
  //   title: "Productivity Enthusiasts",
  //   description:
  //     "Build consistent journaling, task management, and note-taking systems that work exactly how you need them to.",
  // },
  {
    icon: "fas fa-bug", // Represents frustration, debugging, and overcoming challenges, perfect for "Syntax-Frustrated Users"
    title: "Syntax-Frustrated Users",
    description:
      "Eliminate the frustration of troubleshooting code errors in your templates with our visual interface and real-time previews.",
  },
]);

const useCases = ref<UseCase[]>([
  { title: "Daily Notes", icon: "fas fa-clipboard-list" },
  { title: "Journals", icon: "fas fa-feather-alt" },
  { title: "Meeting Notes", icon: "fas fa-comments" },
  { title: "Project Templates", icon: "fas fa-shapes" },
  { title: "Study Notes", icon: "fas fa-brain" },
  { title: "Habit Trackers", icon: "fas fa-calendar-check" },
  { title: "Reading Trackers", icon: "fas fa-book-open" },
  { title: "Recipe Collections", icon: "fas fa-utensils" },
  { title: "Research Notes", icon: "fas fa-book" },
]);

// Testimonials section
interface Author {
  name: string;
  role: string;
  avatar: string;
}

interface Testimonial {
  quote: string;
  author: Author;
}

const testimonials = ref<Testimonial[]>([
  {
    quote:
      "I tried learning Templater three times and gave up. With Kuro, I created a dynamic template for my journal in minutes. Now my notes are consistent and exactly how I want them.",
    author: {
      name: "Maya Desai",
      role: "Content Creator",
      avatar: "https://randomuser.me/api/portraits/women/10.jpg",
    },
  },
  {
    quote:
      "The module system is brilliant. I can see exactly what each part of my template does, and the live preview means I never have to guess if it's working as intended.",
    author: {
      name: "Leo Kim",
      role: "Product Manager",
      avatar: "https://randomuser.me/api/portraits/men/20.jpg",
    },
  },
  {
    quote:
      "As a researcher, I need structured notes with consistent metadata. Kuro lets me create templates that prompt for essential fields and automatically link to related notes without writing code.",
    author: {
      name: "Chloe Dubois",
      role: "PhD Researcher",
      avatar: "https://randomuser.me/api/portraits/women/30.jpg",
    },
  },
  {
    quote:
      "I'm not tech-savvy at all, but Kuro made it easy to create a daily notes template with automatic date formatting and dynamic content. It's transformed how I use Obsidian.",
    author: {
      name: "James Wilson",
      role: "Business Analyst",
      avatar: "https://randomuser.me/api/portraits/men/40.jpg",
    },
  },
  {
    quote:
      "Kuro has turned Obsidian into a professional-grade tool for my freelance writing. The prebuilt templates and real-time preview save me hours of formatting—and keep me focused on writing.",
    author: {
      name: "Sofia Martinez",
      role: "Freelance Writer",
      avatar: "https://randomuser.me/api/portraits/women/50.jpg",
    },
  },
  {
    quote:
      "I used to dread building templates because I’d spend hours troubleshooting weird syntax errors. Now I click, drag, and tweak, and everything just works. Kuro is a game-changer for non-coders like me.",
    author: {
      name: "Ethan Garcia",
      role: "Operations Specialist",
      avatar: "https://randomuser.me/api/portraits/men/60.jpg",
    },
  },
  {
    quote:
      "From customizing my task manager to organizing lecture notes, Kuro adapts to everything I need. It’s like having a personal assistant that thinks exactly the way I do.",
    author: {
      name: "Amelia Nguyen",
      role: "University Student",
      avatar: "https://randomuser.me/api/portraits/women/70.jpg",
    },
  },
]);

// Responsive slides per view
const windowWidth = ref(typeof window !== "undefined" ? window.innerWidth : 0);

const slidesPerView = computed(() => {
  if (windowWidth.value < 640) return 1;
  if (windowWidth.value < 1024) return 2;
  return 3;
});

// Pricing section
type BillingCycle = "monthly" | "annual";

const billingCycle = ref<BillingCycle>("monthly");

const freePlanFeatures = ref([
  "Basic template modules",
  "Unlimited template creation",
  "Markdown export",
  "Community support",
]);

const proPlanFeatures = ref([
  "Everything in Free plan",
  "All template modules including Templater & Dataview",
  "Direct Obsidian vault integration",
  "True-to-Obsidian preview",
  "Template library access",
  "Template sharing & importing",
  "Faster updates & new modules",
  "Priority support",
]);

const toggleBillingCycle = () => {
  billingCycle.value = billingCycle.value === "monthly" ? "annual" : "monthly";
};

const proPlanPrice = computed(() => {
  return billingCycle.value === "monthly" ? "4.99" : "48";
});

const billingPeriod = computed(() => {
  return billingCycle.value === "monthly" ? "month" : "year";
});

const billingNote = computed(() => {
  return billingCycle.value === "monthly"
    ? "Billed monthly, cancel anytime"
    : "Billed annually (save 20%)";
});

// FAQ section
interface FaqItem {
  question: string;
  answer: string;
}

const faqItems = ref<FaqItem[]>([
  {
    question: "Do I need to know JavaScript or query syntax?",
    answer:
      "Not at all! That's why we built Kuro. Our visual modules generate all the necessary code behind the scenes, so you can create dynamic templates without learning JavaScript or Dataview query syntax.",
  },
  {
    question: "Do I need Templater and Dataview installed in Obsidian?",
    answer:
      "Yes. Kuro helps you build templates using these plugins' capabilities without knowing their syntax. You'll need the plugins installed in your Obsidian vault for the templates to function properly when used.",
  },
  {
    question: "How does the Obsidian vault integration work?",
    answer:
      "Kuro connects directly to your local Obsidian vault folders. Once connected, you can push templates directly to your vault's template folder with one click. This connection is local and secure—your vault contents are never uploaded to our servers.",
  },
  {
    question: "What if I want to expand beyond what the modules offer?",
    answer:
      "Kuro generates standard Templater and Dataview code that you can extend. Advanced users can always edit the generated code directly or add custom JavaScript. Our goal is to make the basics accessible while allowing for growth as your skills develop.",
  },
  {
    question: "What happens to my templates if I cancel my subscription?",
    answer:
      "Any templates you've exported or pushed to your vault remain yours permanently. You'll lose access to cloud storage of templates and the ability to edit them in our app after your subscription ends, but all your created templates will continue to work in Obsidian.",
  },
]);

const activeIndex = ref<number | null>(null);

const toggleFaq = (index: number) => {
  activeIndex.value = activeIndex.value === index ? null : index;
};

const getAnswerStyles = (index: number) => {
  if (activeIndex.value === index) {
    const answerContent = document.querySelectorAll(".answer-content")[index];
    return {
      maxHeight: answerContent
        ? `${answerContent.scrollHeight + 32}px`
        : "auto",
    };
  }
  return { maxHeight: "0" };
};

// Footer
interface SocialLink {
  name: string;
  url: string;
  icon: string;
}

interface FooterLink {
  text: string;
  url: string;
  isExternal: boolean;
}

interface LinkGroup {
  title: string;
  links: FooterLink[];
}

const socialLinks = ref<SocialLink[]>([
  {
    name: "Twitter",
    url: "https://twitter.com/buildwithkuro",
    icon: "twitter",
  },
  {
    name: "GitHub",
    url: "https://github.com/kuro-app",
    icon: "github",
  },
  {
    name: "Discord",
    url: "https://discord.gg/kuro-community",
    icon: "discord",
  },
  {
    name: "YouTube",
    url: "https://youtube.com/buildwithkuro",
    icon: "youtube",
  },
]);

const linkGroups = ref<LinkGroup[]>([
  {
    title: "Product",
    links: [
      { text: "Features", url: "#features", isExternal: false },
      { text: "Pricing", url: "#pricing", isExternal: false },
      { text: "Changelog", url: "/changelog", isExternal: false },
      { text: "Roadmap", url: "/roadmap", isExternal: false },
    ],
  },
  {
    title: "Resources",
    links: [
      { text: "Documentation", url: "/docs", isExternal: false },
      { text: "Templates", url: "/templates", isExternal: false },
      { text: "Tutorials", url: "/tutorials", isExternal: false },
      { text: "Blog", url: "/blog", isExternal: false },
    ],
  },
  {
    title: "Community",
    links: [
      {
        text: "Discord",
        url: "https://discord.gg/kuro-community",
        isExternal: true,
      },
      {
        text: "Twitter",
        url: "https://twitter.com/buildwithkuro",
        isExternal: true,
      },
      { text: "GitHub", url: "https://github.com/kuro-app", isExternal: true },
      {
        text: "Obsidian Forum",
        url: "https://forum.obsidian.md/tag/kuro",
        isExternal: true,
      },
    ],
  },
  {
    title: "Company",
    links: [
      { text: "About", url: "/about", isExternal: false },
      { text: "Contact", url: "/contact", isExternal: false },
      { text: "Jobs", url: "/jobs", isExternal: false },
      { text: "Press Kit", url: "/press", isExternal: false },
    ],
  },
]);

const currentYear = computed(() => new Date().getFullYear());

// Window size/resize events
const handleResize = () => {
  windowWidth.value = window.innerWidth;
};

// Lifecycle hooks
onMounted(() => {
  window.addEventListener("scroll", handleScroll);
  window.addEventListener("resize", handleResize);

  // Check initial scroll/size state
  handleScroll();
  handleResize();

  // Initialize FAQ answers to collapsed state
  document.querySelectorAll(".faq-answer").forEach((element) => {
    (element as HTMLElement).style.maxHeight = "0";
  });
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
  window.removeEventListener("resize", handleResize);

  // Reset body overflow in case component is unmounted while menu is open
  document.body.style.overflow = "";
});

// Ensure FAQ answers are updated when content changes
watch(
  () => activeIndex.value,
  () => {
    setTimeout(() => {
      document.querySelectorAll(".faq-answer").forEach((element, index) => {
        const answerContent =
          document.querySelectorAll(".answer-content")[index];
        if (index === activeIndex.value && answerContent) {
          (element as HTMLElement).style.maxHeight = `${
            answerContent.scrollHeight + 32
          }px`;
        } else {
          (element as HTMLElement).style.maxHeight = "0";
        }
      });
    }, 50); // Small delay to ensure DOM is updated
  }
);
</script>

<style>
/* CSS Variables for consistent theming */
/* I need to figure out why the root here effects my entire code base. How is that happening? */
:root {
  /* Colors */
  --color-primary: #8866e9;
  --color-primary-light: #a184f0;
  --color-primary-dark: #6a4fcc;
  --color-secondary: #55c2da;

  --color-background: #14151e;
  --color-background-alt: #0f1018;
  --color-surface: rgba(255, 255, 255, 0.1);
  --color-surface-dark: #171822;

  --color-text: #e0e0e0;
  --color-text-light: #b0b0b0;

  --color-border: rgba(255, 255, 255, 0.08);
  --color-border-hover: rgba(255, 255, 255, 0.15);

  /* RGBA variants for opacity usage */
  --color-primary-rgb: 136, 102, 233;
  --color-background-rgb: 20, 21, 30;
  --color-surface-rgb: 30, 31, 46;

  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-xxl: 4rem;

  /* Border radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;

  /* Typography */
  --font-sans: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  --font-mono: "JetBrains Mono", "SF Mono", "Cascadia Code", "Menlo", "Consolas",
    monospace;

  /* Transitions */
  --transition-fast: 0.2s;
  --transition-normal: 0.3s;
  --transition-slow: 0.5s;

  /* Shadows */
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.15);
  --shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.2);
  --shadow-xl: 0 15px 30px rgba(0, 0, 0, 0.25);

  /* Layout */
  --max-width: 1200px;
  --header-height: 70px;
}

/* Base Styles */
html {
  scroll-behavior: smooth;
}

body {
  background-color: var(--color-background);
  color: var(--color-text);
  font-family: var(--font-sans);
  line-height: 1.6;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

.container {
  width: 100%;
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}

/* Typography */
h1,
h2,
h3,
h4,
h5,
h6 {
  margin: 0 0 var(--spacing-md);
  font-weight: 700;
  line-height: 1.3;
  color: var(--color-text);
}

h1 {
  font-size: 3rem;
}

h2 {
  font-size: 2.25rem;
}

h3 {
  font-size: 1.5rem;
}

h4 {
  font-size: 1.25rem;
}

p {
  margin: 0 0 var(--spacing-md);
  color: var(--color-text-light);
}

a {
  color: var(--color-primary);
  text-decoration: none;
  transition: color var(--transition-normal);
}

a:hover {
  color: var(--color-primary-light);
}

/* Section Styling */
section {
  padding: 6rem 0;
  position: relative;
}

.section-heading {
  text-align: center;
  margin-bottom: 3rem;
}

.section-title {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  background: linear-gradient(
    90deg,
    var(--color-primary),
    var(--color-secondary)
  );
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  display: inline-block;
}

.section-subtitle {
  font-size: 1.125rem;
  color: var(--color-text-light);
  max-width: 700px;
  margin: 0 auto;
}

.accent {
  color: var(--color-primary);
  display: block;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all var(--transition-normal);
  border: none;
  text-align: center;
}

.btn-lg {
  padding: 0.75rem 1.5rem;
  font-size: 1.125rem;
}

.btn-block {
  display: flex;
  width: 100%;
}

.btn-primary {
  background: linear-gradient(
    90deg,
    var(--color-primary),
    var(--color-primary-dark)
  );
  color: white;
}

.btn-primary:hover {
  background: linear-gradient(
    90deg,
    var(--color-primary-dark),
    var(--color-primary)
  );
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(var(--color-primary-rgb), 0.3);
}

.btn-outline {
  background: transparent;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
}

.btn-outline:hover {
  background: rgba(var(--color-primary-rgb), 0.1);
  transform: translateY(-2px);
}

/* Header/Navigation */
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  transition: all var(--transition-normal);
  padding: 1rem 0;
  background: rgba(var(--color-background-rgb), 0.85);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid transparent;
}

.app-header.scrolled {
  padding: 0.75rem 0;
  background: rgba(var(--color-background-rgb), 0.95);
  border-bottom-color: var(--color-border);
  box-shadow: var(--shadow-md);
}

.app-header .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  z-index: 1001;
}

.logo-icon {
  height: 2rem;
  width: auto;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(
    90deg,
    var(--color-primary),
    var(--color-primary-light)
  );
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-link {
  color: var(--color-text-light);
  font-weight: 500;
  position: relative;
}

.nav-link::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: -4px;
  width: 0;
  height: 2px;
  background: var(--color-primary);
  transition: width var(--transition-normal);
}

.nav-link:hover {
  color: var(--color-text);
}

.nav-link:hover::after {
  width: 100%;
}

.nav-cta {
  margin-left: 1rem;
}

.menu-toggle {
  display: none;
  background: transparent;
  border: none;
  cursor: pointer;
  width: 30px;
  height: 24px;
  position: relative;
  z-index: 1001;
}

.menu-toggle span {
  display: block;
  width: 100%;
  height: 2px;
  background: var(--color-text);
  position: absolute;
  left: 0;
  transition: all var(--transition-normal);
  border-radius: 2px;
}

.menu-toggle span:nth-child(1) {
  top: 0;
}

.menu-toggle span:nth-child(2) {
  top: 50%;
  transform: translateY(-50%);
}

.menu-toggle span:nth-child(3) {
  bottom: 0;
}

/* Hero Section */
.hero-section {
  min-height: 100vh;
  padding: 8rem 0 6rem;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.hero-section .container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.hero-title {
  font-size: 3.75rem;
  line-height: 1.2;
  margin-bottom: 1.5rem;
}

.hero-description {
  font-size: 1.25rem;
  margin-bottom: 2.5rem;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
  margin-bottom: 2.5rem;
}

.hero-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(var(--color-surface-rgb), 0.5);
  padding: 0.5rem 1rem;
  border-radius: 100px;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-light);
  border: 1px solid var(--color-border);
  transition: all var(--transition-normal);
}

.badge:hover {
  background: var(--color-surface);
  border-color: var(--color-border-hover);
  transform: translateY(-2px);
}

.hero-image {
  position: relative;
  width: 100%;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-xl);
  transition: all var(--transition-normal);
  border: 1px solid var(--color-border);
}

.hero-image:hover {
  transform: translateY(-5px);
  box-shadow: 0 25px 50px rgba(var(--color-primary-rgb), 0.2);
  border-color: var(--color-primary);
}

.preview-image {
  width: 100%;
  height: auto;
  display: block;
}

.glow-effect {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at 50% 50%,
    rgba(var(--color-primary-rgb), 0.25),
    transparent 70%
  );
  filter: blur(30px);
  opacity: 0;
  transition: opacity var(--transition-normal);
  z-index: -1;
}

.hero-image:hover .glow-effect {
  opacity: 1;
}

/* Features Section */
.features-section {
  background-color: var(--color-background-alt);
  position: relative;
  overflow: hidden;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
}

.feature-card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: 2rem;
  transition: all var(--transition-normal);
  border: 1px solid var(--color-border);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.feature-card:hover {
  transform: translateY(-5px);
  border-color: var(--color-primary);
  box-shadow: 0 15px 30px rgba(var(--color-primary-rgb), 0.1);
}

.feature-icon {
  width: 3rem;
  height: 3rem;
  background: rgba(var(--color-primary-rgb), 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  color: var(--color-primary);
  font-size: 1.5rem;
}

/* Workflow Section */
.workflow-section {
  position: relative;
  overflow: hidden;
}

.workflow-steps {
  display: flex;
  justify-content: space-between;
  gap: 2rem;
  margin-bottom: 4rem;
}

.workflow-step {
  flex: 1;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  padding: 2rem;
  text-align: center;
  position: relative;
  transition: all var(--transition-normal);
}

.workflow-step:hover {
  transform: translateY(-5px);
  border-color: var(--color-primary);
  box-shadow: 0 15px 30px rgba(var(--color-primary-rgb), 0.1);
}

.step-number {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-primary);
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 700;
  font-size: 1.125rem;
}

.step-icon {
  font-size: 2.5rem;
  color: var(--color-primary);
  margin: 1rem 0 1.5rem;
}

.workflow-demo {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-xl);
  margin-top: 3rem;
}

.workflow-tabs {
  display: flex;
  background: var(--color-surface-dark);
  border-bottom: 1px solid var(--color-border);
}

.workflow-tab {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--color-text-light);
  padding: 1rem;
  font-size: 1rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all var(--transition-normal);
  border-bottom: 2px solid transparent;
}

.workflow-tab:hover {
  background: rgba(var(--color-primary-rgb), 0.05);
  color: var(--color-text);
}

.workflow-tab.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
  background: rgba(var(--color-primary-rgb), 0.05);
}

.workflow-display {
  position: relative;
  min-height: 400px;
}

.workflow-screen {
  position: relative;
  width: 100%;
}

.workflow-image {
  width: 100%;
  height: auto;
  display: block;
}

.workflow-caption {
  padding: 1.5rem;
  background: var(--color-surface-dark);
  border-top: 1px solid var(--color-border);
}

.workflow-caption h4 {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  color: var(--color-text);
}

.workflow-caption p {
  color: var(--color-text-light);
  font-size: 1rem;
  margin: 0;
}

/* Fade transition for workflow tabs */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* User Types Section */
.user-types-section {
  background-color: var(--color-background-alt);
  position: relative;
  overflow: hidden;
}

.user-types-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  margin-bottom: 4rem;
}

.user-type-card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  padding: 2rem;
  transition: all var(--transition-normal);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.user-type-card:hover {
  transform: translateY(-5px);
  border-color: var(--color-primary);
  box-shadow: 0 15px 30px rgba(var(--color-primary-rgb), 0.1);
}

.user-type-icon {
  width: 3rem;
  height: 3rem;
  background: rgba(var(--color-primary-rgb), 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  color: var(--color-primary);
  font-size: 1.5rem;
}

.use-cases {
  margin-top: 4rem;
  text-align: center;
}

.use-cases-title {
  font-size: 1.5rem;
  margin-bottom: 2rem;
}

.use-cases-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
}

.use-case-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: 0.75rem 1.25rem;
  font-size: 1rem;
  font-weight: 500;
  color: var(--color-text-light);
  transition: all var(--transition-normal);
  border: 1px solid var(--color-border);
}

.use-case-card:hover {
  transform: translateY(-3px);
  background: var(--color-surface-dark);
  border-color: var(--color-primary);
  box-shadow: 0 5px 15px rgba(var(--color-primary-rgb), 0.15);
  color: var(--color-text);
}

/* Testimonials Section */
.testimonials-section {
  position: relative;
  overflow: hidden;
}

.testimonials-swiper {
  padding-bottom: 3.5rem;
  margin-top: 3rem;
}

.testimonial-card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  padding: 2rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all var(--transition-normal);
}

.testimonial-card:hover {
  transform: translateY(-5px);
  border-color: var(--color-primary);
  box-shadow: 0 15px 30px rgba(var(--color-primary-rgb), 0.1);
}

.testimonial-card blockquote {
  margin: 0 0 1.5rem;
  font-style: italic;
  color: var(--color-text);
  border-left: 3px solid var(--color-primary);
  padding-left: 1.5rem;
  flex: 1;
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.testimonial-author img {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.testimonial-author h4 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
}

.testimonial-author p {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  margin: 0;
}

/* Pricing Section */
.pricing-section {
  background-color: var(--color-background-alt);
  position: relative;
  overflow: hidden;
}

.pricing-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin: 3rem 0;
  font-size: 1rem;
  color: var(--color-text-light);
}

.pricing-toggle span {
  transition: color var(--transition-normal);
}

.pricing-toggle span.active {
  color: var(--color-text);
  font-weight: 500;
}

.toggle-switch {
  position: relative;
  width: 48px;
  height: 24px;
  background: var(--color-surface-dark);
  border-radius: 100px;
  border: 1px solid var(--color-border);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.toggle-switch:hover {
  background: var(--color-surface);
}

.toggle-switch.toggled {
  background: var(--color-primary);
  border-color: var(--color-primary);
}

.toggle-slider {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  background: var(--color-text);
  border-radius: 50%;
  transition: transform var(--transition-normal);
}

.toggle-switch.toggled .toggle-slider {
  transform: translateX(24px);
  background: white;
}

.discount-badge {
  display: inline-block;
  background: rgba(var(--color-primary-rgb), 0.1);
  color: var(--color-primary);
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  margin-left: 0.5rem;
}

.pricing-cards {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin: 2rem 0 3rem;
}

.pricing-card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  padding: 2rem;
  width: 100%;
  max-width: 350px;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: all var(--transition-normal);
}

.pricing-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.pricing-card.featured {
  border-color: var(--color-primary);
  background: var(--color-surface-dark);
  box-shadow: 0 20px 40px rgba(var(--color-primary-rgb), 0.1);
  transform: scale(1.05);
}

.pricing-card.featured:hover {
  transform: scale(1.05) translateY(-5px);
}

.popular-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-primary);
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.3rem 1rem;
}

/* FAQ Section */
.faq-section {
  padding: var(--spacing-xxl) 0;
}

.faq-container {
  max-width: 800px;
  margin: 0 auto;
}

/* FAQ Item */
.faq-item {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-lg);
  overflow: hidden;
  transition: all var(--transition-normal);
}

/* FAQ Item (Expanded) */
.faq-item.open {
  border-color: var(--color-primary);
  box-shadow: 0 10px 30px rgba(var(--color-primary-rgb), 0.1);
}

/* FAQ Question */
.faq-question {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg);
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  color: var(--color-text);
  transition: color var(--transition-normal);
}

.faq-question:hover {
  color: var(--color-primary);
}

/* Question Icon */
.faq-question .icon-chevron {
  font-size: 1.25rem;
  color: var(--color-text-light);
  transition: transform var(--transition-normal), color var(--transition-normal);
}

.faq-question .icon-chevron.rotated {
  transform: rotate(180deg);
  color: var(--color-primary);
}

/* FAQ Answer */
.faq-answer {
  max-height: 0;
  overflow: hidden;
  transition: max-height var(--transition-normal) ease;
  background: var(--color-surface-dark);
}

.faq-answer .answer-content {
  padding: var(--spacing-lg);
  color: var(--color-text-light);
  font-size: 1rem;
  line-height: 1.5;
}

/* FAQ Answer Visible (Expanded) */
.faq-item.open .faq-answer {
  max-height: 200px; /* Adjust based on expected answer size */
}

/* More Questions Section */
.more-questions {
  text-align: center;
  margin-top: var(--spacing-xl);
}

.more-questions p {
  font-size: 1.125rem;
  color: var(--color-text-light);
}

.more-questions .text-link {
  color: var(--color-primary);
  font-weight: 600;
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: all var(--transition-normal);
}

.more-questions .text-link:hover {
  color: var(--color-primary-light);
  border-bottom-color: var(--color-primary-light);
}

/* Call to Action Section */
.cta-section {
  background: linear-gradient(
    120deg,
    rgba(var(--color-primary-rgb), 0.2),
    rgba(var(--color-secondary-rgb), 0.1)
  );
  padding: var(--spacing-xxl) 0;
  overflow: hidden;
}

.cta-card {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-xl);
  background: var(--color-surface-dark);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 3rem;
}

.cta-content {
  flex: 1;
  text-align: left;
}

.cta-content h2 {
  font-size: 2rem;
  margin-bottom: var(--spacing-md);
  color: var(--color-text);
}

.cta-content p {
  font-size: 1.125rem;
  margin-bottom: var(--spacing-lg);
  color: var(--color-text-light);
}

.cta-buttons {
  display: flex;
  gap: var(--spacing-md);
}

.cta-graphic {
  flex: 1;
  text-align: center;
}

.cta-graphic img {
  max-width: 100%;
  height: auto;
  display: block;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  transition: transform var(--transition-normal);
}

.cta-graphic img:hover {
  transform: translateY(-5px);
}

/* Footer Section */
.app-footer {
  background: var(--color-surface-dark);
  padding: var(--spacing-xxl) 0 var(--spacing-xl);
  color: var(--color-text-light);
}

.footer-main {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.footer-brand {
  flex: 1 1 30%;
}

.footer-brand .logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.footer-brand .logo-icon {
  height: 40px;
  width: auto;
}

.footer-brand .logo-text {
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(
    90deg,
    var(--color-primary),
    var(--color-secondary)
  );
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.footer-brand .brand-tagline {
  font-size: 0.875rem;
  color: var(--color-text-light);
  margin-bottom: var(--spacing-lg);
}

.social-links {
  display: flex;
  gap: var(--spacing-md);
}

.social-link {
  color: var(--color-text-light);
  font-size: 1.25rem;
  transition: color var(--transition-normal);
}

.social-link:hover {
  color: var(--color-primary);
}

.footer-links {
  flex: 1 1 60%;
  display: flex;
  gap: var(--spacing-lg);
}

.link-group {
  flex: 1 1 45%;
}

.group-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--spacing-sm);
}

.link-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.link-list li {
  margin-bottom: var(--spacing-sm);
}

.footer-link {
  color: var(--color-text-light);
  text-decoration: none;
  font-size: 0.875rem;
  transition: all var(--transition-normal);
}

.footer-link:hover {
  color: var(--color-primary);
}

/* Footer Bottom Section */
.footer-bottom {
  border-top: 1px solid var(--color-border);
  padding-top: var(--spacing-lg);
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-md);
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.copyright {
  margin: 0;
}

.legal-links {
  display: flex;
  gap: var(--spacing-md);
}

.legal-link {
  color: var(--color-text-light);
  text-decoration: none;
  transition: all var(--transition-normal);
}

.legal-link:hover {
  color: var(--color-primary);
}
</style>
