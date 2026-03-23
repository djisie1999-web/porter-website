/* ============================================================
   Porter — Premium SaaS Marketing Website
   main.js  |  Vanilla JS  |  No dependencies
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ----------------------------------------------------------
     1. LOADING SCREEN
     ---------------------------------------------------------- */
  const loadingOverlay = document.querySelector('.loading-overlay');

  window.addEventListener('load', () => {
    if (loadingOverlay) {
      loadingOverlay.style.opacity = '0';
      loadingOverlay.style.transition = 'opacity 0.6s ease';
      setTimeout(() => {
        loadingOverlay.style.display = 'none';
      }, 600);
    }
    document.body.classList.add('loaded');
  });

  /* ----------------------------------------------------------
     2. CUSTOM CURSOR (desktop only)
     ---------------------------------------------------------- */
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  if (!isTouchDevice) {
    const cursorDot = document.createElement('div');
    const cursorOutline = document.createElement('div');
    cursorDot.classList.add('cursor-dot');
    cursorOutline.classList.add('cursor-outline');
    document.body.appendChild(cursorDot);
    document.body.appendChild(cursorOutline);

    let mouseX = 0;
    let mouseY = 0;
    let outlineX = 0;
    let outlineY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
    });

    const animateCursor = () => {
      outlineX += (mouseX - outlineX) * 0.15;
      outlineY += (mouseY - outlineY) * 0.15;
      cursorOutline.style.left = `${outlineX}px`;
      cursorOutline.style.top = `${outlineY}px`;
      requestAnimationFrame(animateCursor);
    };
    requestAnimationFrame(animateCursor);

    const interactiveSelectors = 'a, button, input, textarea, select, .card';

    document.querySelectorAll(interactiveSelectors).forEach((el) => {
      el.addEventListener('mouseenter', () => {
        cursorDot.classList.add('cursor-hover');
        cursorOutline.classList.add('cursor-hover');
      });
      el.addEventListener('mouseleave', () => {
        cursorDot.classList.remove('cursor-hover');
        cursorOutline.classList.remove('cursor-hover');
      });
    });

    document.addEventListener('mouseenter', () => {
      cursorDot.style.opacity = '1';
      cursorOutline.style.opacity = '1';
    });
    document.addEventListener('mouseleave', () => {
      cursorDot.style.opacity = '0';
      cursorOutline.style.opacity = '0';
    });
  }

  /* ----------------------------------------------------------
     3. MOBILE NAVIGATION
     ---------------------------------------------------------- */
  const hamburger = document.querySelector('.hamburger');
  const nav = document.querySelector('.nav, nav');
  const navLinks = document.querySelectorAll('.nav-links a, nav a');

  if (hamburger && nav) {
    hamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      hamburger.classList.toggle('active');
      nav.classList.toggle('active');
      document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
    });

    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        nav.classList.remove('active');
        document.body.style.overflow = '';
      });
    });

    document.addEventListener('click', (e) => {
      if (nav.classList.contains('active') && !nav.contains(e.target) && !hamburger.contains(e.target)) {
        hamburger.classList.remove('active');
        nav.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  /* ----------------------------------------------------------
     4. STICKY NAV (throttled)
     ---------------------------------------------------------- */
  const header = document.querySelector('header, .header, nav');
  let scrollTicking = false;

  const handleStickyNav = () => {
    if (!header) return;
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    scrollTicking = false;
  };

  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      requestAnimationFrame(handleStickyNav);
      scrollTicking = true;
    }
  });

  /* ----------------------------------------------------------
     5. SCROLL ANIMATIONS (IntersectionObserver)
     ---------------------------------------------------------- */
  const animateElements = document.querySelectorAll('.animate-on-scroll');

  if (animateElements.length > 0) {
    const scrollObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;

            // Check if parent wants staggered children
            const parent = el.parentElement;
            if (parent && parent.classList.contains('stagger-children')) {
              const siblings = Array.from(parent.querySelectorAll('.animate-on-scroll'));
              const index = siblings.indexOf(el);
              el.style.transitionDelay = `${index * 0.1}s`;
            }

            el.classList.add('animated');
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.1 }
    );

    animateElements.forEach((el) => scrollObserver.observe(el));
  }

  /* ----------------------------------------------------------
     6. ANIMATED COUNTERS
     ---------------------------------------------------------- */
  const counters = document.querySelectorAll('.counter');

  const easeOutQuad = (t) => t * (2 - t);

  const animateCounter = (el) => {
    const target = parseFloat(el.getAttribute('data-target')) || 0;
    const prefix = el.getAttribute('data-prefix') || '';
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 2000;
    const startTime = performance.now();
    const isInteger = Number.isInteger(target);

    const updateCounter = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuad(progress);
      const currentValue = easedProgress * target;

      el.textContent = `${prefix}${isInteger ? Math.floor(currentValue).toLocaleString() : currentValue.toFixed(1)}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        el.textContent = `${prefix}${isInteger ? target.toLocaleString() : target.toFixed(1)}${suffix}`;
      }
    };

    requestAnimationFrame(updateCounter);
  };

  if (counters.length > 0) {
    const counterObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    counters.forEach((counter) => counterObserver.observe(counter));
  }

  /* ----------------------------------------------------------
     7. FAQ ACCORDION
     ---------------------------------------------------------- */
  const faqQuestions = document.querySelectorAll('.faq-question');

  faqQuestions.forEach((question) => {
    question.addEventListener('click', () => {
      const parentItem = question.closest('.faq-item');
      const answer = parentItem.querySelector('.faq-answer');
      const isActive = parentItem.classList.contains('active');

      // Close all other items
      document.querySelectorAll('.faq-item.active').forEach((item) => {
        if (item !== parentItem) {
          item.classList.remove('active');
          const otherAnswer = item.querySelector('.faq-answer');
          if (otherAnswer) {
            otherAnswer.style.maxHeight = '0';
            otherAnswer.style.opacity = '0';
          }
        }
      });

      // Toggle clicked item
      if (isActive) {
        parentItem.classList.remove('active');
        if (answer) {
          answer.style.maxHeight = '0';
          answer.style.opacity = '0';
        }
      } else {
        parentItem.classList.add('active');
        if (answer) {
          answer.style.maxHeight = `${answer.scrollHeight}px`;
          answer.style.opacity = '1';
        }
      }
    });
  });

  /* ----------------------------------------------------------
     8. PRICING TOGGLE (monthly / annual)
     ---------------------------------------------------------- */
  const pricingToggle = document.querySelector('.pricing-toggle input');
  const toggleMonthlyLabel = document.querySelector('.toggle-monthly');
  const toggleAnnualLabel = document.querySelector('.toggle-annual');

  if (pricingToggle) {
    const updatePricing = () => {
      const isAnnual = pricingToggle.checked;
      const priceElements = document.querySelectorAll('[data-monthly][data-annual]');

      priceElements.forEach((el) => {
        el.textContent = isAnnual ? el.getAttribute('data-annual') : el.getAttribute('data-monthly');
      });

      if (toggleMonthlyLabel && toggleAnnualLabel) {
        toggleMonthlyLabel.classList.toggle('active', !isAnnual);
        toggleAnnualLabel.classList.toggle('active', isAnnual);
      }
    };

    pricingToggle.addEventListener('change', updatePricing);
    // Initialise on load
    updatePricing();
  }

  /* ----------------------------------------------------------
     9. LOCATION CALCULATOR
     ---------------------------------------------------------- */
  const locationSlider = document.getElementById('location-slider');
  const locationCount = document.getElementById('location-count');
  const monthlyTotal = document.getElementById('monthly-total');
  const annualTotal = document.getElementById('annual-total');

  if (locationSlider) {
    const MONTHLY_RATE = 79;
    const ANNUAL_RATE = 790;

    const updateLocationPricing = () => {
      const locations = parseInt(locationSlider.value, 10) || 1;

      if (locationCount) locationCount.textContent = locations;
      if (monthlyTotal) monthlyTotal.textContent = `\u00A3${(MONTHLY_RATE * locations).toLocaleString()}`;
      if (annualTotal) annualTotal.textContent = `\u00A3${(ANNUAL_RATE * locations).toLocaleString()}`;
    };

    locationSlider.addEventListener('input', updateLocationPricing);
    // Initialise
    updateLocationPricing();
  }

  /* ----------------------------------------------------------
     10. SMOOTH SCROLL (anchor links)
     ---------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#' || targetId === '') return;

      const targetEl = document.querySelector(targetId);
      if (!targetEl) return;

      e.preventDefault();
      const navHeight = 80;
      const targetPosition = targetEl.getBoundingClientRect().top + window.scrollY - navHeight;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth',
      });

      // Update hash without jumping
      history.pushState(null, null, targetId);
    });
  });

  /* ----------------------------------------------------------
     11. TABS (comparison page)
     ---------------------------------------------------------- */
  const tabButtons = document.querySelectorAll('.tab-btn');

  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const tabGroup = btn.closest('.tabs, .tab-container, .tab-wrapper') || btn.parentElement.parentElement;
      const targetTab = btn.getAttribute('data-tab');

      // Deactivate all tabs in this group
      tabGroup.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
      tabGroup.querySelectorAll('.tab-content').forEach((c) => c.classList.remove('active'));

      // Activate selected
      btn.classList.add('active');
      const targetContent = tabGroup.querySelector(`.tab-content[data-tab="${targetTab}"], #${targetTab}`);
      if (targetContent) targetContent.classList.add('active');
    });
  });

  /* ----------------------------------------------------------
     12. CONTACT FORM (client-side validation)
     ---------------------------------------------------------- */
  const contactForm = document.querySelector('.contact-form, #contact-form');

  if (contactForm) {
    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let isValid = true;

      // Clear previous errors
      contactForm.querySelectorAll('.error-message').forEach((err) => err.remove());
      contactForm.querySelectorAll('.input-error').forEach((el) => el.classList.remove('input-error'));

      // Validate required fields
      contactForm.querySelectorAll('[required]').forEach((field) => {
        if (!field.value.trim()) {
          isValid = false;
          field.classList.add('input-error');
          const error = document.createElement('span');
          error.classList.add('error-message');
          error.textContent = 'This field is required';
          field.parentElement.appendChild(error);
        }
      });

      // Validate email fields
      contactForm.querySelectorAll('input[type="email"]').forEach((field) => {
        if (field.value && !validateEmail(field.value)) {
          isValid = false;
          field.classList.add('input-error');
          const error = document.createElement('span');
          error.classList.add('error-message');
          error.textContent = 'Please enter a valid email';
          field.parentElement.appendChild(error);
        }
      });

      if (isValid) {
        const submitBtn = contactForm.querySelector('button[type="submit"], input[type="submit"]');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.classList.add('btn-submitting');
          const originalText = submitBtn.textContent;
          submitBtn.textContent = 'Sending...';

          const formData = new FormData(contactForm);
          const payload = {
            name: formData.get('name'),
            email: formData.get('email'),
            company: formData.get('company') || '',
            phone: formData.get('phone') || '',
            subject: formData.get('subject') || '',
            message: formData.get('message'),
          };

          fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
            .then((res) => res.json())
            .then((data) => {
              if (data.success) {
                submitBtn.textContent = 'Sent!';
                submitBtn.classList.remove('btn-submitting');
                submitBtn.classList.add('btn-success');

                const successMsg = document.createElement('div');
                successMsg.classList.add('form-success');
                successMsg.textContent = 'Thank you! Your message has been sent successfully.';
                contactForm.appendChild(successMsg);
                successMsg.style.opacity = '0';
                requestAnimationFrame(() => {
                  successMsg.style.transition = 'opacity 0.4s ease';
                  successMsg.style.opacity = '1';
                });

                setTimeout(() => {
                  contactForm.reset();
                  submitBtn.textContent = originalText;
                  submitBtn.disabled = false;
                  submitBtn.classList.remove('btn-success');
                  successMsg.remove();
                }, 4000);
              } else {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                submitBtn.classList.remove('btn-submitting');

                const errorMsg = document.createElement('div');
                errorMsg.classList.add('form-error');
                errorMsg.style.color = 'var(--color-error, #ef4444)';
                errorMsg.style.marginTop = '1rem';
                errorMsg.textContent = (data.errors && data.errors[0]) || 'Something went wrong. Please try again.';
                contactForm.appendChild(errorMsg);
                setTimeout(() => errorMsg.remove(), 4000);
              }
            })
            .catch(() => {
              submitBtn.textContent = originalText;
              submitBtn.disabled = false;
              submitBtn.classList.remove('btn-submitting');

              const errorMsg = document.createElement('div');
              errorMsg.classList.add('form-error');
              errorMsg.style.color = 'var(--color-error, #ef4444)';
              errorMsg.style.marginTop = '1rem';
              errorMsg.textContent = 'Network error. Please check your connection and try again.';
              contactForm.appendChild(errorMsg);
              setTimeout(() => errorMsg.remove(), 4000);
            });
        }
      }
    });
  }

  /* ----------------------------------------------------------
     13. HEADER ACTIVE STATE (highlight current page)
     ---------------------------------------------------------- */
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';

  document.querySelectorAll('.nav-links a, nav a').forEach((link) => {
    const href = link.getAttribute('href');
    if (!href) return;
    const linkPage = href.split('/').pop().split('#')[0] || 'index.html';
    if (linkPage === currentPath) {
      link.classList.add('active');
    }
  });

  /* ----------------------------------------------------------
     14. PARALLAX (subtle, desktop only)
     ---------------------------------------------------------- */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const parallaxElements = document.querySelectorAll('.parallax');

  if (parallaxElements.length > 0 && window.innerWidth >= 768 && !prefersReducedMotion) {
    let parallaxTicking = false;

    const handleParallax = () => {
      const scrollY = window.scrollY;
      parallaxElements.forEach((el) => {
        const speed = parseFloat(el.getAttribute('data-speed')) || 0.3;
        const rect = el.getBoundingClientRect();
        const offset = (rect.top + scrollY - window.innerHeight / 2) * speed * 0.1;
        el.style.transform = `translateY(${offset}px)`;
      });
      parallaxTicking = false;
    };

    window.addEventListener('scroll', () => {
      if (!parallaxTicking) {
        requestAnimationFrame(handleParallax);
        parallaxTicking = true;
      }
    });
  }

  /* ----------------------------------------------------------
     15. TYPING EFFECT
     ---------------------------------------------------------- */
  const typingEl = document.querySelector('.typing-effect');

  if (typingEl) {
    let phrases = [];
    try {
      phrases = JSON.parse(typingEl.getAttribute('data-phrases') || '[]');
    } catch (e) {
      phrases = [];
    }

    if (phrases.length > 0) {
      let phraseIndex = 0;
      let charIndex = 0;
      let isDeleting = false;
      const typeSpeed = 80;
      const deleteSpeed = 40;
      const pauseEnd = 2000;
      const pauseStart = 500;

      const type = () => {
        const currentPhrase = phrases[phraseIndex];
        let delay;

        if (isDeleting) {
          charIndex--;
          typingEl.textContent = currentPhrase.substring(0, charIndex);
          delay = deleteSpeed;

          if (charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            delay = pauseStart;
          }
        } else {
          charIndex++;
          typingEl.textContent = currentPhrase.substring(0, charIndex);
          delay = typeSpeed;

          if (charIndex === currentPhrase.length) {
            isDeleting = true;
            delay = pauseEnd;
          }
        }

        setTimeout(type, delay);
      };

      // Ensure blinking cursor via CSS class
      typingEl.classList.add('typing-cursor');
      type();
    }
  }

  /* ----------------------------------------------------------
     16. SCROLL PROGRESS BAR
     ---------------------------------------------------------- */
  const progressBar = document.createElement('div');
  progressBar.classList.add('scroll-progress');
  progressBar.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    height: 3px;
    width: 0%;
    background: var(--brand-blue, #2563eb);
    z-index: 10000;
    transition: width 0.1s linear;
    pointer-events: none;
  `;
  document.body.appendChild(progressBar);

  let progressTicking = false;

  const updateProgress = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = `${progress}%`;
    progressTicking = false;
  };

  window.addEventListener('scroll', () => {
    if (!progressTicking) {
      requestAnimationFrame(updateProgress);
      progressTicking = true;
    }
  });

});
