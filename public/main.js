(() => {
  const { Scene, PerspectiveCamera, WebGLRenderer,
          Vector3, Sprite, SpriteMaterial, Group, TextureLoader } = THREE;

  // Init
  const scene = new Scene();
  const camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
  camera.position.set(0, 60, 140);

  const renderer = new WebGLRenderer({ antialias: true, alpha: true }); // transparent so CSS bg shows
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio || 1);
  document.getElementById('canvas-container').appendChild(renderer.domElement);

  // Agents group
  const agentsGroup = new Group();
  scene.add(agentsGroup);
  const WORLD = { size: 120 };

  // Flower Texture
  const textureLoader = new TextureLoader();
  const flowerTexture = textureLoader.load('flower.png');

  // Agent bahavior
  class Agent {
    constructor(position, params) {
      this.position = position.clone();
      this.velocity = new Vector3(Math.random(), Math.random(), Math.random());
      this.acceleration = new Vector3();
      this.maxSpeed = params.maxSpeed || 1.6;

      const spriteMat = new SpriteMaterial({ map: flowerTexture, transparent: true });
      this.mesh = new Sprite(spriteMat);
      this.mesh.scale.set(params.agentSize, params.agentSize, 1);
      this.mesh.position.copy(this.position);
    }

    applyForce(force) {
      this.acceleration.add(force);
    }

    update(dt, globalHeadingVec) {
      // wandering noise centered around 0
      const noiseStrength = 0.2;
      const noise = new Vector3(
        Math.random() * noiseStrength,
        Math.random() * noiseStrength,
        Math.random() * noiseStrength
      );
      this.applyForce(noise);

      // steering toward global heading
      if (globalHeadingVec) {
        const desired = globalHeadingVec.clone().setLength(this.maxSpeed);
        const steer = desired.sub(this.velocity).multiplyScalar(0.02); // gentle
        this.applyForce(steer);
      }

      // Euler integrate
      this.velocity.add(this.acceleration);
      if (this.velocity.length() > this.maxSpeed) this.velocity.setLength(this.maxSpeed);
      this.position.add(this.velocity.clone().multiplyScalar(dt));
      this.acceleration.set(0, 0, 0);

      // wrap world edges
      const s = WORLD.size;
      if (this.position.x > s) this.position.x = -s;
      if (this.position.x < -s) this.position.x = s;
      if (this.position.y > s) this.position.y = -s;
      if (this.position.y < -s) this.position.y = s;
      if (this.position.z > s) this.position.z = -s;
      if (this.position.z < -s) this.position.z = s;

      // update mesh position
      this.mesh.position.copy(this.position);
    }

    setSize(s) {
      this.mesh.scale.set(s, s, 1);
    }

    setSpeed(v) {
      this.maxSpeed = v;
    }

    dispose() {
      // don't dispose of texture
      if (this.mesh && this.mesh.material) {
        try { this.mesh.material.dispose(); } catch (e) {}
      }
    }
  }

  // controllable params
  const state = {
    agentCount: 120,
    agentSize: 3,
    maxSpeed: 1.6,
    direction: 0 // degrees (0 = +Z)
  };

  let agents = [];
  let lastTime = performance.now();

  // compute global heading vector
  function getGlobalHeadingVec() {
    const deg = ((state.direction % 360) + 360) % 360;
    const rad = deg * (Math.PI / 180);
    return new Vector3(Math.sin(rad), 0, Math.cos(rad)); // X = sin, Z = cos; 0° => +Z
  }

  // Spawn
  function spawnAgents(count) {
    const n = Math.max(0, Math.floor(count));

    // remove old
    for (const a of agents) {
      agentsGroup.remove(a.mesh);
      a.dispose();
    }
    agents = [];

    for (let i = 0; i < n; i++) {
      const pos = new Vector3(
        (Math.random() - 0.5) * WORLD.size * 1.2,
        (Math.random() - 0.5) * WORLD.size * 1.2,
        (Math.random() - 0.5) * WORLD.size * 1.2
      );
      const agent = new Agent(pos, { maxSpeed: state.maxSpeed, agentSize: state.agentSize });
      agentsGroup.add(agent.mesh);
      agents.push(agent);
    }
  }

  // initial spawn
  spawnAgents(state.agentCount);

  // GUI
  function setupGUI() {
    const container = document.getElementById('guiContainer');

    if (window.Tweakpane) {
      const pane = new Tweakpane.Pane({ container });
      pane.addInput(state, 'agentCount', { min: 1, max: 1000, step: 1, label: 'Number of agents' })
        .on('change', (ev) => spawnAgents(ev.value));
      pane.addInput(state, 'agentSize', { min: 0.2, max: 10, step: 0.1, label: 'Agent size' })
        .on('change', (ev) => agents.forEach(a => a.setSize(ev.value)));
      pane.addInput(state, 'maxSpeed', { min: 0.05, max: 20, step: 0.05, label: 'Agent speed' })
        .on('change', (ev) => agents.forEach(a => a.setSpeed(ev.value)));
      pane.addInput(state, 'direction', { min: 0, max: 360, step: 1, label: 'Direction (°)' });
    }
    else {
      Error('Tweakpane not found. GUI disabled.');
    }
  }

  setupGUI();

  // animation loop
  function animate() {
    requestAnimationFrame(animate);
    const now = performance.now();
    const dt = Math.min((now - lastTime) / 16.6667, 4);
    lastTime = now;

    // compute heading vector once per frame
    const heading = getGlobalHeadingVec();

    // update agents
    for (let i = 0; i < agents.length; i++) {
      agents[i].update(dt, heading);
    }

    renderer.render(scene, camera);
  }

  animate();

  // Overlay
  const overlay = document.getElementById('instructions');
  window.addEventListener('keydown', (e) => {
    if (e.key && e.key.toLowerCase() === 'x') {
      overlay && (overlay.style.display = 'none');
    }
  });

  // Resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();
