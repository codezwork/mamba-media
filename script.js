document.addEventListener('DOMContentLoaded', function() {
  
  // --- 1. Subpage Backgrounds (Square Pixels) ---
  // If we are NOT on the homepage (no canvas-container), render the pixels
  if (!document.getElementById('canvas-container')) {
    const bgContainer = document.querySelector('.page-background');
    if (bgContainer) {
      // Add floating pixels dynamically
      for(let i = 0; i < 15; i++) {
        const pixel = document.createElement('div');
        pixel.classList.add('floating-pixel');
        
        // Random positions
        pixel.style.left = Math.random() * 100 + '%';
        pixel.style.top = Math.random() * 100 + '%';
        
        // Random delays so they don't move in sync
        pixel.style.animationDelay = (Math.random() * 5) + 's';
        pixel.style.animationDuration = (5 + Math.random() * 5) + 's';
        
        bgContainer.appendChild(pixel);
      }
      
      // Ensure the connecting SVG line exists if it was lost
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
  
  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', function() {
      mobileMenu.classList.toggle('active');
      const dots = this.querySelectorAll('.dot');
      dots.forEach(dot => {
        dot.style.background = mobileMenu.classList.contains('active') ? '#ff4444' : '#444';
      });
    });
  }

  window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
      navbar.style.background = window.scrollY > 50 ? 'rgba(18, 18, 18, 0.98)' : 'rgba(18, 18, 18, 0.95)';
    }
  });

  // --- 3. SCROLLYTELLING HERO LOGIC (THREE.JS) ---
  const canvasContainer = document.getElementById('canvas-container');
  const heroSpacer = document.querySelector('.hero-spacer');
  
  if (canvasContainer && heroSpacer) {
    // A. Setup Three.js
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x121212, 0.02);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    // Initial Zoom (Start far out)
    const initialZ = 25;
    const finalZ = 8; // Zoomed in very close
    camera.position.z = initialZ; 
    
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    canvasContainer.appendChild(renderer.domElement);

    setTimeout(() => { canvasContainer.style.opacity = '1'; }, 100);

    // B. Create Objects
    // Globe Wireframe
    const geometry = new THREE.IcosahedronGeometry(10, 2); 
    const wireframeGeometry = new THREE.WireframeGeometry(geometry);
    const wireframeMaterial = new THREE.LineBasicMaterial({ color: 0xff4444, transparent: true, opacity: 0.5 });
    const globe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
    scene.add(globe);

    // Black Occluder (hides back lines)
    const occcluderMaterial = new THREE.MeshBasicMaterial({ color: 0x121212 });
    const occluder = new THREE.Mesh(geometry, occcluderMaterial);
    occluder.scale.set(0.99, 0.99, 0.99); 
    globe.add(occluder);

    // Square Pixels (Replacing Dots)
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 300;
    const posArray = new Float32Array(particleCount * 3);
    for(let i = 0; i < particleCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 40;
    }
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particleMaterial = new THREE.PointsMaterial({
        size: 0.15, // Slightly larger for "pixel" look
        color: 0xff4444,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true
    });
    // Points are squares by default in Three.js unless a texture is mapped!
    const particlesMesh = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particlesMesh);

    // Rings
    function createRing(radius, tube, opacity) {
        const ringGeo = new THREE.TorusGeometry(radius, tube, 16, 100);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0xff4444, transparent: true, opacity: opacity });
        return new THREE.Mesh(ringGeo, ringMat);
    }
    const ring1 = createRing(14, 0.05, 0.4); ring1.rotation.x = Math.PI / 2; ring1.rotation.y = 0.2; scene.add(ring1);
    const ring2 = createRing(16, 0.03, 0.2); ring2.rotation.x = Math.PI / 1.8; ring2.rotation.y = -0.2; scene.add(ring2);
    const ring3 = createRing(15, 0.02, 0.3); ring3.rotation.x = Math.PI / 6; scene.add(ring3);

    // C. Scroll & Animation Loop
    let scrollProgress = 0; // 0 to 1
    const stages = document.querySelectorAll('.hero-stage');
    const scrollIndicator = document.querySelector('.scroll-indicator');
    const sideDots = document.querySelectorAll('.control-dot');

    function animate() {
        requestAnimationFrame(animate);
        
        // Constant idle rotation
        globe.rotation.y += 0.002;
        particlesMesh.rotation.y = -0.0005;
        ring1.rotation.z += 0.005;
        ring2.rotation.z -= 0.003;
        ring3.rotation.z += 0.008;

        // Apply Scroll Zoom
        // The more we scroll, the closer camera gets
        const targetZ = initialZ - (scrollProgress * (initialZ - finalZ));
        
        // Smooth interpolation for zoom
        camera.position.z += (targetZ - camera.position.z) * 0.1;

        // Add some rotation based on scroll too
        globe.rotation.x = scrollProgress * 0.5;

        renderer.render(scene, camera);
    }
    animate();

    // D. Scroll Event Listener (The Scrollytelling Core)
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const spacerHeight = heroSpacer.offsetHeight;
        const viewportHeight = window.innerHeight;
        
        // Calculate how far we are down the "Spacer" container
        // We subtract one viewport because the spacer ends when bottom hits bottom
        const scrollableDistance = spacerHeight - viewportHeight;
        
        // Normalize 0 to 1
        let progress = scrollTop / scrollableDistance;
        if (progress < 0) progress = 0;
        if (progress > 1) progress = 1;
        
        scrollProgress = progress;

        // Hide scroll indicator if started scrolling
        if(progress > 0.05) scrollIndicator.classList.add('hide');
        else scrollIndicator.classList.remove('hide');

        // Stage Management (0-30%, 30-60%, 60-100%)
        stages.forEach(s => s.classList.remove('active'));
        sideDots.forEach(d => d.classList.remove('active'));

        if (progress < 0.33) {
            stages[0].classList.add('active');
            sideDots[0].classList.add('active');
        } else if (progress >= 0.33 && progress < 0.66) {
            stages[1].classList.add('active');
            sideDots[1].classList.add('active');
        } else {
            stages[2].classList.add('active');
            sideDots[2].classList.add('active');
        }
    });

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  // --- 4. Portfolio Data & Modal ---
  const portfolioGrid = document.getElementById('portfolio-grid-dynamic');
  if (portfolioGrid) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    });

    fetch('projects.json')
      .then(r => r.json())
      .then(data => {
        data.forEach(project => {
          const row = document.createElement('div');
          row.className = 'portfolio-row';
          row.innerHTML = `<img src="${project.image}" alt="${project.title}"><div class="portfolio-row-content"><h3>${project.title}</h3><p>${project.excerpt}</p></div>`;
          row.style.opacity = '0';
          row.style.transform = 'translateY(30px)';
          observer.observe(row);
          row.addEventListener('click', () => openModal(project));
          portfolioGrid.appendChild(row);
        });
      })
      .catch(e => console.error(e));

    const modal = document.getElementById('project-modal');
    const closeBtn = document.getElementById('close-modal');
    const modalImg = document.getElementById('modal-image');
    const modalTitle = document.getElementById('modal-title');
    const modalDetails = document.getElementById('modal-details');

    function openModal(p) {
      modalImg.src = p.image;
      modalTitle.textContent = p.title;
      modalDetails.textContent = p.details;
      modal.classList.add('show');
      document.body.style.overflow = 'hidden';
    }
    function closeModal() {
      modal.classList.remove('show');
      document.body.style.overflow = 'auto';
    }

    if(closeBtn) closeBtn.addEventListener('click', closeModal);
    window.addEventListener('click', e => { if(e.target === modal) closeModal(); });
  }
});