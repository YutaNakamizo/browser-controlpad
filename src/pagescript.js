const GpCtrl = {
  bindings: {},
  states: {}
};


const attachBindings = index => {
  const pad = navigator.getGamepads()[index];
  const bindings = GpCtrl.bindings[pad.id];
  const states = GpCtrl.states[pad.id];
  if(!bindings) return;
  for(let i=0; i<pad.buttons.length; i++) {
    const btn = pad.buttons[i];
    const binding = bindings.buttons[i];
    const state = states.buttons[i];
    if(
      binding.keyCode !== ''
      && state === 0
      && (btn.pressed && btn.touched && btn.value>0)
    ) {
      console.log(binding.keyCode);
      const global = document.activeElement.tagName==='IFRAME' ? document.activeElement.contentWindow : window;
      for(let type of ['keydown', 'keyup']) {
        for(let target of [global.document, global]) {
          console.log(type, target);
          target.dispatchEvent(new KeyboardEvent(type, { keyCode: Number(binding.keyCode) }));
        }
      }
    }
    GpCtrl.states[pad.id].buttons[i] = (btn.pressed || btn.touched || btn.value>0) ? 1 : 0;
  }
  return;
};

window.addEventListener('gamepadconnected', e => {
  const pad = e.gamepad;
  console.log(`Gamepad #${pad.index}: Connected!`);
  console.log(`ID: ${pad.id}`);
  GpCtrl.states[pad.id] = {
    buttons: pad.buttons.map(btn => (btn.pressed || btn.touched || btn.value>0) ? 1 : 0)
  }
  window.setInterval(() => {
    attachBindings(pad.index);
  }, 33);
});

window.addEventListener('gamepaddisconnected', e => {
  const pad = e.gamepad;
  console.log(`Gamepad #${pad.index}: Disconnected.`);
});


chrome.storage.sync.get(['devices'], result => {
  if(!result.devices) return;
  const devices = result.devices.split(',');
  if(devices.length === 0) return;
  chrome.storage.sync.get(devices, result => {
    for(let id in result) {
      GpCtrl.bindings[id] = JSON.parse(result[id]);
    }
    console.log('loaded bindings.');
  });
});
