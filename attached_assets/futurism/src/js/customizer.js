(function () {
  "use strict";

  /***********************************/
  /*     Customizer Js             
  /*     by Ari budin               
   ==================================*/
  function changeTheme(color) {
    document.documentElement.className = document.documentElement.className.replace(/\btheme-\S+/g, '');
    document.documentElement.classList.add(`theme-${color}`);
  }

  function saveTheme(color) {
    localStorage.setItem('selectedTheme', color);
  }

  function loadTheme() {
    const savedColor = localStorage.getItem('selectedTheme');
    if (savedColor) {
      changeTheme(savedColor);
      // Set active class to the correct button
      const colorButton = document.querySelector(`.relative button[data-color="${savedColor}"]`);
      if (colorButton) {
        colorButtons.forEach(btn => btn.classList.remove('active'));
        colorButton.classList.add('active');
      }
    }
  }

  function toggleDirection() {
    const htmlElement = document.documentElement;
    const isRtl = htmlElement.dir === 'rtl';
    htmlElement.dir = isRtl ? 'ltr' : 'rtl';
    localStorage.setItem('textDirection', htmlElement.dir);
  }

  function loadDirection() {
    const direction = localStorage.getItem('textDirection');
    if (direction) {
      document.documentElement.dir = direction;
      document.getElementById('switch-rtl').checked = (direction === 'rtl');
    }
  }

  function scrollSidebarToActive() {
    // Find the element with the "active" class inside <aside>
    var activeElement = document.querySelector('aside ul > li > ul > li > a.active');

    // Ensure that the element with the "active" class is found
    if (activeElement) {
      // Calculate the distance of the element from the top of <aside>
      var offsetTop = activeElement.parentElement.parentElement.parentElement.offsetTop - 10;

      // Scroll <aside> with smooth scrolling animation
      document.querySelector('aside').scroll({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  }

  const colorButtons = document.querySelectorAll('.relative button[data-color]');
  colorButtons.forEach(button => {
    button.addEventListener('click', function() {
      colorButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');

      const color = button.getAttribute('data-color');
      changeTheme(color);
      saveTheme(color);
    });
  });

  document.getElementById('switch-rtl').addEventListener('change', toggleDirection);

  window.addEventListener('load', () => {
    scrollSidebarToActive();
    loadTheme();
    loadDirection();
  });
})();
