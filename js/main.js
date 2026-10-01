// ==============================
// Epimer Labs — Main JavaScript
// BB.Agency-inspired interactions
// ==============================

// ---------- Mobile Menu ----------
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');

if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        menuToggle.classList.toggle('active');
        navbar.classList.toggle('menu-open', navMenu.classList.contains('active'));
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });

    navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            menuToggle.classList.remove('active');
            navbar.classList.remove('menu-open');
            document.body.style.overflow = '';
        });
    });
}

// ---------- Navbar Scroll Effect ----------
const navbar = document.querySelector('.navbar');

const handleScroll = () => {
    if (window.scrollY > 60) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
};

window.addEventListener('scroll', handleScroll, { passive: true });
handleScroll(); // run on load

// ---------- Reveal on Scroll (Intersection Observer) ----------
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -60px 0px'
});

document.addEventListener('DOMContentLoaded', () => {
    // Observe all .reveal and .stagger elements
    document.querySelectorAll('.reveal, .stagger').forEach(el => {
        revealObserver.observe(el);
    });
});

// ---------- Smooth Scroll for Anchors ----------
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && href !== '#!') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    });
});

// ---------- FAQ Accordion ----------
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.faq-question').forEach(button => {
        button.addEventListener('click', () => {
            const item = button.closest('.faq-item');
            const isOpen = item.classList.contains('open');

            // Close all
            document.querySelectorAll('.faq-item.open').forEach(openItem => {
                openItem.classList.remove('open');
            });

            // Toggle current
            if (!isOpen) {
                item.classList.add('open');
            }
        });
    });
});

// ---------- Counter Animation ----------
const animateCounters = () => {
    const counters = document.querySelectorAll('.stat-number[data-count]');
    counters.forEach(counter => {
        const target = parseFloat(counter.getAttribute('data-count'));
        const suffix = counter.getAttribute('data-suffix') || '';
        const prefix = counter.getAttribute('data-prefix') || '';
        const duration = 2000;
        const start = performance.now();

        const tick = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(target * eased);
            counter.textContent = prefix + current.toLocaleString() + suffix;
            if (progress < 1) requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
    });
};

// ---------- Form Validation ----------
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        let isValid = true;
        contactForm.querySelectorAll('[required]').forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                field.style.borderColor = '#ef4444';
            } else {
                field.style.borderColor = '';
            }
        });

        if (isValid) {
            const msg = document.createElement('div');
            msg.className = 'success-message';
            msg.textContent = 'Thank you! We\'ll be in touch soon.';
            contactForm.appendChild(msg);
            contactForm.reset();
            setTimeout(() => msg.remove(), 5000);
        }
    });
}

// ---------- Industry Ticker (clone for seamless loop) ----------
document.addEventListener('DOMContentLoaded', () => {
    const ticker = document.querySelector('.industries-ticker');
    if (ticker) {
        const clone = ticker.innerHTML;
        ticker.innerHTML = clone + clone;
    }
});

// ---------- Website Work Carousel ----------
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-carousel]').forEach(carousel => {
        const track = carousel.querySelector('[data-carousel-track]');
        const slides = Array.from(carousel.querySelectorAll('.website-slide'));
        const dotsContainer = carousel.querySelector('[data-carousel-dots]');
        const previous = carousel.querySelector('[data-carousel-prev]');
        const next = carousel.querySelector('[data-carousel-next]');
        if (!track || slides.length < 2) return;

        let current = 0;
        let timer;
        let dragStartX = 0;
        let dragDeltaX = 0;
        let isDragging = false;
        let suppressClick = false;

        const dots = slides.map((_, index) => {
            const dot = document.createElement('button');
            dot.type = 'button';
            dot.className = 'carousel-dot';
            dot.setAttribute('aria-label', `Show website design ${index + 1}`);
            dot.addEventListener('click', () => showSlide(index, true));
            dotsContainer.appendChild(dot);
            return dot;
        });

        const showSlide = (index, restart = false) => {
            current = (index + slides.length) % slides.length;
            track.style.transform = `translateX(-${current * 100}%)`;
            slides.forEach((slide, slideIndex) => {
                const active = slideIndex === current;
                slide.classList.toggle('is-active', active);
                slide.setAttribute('aria-hidden', String(!active));
                slide.setAttribute('tabindex', active ? '0' : '-1');
            });
            dots.forEach((dot, dotIndex) => {
                const active = dotIndex === current;
                dot.classList.toggle('is-active', active);
                dot.setAttribute('aria-current', active ? 'true' : 'false');
            });
            if (restart) startTimer();
        };

        const startTimer = () => {
            window.clearInterval(timer);
            timer = window.setInterval(() => showSlide(current + 1), 5000);
        };

        const finishDrag = () => {
            if (!isDragging) return;
            isDragging = false;
            track.classList.remove('is-dragging');

            const swipeThreshold = Math.min(carousel.clientWidth * 0.16, 90);
            if (Math.abs(dragDeltaX) >= swipeThreshold) {
                showSlide(current + (dragDeltaX < 0 ? 1 : -1), true);
                suppressClick = true;
                window.setTimeout(() => { suppressClick = false; }, 300);
            } else {
                showSlide(current);
                startTimer();
            }
        };

        const startDrag = (clientX, target) => {
            if (target.closest('button')) return;
            isDragging = true;
            dragStartX = clientX;
            dragDeltaX = 0;
            track.classList.add('is-dragging');
            window.clearInterval(timer);
        };

        const moveDrag = clientX => {
            if (!isDragging) return;
            dragDeltaX = clientX - dragStartX;
            const offset = -current * carousel.clientWidth + dragDeltaX;
            track.style.transform = `translateX(${offset}px)`;
        };

        carousel.addEventListener('touchstart', event => {
            startDrag(event.touches[0].clientX, event.target);
        }, { passive: true });
        carousel.addEventListener('touchmove', event => {
            moveDrag(event.touches[0].clientX);
        }, { passive: true });
        carousel.addEventListener('touchend', finishDrag);
        carousel.addEventListener('touchcancel', finishDrag);
        carousel.addEventListener('dragstart', event => event.preventDefault());

        carousel.addEventListener('mousedown', event => {
            if (event.button !== 0) return;
            startDrag(event.clientX, event.target);
        });
        window.addEventListener('mousemove', event => moveDrag(event.clientX));
        window.addEventListener('mouseup', finishDrag);
        carousel.addEventListener('mouseleave', finishDrag);
        carousel.addEventListener('click', event => {
            if (!suppressClick) return;
            event.preventDefault();
            event.stopPropagation();
        }, true);

        previous?.addEventListener('click', () => showSlide(current - 1, true));
        next?.addEventListener('click', () => showSlide(current + 1, true));
        carousel.addEventListener('mouseenter', () => window.clearInterval(timer));
        carousel.addEventListener('mouseleave', startTimer);
        carousel.addEventListener('focusin', () => window.clearInterval(timer));
        carousel.addEventListener('focusout', startTimer);

        showSlide(0);
        startTimer();
    });
});

// ---------- Related Insight Articles ----------
document.addEventListener('DOMContentLoaded', () => {
    const articleBody = document.querySelector('.article-body');
    const articleNav = document.querySelector('.article-footer-nav');
    if (!articleBody || !articleNav) return;

    const articles = [
        ['insight-real-cost-of-poor-ux.html', 'Product Design', 'The Real Cost of Poor UX', 'Why design debt compounds across support, delivery, and trust.'],
        ['insight-design-systems-that-scale.html', 'Design Systems', 'Design Systems That Actually Scale', 'What turns a component library into an organizational capability.'],
        ['insight-ai-product-design-leverage.html', 'AI & Design', 'AI in Product Design: Leverage, Not Autopilot', 'How to accelerate design work without outsourcing judgment.'],
        ['insight-enterprise-ai-production.html', 'AI Strategy', 'Why Most Enterprise AI Initiatives Stall', 'Closing the gap between a promising pilot and a reliable product.'],
        ['insight-designing-trustworthy-ai-interfaces.html', 'Design', 'Designing AI Interfaces People Can Trust', 'Patterns for communicating uncertainty, control, and accountability.'],
        ['insight-shipping-ai-under-regulatory-scrutiny.html', 'Compliance', 'Shipping AI Under Regulatory Scrutiny', 'Building audit-ready products without making compliance a bottleneck.'],
        ['insight-model-evaluation-product-decision.html', 'Engineering', 'Model Evaluation Is a Product Decision', 'Define evaluation around outcomes, failure costs, and real conditions.'],
        ['insight-enterprise-ai-2027.html', 'Trends', 'What Enterprise AI Will Look Like in 2027', 'Beyond chat toward governed workflows and accountable agents.'],
        ['insight-conversational-interfaces.html', 'Agent UX', 'Conversational Interfaces Are Not Always the Answer', 'When chat helps, when it hurts, and what to use instead.'],
        ['insight-data-readiness.html', 'Data', 'Data Readiness: The Prerequisite for AI', 'Assess whether your data can support a useful AI product.'],
        ['insight-prototype-to-production.html', 'Product Strategy', 'From Prototype to Production', 'The guardrails and operating discipline a demo needs to become a product.'],
        ['insight-ai-product-adoption.html', 'Adoption', 'Building AI Products People Actually Use', 'Designing for durable adoption after the novelty disappears.'],
        ['insight-responsible-ai-framework.html', 'Responsible AI', 'A Practical Framework for Responsible AI', 'Turn principles into requirements, release decisions, and ownership.'],
        ['insight-ai-accessibility-checklist.html', 'Accessibility', 'Accessibility Audit Checklist for AI Products', 'Audit dynamic and generated experiences beyond the happy path.'],
        ['insight-enterprise-ai-build-vs-buy.html', 'Build vs. Buy', 'Build vs. Buy for Enterprise AI', 'Own the differentiating layer while preserving strategic flexibility.']
    ];

    const currentFile = window.location.pathname.split('/').pop();
    const currentIndex = articles.findIndex(([file]) => file === currentFile);
    if (currentIndex < 0) return;

    const related = [1, 2, 3].map(offset => articles[(currentIndex + offset) % articles.length]);
    const section = document.createElement('aside');
    section.className = 'related-articles';
    section.setAttribute('aria-labelledby', 'related-articles-title');
    section.innerHTML = `
        <div class="related-articles-inner">
            <span class="section-label">Keep Reading</span>
            <h2 id="related-articles-title">Related insights</h2>
            <div class="related-articles-grid">
                ${related.map(([file, category, title, excerpt]) => `
                    <a href="${file}" class="related-article-card">
                        <span>${category}</span>
                        <h3>${title}</h3>
                        <p>${excerpt}</p>
                        <strong>Read article →</strong>
                    </a>
                `).join('')}
            </div>
        </div>
    `;
    articleNav.before(section);

    const projectLink = articleNav.querySelector('a[href="contact.html"]');
    if (projectLink) projectLink.textContent = 'Start a Project';
});

// ---------- Shared Article Footer ----------
document.addEventListener('DOMContentLoaded', () => {
    if (!document.querySelector('.article-body') || document.querySelector('footer.footer')) return;

    const footer = document.createElement('footer');
    footer.className = 'footer';
    footer.innerHTML = `
        <div class="container">
            <div class="footer-top">
                <div class="footer-brand">
                    <a href="index.html" class="logo"><img src="images/logo-lockup-white.svg" alt="Epimer Labs" class="logo-lockup"></a>
                    <p class="footer-tagline">Solving for the exponential.</p>
                </div>
            </div>
            <div class="footer-grid">
                <div class="footer-column">
                    <h4>Services</h4>
                    <ul>
                        <li><a href="services.html#strategy">Product Strategy</a></li>
                        <li><a href="services.html#design">UX/UI Design</a></li>
                        <li><a href="services.html#design">Design Systems</a></li>
                        <li><a href="print.html">Custom Print</a></li>
                        <li><a href="services.html#technology">Web &amp; Mobile Development</a></li>
                        <li><a href="services.html#technology">AI Solutions</a></li>
                        <li><a href="services.html#growth">Growth &amp; Analytics</a></li>
                    </ul>
                </div>
                <div class="footer-column">
                    <h4>Company</h4>
                    <ul>
                        <li><a href="about.html">About</a></li>
                        <li><a href="work.html">Work</a></li>
                        <li><a href="insights.html">Insights</a></li>
                        <li><a href="careers.html">Careers</a></li>
                        <li><a href="contact.html">Contact</a></li>
                    </ul>
                </div>
                <div class="footer-column">
                    <h4>Resources</h4>
                    <ul>
                        <li><a href="work.html">Case Studies</a></li>
                        <li><a href="insights.html">Articles</a></li>
                    </ul>
                </div>
                <div class="footer-column">
                    <h4>Connect</h4>
                    <div class="social-links"><a href="https://www.linkedin.com/company/epimer-labs" aria-label="LinkedIn" target="_blank" rel="noopener">LinkedIn</a></div>
                    <div class="footer-locations" aria-label="Locations">
                        <span class="footer-location"><span class="footer-location-flag" aria-hidden="true">🇨🇦</span>Canada</span>
                        <span class="footer-location"><span class="footer-location-flag" aria-hidden="true">🇺🇸</span>United States</span>
                    </div>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2026 Epimer Labs. All rights reserved.</p>
                <p><a href="privacy.html" style="color: var(--gray-400);">Privacy Policy</a> | <a href="terms.html" style="color: var(--gray-400);">Terms of Service</a></p>
            </div>
        </div>
    `;
    document.body.appendChild(footer);
});

// ---------- Modal (click outside to close, Escape key) ----------
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('active');
        document.body.style.overflow = '';
    }
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modal = document.querySelector('.modal-overlay.active');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
});

// ---------- Form success message (?sent=1 after /api/contact redirect) ----------
if (new URLSearchParams(location.search).get('sent') === '1') {
    const form = document.querySelector('form[action="/api/contact"]');
    if (form) {
        const note = document.createElement('p');
        note.textContent = "Thanks, your message is on its way. We'll get back to you shortly.";
        note.style.cssText = 'background: var(--accent); color: #fff; padding: 1rem 1.25rem; border-radius: 8px; font-weight: 500; margin-bottom: 1.5rem;';
        form.parentElement.insertBefore(note, form);
        note.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    history.replaceState(null, '', location.pathname);
}
