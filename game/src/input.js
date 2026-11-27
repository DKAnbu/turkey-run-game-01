// Input manager supporting Keyboard, Mouse, and Mobile Touch Events

export class InputManager {
  constructor() {
    this.keys = new Set();
    this.prevKeys = new Set();
    this.mouse = { x: 0, y: 0, down: false, clicked: false };
    this.touch = { active: false, x: 0, y: 0 };
    this.setupListeners();
  }

  setupListeners() {
    window.addEventListener('keydown', (e) => {
      // Prevent default scrolling for arrows and space
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyS', 'KeyA', 'KeyD'].includes(e.code)) {
        e.preventDefault();
      }
      this.keys.add(e.code);
    });

    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
    });

    const canvas = document.getElementById('game-canvas');
    if (canvas) {
      canvas.addEventListener('mousedown', (e) => {
        const rect = canvas.getBoundingClientRect();
        this.mouse.x = (e.clientX - rect.left) * (canvas.width / rect.width);
        this.mouse.y = (e.clientY - rect.top) * (canvas.height / rect.height);
        this.mouse.down = true;
        this.mouse.clicked = true;
      });

      window.addEventListener('mouseup', () => {
        this.mouse.down = false;
      });

      canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        this.mouse.x = (e.clientX - rect.left) * (canvas.width / rect.width);
        this.mouse.y = (e.clientY - rect.top) * (canvas.height / rect.height);
      });
    }

    // Bind touch buttons if available
    this.bindTouchButton('btn-up', 'ArrowUp');
    this.bindTouchButton('btn-down', 'ArrowDown');
    this.bindTouchButton('btn-dash', 'ShiftLeft');
    this.bindTouchButton('btn-gobble', 'KeyG');
  }

  bindTouchButton(elemId, mappedCode) {
    const el = document.getElementById(elemId);
    if (!el) return;
    el.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.keys.add(mappedCode);
    }, { passive: false });

    el.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.keys.delete(mappedCode);
    }, { passive: false });
  }

  update() {
    this.prevKeys = new Set(this.keys);
    this.mouse.clicked = false;
  }

  isDown(code) {
    return this.keys.has(code);
  }

  isJustPressed(code) {
    return this.keys.has(code) && !this.prevKeys.has(code);
  }

  jumpPressed() {
    return this.isJustPressed('Space') || this.isJustPressed('ArrowUp') || this.isJustPressed('KeyW');
  }

  duckDown() {
    return this.isDown('ArrowDown') || this.isDown('KeyS');
  }

  dashPressed() {
    return this.isJustPressed('ShiftLeft') || this.isJustPressed('ShiftRight') || this.isJustPressed('KeyJ');
  }

  gobblePressed() {
    return this.isJustPressed('KeyG') || this.isJustPressed('KeyE');
  }

  actionPressed() {
    return this.jumpPressed() || this.isJustPressed('Enter') || this.mouse.clicked;
  }
}
