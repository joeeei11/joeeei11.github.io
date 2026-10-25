// ===== 首页逻辑（沿用 V1，仅在存在对应元素时运行）=====
const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');
const header = document.querySelector('.site-header');

if (menuToggle && siteNav && header) {
  const navLinks = [...siteNav.querySelectorAll('a')];
  const sections = navLinks.map((link) => document.querySelector(link.getAttribute('href')));

  function setMenuOpen(isOpen) {
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? '关闭导航菜单' : '打开导航菜单');
    siteNav.classList.toggle('is-open', isOpen);
  }

  menuToggle.addEventListener('click', () => {
    setMenuOpen(menuToggle.getAttribute('aria-expanded') !== 'true');
  });

  navLinks.forEach((link) => link.addEventListener('click', () => setMenuOpen(false)));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
      setMenuOpen(false);
      menuToggle.focus();
    }
  });

  document.addEventListener('click', (event) => {
    if (!header.contains(event.target)) setMenuOpen(false);
  });

  let scrollScheduled = false;
  function updateScrollState() {
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
    header.style.setProperty('--scroll-progress', Math.min(1, Math.max(0, progress)));

    const activeIndex = sections.reduce((current, section, index) => {
      return section && section.getBoundingClientRect().top <= window.innerHeight * 0.35 ? index : current;
    }, -1);

    navLinks.forEach((link, index) => {
      if (index === activeIndex) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    scrollScheduled = false;
  }

  window.addEventListener('scroll', () => {
    if (scrollScheduled) return;
    scrollScheduled = true;
    requestAnimationFrame(updateScrollState);
  }, { passive: true });
  window.addEventListener('resize', updateScrollState);
  updateScrollState();
}

if (window.IntersectionObserver && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const targets = document.querySelectorAll('.section-side, .section h2, .section-intro, .about-copy > p, .direction-card, .section-heading > p, .project-group-title, .project-row, .tools-empty-note, .contact-copy, .contact-links');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -40px 0px', threshold: 0.05 });

  targets.forEach((target, index) => {
    target.classList.add('reveal');
    target.style.setProperty('--reveal-delay', `${index % 3 * 70}ms`);
    observer.observe(target);
  });
  document.documentElement.classList.add('motion-ready');

  // Prevent a direct section link from leaving content hidden before its observer fires.
  window.setTimeout(() => {
    targets.forEach((target) => target.classList.add('is-visible'));
  }, 1200);
}

const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ===== 首页项目行：宣传片原地手风琴展开 =====
document.querySelectorAll('.preview-toggle').forEach((btn) => {
  btn.addEventListener('click', () => {
    const targetId = btn.getAttribute('aria-controls');
    const panel = document.getElementById(targetId);
    if (!panel) return;
    const isOpen = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!isOpen));
    panel.classList.toggle('is-open', !isOpen);
    btn.querySelector('.toggle-text').textContent = isOpen ? '查看宣传片' : '收起宣传片';

    if (!isOpen) {
      // 展开时才加载视频资源，避免首页一次性预加载多个视频
      const video = panel.querySelector('video');
      if (video && !video.src && video.dataset.src) video.src = video.dataset.src;
    } else {
      const video = panel.querySelector('video');
      if (video) video.pause();
    }
  });
});

// ===== 项目详情页：侧边栏 scroll-spy =====
const detailNav = document.querySelector('.detail-sidebar nav');
if (detailNav) {
  const detailLinks = [...detailNav.querySelectorAll('a')];
  const detailSections = detailLinks.map((link) => document.querySelector(link.getAttribute('href')));

  function updateDetailNav() {
    const activeIndex = detailSections.reduce((current, section, index) => {
      return section && section.getBoundingClientRect().top <= window.innerHeight * 0.4 ? index : current;
    }, 0);
    detailLinks.forEach((link, index) => {
      if (index === activeIndex) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }

  let detailScrollScheduled = false;
  window.addEventListener('scroll', () => {
    if (detailScrollScheduled) return;
    detailScrollScheduled = true;
    requestAnimationFrame(() => { updateDetailNav(); detailScrollScheduled = false; });
  }, { passive: true });
  updateDetailNav();
}

// ===== 项目详情页：Hero 视频取消静音/完整播放按钮 =====
document.querySelectorAll('.sound-toggle').forEach((btn) => {
  btn.addEventListener('click', () => {
    const video = btn.closest('.hero-video-wrap')?.querySelector('video');
    if (!video) return;
    video.muted = !video.muted;
    if (!video.muted) video.play().catch(() => {});
    btn.querySelector('.toggle-label').textContent = video.muted ? '开启声音' : '关闭声音';
  });
});

// ===== 项目详情页：Hero 视频播放策略 =====
// 桌面端：静音自动循环播放（氛围感），隐藏静态首帧占位层
// 移动端：保留静态首帧占位 + 点击播放（省流量、省电），点击后带声音播放
const isDesktopHero = window.matchMedia('(min-width: 641px)').matches
  && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.querySelectorAll('.hero-video-wrap').forEach((wrap) => {
  const video = wrap.querySelector('video');
  const staticLayer = wrap.querySelector('.hero-video-static');
  if (!video) return;

  if (isDesktopHero) {
    if (video.dataset.src) video.src = video.dataset.src;
    video.muted = true;
    video.play().catch(() => {});
    if (staticLayer) staticLayer.style.display = 'none';
  }
  // 移动端保持 staticLayer 可见，交由下方点击事件处理
});

document.querySelectorAll('.hero-video-static .play-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const wrap = btn.closest('.hero-video-wrap');
    const video = wrap?.querySelector('video');
    const staticLayer = wrap?.querySelector('.hero-video-static');
    if (!video || !staticLayer) return;
    if (!video.src && video.dataset.src) video.src = video.dataset.src;
    video.muted = false;
    video.loop = false;
    video.controls = true;
    staticLayer.style.display = 'none';
    video.play().catch(() => {});
  });
});
