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

  // Smooth scrolling for hash links (only targets links that start with #)
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

  // Intersection Observer for scroll animations (Services, Testimonials, etc)
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
      // Check if it's a form submit button or link
      if(this.tagName === 'A') return; // let links navigate naturally unless prevented
      
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
    // 1. JSON Dictionary
    const projectsData = [
      {
        id: 1,
        title: "TATA Mine Project",
        image: "https://drive.google.com/thumbnail?id=1Xh51Ayw3opBZ74qNkb2GPKJNnAM9ETaj&sz=w400",
        excerpt: "A comprehensive digital tracking solution tailored for heavy mining operations.",
        details: "The TATA Mine Project required an aggressive timeline to deploy a fully responsive platform for on-site managers. Our team mapped out wireframes, designed custom UI elements, and integrated real-time tracking APIs. The result improved site efficiency by 24% in the first quarter."
      },
      {
        id: 2,
        title: "Fly Store",
        image: "https://drive.google.com/thumbnail?id=1sePEYYj2XA4AJt-C5OxBj31RJuBARY56&sz=w400",
        excerpt: "An e-commerce experience designed for modern streetwear.",
        details: "Fly Store is a conceptual e-commerce platform that challenges traditional shopping layouts. By utilizing asymmetrical grids and high-contrast typography, we created a digital storefront that speaks directly to Gen-Z shoppers. Complete with payment gateway integration and inventory management."
      },
      {
        id: 3,
        title: "Glitch The Matrix",
        image: "https://drive.google.com/thumbnail?id=1Fznhj6qKo9SbPsGJ-vJY3yDaPn3Bo9c6&sz=w400",
        excerpt: "An interactive, WebGL-powered promotional campaign site.",
        details: "Built to promote an upcoming sci-fi indie game, 'Glitch The Matrix' pushes the boundaries of browser rendering. Using Three.js and custom shaders, users navigate through a 3D environment right from their browser, finding hidden clues about the game's lore."
      },
      {
         id: 4,
         title: "CodeZ Platform",
         image: "https://drive.google.com/thumbnail?id=1bzc_5qX5D76jRod7XNTGYMmEsY4nuvB5&sz=w400",
         excerpt: "An online learning portal for budding programmers.",
         details: "CodeZ approached MAMBA to rethink how students learn to code online. We built an in-browser code editor paired with dynamic video lesson panels. The platform handles thousands of concurrent users running Python and JavaScript directly in the browser safely."
      }
    ];

    // 2. Load data into page
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
      
      // Reset scroll position to top when opening a new project
      modal.scrollTop = 0; 
      
      modal.classList.add('show');
      document.body.style.overflow = 'hidden'; // prevent background page from scrolling
    }

    function closeModal() {
      modal.classList.remove('show');
      document.body.style.overflow = 'auto'; // restore background page scroll
    }

    closeBtn.addEventListener('click', closeModal);
    
    // Allow closing if user hits the ESC key
    window.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && modal.classList.contains('show')) {
        closeModal();
      }
    });
  }
});