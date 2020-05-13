const menu = document.querySelector('.menu'),
      wrapper = document.querySelector('.wrapper'),
      aside = document.querySelector('.aside');

menu.addEventListener('click', () => {
  menu.classList.toggle('menu_active');
  wrapper.classList.toggle('wrapper_innactive');
  aside.classList.toggle('aside_active');
});
