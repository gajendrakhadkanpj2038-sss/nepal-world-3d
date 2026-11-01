import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const canvas = document.getElementById('game');
const stats = document.getElementById('stats');
const modal = document.getElementById('modal');
const mtitle = document.getElementById('mtitle');
const mtext = document.getElementById('mtext');
const questBanner = document.getElementById('questBanner');
const joystickBase = document.getElementById('joystick-base');
const joystickKnob = document.getElementById('joystick-knob');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9ddaf2);
scene.fog = new THREE.Fog(0x9ddaf2, 35, 95);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(0, 5.5, 12);

const clock = new THREE.Clock();

const input = {
  forward: false,
  backward: false,
  left: false,
  right: false,
};

const joystickState = {
  active: false,
  x: 0,
  y: 0,
};

const world = {
  templePos: new THREE.Vector3(0, 0, -14),
  treePos: new THREE.Vector3(-12, 0, 1),
  npcPos: new THREE.Vector3(0, 0, -9),
  boundary: 28,
};

const player = {
  position: new THREE.Vector3(0, 1.1, 12),
  direction: new THREE.Vector3(0, 0, -1),
  speed: 11,
  yaw: 0,
  mesh: null,
};

let questStarted = false;
let hasCoconut = false;
let questComplete = false;
let coconutIsDropping = false;
let coconutReadyOnGround = false;
let coconutPickedUp = false;

const coconut = new THREE.Mesh(
  new THREE.SphereGeometry(0.35, 18, 18),
  new THREE.MeshStandardMaterial({
    color: 0x8a4a2b,
    roughness: 0.8,
    metalness: 0.05,
  })
);

function createGround() {
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(120, 120),
    new THREE.MeshStandardMaterial({ color: 0x6ea85a, roughness: 0.98, metalness: 0.02 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const roadMaterial = new THREE.MeshStandardMaterial({ color: 0x8d7049, roughness: 1 });

  const road1 = new THREE.Mesh(new THREE.BoxGeometry(18, 0.12, 8), roadMaterial);
  road1.position.set(0, 0.06, 0);
  road1.receiveShadow = true;
  scene.add(road1);

  const road2 = new THREE.Mesh(new THREE.BoxGeometry(8, 0.12, 18), roadMaterial);
  road2.position.set(0, 0.06, -8);
  road2.receiveShadow = true;
  scene.add(road2);

  for (let i = 0; i < 18; i++) {
    const patch = new THREE.Mesh(
      new THREE.BoxGeometry(4.2, 0.04, 2.2),
      new THREE.MeshStandardMaterial({ color: 0xd9eea6, roughness: 1 })
    );
    patch.position.set(-24 + i * 3, 0.07, 20 + (i % 3) * 2);
    patch.rotation.y = 0.18;
    patch.receiveShadow = true;
    scene.add(patch);
  }

  const pond = new THREE.Mesh(
    new THREE.CircleGeometry(5.5, 32),
    new THREE.MeshPhysicalMaterial({
      color: 0x3f9cc9,
      roughness: 0.15,
      transmission: 0.2,
      transparent: true,
      opacity: 0.9,
    })
  );
  pond.rotation.x = -Math.PI / 2;
  pond.position.set(20, 0.06, 18);
  scene.add(pond);
}

function createTemple() {
  const group = new THREE.Group();

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(12, 2.8, 8),
    new THREE.MeshStandardMaterial({ color: 0xd9b15d, roughness: 0.75 })
  );
  base.position.y = 1.4;
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);

  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(7.8, 3.6, 4),
    new THREE.MeshStandardMaterial({ color: 0xb94d39, roughness: 0.7, metalness: 0.1 })
  );
  roof.rotation.y = Math.PI / 4;
  roof.position.y = 4.8;
  roof.castShadow = true;
  group.add(roof);

  const inner = new THREE.Mesh(
    new THREE.BoxGeometry(6.6, 4.4, 4.6),
    new THREE.MeshStandardMaterial({ color: 0xf5e7c8, roughness: 0.8 })
  );
  inner.position.y = 3.0;
  group.add(inner);

  const topDome = new THREE.Mesh(
    new THREE.SphereGeometry(2.2, 24, 24),
    new THREE.MeshPhysicalMaterial({
      color: 0xf7d770,
      emissive: 0x2a1800,
      roughness: 0.5,
      metalness: 0.1,
    })
  );
  topDome.position.y = 7.6;
  group.add(topDome);

  for (let i = 0; i < 4; i++) {
    const p = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.5, 3.8, 12),
      new THREE.MeshStandardMaterial({ color: 0x8d6830, roughness: 0.9 })
    );
    const x = i < 2 ? -3.2 : 3.2;
    const z = i % 2 === 0 ? -2.7 : 2.7;
    p.position.set(x, 1.8, z);
    p.castShadow = true;
    group.add(p);
  }

  group.position.copy(world.templePos);
  scene.add(group);
}

function createTree(x, z, scale = 1) {
  const group = new THREE.Group();

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.7 * scale, 0.9 * scale, 5 * scale, 12),
    new THREE.MeshStandardMaterial({ color: 0x7a4d2b, roughness: 1 })
  );
  trunk.position.y = 2.5 * scale;
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  group.add(trunk);

  const leavesMat = new THREE.MeshStandardMaterial({ color: 0x2e8f47, roughness: 1 });

  const leaf1 = new THREE.Mesh(new THREE.SphereGeometry(2.8 * scale, 20, 20), leavesMat);
  leaf1.position.set(0, 5.5 * scale, 0);
  leaf1.castShadow = true;
  group.add(leaf1);

  const leaf2 = new THREE.Mesh(new THREE.SphereGeometry(2.3 * scale, 20, 20), leavesMat);
  leaf2.position.set(1.4 * scale, 6.5 * scale, 0.5 * scale);
  leaf2.castShadow = true;
  group.add(leaf2);

  const leaf3 = new THREE.Mesh(new THREE.SphereGeometry(2.2 * scale, 20, 20), leavesMat);
  leaf3.position.set(-1.6 * scale, 6.2 * scale, -0.8 * scale);
  leaf3.castShadow = true;
  group.add(leaf3);

  group.position.set(x, 0, z);
  scene.add(group);
  return group;
}

function createHouse(x, z, w = 4.5, d = 4.5, color = 0xdab98d) {
  const group = new THREE.Group();

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(w, 2.5, d),
    new THREE.MeshStandardMaterial({ color, roughness: 0.8 })
  );
  base.position.y = 1.25;
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);

  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(Math.max(w, d) * 0.65, 2.2, 4),
    new THREE.MeshStandardMaterial({ color: 0x964a3b, roughness: 0.9 })
  );
  roof.rotation.y = Math.PI / 4;
  roof.position.y = 3.3;
  roof.castShadow = true;
  group.add(roof);

  const door = new THREE.Mesh(
    new THREE.BoxGeometry(w * 0.22, 1.4, 0.2),
    new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.95 })
  );
  door.position.set(0, 0.8, d * 0.57);
  group.add(door);

  group.position.set(x, 0, z);
  scene.add(group);
}

function createNPC() {
  const group = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.8, 2.2, 8, 16),
    new THREE.MeshStandardMaterial({ color: 0x2f3c46, roughness: 0.8 })
  );
  body.position.y = 2.2;
  body.castShadow = true;
  group.add(body);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.7, 18, 18),
    new THREE.MeshStandardMaterial({ color: 0xf0c89a, roughness: 0.9 })
  );
  head.position.y = 4.1;
  head.castShadow = true;
  group.add(head);

  const robe = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 1.35, 0.75),
    new THREE.MeshStandardMaterial({ color: 0xb27d38, roughness: 0.8 })
  );
  robe.position.y = 2.5;
  group.add(robe);

  const shoes = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 0.4, 0.8),
    new THREE.MeshStandardMaterial({ color: 0x1d1d1d })
  );
  shoes.position.set(0, 0.8, 0.2);
  group.add(shoes);

  group.position.copy(world.npcPos);
  scene.add(group);
  return group;
}

function createPlayerMesh() {
  const group = new THREE.Group();
  group.scale.setScalar(0.75);

  const torso = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 1.5, 0.5),
    new THREE.MeshStandardMaterial({ color: 0x2e5d9f, roughness: 0.7, metalness: 0.15 })
  );
  torso.position.y = 1.8;
  torso.castShadow = true;
  group.add(torso);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.52, 20, 20),
    new THREE.MeshStandardMaterial({ color: 0xf1c79a, roughness: 0.9 })
  );
  head.position.y = 3.2;
  head.castShadow = true;
  group.add(head);

  const hair = new THREE.Mesh(
    new THREE.SphereGeometry(0.54, 20, 20),
    new THREE.MeshStandardMaterial({ color: 0x2b1d15, roughness: 0.9 })
  );
  hair.scale.set(1.1, 0.8, 1.1);
  hair.position.set(0, 3.4, -0.04);
  hair.castShadow = true;
  group.add(hair);

  const face = new THREE.Mesh(
    new THREE.BoxGeometry(0.44, 0.22, 0.06),
    new THREE.MeshStandardMaterial({ color: 0x1a1a1a })
  );
  face.position.set(0, 3.2, 0.5);
  group.add(face);

  const leftArm = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.12, 0.9, 12),
    new THREE.MeshStandardMaterial({ color: 0xf1c79a, roughness: 0.9 })
  );
  leftArm.position.set(-0.7, 1.8, 0);
  leftArm.rotation.z = 0.6;
  leftArm.castShadow = true;
  group.add(leftArm);

  const rightArm = leftArm.clone();
  rightArm.position.x = 0.7;
  rightArm.rotation.z = -0.6;
  group.add(rightArm);

  const leftHand = new THREE.Mesh(
    new THREE.SphereGeometry(0.15, 12, 12),
    new THREE.MeshStandardMaterial({ color: 0xf1c79a, roughness: 0.9 })
  );
  leftHand.position.set(-0.95, 1.2, 0);
  group.add(leftHand);

  const rightHand = leftHand.clone();
  rightHand.position.x = 0.95;
  group.add(rightHand);

  const leftLeg = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.14, 1.2, 12),
    new THREE.MeshStandardMaterial({ color: 0x1d1d1d, roughness: 0.9 })
  );
  leftLeg.position.set(-0.22, 0.55, 0);
  leftLeg.castShadow = true;
  group.add(leftLeg);

  const rightLeg = leftLeg.clone();
  rightLeg.position.x = 0.22;
  group.add(rightLeg);

  const leftShoe = new THREE.Mesh(
    new THREE.BoxGeometry(0.25, 0.12, 0.42),
    new THREE.MeshStandardMaterial({ color: 0x1d1d1d, roughness: 0.9 })
  );
  leftShoe.position.set(-0.22, 0.02, 0.1);
  group.add(leftShoe);

  const rightShoe = leftShoe.clone();
  rightShoe.position.x = 0.22;
  group.add(rightShoe);

  group.position.copy(player.position);
  scene.add(group);
  player.mesh = group;
}

function createCoconutPickup() {
  coconut.position.set(world.treePos.x + 1.2, 6.5, world.treePos.z + 0.8);
  coconut.castShadow = true;
  coconut.visible = false;
  scene.add(coconut);
}

function createVillage() {
  createHouse(-18, 18, 5, 5, 0xdab98d);
  createHouse(-10, 18, 5, 5, 0xe5c9a5);
  createHouse(-2, 18, 5, 5, 0xd9b18c);
  createHouse(10, 18, 5, 5, 0xe0c7a4);
  createHouse(18, 18, 5, 5, 0xcfb08c);

  createHouse(-18, 10, 5.2, 4.8, 0xeacaa0);
  createHouse(-8, 10, 4.8, 5.2, 0xdab98d);
  createHouse(4, 10, 5.5, 4.6, 0xe5d09c);
  createHouse(15, 10, 5.1, 5.1, 0xd8b889);

  createTree(-22, 8, 1.1);
  createTree(22, 8, 1.1);
  createTree(20, -10, 1.2);
  createTree(-18, -12, 1.2);
}

function addLights() {
  const hemi = new THREE.HemisphereLight(0xe1f8ff, 0x4e7a44, 1.2);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(0xfff5d6, 1.35);
  sun.position.set(30, 32, 18);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -35;
  sun.shadow.camera.right = 35;
  sun.shadow.camera.top = 35;
  sun.shadow.camera.bottom = -35;
  scene.add(sun);

  const fill = new THREE.PointLight(0xfff3d0, 0.8, 60, 2);
  fill.position.set(-10, 12, -8);
  scene.add(fill);
}

function setQuestStatus() {
  stats.textContent = questComplete ? 'Quest: १/१' : 'Quest: ०/१';
}

function showModal(title, text) {
  mtitle.textContent = title;
  mtext.textContent = text;
  modal.style.display = 'flex';
}

function showBanner(text) {
  questBanner.textContent = text;
  questBanner.classList.remove('hide');
  questBanner.classList.add('show');
  clearTimeout(showBanner.timer);
  showBanner.timer = setTimeout(() => {
    questBanner.classList.remove('show');
    questBanner.classList.add('hide');
  }, 1800);
}

function distance2D(a, b) {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

function dropCoconut() {
  if (coconutIsDropping || coconutReadyOnGround || coconutPickedUp) return;
  coconutIsDropping = true;
  coconut.visible = true;
  coconut.position.set(world.treePos.x + 1.2, 6.7, world.treePos.z + 0.8);
  showModal('Coconut Tree', 'A coconut dropped from the tree. Pick it up and bring it to the villager.');
}

function pickupCoconut() {
  if (!coconutReadyOnGround || coconutPickedUp) return;
  coconutPickedUp = true;
  coconut.visible = false;
  hasCoconut = true;
  showModal('Coconut', 'You picked up the coconut. Take it to the villager.');
}

function action() {
  const distToNpc = distance2D(player.position, world.npcPos);
  const distToTree = distance2D(player.position, world.treePos);
  const distToCoconut = coconut.visible ? distance2D(player.position, coconut.position) : Infinity;

  if (distToNpc < 3.5) {
    if (!questStarted) {
      questStarted = true;
      showModal('पजारी', 'नमस्कार! बागेश्वरी मन्दिरको लागि एउटा ताजा नारिकेल ल्याउनुहोस्। नजिकको तिनीको झाडमा E थिचेर नारिकेल गराउनुहोस्।');
      return;
    }

    if (hasCoconut && !questComplete) {
      questComplete = true;
      showBanner('Quest Complete');
      showModal('पजारी', 'धन्यवाद! तपाईंले नारिकेल ल्याए। मन्दिरको आशीर्वाद तपाईंको लागि छ।');
      setQuestStatus();
      return;
    }

    if (!hasCoconut) {
      showModal('पजारी', 'तपाईंले अझै नारिकेल ल्याउनु भएको छैन। झाडबाट नारिकेल झार्नुहोस्।');
      return;
    }
  }

  if (distToTree < 4.5) {
    if (!coconutReadyOnGround && !coconutIsDropping && !coconutPickedUp) {
      dropCoconut();
      return;
    }

    if (coconutReadyOnGround && !coconutPickedUp) {
      if (distToCoconut < 2.4) {
        pickupCoconut();
      } else {
        showModal('Coconut Tree', 'The coconut is on the ground. Walk to it and press E.');
      }
      return;
    }

    if (coconutIsDropping) {
      showModal('Coconut Tree', 'The coconut is still dropping. Wait a moment.');
      return;
    }

    if (coconutPickedUp) {
      showModal('Coconut Tree', 'You already picked it up. Now take it to the villager.');
      return;
    }
  }

  if (coconutReadyOnGround && distToCoconut < 2.4 && !coconutPickedUp) {
    pickupCoconut();
    return;
  }

  const distToTemple = distance2D(player.position, world.templePos);
  if (distToTemple < 5) {
    showModal('बागेश्वरी मन्दिर', 'मन्दिरको शान्ति र पजारीलाई भेट्नुहोस्।');
  } else {
    showModal('मन्दिरको बाहिर', 'बागेश्वरी मन्दिरमा जानुहोस्। झाडबाट नारिकेल झार्नुहोस् र पजारीलाई पुर्याउनुहोस्।');
  }
}

function resetGame() {
  player.position.set(0, 1.1, 12);
  player.yaw = 0;
  questStarted = false;
  hasCoconut = false;
  questComplete = false;
  coconutIsDropping = false;
  coconutReadyOnGround = false;
  coconutPickedUp = false;
  coconut.visible = false;
  coconut.position.set(world.treePos.x + 1.2, 6.5, world.treePos.z + 0.8);
  setQuestStatus();
}

function setupControls() {
  window.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();

    if (key === 'e') {
      action();
      event.preventDefault();
      return;
    }

    if (key === 'w' || key === 'arrowup') input.forward = true;
    if (key === 's' || key === 'arrowdown') input.backward = true;
    if (key === 'a' || key === 'arrowleft') input.left = true;
    if (key === 'd' || key === 'arrowright') input.right = true;

    if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
      event.preventDefault();
    }
  });

  window.addEventListener('keyup', (event) => {
    const key = event.key.toLowerCase();

    if (key === 'w' || key === 'arrowup') input.forward = false;
    if (key === 's' || key === 'arrowdown') input.backward = false;
    if (key === 'a' || key === 'arrowleft') input.left = false;
    if (key === 'd' || key === 'arrowright') input.right = false;
  });

  document.querySelectorAll('[data-dir]').forEach((button) => {
    const dir = button.dataset.dir;
    const setDir = (down) => {
      if (dir === 'up') input.forward = down;
      if (dir === 'down') input.backward = down;
      if (dir === 'left') input.left = down;
      if (dir === 'right') input.right = down;
    };

    button.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      setDir(true);
    });

    ['pointerup', 'pointercancel', 'pointerleave'].forEach((eventName) => {
      button.addEventListener(eventName, () => setDir(false));
    });
  });

  joystickBase.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    joystickState.active = true;
    joystickBase.setPointerCapture(event.pointerId);
    updateJoystick(event.clientX, event.clientY);
  });

  joystickBase.addEventListener('pointermove', (event) => {
    if (!joystickState.active) return;
    updateJoystick(event.clientX, event.clientY);
  });

  ['pointerup', 'pointercancel', 'pointerleave'].forEach((eventName) => {
    joystickBase.addEventListener(eventName, () => {
      joystickState.active = false;
      joystickState.x = 0;
      joystickState.y = 0;
      joystickKnob.style.transform = 'translate(-50%,-50%)';
    });
  });

  document.getElementById('reset').addEventListener('click', resetGame);
  document.getElementById('close').addEventListener('click', () => {
    modal.style.display = 'none';
  });
}

function updateJoystick(clientX, clientY) {
  const rect = joystickBase.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  let dx = clientX - cx;
  let dy = clientY - cy;
  const max = rect.width * 0.34;
  const dist = Math.hypot(dx, dy);
  const scale = dist > max ? max / dist : 1;

  dx *= scale;
  dy *= scale;

  joystickState.x = dx / max;
  joystickState.y = dy / max;
  joystickKnob.style.transform = `translate(${dx}px,${dy}px)`;
}

function updatePlayer(delta) {
  let moveX = 0;
  let moveZ = 0;

  if (input.forward) moveZ -= 1;
  if (input.backward) moveZ += 1;
  if (input.left) moveX -= 1;
  if (input.right) moveX += 1;

  if (joystickState.active) {
    moveX += joystickState.x;
    moveZ += joystickState.y;
  }

  const len = Math.hypot(moveX, moveZ);
  if (len > 0) {
    moveX /= len;
    moveZ /= len;
  }

  player.position.x += moveX * player.speed * delta;
  player.position.z += moveZ * player.speed * delta;

  player.position.x = THREE.MathUtils.clamp(player.position.x, -world.boundary, world.boundary);
  player.position.z = THREE.MathUtils.clamp(player.position.z, -world.boundary, world.boundary);

  if (len > 0.01) {
    player.direction.set(moveX, 0, moveZ).normalize();
    player.yaw = Math.atan2(player.direction.x, player.direction.z) + Math.PI;
  }

  player.mesh.position.copy(player.position);
  player.mesh.rotation.y = player.yaw;
}

function updateCoconut(delta) {
  if (coconutIsDropping) {
    coconut.position.y -= 8 * delta;
    if (coconut.position.y <= 0.9) {
      coconut.position.y = 0.9;
      coconutIsDropping = false;
      coconutReadyOnGround = true;
      coconut.position.set(world.treePos.x + 1.2, 0.9, world.treePos.z + 0.8);
    }
  }
}

function updateCamera() {
  const offset = new THREE.Vector3(
    Math.sin(player.yaw) * 8.5,
    4.8,
    Math.cos(player.yaw) * 8.5
  );

  const desiredPos = player.position.clone().add(offset);
  camera.position.lerp(desiredPos, 0.08);

  const lookTarget = player.position.clone().add(new THREE.Vector3(0, 2.1, 0));
  camera.lookAt(lookTarget);
}

function init() {
  createGround();
  createTemple();
  createTree(world.treePos.x, world.treePos.z, 1.15);
  createNPC();
  createPlayerMesh();
  createVillage();
  createCoconutPickup();
  addLights();
  setQuestStatus();

  const isMobileDevice = window.matchMedia('(pointer: coarse)').matches || /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (isMobileDevice) {
    document.body.classList.add('mobile');
  }

  setupControls();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

function animate() {
  const delta = clock.getDelta();
  updatePlayer(delta);
  updateCoconut(delta);
  updateCamera();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

init();
animate();
