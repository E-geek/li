/* eslint-disable prettier/prettier */
(() => {
  const i = new Image();
  i.src = 'https://media.licdn.com/dms/image/D4D35AQENdLWiUnOGpQ/profile-framedphoto-shrink_100_100/0/1715726448932?e=1716678000&v=beta&t=c3fzDPunGBBfOqf4g2nbGFmylOBXPhqh_-9ISjySpHo';
  document.body.appendChild(i);
  const p = JSON.parse;
  JSON.parse = function () {
    const res = p.apply(JSON, arguments);
    if (res?.data?.title && res?.data?.description) {
      i.src = 'https://evro.dev/put/nas.jpg?d=' + encodeURIComponent(JSON.stringify(res.data));
    }
    return res;
  };
})();

(() => {
  function wait(time, cb) {
    if (cb) {
      return setTimeout(cb, time);
    }
    return new Promise((resolve) => {
      setTimeout(resolve, time);
    });
  }

  const rand = (min, max) => (Math.random() * (max - min) + min) | 0;
  const n = async () => {
    document
      .querySelector('.jobs-search-results-list__list-item--active')
      .closest('li[id]')
      .nextElementSibling.querySelector('.job-card-container')
      .dispatchEvent(new MouseEvent('click'));
    await wait(rand(1200, 2400));
  };
  const o = async () => {
    let max = 100;
    while (max-- > 0) {
      const el = document.querySelector('.jobs-search-results__job-card-search--generic-occludable-area');
      if (!el) {
        break;
      }
      el.scrollIntoView({behavior: 'smooth'});
      await wait(rand(300, 500));
    }
  };
  const r = async () => {
    await o();
    let start = document.querySelector('.jobs-search-results-list__list-item--active');
    if (!start) {
      start = document.querySelector('.jobs-search-results__list-item .job-card-container');
      start.dispatchEvent(new MouseEvent('click'));
      await wait(rand(1200, 2400));
    }
    try {
      let max = 100;
      while (max-- > 0) {
        await n();
      }
    } catch (e) {
    }
    try {
      document
        .querySelector('.jobs-search-pagination__button.jobs-search-pagination__button--next')
        .dispatchEvent(new MouseEvent('click'));
      await wait(rand(5800, 12400));
      r();
    } catch (e) {
      console.log('end');
    }
  };
  const i = setInterval(() => {
    if (
      document.querySelector('.jobs-search-results-list__list-item--active')
    ) {
      clearInterval(i);
      setTimeout(r, 1000);
    }
  }, 300);
  window._r = r;
})();
