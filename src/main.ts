// Mobile menu functionality
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

mobileMenuBtn?.addEventListener('click', () => {
  mobileMenu?.classList.toggle('hidden');
});

// Portfolio filtering
const portfolioFilters = document.querySelectorAll<HTMLButtonElement>('.portfolio-filter');
const portfolioItems = document.querySelectorAll<HTMLElement>('.portfolio-item');

portfolioFilters.forEach((filter) => {
  filter.addEventListener('click', () => {
    const filterValue = filter.getAttribute('data-filter');

    // Update active filter button
    portfolioFilters.forEach((f) => {
      f.classList.remove('active', 'bg-emerald-600', 'text-white');
      f.classList.add('bg-white', 'dark:bg-gray-800', 'text-gray-600', 'dark:text-gray-300');
    });

    filter.classList.add('active', 'bg-emerald-600', 'text-white');
    filter.classList.remove('bg-white', 'dark:bg-gray-800', 'text-gray-600', 'dark:text-gray-300');

    // Filter portfolio items
    portfolioItems.forEach((item) => {
      const itemCategory = item.getAttribute('data-category');

      if (filterValue === 'all' || itemCategory === filterValue) {
        item.style.display = 'block';
        item.style.animation = 'fadeIn 0.5s ease-in forwards';
      } else {
        item.style.display = 'none';
      }
    });
  });
});

// Image Gallery Functionality
class ImageGallery {
  private gallery: HTMLElement;
  private images: HTMLImageElement[] = [];
  private dots: HTMLButtonElement[] = [];
  private currentIndex: number = 0;
  private autoPlayInterval?: number;
  private category: string | null = null;

  constructor(galleryElement: HTMLElement) {
    this.gallery = galleryElement;
    this.images = Array.from(galleryElement.querySelectorAll<HTMLImageElement>('.gallery-image'));
    this.dots = Array.from(galleryElement.querySelectorAll<HTMLButtonElement>('.gallery-dot'));
    this.currentIndex = 0;
    this.autoPlayInterval = undefined;
    this.category = galleryElement.getAttribute('data-category');

    this.init();
  }

  private init() {
    // Set up dot navigation
    this.dots.forEach((dot: HTMLButtonElement, index: number) => {
      dot.addEventListener('click', () => this.goToSlide(index));
    });

    // Set up zoom functionality
    const zoomTrigger = this.gallery.querySelector<HTMLElement>('.zoom-trigger');
    if (zoomTrigger) {
      zoomTrigger.addEventListener('click', () => this.openModal());
    }

    // Start auto-play
    this.startAutoPlay();

    // Pause auto-play on hover
    this.gallery.addEventListener('mouseenter', () => this.pauseAutoPlay());
    this.gallery.addEventListener('mouseleave', () => this.startAutoPlay());
  }

  private goToSlide(index: number) {
    if (index < 0 || index >= this.images.length) return;

    // Hide current image
    this.images[this.currentIndex].style.opacity = '0';
    this.dots[this.currentIndex].classList.remove('active');

    // Show new image
    this.currentIndex = index;
    this.images[this.currentIndex].style.opacity = '1';
    this.dots[this.currentIndex].classList.add('active');
  }

  private nextSlide() {
    const nextIndex = (this.currentIndex + 1) % this.images.length;
    this.goToSlide(nextIndex);
  }

  private startAutoPlay() {
    this.autoPlayInterval = window.setInterval(() => {
      this.nextSlide();
    }, 4000); // Change slide every 4 seconds
  }

  private pauseAutoPlay() {
    if (this.autoPlayInterval !== undefined) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = undefined;
    }
  }

  private openModal() {
    const modal = new ImageModal(this.images, this.currentIndex, this.category);
    modal.open();
  }
}

// Image Modal Functionality
class ImageModal {
  private images: HTMLImageElement[];
  private currentIndex: number;
  private category: string | null;
  private modal: HTMLElement | null;
  private modalImage: HTMLImageElement | null;
  private modalTitle: HTMLElement | null;
  private modalCategory: HTMLElement | null;
  private modalDots: HTMLElement | null;
  private modalClose: HTMLElement | null;
  private modalPrev: HTMLElement | null;
  private modalNext: HTMLElement | null;

  constructor(images: HTMLImageElement[], startIndex: number, category: string | null) {
    this.images = images;
    this.currentIndex = startIndex;
    this.category = category;
    this.modal = document.getElementById('image-modal') as HTMLElement | null;
    this.modalImage = document.getElementById('modal-image') as HTMLImageElement | null;
    this.modalTitle = document.getElementById('modal-title');
    this.modalCategory = document.getElementById('modal-category');
    this.modalDots = document.getElementById('modal-dots');
    this.modalClose = document.getElementById('modal-close');
    this.modalPrev = document.getElementById('modal-prev');
    this.modalNext = document.getElementById('modal-next');

    this.init();
  }

  private init() {
    // Set up event listeners
    this.modalClose?.addEventListener('click', () => this.close());
    this.modalPrev?.addEventListener('click', () => this.prevImage());
    this.modalNext?.addEventListener('click', () => this.nextImage());

    // Close on background click
    this.modal?.addEventListener('click', (e: MouseEvent) => {
      if (e.target === this.modal) this.close();
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (!this.modal?.classList.contains('hidden')) {
        switch (e.key) {
          case 'Escape':
            this.close();
            break;
          case 'ArrowLeft':
            this.prevImage();
            break;
          case 'ArrowRight':
            this.nextImage();
            break;
        }
      }
    });

    this.createDots();
  }

  private createDots() {
    if (!this.modalDots) return;

    this.modalDots.innerHTML = '';
    this.images.forEach((_, index: number) => {
      const dot = document.createElement('button');
      dot.className = `w-2 h-2 rounded-full transition-colors duration-200 ${
        index === this.currentIndex ? 'bg-emerald-600' : 'bg-gray-300 dark:bg-gray-600'
      }`;
      dot.addEventListener('click', () => this.goToImage(index));
      this.modalDots!.appendChild(dot);
    });
  }

  open() {
    if (!this.modal) return;

    this.modal.classList.remove('hidden');
    this.modal.classList.add('flex');
    this.updateImage();
    document.body.style.overflow = 'hidden';
  }

  close() {
    if (!this.modal) return;

    this.modal.classList.add('hidden');
    this.modal.classList.remove('flex');
    document.body.style.overflow = '';
  }

  private goToImage(index: number) {
    if (index < 0 || index >= this.images.length) return;
    this.currentIndex = index;
    this.updateImage();
    this.updateDots();
  }

  private nextImage() {
    const nextIndex = (this.currentIndex + 1) % this.images.length;
    this.goToImage(nextIndex);
  }

  private prevImage() {
    const prevIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
    this.goToImage(prevIndex);
  }

  private updateImage() {
    const currentImage = this.images[this.currentIndex];
    if (!currentImage || !this.modalImage) return;

    this.modalImage.src = currentImage.src;
    this.modalImage.alt = currentImage.alt;

    if (this.modalTitle) {
      this.modalTitle.textContent = currentImage.getAttribute('data-title') || currentImage.alt;
    }

    if (this.modalCategory) {
      this.modalCategory.textContent = this.getCategoryDisplayName();
    }
  }

  private updateDots() {
    const dots = this.modalDots?.children;
    if (!dots) return;

    Array.from(dots).forEach((dotEl, index) => {
      const dot = dotEl as HTMLElement;
      if (index === this.currentIndex) {
        dot.className = dot.className.replace('bg-gray-300 dark:bg-gray-600', 'bg-emerald-600');
      } else {
        dot.className = dot.className.replace('bg-emerald-600', 'bg-gray-300 dark:bg-gray-600');
      }
    });
  }

  private getCategoryDisplayName() {
    const categoryNames = {
      education: 'School & Education',
      horticulture: 'Work & Cultivation Registration',
      recruitment: 'Job Matching & Recruitment',
      scheduling: 'Scheduling & Validation',
      components: 'Frontend Libraries',
      cms: 'Content Management System',
      complete: 'Complete Solutions'
    } as const;
    const key = (this.category ?? '') as keyof typeof categoryNames;
    return categoryNames[key] ?? (this.category ?? '');
  }
}

// Initialize all image galleries
const initImageGalleries = () => {
  const galleries = document.querySelectorAll<HTMLElement>('.image-gallery');
  galleries.forEach((gallery) => {
    new ImageGallery(gallery);
  });
};

// Scroll animations
const observeElements = () => {
  const elements = document.querySelectorAll<HTMLElement>('.scroll-fade');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        (entry.target as HTMLElement).classList.add('visible');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  elements.forEach((element) => {
    observer.observe(element);
  });
};

// Email decoding functionality
const setupEmailLinks = () => {
  const emailLinks = document.querySelectorAll<HTMLAnchorElement>('.email-link');
  emailLinks.forEach((link) => {
    link.addEventListener('click', (e: MouseEvent) => {
      e.preventDefault();
      const hash = link.getAttribute('href')?.slice(1);
      if (hash) {
        const email = atob(hash);
        window.location.href = `mailto:${email}`;
      }
    });
  });
};

// Smooth scroll for navigation links
const setupSmoothScroll = () => {
  const navLinks = document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]');
  navLinks.forEach((link) => {
    link.addEventListener('click', (e: MouseEvent) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#') && href.length > 1 && !href.includes('=')) {
        e.preventDefault();
        const targetId = href.slice(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
          const headerHeight = 80; // Account for fixed header
          const targetPosition = targetElement.offsetTop - headerHeight;

          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });

          // Close mobile menu if open
          mobileMenu?.classList.add('hidden');
        }
      }
    });
  });
};

// Navbar background on scroll
const setupNavbarScroll = () => {
  const navbar = document.querySelector('nav');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar?.classList.add('bg-white/95', 'dark:bg-gray-900/95');
      navbar?.classList.remove('bg-white/80', 'dark:bg-gray-900/80');
    } else {
      navbar?.classList.add('bg-white/80', 'dark:bg-gray-900/80');
      navbar?.classList.remove('bg-white/95', 'dark:bg-gray-900/95');
    }
  });
};

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  observeElements();
  setupEmailLinks();
  setupSmoothScroll();
  setupNavbarScroll();
  initImageGalleries();

  // Add staggered animation delays to portfolio items
  portfolioItems.forEach((item, index) => {
    item.style.animationDelay = `${index * 0.1}s`;
  });
});

// Add typing animation for hero text (optional enhancement)
const typeWriter = (element: HTMLElement, text: string, speed: number = 100) => {
  let i = 0;
  element.innerHTML = '';

  const typing = () => {
    if (i < text.length) {
      element.innerHTML += text.charAt(i);
      i++;
      setTimeout(typing, speed);
    }
  };

  typing();
};

// Export for potential external use
export { typeWriter, ImageGallery, ImageModal };
