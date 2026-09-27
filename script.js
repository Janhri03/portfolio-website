const navToggle =
  document.querySelector(".nav-toggle");

const navLinks =
  document.querySelector(".nav-links");

const navLinkItems =
  document.querySelectorAll(".nav-link");

const sections =
  document.querySelectorAll("section[id]");

const reveals =
  document.querySelectorAll(".reveal");

const cursorDot =
  document.querySelector(".cursor-dot");

const cursorRing =
  document.querySelector(".cursor-ring");

const cursorLabel =
  document.querySelector(".cursor-label");

const heroPortrait =
  document.querySelector(".hero-portrait");

const toast =
  document.getElementById("toast");



/* =========================================================
   MOBILE MENU
========================================================= */

if (
  navToggle &&
  navLinks
) {

  navToggle.addEventListener(
    "click",
    () => {

      const isOpen =
        navLinks.classList.toggle(
          "show"
        );


      navToggle.classList.toggle(
        "open",
        isOpen
      );


      navToggle.setAttribute(
        "aria-expanded",
        String(isOpen)
      );


      document.body.classList.toggle(
        "menu-open",
        isOpen
      );

    }
  );

}



navLinkItems.forEach(
  (link) => {

    link.addEventListener(
      "click",
      () => {

        navLinks?.classList.remove(
          "show"
        );


        navToggle?.classList.remove(
          "open"
        );


        navToggle?.setAttribute(
          "aria-expanded",
          "false"
        );


        document.body.classList.remove(
          "menu-open"
        );

      }
    );

  }
);



/* =========================================================
   ACTIVE NAVIGATION
========================================================= */

const sectionObserver =
  new IntersectionObserver(

    (entries) => {

      entries.forEach(
        (entry) => {

          if (
            !entry.isIntersecting
          ) {
            return;
          }


          navLinkItems.forEach(
            (link) => {

              link.classList.remove(
                "active"
              );


              const target =
                link.getAttribute(
                  "href"
                );


              if (
                target ===
                `#${entry.target.id}`
              ) {

                link.classList.add(
                  "active"
                );

              }

            }
          );

        }
      );

    },

    {
      rootMargin:
        "-40% 0px -50% 0px",

      threshold: 0
    }

  );



sections.forEach(
  (section) => {

    sectionObserver.observe(
      section
    );

  }
);



/* =========================================================
   REVEAL ANIMATIONS
========================================================= */

const revealObserver =
  new IntersectionObserver(

    (
      entries,
      observer
    ) => {

      entries.forEach(
        (entry) => {

          if (
            !entry.isIntersecting
          ) {
            return;
          }


          entry.target.classList.add(
            "show"
          );


          observer.unobserve(
            entry.target
          );

        }
      );

    },

    {
      threshold: 0.12
    }

  );



reveals.forEach(
  (element) => {

    revealObserver.observe(
      element
    );

  }
);



/* =========================================================
   CUSTOM CURSOR
========================================================= */

const desktopPointer =
  window.matchMedia(
    "(pointer: fine)"
  ).matches;



if (
  cursorDot &&
  cursorRing &&
  desktopPointer
) {

  let mouseX =
    window.innerWidth / 2;

  let mouseY =
    window.innerHeight / 2;


  let ringX =
    mouseX;

  let ringY =
    mouseY;



  window.addEventListener(
    "mousemove",
    (event) => {

      mouseX =
        event.clientX;

      mouseY =
        event.clientY;


      cursorDot.style.left =
        `${mouseX}px`;

      cursorDot.style.top =
        `${mouseY}px`;

    }
  );



  function animateCursor() {

    ringX +=
      (mouseX - ringX) *
      0.16;


    ringY +=
      (mouseY - ringY) *
      0.16;


    cursorRing.style.left =
      `${ringX}px`;


    cursorRing.style.top =
      `${ringY}px`;


    requestAnimationFrame(
      animateCursor
    );

  }


  animateCursor();



  const cursorTargets =
    document.querySelectorAll(
      "[data-cursor], a, button"
    );



  cursorTargets.forEach(
    (element) => {

      element.addEventListener(
        "mouseenter",
        () => {

          const label =
            element.dataset.cursor || "";


          cursorRing.classList.add(
            "active"
          );


          if (
            cursorLabel
          ) {

            cursorLabel.textContent =
              label;

          }

        }
      );


      element.addEventListener(
        "mouseleave",
        () => {

          cursorRing.classList.remove(
            "active"
          );


          if (
            cursorLabel
          ) {

            cursorLabel.textContent =
              "";

          }

        }
      );

    }
  );

}



/* =========================================================
   HERO PORTRAIT MOVEMENT
========================================================= */

if (
  heroPortrait &&
  desktopPointer
) {

  window.addEventListener(
    "mousemove",
    (event) => {

      const normalizedX =
        event.clientX /
        window.innerWidth -
        0.5;


      const normalizedY =
        event.clientY /
        window.innerHeight -
        0.5;


      const moveX =
        normalizedX * 16;


      const moveY =
        normalizedY * 12;


      heroPortrait.style.setProperty(
        "--move-x",
        `${moveX}px`
      );


      heroPortrait.style.setProperty(
        "--move-y",
        `${moveY}px`
      );

    }
  );

}



/* =========================================================
   COPY EMAIL
========================================================= */

async function copyText(
  text
) {

  try {

    if (
      navigator.clipboard &&
      window.isSecureContext
    ) {

      await navigator.clipboard.writeText(
        text
      );


      return true;

    }

  } catch (
    error
  ) {

    console.warn(
      "Clipboard API failed:",
      error
    );

  }



  const textArea =
    document.createElement(
      "textarea"
    );


  textArea.value =
    text;


  textArea.style.position =
    "fixed";


  textArea.style.opacity =
    "0";


  textArea.style.pointerEvents =
    "none";


  document.body.appendChild(
    textArea
  );


  textArea.focus();

  textArea.select();



  let success =
    false;


  try {

    success =
      document.execCommand(
        "copy"
      );

  } catch (
    error
  ) {

    success =
      false;

  }


  textArea.remove();


  return success;

}



let toastTimer;



function showToast(
  message
) {

  if (
    !toast
  ) {
    return;
  }


  toast.textContent =
    message;


  toast.classList.add(
    "show"
  );


  clearTimeout(
    toastTimer
  );


  toastTimer =
    setTimeout(
      () => {

        toast.classList.remove(
          "show"
        );

      },
      2200
    );

}



document
  .querySelectorAll(
    ".copy-email"
  )
  .forEach(
    (button) => {

      button.addEventListener(
        "click",
        async () => {

          const copied =
            await copyText(
              "janhri03@gmail.com"
            );


          showToast(

            copied
              ? "EMAIL COPIED"
              : "janhri03@gmail.com"

          );

        }
      );

    }
  );



/* =========================================================
   ESC CLOSES MOBILE MENU
========================================================= */

document.addEventListener(
  "keydown",
  (event) => {

    if (
      event.key !==
      "Escape"
    ) {
      return;
    }


    navLinks?.classList.remove(
      "show"
    );


    navToggle?.classList.remove(
      "open"
    );


    navToggle?.setAttribute(
      "aria-expanded",
      "false"
    );


    document.body.classList.remove(
      "menu-open"
    );

  }
);