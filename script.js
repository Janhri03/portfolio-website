const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
const navLinkItems = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll("section");
const reveals = document.querySelectorAll(".reveal");

if (navToggle) {
  navToggle.addEventListener("click", () => {
    navLinks.classList.toggle("show");
  });
}

navLinkItems.forEach(link => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("show");
  });
});

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinkItems.forEach(link => {
        link.classList.remove("active");

        if (link.getAttribute("href") === `#${entry.target.id}`) {
          link.classList.add("active");
        }
      });
    }
  });
}, { threshold: 0.45 });

sections.forEach(section => sectionObserver.observe(section));

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.18 });

reveals.forEach(item => revealObserver.observe(item));

const cursorDot = document.querySelector(".cursor-dot");
const cursorRing = document.querySelector(".cursor-ring");

if (cursorDot && cursorRing && window.innerWidth > 768) {
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;

  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    cursorDot.style.left = `${mouseX}px`;
    cursorDot.style.top = `${mouseY}px`;
  });

  function animateRing() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;

    cursorRing.style.left = `${ringX}px`;
    cursorRing.style.top = `${ringY}px`;

    requestAnimationFrame(animateRing);
  }

  animateRing();

  document.querySelectorAll("a, button").forEach(el => {
    el.addEventListener("mouseenter", () => cursorRing.classList.add("hover"));
    el.addEventListener("mouseleave", () => cursorRing.classList.remove("hover"));
  });
}
const copyEmailBtn = document.getElementById("copyEmail");
const toast = document.getElementById("toast");

if (copyEmailBtn && toast) {
  copyEmailBtn.addEventListener("click", (e) => {
    e.preventDefault();

    navigator.clipboard.writeText("janhri03@gmail.com");

    toast.classList.add("show");

    setTimeout(() => {
      toast.classList.remove("show");
    }, 2200);
  });
}