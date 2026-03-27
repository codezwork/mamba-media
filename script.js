// --- Initialize Lenis Smooth Scrolling ---
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smooth: true,
  direction: 'vertical',
  gestureDirection: 'vertical',
  smoothTouch: false,
  touchMultiplier: 2,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

document.addEventListener('DOMContentLoaded', function() {
  
  // --- 1. Subpage Backgrounds (Square Pixels) ---
  if (!document.getElementById('canvas-container')) {
    const bgContainer = document.querySelector('.page-background');
    if (bgContainer) {
      for(let i = 0; i < 15; i++) {
        const pixel = document.createElement('div');
        pixel.classList.add('floating-pixel');
        pixel.style.left = Math.random() * 100 + '%';
        pixel.style.top = Math.random() * 100 + '%';
        pixel.style.animationDelay = (Math.random() * 5) + 's';
        pixel.style.animationDuration = (5 + Math.random() * 5) + 's';
        bgContainer.appendChild(pixel);
      }
      
      if(!bgContainer.querySelector('.connecting-line')) {
        bgContainer.innerHTML += `
        <svg class="connecting-line" viewBox="0 0 800 400" preserveAspectRatio="none">
          <path d="M50,200 Q200,100 400,200 T750,150" stroke="#ff4444" stroke-width="1" fill="none" opacity="0.3"/>
        </svg>`;
      }
    }
  }

  // --- 2. Navigation & Mobile Menu ---
  const navToggle = document.getElementById('nav-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const navbar = document.querySelector('.navbar');
  
  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', function() {
      mobileMenu.classList.toggle('active');
      const dots = this.querySelectorAll('.dot');
      dots.forEach(dot => {
        dot.style.background = mobileMenu.classList.contains('active') ? '#ff4444' : '#444';
      });
    });
  }

  // --- UPDATED NAV SCROLL LOGIC ---
  const homeHero = document.getElementById('home'); 
  
  if (homeHero) {
    navbar.classList.add('transparent');
    window.addEventListener('scroll', function() {
        if (window.scrollY > window.innerHeight - 100) { 
            navbar.classList.remove('transparent');
            navbar.style.background = 'rgba(18, 18, 18, 0.98)';
        } else {
            navbar.classList.add('transparent');
            navbar.style.background = 'transparent';
        }
    });
  } else {
    window.addEventListener('scroll', function() {
      if (navbar) {
        navbar.style.background = window.scrollY > 50 ? 'rgba(18, 18, 18, 0.98)' : 'rgba(18, 18, 18, 0.95)';
      }
    });
  }

  // --- Nav Sliding Pill Logic ---
  const navMenuElement = document.querySelector('.nav-menu');
  if (navMenuElement) {
    const pill = document.createElement('div');
    pill.className = 'nav-pill';
    navMenuElement.appendChild(pill);

    const links = navMenuElement.querySelectorAll('a');
    let activeLink = null;

    // Detect current page
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';

    links.forEach(link => {
      // 1. Get the first part of the href before any '#'
      const linkPath = link.getAttribute('href').split('#'); 
      
      // 2. Clean up currentPath to ensure 'index.html' matches '/'
      const normalizedPath = currentPath === '' ? 'index.html' : currentPath;

      if (linkPath === normalizedPath) {
        activeLink = link;
        link.classList.add('active-nav-link');
      }
    });

    // Calculates width and position of the hovered link
    function movePill(el) {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const menuRect = navMenuElement.getBoundingClientRect();
      pill.style.opacity = '1';
      pill.style.setProperty('--pill-width', `${rect.width}px`);
      pill.style.setProperty('--pill-left', `${rect.left - menuRect.left}px`);
    }

    // Hover triggers
    links.forEach(link => {
      link.addEventListener('mouseenter', (e) => {
        movePill(e.target);
      });
    });

    // Mouse leave triggers fallback to active page
    navMenuElement.addEventListener('mouseleave', () => {
      if (activeLink) {
        movePill(activeLink);
      } else {
        pill.style.opacity = '0';
      }
    });

    // Initial load setup
    if (activeLink) {
      setTimeout(() => movePill(activeLink), 200); // Slight delay for fonts to render
      window.addEventListener('resize', () => movePill(activeLink));
    }
  }

  // --- 3. SCROLLYTELLING HERO LOGIC (THREE.JS) ---
  const canvasContainer = document.getElementById('canvas-container');
  const heroSpacer = document.querySelector('.hero-spacer');
  
  if (canvasContainer && heroSpacer) {
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x121212, 0.02);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const initialZ = 25;
    const finalZ = 8;
    camera.position.z = initialZ; 
    
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    canvasContainer.appendChild(renderer.domElement);

    setTimeout(() => { canvasContainer.style.opacity = '1'; }, 100);

    const geometry = new THREE.IcosahedronGeometry(10, 2); 
    const wireframeGeometry = new THREE.WireframeGeometry(geometry);
    const wireframeMaterial = new THREE.LineBasicMaterial({ color: 0xff4444, transparent: true, opacity: 0.5 });
    const globe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
    scene.add(globe);

    const occcluderMaterial = new THREE.MeshBasicMaterial({ color: 0x121212 });
    const occluder = new THREE.Mesh(geometry, occcluderMaterial);
    occluder.scale.set(0.99, 0.99, 0.99); 
    globe.add(occluder);

    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 300;
    const posArray = new Float32Array(particleCount * 3);
    for(let i = 0; i < particleCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 40;
    }
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particleMaterial = new THREE.PointsMaterial({
        size: 0.15,
        color: 0xff4444,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true
    });
    const particlesMesh = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particlesMesh);

    function createRing(radius, tube, opacity) {
        const ringGeo = new THREE.TorusGeometry(radius, tube, 16, 100);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0xff4444, transparent: true, opacity: opacity });
        return new THREE.Mesh(ringGeo, ringMat);
    }
    const ring1 = createRing(14, 0.05, 0.4); ring1.rotation.x = Math.PI / 2; ring1.rotation.y = 0.2; scene.add(ring1);
    const ring2 = createRing(16, 0.03, 0.2); ring2.rotation.x = Math.PI / 1.8; ring2.rotation.y = -0.2; scene.add(ring2);
    const ring3 = createRing(15, 0.02, 0.3); ring3.rotation.x = Math.PI / 6; scene.add(ring3);

    let scrollProgress = 0;
    const stages = document.querySelectorAll('.hero-stage');
    const scrollIndicator = document.querySelector('.scroll-indicator');

    setTimeout(() => {
        window.dispatchEvent(new Event('scroll'));
    }, 1500);

    function animate() {
        requestAnimationFrame(animate);
        globe.rotation.y += 0.002;
        particlesMesh.rotation.y = -0.0005;
        ring1.rotation.z += 0.005;
        ring2.rotation.z -= 0.003;
        ring3.rotation.z += 0.008;

        const targetZ = initialZ - (scrollProgress * (initialZ - finalZ));
        camera.position.z += (targetZ - camera.position.z) * 0.1;
        globe.rotation.x = scrollProgress * 0.5;

        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const spacerHeight = heroSpacer.offsetHeight;
        const viewportHeight = window.innerHeight;
        const scrollableDistance = spacerHeight - viewportHeight;
        
        let progress = scrollTop / scrollableDistance;
        if (progress < 0) progress = 0;
        if (progress > 1) progress = 1;
        
        scrollProgress = progress;

        if(progress > 0.05) scrollIndicator.classList.add('hide');
        else scrollIndicator.classList.remove('hide');

        stages.forEach(s => s.classList.remove('active'));

        if (progress < 0.33) {
            stages[0].classList.add('active');
        } else if (progress >= 0.33 && progress < 0.66) {
            stages[1].classList.add('active');
        } else {
            stages[2].classList.add('active');
        }
    });

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  // --- 4. Portfolio Data & Modal ---
  // --- 4. Portfolio Data, Filtering & Modal ---
  const portfolioGrid = document.getElementById('portfolio-grid-dynamic');
  const selectedWorkGrid = document.getElementById('selected-work-grid');

  // Added 'isHome' parameter to detect where the cards are rendering
  function renderCards(data, container, limit = null, isHome = false) {
    container.innerHTML = ''; // Clear existing
    const displayData = limit ? data.slice(0, limit) : data;

    displayData.forEach(project => {
      const row = document.createElement('div');
      row.className = `portfolio-row ${project.category}`;
      row.setAttribute('data-category', project.category);
      
      const thumbUrl = `https://drive.google.com/thumbnail?id=${project.imageId}&sz=w400`;
      
      const tagsHtml = project.tags ? project.tags.map(tag => `<span class="tech-pill">${tag}</span>`).join('') : '';

      row.innerHTML = `
        <img src="${thumbUrl}" alt="${project.title} screenshot" loading="lazy">
        <div class="portfolio-row-content">
          <h3>${project.title}</h3>
          <p>${project.excerpt}</p>
          <div class="tech-tags">${tagsHtml}</div>
        </div>`;
      
      row.addEventListener('click', () => {
        // If we are on the homepage, redirect. Otherwise, open the modal.
        if (isHome) {
          window.location.href = 'portfolio.html';
        } else {
          openModal(project);
        }
      });
      
      container.appendChild(row);
    });
  }

  // Fetch and initialize
  if (portfolioGrid || selectedWorkGrid) {
    fetch('projects.json')
      .then(r => r.json())
      .then(data => {
        // If on home page, render top 2 and pass 'true' for isHome
        if (selectedWorkGrid) {
          renderCards(data, selectedWorkGrid, 2, true); 
        }
        
        // If on portfolio page, render all and initialize dropdown
        if (portfolioGrid) {
          renderCards(data, portfolioGrid, null, false);

          // NEW: Custom Dropdown Logic for Portfolio Filters
          const filterSelectWrapper = document.getElementById('portfolio-filter-select');
          if (filterSelectWrapper) {
              const trigger = filterSelectWrapper.querySelector('.custom-select-trigger');
              const triggerText = filterSelectWrapper.querySelector('.trigger-text');
              const options = filterSelectWrapper.querySelectorAll('.custom-option');

              trigger.addEventListener('click', function(e) {
                  filterSelectWrapper.classList.toggle('open');
                  e.stopPropagation();
              });

              options.forEach(option => {
                  option.addEventListener('click', function() {
                      // Update visual text and active classes
                      triggerText.textContent = this.textContent;
                      options.forEach(opt => opt.classList.remove('selected'));
                      this.classList.add('selected');
                      filterSelectWrapper.classList.remove('open');

                      // Execute Filtering
                      const filterValue = this.getAttribute('data-value');
                      const cards = portfolioGrid.querySelectorAll('.portfolio-row');
                      
                      cards.forEach(card => {
                          if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                              card.style.display = 'flex';
                          } else {
                              card.style.display = 'none';
                          }
                      });
                  });
              });

              document.addEventListener('click', function(e) {
                  if (!filterSelectWrapper.contains(e.target)) {
                      filterSelectWrapper.classList.remove('open');
                  }
              });
          }
        }
      })
      .catch(e => console.error("Error loading projects:", e));

    // Modal Logic
    const modal = document.getElementById('project-modal');
    const closeBtn = document.getElementById('close-modal');
    const modalImg = document.getElementById('modal-image');
    const modalTitle = document.getElementById('modal-title');
    const modalDetails = document.getElementById('modal-details');
    const modalTestimonial = document.getElementById('modal-testimonial');

    function openModal(p) {
      modalImg.classList.remove('loaded'); // Strip loaded class
      modalImg.src = ''; 
      
      const fullImageUrl = `https://drive.google.com/thumbnail?id=${p.fullImageId || p.imageId}&sz=w1920`;
      
      // Wait for image to fully fetch from Drive before showing
      modalImg.onload = () => {
        modalImg.classList.add('loaded');
      };

      modalImg.src = fullImageUrl;
      modalImg.alt = `${p.title} full view`;
      modalTitle.textContent = p.title;
      modalDetails.textContent = p.details;
      
      if (p.testimonial) {
        modalTestimonial.style.display = 'flex';
        modalTestimonial.innerHTML = `
          <div class="testimony-image">
            <img src="https://drive.google.com/thumbnail?id=${p.testimonial.imageId}&sz=w200" alt="${p.testimonial.author}" loading="lazy">
          </div>
          <div class="testimony-content">
            <p class="testimony-text">"${p.testimonial.text}"</p>
            <p class="testimony-author">- ${p.testimonial.author}</p>
          </div>`;
      } else {
        modalTestimonial.style.display = 'none';
        modalTestimonial.innerHTML = ''; 
      }

      modal.classList.add('show');
      document.body.style.overflow = 'hidden';

      // NEW: Freeze Lenis smooth scroll while modal is open
      if (typeof lenis !== 'undefined') lenis.stop();
    }
    
    function closeModal() {
      modal.classList.remove('show');
      document.body.style.overflow = 'auto';

      // NEW: Resume Lenis smooth scroll when modal closes
      if (typeof lenis !== 'undefined') lenis.start();
    }

    if(closeBtn) closeBtn.addEventListener('click', closeModal);
    window.addEventListener('click', e => { if(e.target === modal) closeModal(); });
    window.addEventListener('keydown', e => { 
      if(e.key === 'Escape' && modal.classList.contains('show')) closeModal(); 
    });
  }

// --- 5. FAQ Accordion Logic ---
  const faqQuestions = document.querySelectorAll('.faq-question');
  
  faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
      const currentItem = question.parentElement;
      const isActive = currentItem.classList.contains('active');
      
      // Close all other open FAQs
      document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
        item.querySelector('.faq-answer').style.maxHeight = null;
        // (Removed the hardcoded '+' text replacement)
      });

      // If the clicked one wasn't active, open it
      if (!isActive) {
        currentItem.classList.add('active');
        const answer = currentItem.querySelector('.faq-answer');
        answer.style.maxHeight = answer.scrollHeight + "px";
        // (Removed the hardcoded '-' text replacement)
      }
    });
  });

  // --- 6. Manual Vanilla Tilt Initialization ---
  // --- 6. Manual Vanilla Tilt Initialization ---
  const tiltElement = document.getElementById('tilt-card-element');
  
  // Only initialize the 3D tilt engine on desktop screens to save mobile CPU
  if (tiltElement && typeof VanillaTilt !== 'undefined' && window.matchMedia("(min-width: 769px)").matches) {
      VanillaTilt.init(tiltElement, {
          max: 15,          // max tilt rotation (degrees)
          speed: 1000,      // Speed of the enter/exit transition
          glare: true,      // Enables the glare reflection
          "max-glare": 0.3, // Opacity of the glare
          scale: 1.03,      // Slight zoom on hover
          perspective: 1500 // The 3D depth field
      });
  }

  // --- Active Nav Link Highlighting ---
  const currentLocation = location.href;
  const menuItem = document.querySelectorAll('.nav-menu a');
  const menuLength = menuItem.length;
  for (let i = 0; i < menuLength; i++) {
    if (menuItem[i].href === currentLocation) {
      menuItem[i].style.color = '#ff4444';
    }
  }


  // --- 7. Lenis Smooth Anchor Routing ---
  
  // A. Handle clicks on anchor links within the same page
  document.querySelectorAll('a[href*="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const url = new URL(this.href, window.location.href);
      
      // Check if the link points to the page we are currently on
      const isSamePage = url.pathname === window.location.pathname || 
                         (url.pathname === '/' && window.location.pathname.endsWith('index.html'));

      if (isSamePage && url.hash) {
        e.preventDefault();
        if (typeof lenis !== 'undefined') {
          // Smooth scroll to the target, offset by 100px so the navbar doesn't cover it
          lenis.scrollTo(url.hash, { offset: -100, duration: 1.5 }); 
        }
      }
    });
  });

  // B. Handle landing on a page from another page (e.g., Home -> Contact#inquiry-form)
  if (window.location.hash) {
    // Wait a brief moment for the page to render, then smooth scroll down to the form
    setTimeout(() => {
      if (typeof lenis !== 'undefined') {
        lenis.scrollTo(window.location.hash, { offset: -100, duration: 1.5 });
      }
    }, 300);
  }

});