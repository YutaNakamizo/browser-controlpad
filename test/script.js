window.addEventListener("gamepadconnected", e=>{
  const gamepad = e.gamepad;
  console.log(
    `index: ${gamepad.index}`,
    `id: ${gamepad.id}`
  );
  /*for(let btn of e.gamepad.buttons) {
    const elm = document.createElement("input");
    elm.setAttribute("type", "checkbox");
    elm.id = btn
  }*/
});

const getGamepads = () => {
  const gamepad_list = navigator.getGamepads();
  for(let gamepad of gamepad_list) {
    if(!gamepad) {
      console.log('Unconnected Gamepad.');
      continue;
    }
    console.log(
      `index: ${gamepad.index}`,
      `id: ${gamepad.id}`
    );
  }
};
