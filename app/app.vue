<script setup lang="ts">
import './assets/portfolio.css'
import { projects } from './projects'
import { certificates } from './certificates'

useSeoMeta({
  title: 'John Diems | Web Developer',
  description: 'John Diems builds web applications for public services and business operations.',
})

const theme = ref(false)
const keyboardInput = ref(false)
const root = ref<HTMLElement>()
const gallery = ref<HTMLDialogElement>()
const contactPanel = ref<HTMLDialogElement>()
const showContactCard = ref(false)
const floatingContact = ref<HTMLElement>()
let contactHideTimer: ReturnType<typeof setTimeout> | undefined
let previousScrollY = 0
const activeProject = ref<(typeof projects)[number]>()
const slide = ref(0)
const terminalLine = ref('')
const contactStatus = ref('')
const sending = ref(false)
const formId = useRuntimeConfig().public.formspreeFormId.trim()
const contactEndpoint = /^[a-z0-9]+$/i.test(formId) ? 'https://formspree.io/f/' + formId : ''
const copyFeedback = ref('')
const email = 'johndiems7@gmail.com'
const terminalCommand = '$ cat about.txt'
let observer: IntersectionObserver | undefined
let projectCards: HTMLElement[] = []
let cardFadeFrame = 0
let cardMotionPreference: MediaQueryList | undefined

function updateCardFades() {
  cardFadeFrame = 0
  const viewport = window.innerHeight
  // Reach full opacity early; keep the central reading area completely steady.
  for (const card of projectCards) {
    const { top, bottom, height } = card.getBoundingClientRect()
    const visible = Math.max(0, Math.min(bottom, viewport) - Math.max(top, 0))
    const fadeDistance = Math.max(1, Math.min(height, viewport) * .6)
    const minimumOpacity = cardMotionPreference?.matches ? .75 : .15
    const opacity = minimumOpacity + (1 - minimumOpacity) * Math.min(1, visible / fadeDistance)
    card.style.opacity = String(opacity)
  }
}

function scheduleCardFades() {
  if (!cardFadeFrame) cardFadeFrame = requestAnimationFrame(updateCardFades)
}
let typing: ReturnType<typeof setInterval> | undefined

function toggleTheme() {
  theme.value = !theme.value
  localStorage.setItem('portfolio-matrix', String(theme.value))
}

async function copyEmail() {
  try {
    await navigator.clipboard.writeText(email)
    copyFeedback.value = 'Email copied.'
  } catch {
    copyFeedback.value = 'Copy the address above or select it to open your email app.'
  }
}

async function sendContact(event: SubmitEvent) {
  if (sending.value || !contactEndpoint) return

  const form = event.currentTarget as HTMLFormElement
  const fields = new FormData(form)
  for (const field of ['name', 'email', 'message']) {
    const value = String(fields.get(field) ?? '').trim()
    if (!value) {
      contactStatus.value = 'Enter your name, email, and message.'
      return
    }
    fields.set(field, value)
  }

  sending.value = true
  contactStatus.value = ''
  try {
    const response = await fetch(contactEndpoint, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: fields,
    })
    if (response.ok) {
      form.reset()
      contactStatus.value = 'Thanks. Your message was submitted.'
    } else {
      contactStatus.value = response.status === 429
        ? 'Too many requests. Wait a minute and try again.'
        : 'Your message could not be submitted. Try again or use the email address above.'
    }
  } catch {
    contactStatus.value = 'Your message could not be submitted. Check your connection and try again.'
  } finally {
    sending.value = false
  }
}

function viewGallery(project: (typeof projects)[number]) {
  activeProject.value = project
  slide.value = 0
  gallery.value?.showModal()
}

function changeSlide(delta: number) {
  const total = activeProject.value?.images.length ?? 0
  if (total) slide.value = (slide.value + delta + total) % total
}

function animateTerminal() {
  let index = 0
  typing = setInterval(() => {
    terminalLine.value = terminalCommand.slice(0, ++index)
    if (index >= terminalCommand.length) clearInterval(typing)
  }, 45)
}

function scheduleContactHide() {
  clearTimeout(contactHideTimer)
  contactHideTimer = setTimeout(() => {
    if (!floatingContact.value?.matches(':hover, :focus-within')) showContactCard.value = false
  }, 2400)
}

function revealContactCard() {
  const currentScrollY = Math.max(0, window.scrollY)
  if (currentScrollY === previousScrollY) return

  showContactCard.value = currentScrollY >= 240 && currentScrollY > previousScrollY
  previousScrollY = currentScrollY
  if (showContactCard.value) scheduleContactHide()
  else clearTimeout(contactHideTimer)
}

function dismissContactCard() {
  showContactCard.value = false
  clearTimeout(contactHideTimer)
  window.removeEventListener('scroll', revealContactCard)
}

onMounted(() => {
  previousScrollY = Math.max(0, window.scrollY)
  window.addEventListener('scroll', revealContactCard, { passive: true })
  theme.value = localStorage.getItem('portfolio-matrix') === 'true'
  cardMotionPreference = matchMedia('(prefers-reduced-motion: reduce)')
  cardMotionPreference.addEventListener('change', scheduleCardFades)
  projectCards = Array.from(root.value?.querySelectorAll<HTMLElement>('.project-card') ?? [])
  window.addEventListener('scroll', scheduleCardFades, { passive: true })
  window.addEventListener('resize', scheduleCardFades)
  scheduleCardFades()
  if (cardMotionPreference.matches || !('IntersectionObserver' in window)) {
    terminalLine.value = terminalCommand
    return
  }
  observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue
      entry.target.classList.add('is-revealed')
      if (entry.target.classList.contains('terminal')) animateTerminal()
      observer?.unobserve(entry.target)
    }
  }, { threshold: .06 })
  root.value?.querySelectorAll('[data-reveal]:not(.project-card)').forEach((element) => {
    if (element.getBoundingClientRect().top >= window.innerHeight) {
      element.classList.add('reveal-pending')
    }
    observer?.observe(element)
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', revealContactCard)
  clearTimeout(contactHideTimer)
  observer?.disconnect()
  window.removeEventListener('scroll', scheduleCardFades)
  window.removeEventListener('resize', scheduleCardFades)
  cancelAnimationFrame(cardFadeFrame)
  cardMotionPreference?.removeEventListener('change', scheduleCardFades)
  projectCards = []
  clearInterval(typing)
})
</script>

<template>
  <div ref="root" class="portfolio" :class="{ 'matrix-mode': theme, 'keyboard-input': keyboardInput }"
    @keydown.capture="keyboardInput = true" @pointerdown.capture="keyboardInput = false"
    @wheel.capture.passive="keyboardInput = false" @touchstart.capture.passive="keyboardInput = false">
    <a class="skip" href="#main">Skip to content</a>
    <MatrixRain v-if="theme" />
    <header class="site-header">
      <div class="shell header-inner">
        <a class="brand" href="#home">
          <img src="/assets/images/john-diems-avatar.png" alt="" width="32" height="32">
          <div>John Developer<span>.</span></div>
        </a>
        <nav aria-label="Main navigation">
          <a href="#projects">Work</a>
          <a href="#about">About</a>
          <a href="#certificates">Certificates</a>
          <a href="#contact">Contact</a>
        </nav>
        <button class="mode-button" type="button" :aria-pressed="theme" aria-label="Matrix mode"
          @click="toggleTheme">Matrix</button>
      </div>
    </header>

    <main id="main">
      <PortfolioHero />
      <section id="projects" class="shell section">
        <div class="section-heading" data-reveal>
          <h2>Selected work</h2>
          <p>From city services to day-to-day business operations.</p>
        </div>
        <div class="project-grid">
          <article v-for="project in projects" :key="project.name" class="project-card" data-reveal>
            <span class="project-border-sweep" aria-hidden="true"></span>
            <button v-if="project.images.length" type="button" class="project-preview"
              :aria-label="'View gallery for ' + project.name" @click="viewGallery(project)">
              <img :src="project.images[0]" alt="" loading="lazy" decoding="async" width="960" height="540">
              <img v-if="project.alternate || project.images[1]" class="preview-alternate"
                :src="project.alternate || project.images[1]" alt="" loading="lazy" decoding="async" width="960"
                height="540">
              <span>View gallery</span>
            </button>
            <div v-else-if="project.preview" class="project-text-preview" aria-hidden="true">
              <span>{{ project.preview }}</span>
            </div>
            <div class="project-copy">
              <div class="project-meta">
                <p class="category">{{ project.category }}</p>
                <span v-if="project.status" class="project-status">{{ project.status }}</span>
              </div>
              <h3>{{ project.name }}</h3>
              <p>{{ project.description }}</p>
              <p class="project-stack"><strong>Tech stack</strong> {{ project.stack }}</p>
              <p v-if="project.sourceRestricted" class="project-stack">Source code is withheld for security and privacy
                reasons.</p>
              <details v-if="project.url || project.repos.length">
                <summary>Project links</summary>
                <div class="detail-links">
                  <a v-if="project.url" :href="project.url" target="_blank" rel="noopener noreferrer">Live site</a>
                  <a v-for="(repo, index) in project.repos" :key="repo" :href="repo" target="_blank" rel="noopener noreferrer">{{ project.repos.length > 1 ?
                    (index === 0 ? 'Frontend source' : 'Backend source') : 'Source code' }}</a>
                </div>
              </details>
            </div>
          </article>
        </div>
      </section>

      <section id="about" class="shell section about">
        <div data-reveal>
          <h2>About me</h2>
          <p>I’m John Diems, a web developer based in Davao City. At the City Information Technology Center, I worked on
            public-facing systems for housing and sports and helped rebuild the city government website. I also build
            tools for smaller businesses, including a bakery pricing calculator and a quoting app for cleaning
            businesses.</p>
          <p>My main focus is frontend development with Vue and Nuxt. I work with designers to turn layouts into
            responsive pages, and with backend developers to connect those pages to Laravel APIs. Once a feature is
            built, I check how it works across devices and browsers, fix defects, and look for ways to improve
            accessibility and performance.</p>
          <p>I earned my Bachelor of Science in Information Technology from Assumption College of Davao, where I studied
            from 2019 to 2023.</p>
        </div>
        <div class="terminal" data-reveal>
          <div class="terminal-bar">about.txt</div>
          <span class="terminal-command" aria-hidden="true">{{ terminalLine }}<span class="cursor" /></span>
          <dl>
            <div>
              <dt>Role</dt>
              <dd>Web developer</dd>
            </div>
            <div>
              <dt>Based in</dt>
              <dd>Davao City, Philippines</dd>
            </div>
            <div>
              <dt>Focus</dt>
              <dd>Responsive frontends and REST APIs</dd>
            </div>
            <div>
              <dt>Tools</dt>
              <dd>Vue, Nuxt, TypeScript, Laravel</dd>
            </div>
          </dl>
        </div>
      </section>

      <section id="experience" class="shell section">
        <div class="section-heading" data-reveal>
          <h2>Experience</h2>
          <p>City Government of Davao</p>
        </div>
        <div class="experience-list">
          <article class="experience-entry" data-reveal>
            <div class="experience-meta">
              <h3>Junior Web Developer</h3>
              <p>City Information Technology Center</p>
              <p>February 2024–2026</p>
            </div>
            <div class="experience-copy">
              <p>Developed, tested, deployed, and maintained responsive web applications for city services. My portfolio
                work from this role includes the Housing Management Information System, the city’s athletics and sports
                system, and the Davao City website revamp.</p>
              <ul>
                <li>Worked with UI/UX designers to implement responsive Vue and Nuxt interfaces and check that they
                  worked across browsers and devices.</li>
                <li>Collaborated with backend developers to integrate REST APIs and contributed to Laravel backend work
                  for city applications.</li>
                <li>Troubleshot defects, tested functionality and usability, and supported accessibility, performance,
                  and security during ongoing maintenance.</li>
              </ul>
            </div>
          </article>
          <article class="experience-entry" data-reveal>
            <div class="experience-meta">
              <h3>On-the-Job Trainee</h3>
              <p>Davao City Hall</p>
              <p>December 2023 · About four months</p>
            </div>
            <div class="experience-copy">
              <p>Assisted with frontend development during my internship, creating and maintaining basic web pages and
                modules. I gained practical experience with how the city operates and maintains its information systems.
              </p>
            </div>
          </article>
          <article class="experience-entry" data-reveal>
            <div class="experience-meta">
              <h3>IT Systems DevOps Assistant II</h3>
              <p>City Information Technology Center</p>
              <p>January 2023</p>
            </div>
            <div class="experience-copy">
              <p>Helped bring forward design proposals and supported DevOps workflows for citywide digital services.</p>
            </div>
          </article>
        </div>
      </section>

      <section id="certificates" class="shell section" aria-labelledby="certificates-title">
        <div class="section-heading">
          <h2 id="certificates-title">Certificates</h2>
        </div>
        <div v-if="certificates.length" class="certificate-gallery">
          <article v-for="certificate in certificates"
            :key="certificate.title + certificate.issuer + certificate.issued" class="certificate-card">
            <a v-if="certificate.image" :href="certificate.image.fullSizeSrc ?? certificate.image.src" class="certificate-preview"
              target="_blank" rel="noopener noreferrer" data-reveal
              :aria-label="'Open full-size certificate for ' + certificate.title + ' (new tab)'">
              <img :src="certificate.image.src" :alt="certificate.image.alt"
                :width="certificate.image.width" :height="certificate.image.height" loading="lazy" decoding="async">
              <span class="certificate-open" aria-hidden="true">↗</span>
            </a>
            <div class="certificate-details">
              <p class="certificate-date">{{ certificate.issued }}</p>
              <h3>{{ certificate.title }}</h3>
              <p class="certificate-issuer">{{ certificate.issuer }}</p>
              <p v-if="certificate.description">{{ certificate.description }}</p>
              <a v-if="certificate.credentialUrl"
                :href="certificate.credentialUrl" class="certificate-link" target="_blank" rel="noopener noreferrer">
                View certificate
              </a>
            </div>
          </article>
        </div>
        <p v-else class="certificate-placeholder" data-reveal>Coming soon
        </p>
      </section>

      <section id="contact" class="shell section contact">
        <div data-reveal>
          <h2>Let’s talk.</h2>
          <p>Tell me what you’re working on.</p>
          <div class="actions">
            <button type="button" class="button primary" @click="contactPanel?.showModal()">Get in touch</button>
          </div>
        </div>
        <div class="contact-details" data-reveal>
          <h3>Contact information</h3>
          <ContactLinks :email="email" />
        </div>
      </section>
    </main>

    <footer class="shell site-footer"><span>John Diems</span><a href="#home">Back to top</a></footer>

    <Transition name="contact-card">
      <aside v-if="showContactCard" ref="floatingContact" class="contact-details floating-contact"
        aria-labelledby="floating-contact-title" @pointerleave="scheduleContactHide" @focusout="scheduleContactHide">
        <div class="floating-contact-header">
          <h3 id="floating-contact-title">Contact information</h3>
          <button class="close-button" type="button" aria-label="Dismiss contact card"
            @click="dismissContactCard">×</button>
        </div>
        <ContactLinks :email="email" />
        <button class="button primary floating-contact-action" type="button" @click="contactPanel?.showModal()">Let’s talk</button>
      </aside>
    </Transition>

    <dialog ref="gallery" class="dialog gallery" aria-labelledby="gallery-title" @keydown.left="changeSlide(-1)"
      @keydown.right="changeSlide(1)">
      <div class="dialog-head">
        <h3 id="gallery-title">{{ activeProject?.name }}</h3>
        <button class="close-button" type="button" aria-label="Close gallery" autofocus
          @click="gallery?.close()">×</button>
      </div>
      <img v-if="activeProject" :src="activeProject.images[slide]"
        :alt="activeProject.name + ' gallery image ' + (slide + 1)">
      <div v-if="activeProject && activeProject.images.length > 1" class="gallery-controls">
        <button class="button" type="button" @click="changeSlide(-1)">Previous</button>
        <span aria-live="polite">{{ slide + 1 }} / {{ activeProject.images.length }}</span>
        <button class="button" type="button" @click="changeSlide(1)">Next</button>
      </div>
    </dialog>

    <dialog ref="contactPanel" class="dialog contact-dialog" aria-labelledby="contact-title">
      <div class="dialog-head">
        <h3 id="contact-title">Contact John</h3>
        <button class="close-button" type="button" aria-label="Close contact panel" autofocus
          @click="contactPanel?.close()">×</button>
      </div>
      <div class="contact-address">
        <a :href="'mailto:' + email">{{ email }}</a>
        <button class="button" type="button" @click="copyEmail">Copy email</button>
      </div>
      <p v-if="copyFeedback" role="status">{{ copyFeedback }}</p>
      <form v-if="contactEndpoint" class="contact-form" :aria-busy="sending" @submit.prevent="sendContact">
        <label>Name <input name="name" autocomplete="name" maxlength="120" required></label>
        <label>Email <input name="email" type="email" autocomplete="email" maxlength="254" required></label>
        <label>Message <textarea name="message" rows="4" maxlength="4000" required /></label>
        <button class="button primary" type="submit" :disabled="sending">{{ sending ? 'Sending…' : 'Send message' }}</button>
        <p role="status">{{ contactStatus }}</p>
      </form>
      <p v-else>The contact form is unavailable. You can email me at the address above.</p>
    </dialog>
  </div>
</template>
