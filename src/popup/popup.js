const intervals = [];



const updateButtonStatus = index => {
  const pad = navigator.getGamepads()[index];
  for(let i in pad.buttons) {
    const btn = pad.buttons[i];
    const elm_tr = document.getElementById(`${pad.id}-button${i}`);
    elm_tr.setAttribute(
      'pressed',
      btn.pressed || btn.touched || btn.value>0
    );
  }
};

const renderOption = id => {
  const elm_devices = document.getElementById('devices');
  const elm_opt = document.createElement('option');
  elm_opt.value = id;
  elm_opt.innerText = id
  devices.appendChild(elm_opt);
  return elm_opt;
};

const renderButtons = (id, buttons) => {
  let html_buttons = '';
  for(let i in buttons) {
    const btn = buttons[i];
    html_buttons += `
      <tr id="${id}-button${i}"><td>
        #${i}
      </td><td>
        <input type="number" id="${id}-button${i}_key"${btn.keyCode ? ' value='+btn.keyCode : ''} />
      </td></tr>
    `;
  }
  const elm_tbody = document.createElement('tbody');
  elm_tbody.id = `${id}-buttons`;
  elm_tbody.innerHTML = html_buttons;
  document.getElementById('buttons').appendChild(elm_tbody);
  return elm_tbody;
};

window.addEventListener('gamepadconnected', e => {
  const pad = e.gamepad;
  console.log(`Gamepad #${pad.index}: Connected!`);
  console.log(`ID: ${pad.id}`);
  if(!document.querySelector(`option[value="${pad.id}"]`)) {
    renderOption(pad.id);
    renderButtons(pad.id, pad.buttons);
  }
  intervals[pad.index] = window.setInterval(() => {
    updateButtonStatus(pad.index)
  }, 1000/30);
});

window.addEventListener('gamepaddisconnected', e => {
  const pad = e.gamepad;
  console.log(`Gamepad #${pad.index}: Disconnected.`);
  console.log(`ID; ${pad.id}`);
  window.clearInterval(intervals[pad.index]);
});


document.addEventListener('DOMContentLoaded', e => {
  const elm_devices = document.getElementById('devices');

  chrome.storage.sync.get(['devices'], result => {
    if(!result.devices) return;
    const devices = result.devices.split(',');
    if(devices.length === 0) return;
    chrome.storage.sync.get(devices, result => {
      for(let id in result) {
        const bindings = JSON.parse(result[id]);
        console.log(bindings);
        renderOption(id);
        renderButtons(id, bindings.buttons);
      }
    });
  })

  elm_devices.addEventListener('change', e => {
    console.log('changed');
    const elm_tbody_list = document.querySelectorAll('#buttons > tbody');
    for(let elm_tbody of elm_tbody_list) {
      elm_tbody.setAttribute('shown', elm_tbody.id === `${elm_devices.value}-buttons`);
    }
  });

  const elm_save = document.getElementById('save');
  elm_save.addEventListener('click', e => {
    elm_save.disabled = true;
    elm_save.innerText = 'saving...';
    const id = document.getElementById('devices').value;
    const elm_key_list = document.querySelectorAll(`input[id^="${id}-button"]`);
    const bindings = [];
    for(let elm_key of elm_key_list) {
      console.log(`${elm_key.value}`);
      bindings.push({ keyCode: elm_key.value });
    }
    const setting = {};
    setting[id] = JSON.stringify({
      buttons: bindings
    });
    chrome.storage.sync.set(setting, () => {
      elm_save.disabled = false;
      elm_save.innerText = 'save';
    });

    chrome.storage.sync.get(['devices'], result => {
      const devices = result.devices ? result.devices.split(',') : [];
      if(!devices.includes(id)) {
        devices.push(id);
        chrome.storage.sync.set({ devices: devices.join(',') })
      }
    });
  });
});
