document.addEventListener('DOMContentLoaded', function() {
  
  // --- Global Navigation & Mobile Menu Logic ---
  const navToggle = document.getElementById('nav-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  
  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', function() {
      // Toggle menu overlay
      mobileMenu.classList.toggle('active');
      
      // Animate the dots as visual feedback
      const dots = this.querySelectorAll('.dot');
      dots.forEach(dot => {
        dot.style.background = mobileMenu.classList.contains('active') ? '#ff4444' : '#444';
      });
    });
  }

  // Navbar background on scroll
  window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
      if (window.scrollY > 50) {
        navbar.style.background = 'rgba(18, 18, 18, 0.98)';
      } else {
        navbar.style.background = 'rgba(18, 18, 18, 0.95)';
      }
    }
  });

  // Smooth scrolling for hash links
  const hashLinks = document.querySelectorAll('a[href^="#"]');
  hashLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if(targetId === '#') return;
      const targetSection = document.querySelector(targetId);
      
      if (targetSection) {
        e.preventDefault();
        targetSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
        // Close mobile menu if clicked
        if(mobileMenu.classList.contains('active')) {
           mobileMenu.classList.remove('active');
        }
      }
    });
  });

  // --- Animation & Parallax Features ---
  
  // Parallax effect for hero/background elements
  window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.floating-dot');
    
    parallaxElements.forEach((element, index) => {
      const speed = 0.5 + (index * 0.1);
      const yPos = -(scrolled * speed);
      element.style.transform = `translateY(${yPos}px)`;
    });
  });

  // Intersection Observer for scroll animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  // Observe items that need animation
  const animateElements = document.querySelectorAll('.service-card, .testimonial-card, .portfolio-row');
  animateElements.forEach((el, index) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
    observer.observe(el);
  });

  // Add click animation to CTA button
  const ctaButtons = document.querySelectorAll('.cta-button');
  ctaButtons.forEach(btn => {
    btn.addEventListener('click', function(e) {
      if(this.tagName === 'A') return;
      
      const ripple = document.createElement('span');
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      ripple.style.position = 'absolute';
      ripple.style.borderRadius = '50%';
      ripple.style.background = 'rgba(255, 255, 255, 0.3)';
      ripple.style.transform = 'scale(0)';
      ripple.style.animation = 'ripple 0.6s linear';
      ripple.style.pointerEvents = 'none';
      
      this.style.position = 'relative';
      this.style.overflow = 'hidden';
      this.appendChild(ripple);
      
      setTimeout(() => { ripple.remove(); }, 600);
    });
  });

  // --- Portfolio JSON Data Logic ---
  
  const portfolioGrid = document.getElementById('portfolio-grid-dynamic');
  
  if (portfolioGrid) {
    // 1. Fetch JSON Data
    fetch('projects.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(projectsData => {
        // 2. Load data into page inside the Fetch promise
        projectsData.forEach(project => {
          const row = document.createElement('div');
          row.className = 'portfolio-row';
          row.innerHTML = `
            <img src="${project.image}" alt="${project.title}">
            <div class="portfolio-row-content">
              <h3>${project.title}</h3>
              <p>${project.excerpt}</p>
            </div>
          `;
          
          // Add intersection observer right away
          row.style.opacity = '0';
          row.style.transform = 'translateY(30px)';
          observer.observe(row);
          
          // 3. Attach click event for modal
          row.addEventListener('click', () => openModal(project));
          
          portfolioGrid.appendChild(row);
        });
      })
      .catch(error => {
        console.error('There was a problem loading the project data:', error);
        portfolioGrid.innerHTML = '<p style="text-align:center; padding:20px;">Unable to load projects. Please try again later.</p>';
      });

    // 4. Modal Handling Logic
    const modal = document.getElementById('project-modal');
    const closeBtn = document.getElementById('close-modal');
    const modalImg = document.getElementById('modal-image');
    const modalTitle = document.getElementById('modal-title');
    const modalDetails = document.getElementById('modal-details');

    function openModal(project) {
      modalImg.src = project.image;
      modalTitle.textContent = project.title;
      modalDetails.textContent = project.details;
      
      // Reset scroll to top of modal when opening
      modal.scrollTop = 0;

      modal.classList.add('show');
      document.body.style.overflow = 'hidden'; // prevent background scroll
    }

    function closeModal() {
      modal.classList.remove('show');
      document.body.style.overflow = 'auto'; // restore background scroll
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
    }
    
    // Close modal if user clicks outside content
    window.addEventListener('click', function(e) {
      if (e.target === modal) {
        closeModal();
      }
    });

    // Close on Escape key
    window.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && modal.classList.contains('show')) {
        closeModal();
      }
    });
  }
});
