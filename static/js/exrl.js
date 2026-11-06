(() => {
  'use strict';
  const tasks = [['fold', 'Fold cloth'], ['power', 'Power insertion'], ['stack', 'Stack cube']];
  const labels = [['base', 'Base policy'], ['training', 'Uncut ExRL training timelapse'], ['exrl', 'ExRL']];
  function evaluationPlayer(key, kind, title, label) {
    const file = `${key}-${kind}${kind === 'training' ? '' : '-v2'}`;
    return `<video controls muted loop playsinline data-autoplay preload="none" poster="static/images/${file}.jpg" aria-label="${title}: ${label}"><source src="static/videos/${file}.mp4" type="video/mp4"></video>`;
  }
  document.querySelector('#real-world-videos').innerHTML = tasks.map(([key, title]) => `
    <article class="task-row" aria-labelledby="task-${key}">
      <h3 class="title is-4" id="task-${key}">${title}</h3>
      <div class="columns is-centered">${labels.map(([kind, label]) => `
        <figure class="column">${evaluationPlayer(key, kind, title, label)}<figcaption class="media-caption">${label}</figcaption></figure>`).join('')}
      </div>
    </article>`).join('');

  function rovingTabs(buttons, activate) {
    buttons.forEach((button, index) => {
      button.addEventListener('click', () => activate(button));
      button.addEventListener('keydown', event => {
        let next;
        if (event.key === 'ArrowRight') next = (index + 1) % buttons.length;
        else if (event.key === 'ArrowLeft') next = (index + buttons.length - 1) % buttons.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = buttons.length - 1;
        else return;
        event.preventDefault(); activate(buttons[next]); buttons[next].focus();
      });
    });
  }
  const resultButtons = [...document.querySelectorAll('[data-result]')];
  rovingTabs(resultButtons, active => {
    resultButtons.forEach(button => {
      const selected = button === active;
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
      button.parentElement.classList.toggle('is-active', selected);
      document.querySelector('#result-' + button.dataset.result).hidden = !selected;
    });
  });

  const galleries = {
    Robomimic: [
      ['Square', 'robomimic-square', 'Diffusion Policy · 2× playback'],
      ['Tool Hang', 'robomimic-tool-hang', 'Diffusion Policy · 2× playback'],
      ['Transport', 'robomimic-transport-restored', 'Diffusion Policy · 2× playback'],
      ['Can', 'robomimic-can', 'Diffusion Policy · 2× playback'],
      ['Lift', 'robomimic-lift', 'Diffusion Policy · 2× playback']
    ],
    Adroit: [['Pen', 'adroit-pen', 'Diffusion Policy · 0.25× playback'], ['Hammer', 'adroit-hammer', 'Diffusion Policy · 0.25× playback'], ['Door', 'adroit-door', 'Diffusion Policy · 0.25× playback'], ['Relocate', 'adroit-relocate', 'Diffusion Policy · 0.25× playback']],
    LIBERO: [['π₀.₅', 'libero-pi05', 'Pick up the cream cheese · 2× playback'], ['π₀', 'libero-pi0', 'Pick up the cream cheese · 2× playback']],
    'Real world': [['Power insertion', 'power-execution-2x', 'π₀.₅ · 2× playback']]
  };
  const groupList = document.querySelector('#gallery-groups');
  groupList.innerHTML = Object.keys(galleries).map((name, i) => `<li class="${i === 0 ? 'is-active' : ''}"><button role="tab" type="button" id="group-${i}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" aria-controls="rollout-panel" data-group="${name}">${name}</button></li>`).join('');
  const groupButtons = [...groupList.querySelectorAll('button')];
  const video = document.querySelector('#rollout-video');
  function selectClip(clip, play = false) {
    const [title, file, detail] = clip;
    video.pause();
    video.poster = `static/images/${file}.jpg`;
    video.querySelector('source').src = `static/videos/${file}.mp4`;
    video.setAttribute('aria-label', `${title} rollout with measured execution-length trace`);
    video.load();
    document.querySelector('#rollout-caption').textContent = `${title} · ${detail}`;
    document.querySelectorAll('#gallery-tasks button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.file === file)));
    if (play) video.play().catch(() => {});
  }
  function selectGroup(active) {
    groupButtons.forEach(button => {
      const selected = button === active;
      button.setAttribute('aria-selected', String(selected)); button.tabIndex = selected ? 0 : -1;
      button.parentElement.classList.toggle('is-active', selected);
    });
    const clips = galleries[active.dataset.group];
    document.querySelector('#rollout-panel').setAttribute('aria-labelledby', active.id);
    const taskList = document.querySelector('#gallery-tasks');
    taskList.innerHTML = clips.map((clip, i) => `<button type="button" aria-pressed="${i === 0}" data-file="${clip[1]}">${clip[0]}</button>`).join('');
    taskList.querySelectorAll('button').forEach((button, i) => button.addEventListener('click', () => selectClip(clips[i], true)));
    selectClip(clips[0]);
  }
  rovingTabs(groupButtons, selectGroup);
  selectGroup(groupButtons[0]);

  // Keep offscreen clips quiet and avoid fetching nine videos on page load.
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(({target, isIntersecting}) => {
      if (!isIntersecting && !target.paused) target.pause();
      else if (isIntersecting && target.hasAttribute('data-autoplay') && !reducedMotion) target.play().catch(() => {});
    });
  }, {threshold: 0.1});
  document.querySelectorAll('video').forEach(item => observer.observe(item));
  if (reducedMotion) document.querySelector('#teaser').pause();
})();
