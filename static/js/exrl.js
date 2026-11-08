(() => {
  'use strict';
  const pi05 = String.raw`\(\pi_{0.5}\)`;
  const pi0 = String.raw`\(\pi_{0}\)`;
  const plainLabel = text => text.replaceAll(pi05, 'pi 0.5').replaceAll(pi0, 'pi 0');
  let mathReady;
  function renderMath(elements) {
    if (!mathReady) return;
    mathReady = mathReady.then(() => MathJax.typesetPromise(elements))
      .catch(error => console.error('Math typesetting failed:', error));
  }
  const tasks = [['fold', 'Fold cloth'], ['power', 'Power insertion'], ['stack', 'Stack cube']];
  const labels = [['base', `${pi05} base policy`], ['training', 'Uncut ExRL training timelapse'], ['exrl', `${pi05} with ExRL-learned execution policy`]];
  function evaluationPlayer(key, kind, title, label) {
    const file = kind === 'training' ? `${key}-training-v12-base` : `${key}-${kind}-v7-smallx`;
    return `<video class="${kind === 'training' ? 'training-video' : 'evaluation-video'}" controls muted loop playsinline data-autoplay preload="none" poster="static/images/${file}.jpg" aria-label="${title}: ${plainLabel(label)}"><source src="static/videos/${file}.mp4" type="video/mp4"></video>`;
  }
  document.querySelector('#real-world-videos').innerHTML = tasks.map(([key, title]) => `
    <article class="task-row" aria-labelledby="task-${key}">
      <h3 class="title is-4" id="task-${key}">${title}</h3>
      <div class="columns is-centered">${labels.map(([kind, label]) => `
        <figure class="column"><figcaption class="media-caption"><span>${label}</span></figcaption>${evaluationPlayer(key, kind, title, label)}</figure>`).join('')}
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
    'Real world': [
      ['Fold cloth', 'real-fold-execution-multi-v2', `${pi05} · 2 rollouts · 2× playback`],
      ['Power insertion', 'real-power-execution-multi-v1', `${pi05} · 3 rollouts · 2× playback`],
      ['Parts organization', 'real-parts-execution-multi-v1', `${pi05} · 3 rollouts · 4× playback`],
      ['Stack cube', 'real-stack-execution-multi-v1', `${pi05} · 3 rollouts · 2× playback`]
    ],
    Robomimic: [
      ['Square', 'robomimic-square-multi-v1', 'Diffusion Policy · 3 rollouts · 2× playback'],
      ['Tool Hang', 'robomimic-tool-hang-v3', 'Diffusion Policy · 2× playback'],
      ['Transport', 'robomimic-transport-restored-multi-v1', 'Diffusion Policy · 2 rollouts · 2× playback'],
      ['Can', 'robomimic-can-multi-v1', 'Diffusion Policy · 3 rollouts · 2× playback'],
      ['Lift', 'robomimic-lift-multi-v1', 'Diffusion Policy · 3 rollouts · 2× playback']
    ],
    Adroit: [['Pen', 'adroit-pen-v3', 'Diffusion Policy · 0.25× playback'], ['Hammer', 'adroit-hammer-v3', 'Diffusion Policy · 0.25× playback'], ['Door', 'adroit-door-v3', 'Diffusion Policy · 0.25× playback'], ['Relocate', 'adroit-relocate-v3', 'Diffusion Policy · 0.25× playback']],
    LIBERO: [[pi05, 'libero-pi05-multi-v1', 'Pick up the cream cheese · 3 rollouts · 2× playback'], [pi0, 'libero-pi0-multi-v1', 'Pick up the cream cheese · 2 rollouts · 2× playback']]
  };
  const groupList = document.querySelector('#gallery-groups');
  groupList.innerHTML = Object.keys(galleries).map((name, i) => `<li class="${i === 0 ? 'is-active' : ''}"><button role="tab" type="button" id="group-${i}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" aria-controls="rollout-panel" data-group="${name}">${name}</button></li>`).join('');
  const groupButtons = [...groupList.querySelectorAll('button')];
  const video = document.querySelector('#rollout-video');
  function selectClip(clip, play = false) {
    const [title, sourceFile, detail] = clip;
    const mediaFile = `${sourceFile}-steps`;
    video.pause();
    video.poster = `static/images/${mediaFile}.jpg`;
    video.querySelector('source').src = `static/videos/${mediaFile}.mp4`;
    video.setAttribute('aria-label', `${plainLabel(title)} rollout with measured execution-length trace. ${plainLabel(detail)}`);
    video.load();
    document.querySelectorAll('#gallery-tasks button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.file === sourceFile)));
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
    if (mathReady) MathJax.typesetClear([taskList]);
    taskList.innerHTML = clips.map((clip, i) => `<button type="button" aria-pressed="${i === 0}" data-file="${clip[1]}">${clip[0]}</button>`).join('');
    taskList.querySelectorAll('button').forEach((button, i) => button.addEventListener('click', () => selectClip(clips[i], true)));
    selectClip(clips[0]);
    renderMath([taskList]);
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
  mathReady = MathJax.startup.promise;
  renderMath([document.body]);
  if (reducedMotion) document.querySelector('#teaser').pause();
})();
