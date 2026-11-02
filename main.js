// NEPAL WORLD 3D - Advanced Himalayan Village Experience
// Created by Gajendra Kumar Khadka & Shrijan Khadka

let scene, camera, renderer, player, clock;
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let sunLight, moonLight;
let clouds = [];
let worldWater = null;

const gameState = {
  mainQuestStep: 0,
  sideQuests: { teaStall: false }
};

const npcs = [];
const worldProps = [];

window.initGame = function() {
  const canvas = document.getElementById('game');
  if (!canvas) return;

  if (!window.THREE) {
    console.error('Three.js failed to load. Check the CDN or browser network connection.');
    const splash = document.getElementById('splash-screen');
    if (splash) splash.classList.remove('hidden');
    return;
  }

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x9ad8ff);
  scene.fog = new THREE.Fog(0xbfe7ff, 28, 220);

  camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1500);
  camera.position.set(0, 7, 18);

  renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x9ad8ff, 1);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputEncoding = THREE.sRGBEncoding;

  clock = new THREE.Clock();

  const hemi = new THREE.HemisphereLight(0xdff5ff, 0x1d401b, 0.9);
  scene.add(hemi);

  sunLight = new THREE.DirectionalLight(0xfff2bf, 1.4);
  sunLight.position.set(80, 120, 40);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.set(2048, 2048);
  sunLight.shadow.camera.left = -120;
  sunLight.shadow.camera.right = 120;
  sunLight.shadow.camera.top = 120;
  sunLight.shadow.camera.bottom = -120;
  scene.add(sunLight);

  moonLight = new THREE.DirectionalLight(0x8ab8ff, 0.25);
  moonLight.position.set(-60, 60, -40);
  scene.add(moonLight);

  const sun = new THREE.Mesh(
    new THREE.SphereGeometry(6, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0xffd76a })
  );
  sun.position.set(90, 110, 30);
  scene.add(sun);
  worldProps.push(sun);

  createSkyClouds();
  createTerrain();
  createVillage();
  createNPCs();
  createPlayer();

  setupControls();
  window.addEventListener('resize', onWindowResize);
  renderer.setAnimationLoop(animate);
};

function createSkyClouds() {
  const cloudMaterial = new THREE.MeshStandardMaterial({
    color: 0xf2f7ff,
    roughness: 0.95,
    metalness: 0
  });

  for (let i = 0; i < 12; i++) {
    const cloud = new THREE.Group();
    const puffCount = 5 + Math.floor(Math.random() * 5);
    for (let j = 0; j < puffCount; j++) {
      const puff = new THREE.Mesh(
        new THREE.SphereGeometry(2 + Math.random() * 2.5, 18, 18),
        cloudMaterial
      );
      puff.position.set((j - puffCount / 2) * 2.2, Math.random() * 1.4, Math.random() * 2);
      cloud.add(puff);
    }
    cloud.position.set(-80 + Math.random() * 160, 40 + Math.random() * 36, -90 - Math.random() * 70);
    cloud.userData = { speed: 0.5 + Math.random() * 0.7, drift: Math.random() * Math.PI * 2 };
    scene.add(cloud);
    clouds.push(cloud);
  }
}

function createTerrain() {
  const geometry = new THREE.PlaneGeometry(400, 400, 220, 220);
  geometry.rotateX(-Math.PI / 2);
  const positions = geometry.attributes.position;

  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const z = positions.getZ(i);
    const distance = Math.sqrt(x * x + z * z);
    const hill = Math.sin(x * 0.12) * 2.5 + Math.cos(z * 0.09) * 2.2 + Math.max(0, 18 - distance * 0.08);
    positions.setY(i, hill);
  }

  geometry.computeVertexNormals();

  const material = new THREE.MeshStandardMaterial({
    color: 0x497b3d,
    roughness: 1,
    metalness: 0.05
  });

  const ground = new THREE.Mesh(geometry, material);
  ground.receiveShadow = true;
  scene.add(ground);

  const river = new THREE.Mesh(
    new THREE.PlaneGeometry(140, 46, 1, 1),
    new THREE.MeshPhysicalMaterial({
      color: 0x62b9e3,
      transparent: true,
      opacity: 0.9,
      roughness: 0.15,
      metalness: 0.0,
      clearcoat: 1,
      clearcoatRoughness: 0.2,
      transmission: 0.1,
      emissive: 0x1a80b5,
      emissiveIntensity: 0.15
    })
  );
  river.rotation.x = -Math.PI / 2;
  river.position.set(0, 0.55, 36);
  river.receiveShadow = true;
  worldWater = river;
  scene.add(river);
  worldProps.push(river);

  const stonePath = new THREE.Mesh(
    new THREE.BoxGeometry(18, 0.4, 54),
    new THREE.MeshStandardMaterial({
      color: 0x9a8a7b,
      roughness: 1,
      map: createStoneTexture()
    })
  );
  stonePath.position.set(0, 0.2, 7);
  stonePath.rotation.y = Math.PI / 12;
  stonePath.receiveShadow = true;
  scene.add(stonePath);

  const bridge = new THREE.Group();
  const bridgeBase = new THREE.Mesh(
    new THREE.BoxGeometry(12, 0.5, 4),
    new THREE.MeshStandardMaterial({ color: 0x8b6a4a, roughness: 1 })
  );
  bridgeBase.position.y = 0.8;
  bridge.add(bridgeBase);

  for (const x of [-4.5, 0, 4.5]) {
    const post = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 1.6, 0.35),
      new THREE.MeshStandardMaterial({ color: 0x7b5c3d, roughness: 1 })
    );
    post.position.set(x, 0.8, -1.7);
    bridge.add(post);
    const post2 = post.clone();
    post2.position.z = 1.7;
    bridge.add(post2);
  }

  for (const z of [-1.2, 1.2]) {
    const rail = new THREE.Mesh(
      new THREE.BoxGeometry(10.8, 0.2, 0.12),
      new THREE.MeshStandardMaterial({ color: 0x6a4d2b, roughness: 1 })
    );
    rail.position.set(0, 1.5, z);
    bridge.add(rail);
  }

  bridge.position.set(0, 0.2, 34);
  scene.add(bridge);
  worldProps.push(bridge);

  const shrineRing = new THREE.Mesh(
    new THREE.TorusGeometry(8, 0.5, 12, 32),
    new THREE.MeshStandardMaterial({ color: 0xc39a4f, roughness: 0.7, metalness: 0.2 })
  );
  shrineRing.rotation.x = Math.PI / 2;
  shrineRing.position.set(-14, 0.3, -28);
  scene.add(shrineRing);
}

function createStoneTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#a79b92';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 5000; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const w = 2 + Math.random() * 8;
    const h = 2 + Math.random() * 8;
    ctx.fillStyle = i % 2 === 0 ? '#91857d' : '#b7adaa';
    ctx.fillRect(x, y, w, h);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  return texture;
}

function createVillage() {
  createTemple();
  createHouses();
  createTeaStall();
  createTrees();
  createLanterns();
  createFence();
  createMonument();
  createStonePillars();
}

function createTemple() {
  const temple = new THREE.Group();

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(16, 2.6, 16),
    new THREE.MeshStandardMaterial({ color: 0x8f623b, roughness: 1 })
  );
  base.position.y = 1.3;
  base.castShadow = true;
  base.receiveShadow = true;
  temple.add(base);

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(10, 8.5, 10),
    new THREE.MeshStandardMaterial({ color: 0xc94c3d, roughness: 0.9, metalness: 0.05 })
  );
  body.position.y = 6.4;
  body.castShadow = true;
  body.receiveShadow = true;
  temple.add(body);

  const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x1e1e1e, roughness: 0.8 });
  for (let i = 0; i < 3; i++) {
    const roof = new THREE.Mesh(new THREE.ConeGeometry(8.5 - i * 1.2, 2.8, 4), roofMaterial);
    roof.position.y = 12 + i * 1.8;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    temple.add(roof);
  }

  const gajur = new THREE.Mesh(
    new THREE.ConeGeometry(1.1, 3, 8),
    new THREE.MeshStandardMaterial({ color: 0xffd43a, emissive: 0x7a5b00, emissiveIntensity: 0.2 })
  );
  gajur.position.y = 16.4;
  temple.add(gajur);

  const door = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 4.2, 0.8),
    new THREE.MeshStandardMaterial({ color: 0x4c2b17, roughness: 0.9 })
  );
  door.position.set(0, 2.8, 5.15);
  temple.add(door);

  const bell = new THREE.Mesh(
    new THREE.CylinderGeometry(0.45, 0.5, 1.3, 18),
    new THREE.MeshStandardMaterial({ color: 0xf3d48d, metalness: 0.8, roughness: 0.3 })
  );
  bell.position.set(0, 18.5, 0);
  temple.add(bell);

  const steps = new THREE.Mesh(
    new THREE.BoxGeometry(11, 0.7, 3.8),
    new THREE.MeshStandardMaterial({ color: 0xc7b497, roughness: 1 })
  );
  steps.position.set(0, 0.35, 8.9);
  temple.add(steps);

  for (const x of [-3.5, 3.5]) {
    const lamp = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.2, 1.6, 8),
      new THREE.MeshStandardMaterial({ color: 0xc0c0c0, metalness: 0.7, roughness: 0.3 })
    );
    lamp.position.set(x, 1.2, 7.7);
    temple.add(lamp);

    const glow = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0xffdb6e, emissive: 0xffc857, emissiveIntensity: 1.2 })
    );
    glow.position.set(x, 2.3, 7.7);
    temple.add(glow);
  }

  temple.position.set(0, 0, -20);
  scene.add(temple);
}

function createHouses() {
  const positions = [
    { x: -24, z: 8, rot: Math.PI / 7 },
    { x: 22, z: 14, rot: -Math.PI / 7 },
    { x: -12, z: 24, rot: Math.PI / 5 },
    { x: 32, z: -8, rot: -Math.PI / 6 },
    { x: 18, z: -20, rot: Math.PI / 8 }
  ];

  positions.forEach((pos) => {
    const house = new THREE.Group();

    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(6.4, 4.5, 6.4),
      new THREE.MeshStandardMaterial({ color: 0xd08f3b, roughness: 0.9 })
    );
    wall.position.y = 2.25;
    wall.castShadow = true;
    wall.receiveShadow = true;
    house.add(wall);

    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(5.6, 3.1, 4),
      new THREE.MeshStandardMaterial({ color: 0x343434, roughness: 0.85 })
    );
    roof.position.y = 6.1;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    house.add(roof);

    const door = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 2.8, 0.5),
      new THREE.MeshStandardMaterial({ color: 0x5c3518, roughness: 0.85 })
    );
    door.position.set(0, 1.4, 3.25);
    house.add(door);

    for (const x of [-1.8, 1.8]) {
      const win = new THREE.Mesh(
        new THREE.BoxGeometry(1.1, 1.1, 0.12),
        new THREE.MeshStandardMaterial({ color: 0xf8d791, emissive: 0xc98919, emissiveIntensity: 0.2 })
      );
      win.position.set(x, 2.7, 3.2);
      house.add(win);
    }

    const chimney = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 2.2, 0.9),
      new THREE.MeshStandardMaterial({ color: 0x7a7a7a, roughness: 0.8 })
    );
    chimney.position.set(2.1, 6, 0.6);
    house.add(chimney);

    house.position.set(pos.x, 0, pos.z);
    house.rotation.y = pos.rot;
    scene.add(house);
  });
}

function createTeaStall() {
  const stall = new THREE.Group();

  const counter = new THREE.Mesh(
    new THREE.BoxGeometry(6, 1.6, 3),
    new THREE.MeshStandardMaterial({ color: 0x8a5932, roughness: 0.9 })
  );
  counter.position.y = 0.8;
  counter.castShadow = true;
  stall.add(counter);

  const awning = new THREE.Mesh(
    new THREE.BoxGeometry(6.8, 0.25, 3.6),
    new THREE.MeshStandardMaterial({ color: 0xd32f2f, roughness: 0.9 })
  );
  awning.position.set(0, 2.4, 0);
  stall.add(awning);

  const table = new THREE.Mesh(
    new THREE.CylinderGeometry(0.7, 0.7, 0.7, 16),
    new THREE.MeshStandardMaterial({ color: 0x6d4a2d, roughness: 0.9 })
  );
  table.position.set(-1.3, 0.35, 1.8);
  stall.add(table);

  const kettle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.5, 0.8, 16),
    new THREE.MeshStandardMaterial({ color: 0x4a4a4a, metalness: 0.7, roughness: 0.3 })
  );
  kettle.position.set(1.3, 1.1, 1.3);
  stall.add(kettle);

  const sign = new THREE.Mesh(
    new THREE.BoxGeometry(3.2, 1.1, 0.2),
    new THREE.MeshStandardMaterial({ color: 0xf7d978, roughness: 0.8 })
  );
  sign.position.set(0, 3.2, 1.8);
  stall.add(sign);

  stall.position.set(-18, 0, 10);
  scene.add(stall);
}

function createTrees() {
  const positions = [
    [-30, 10], [-18, -22], [24, -18], [30, 8], [-6, 34], [15, 27], [-28, 27], [36, 17], [0, -18], [42, -25],
    [-38, -8], [-12, -32], [10, 38], [38, -4], [-40, 22], [22, 30]
  ];

  positions.forEach(([x, z], index) => {
    const tree = new THREE.Group();

    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.55, 0.8, 4.2 + (index % 3), 10),
      new THREE.MeshStandardMaterial({ color: 0x6f4e2a, roughness: 0.9 })
    );
    trunk.position.y = 2.1;
    trunk.castShadow = true;
    tree.add(trunk);

    for (let i = 0; i < 3; i++) {
      const leaf = new THREE.Mesh(
        new THREE.SphereGeometry(1.8 + i * 0.6, 16, 16),
        new THREE.MeshStandardMaterial({ color: i === 0 ? 0x2e8b4d : i === 1 ? 0x3caf58 : 0x48c76c, roughness: 0.95 })
      );
      leaf.position.set((i - 1) * 1.2, 4.6 + i * 0.8, (i % 2 === 0 ? 0.8 : -0.6));
      leaf.castShadow = true;
      tree.add(leaf);
    }

    tree.position.set(x, 0, z);
    scene.add(tree);
    worldProps.push(tree);
  });
}

function createLanterns() {
  const lanternPositions = [
    [-15, 0, -6], [15, 0, -6], [0, 0, -26], [-25, 0, 12], [25, 0, 18], [0, 0, 28]
  ];

  lanternPositions.forEach(([x, y, z]) => {
    const lantern = new THREE.Group();
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 2.5, 8),
      new THREE.MeshStandardMaterial({ color: 0x8a8a8a, metalness: 0.8, roughness: 0.3 })
    );
    pole.position.y = 1.25;
    lantern.add(pole);

    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0xffde88, emissive: 0xffb700, emissiveIntensity: 1.8 })
    );
    bulb.position.y = 2.4;
    lantern.add(bulb);

    lantern.position.set(x, y, z);
    scene.add(lantern);
  });
}

function createFence() {
  const fence = new THREE.Group();
  for (let i = 0; i < 14; i++) {
    const post = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 1.5, 0.42),
      new THREE.MeshStandardMaterial({ color: 0x817d6e, roughness: 1 })
    );
    post.position.set(-26 + i * 3.8, 0.75, 25);
    fence.add(post);
  }

  for (let i = 0; i < 13; i++) {
    const bar = new THREE.Mesh(
      new THREE.BoxGeometry(2.7, 0.15, 0.15),
      new THREE.MeshStandardMaterial({ color: 0x707060, roughness: 1 })
    );
    bar.position.set(-25 + i * 3.8, 1.3, 25);
    fence.add(bar);
  }
  scene.add(fence);
}

function createMonument() {
  const monument = new THREE.Group();
  const stone = new THREE.Mesh(
    new THREE.CylinderGeometry(1.3, 1.8, 4.2, 10),
    new THREE.MeshStandardMaterial({ color: 0x8a8a8a, roughness: 1 })
  );
  stone.position.y = 2.1;
  stone.castShadow = true;
  monument.add(stone);

  const cap = new THREE.Mesh(
    new THREE.BoxGeometry(2.7, 0.8, 2.7),
    new THREE.MeshStandardMaterial({ color: 0xd7b26c, roughness: 0.7 })
  );
  cap.position.y = 4.6;
  monument.add(cap);

  monument.position.set(-11, 0, -30);
  scene.add(monument);
}

function createStonePillars() {
  const pillars = new THREE.Group();
  for (let i = 0; i < 8; i++) {
    const pillar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.5, 3.2, 8),
      new THREE.MeshStandardMaterial({ color: 0x8f8f8f, roughness: 1 })
    );
    pillar.position.set(-30 + i * 8.5, 1.6, -34);
    pillar.castShadow = true;
    pillars.add(pillar);
  }
  scene.add(pillars);
}

function createNPCs() {
  const pandit = createHumanoid(0xd72638);
  pandit.position.set(0, 0, -12);
  pandit.userData = {
    name: 'पुजारी (Main Quest)',
    type: 'main_quest',
    dialogue: 'नमस्कार! बागेश्वरी मन्दिरमा स्वागत छ। तपाईंको मुख्य मिसन सफल भयो! अब गाउँको जीवन, चिया र संस्कृति पत्ता लगाउनुहोस्।'
  };
  scene.add(pandit);
  npcs.push(pandit);

  const teaOwner = createHumanoid(0x3d6ecf);
  teaOwner.position.set(-18, 0, 8);
  teaOwner.userData = {
    name: 'दाइ (चिया पसल - Side Quest)',
    type: 'side_quest',
    dialogue: 'नमस्ते बाबु! चिया खानुहुन्छ? हामरो गाउँको खास चिया, ताजा र मनमोहक छ!'
  };
  scene.add(teaOwner);
  npcs.push(teaOwner);

  const farmer = createHumanoid(0x7c9d2a);
  farmer.position.set(18, 0, 20);
  farmer.userData = {
    name: 'किसान',
    type: 'farmer',
    dialogue: 'यो गाउँको खेत, पहाड़, र नदीले नै हाम्रो जीवनलाई सजिले चलाउँछ।'
  };
  scene.add(farmer);
  npcs.push(farmer);
}

function createHumanoid(color) {
  const group = new THREE.Group();

  const torso = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 0.5, 1.6, 12),
    new THREE.MeshStandardMaterial({ color: color, roughness: 0.9 })
  );
  torso.position.y = 1.2;
  torso.castShadow = true;
  group.add(torso);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.34, 18, 18),
    new THREE.MeshStandardMaterial({ color: 0xffdfb5 })
  );
  head.position.y = 2.3;
  head.castShadow = true;
  group.add(head);

  const hat = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.38, 0.26, 12),
    new THREE.MeshStandardMaterial({ color: 0x7a1f1f, roughness: 0.8 })
  );
  hat.position.y = 2.6;
  group.add(hat);

  const leftArm = new THREE.Mesh(
    new THREE.CylinderGeometry(0.11, 0.13, 1.2, 8),
    new THREE.MeshStandardMaterial({ color: 0xffdfb5 })
  );
  leftArm.position.set(-0.55, 1.2, 0);
  leftArm.rotation.z = Math.PI / 9;
  group.add(leftArm);

  const rightArm = leftArm.clone();
  rightArm.position.x = 0.55;
  rightArm.rotation.z = -Math.PI / 9;
  group.add(rightArm);

  const leftLeg = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.15, 1.1, 8),
    new THREE.MeshStandardMaterial({ color: 0x3a3a3a })
  );
  leftLeg.position.set(-0.2, 0.15, 0);
  group.add(leftLeg);

  const rightLeg = leftLeg.clone();
  rightLeg.position.x = 0.2;
  group.add(rightLeg);

  const sash = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 0.15, 0.15),
    new THREE.MeshStandardMaterial({ color: 0xf0d162 })
  );
  sash.position.y = 0.9;
  group.add(sash);

  const backpack = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.8, 0.35),
    new THREE.MeshStandardMaterial({ color: 0x2b2b2b, roughness: 0.85 })
  );
  backpack.position.set(0, 1.6, -0.45);
  group.add(backpack);

  return group;
}

function createPlayer() {
  player = createHumanoid(0x2ca25d);
  player.position.set(0, 0, 15);
  scene.add(player);
}

function setupControls() {
  document.addEventListener('keydown', (e) => {
    if (e.code === 'KeyW' || e.code === 'ArrowUp') moveForward = true;
    if (e.code === 'KeyS' || e.code === 'ArrowDown') moveBackward = true;
    if (e.code === 'KeyA' || e.code === 'ArrowLeft') moveLeft = true;
    if (e.code === 'KeyD' || e.code === 'ArrowRight') moveRight = true;
    if (e.code === 'KeyE') checkInteractions();
  });

  document.addEventListener('keyup', (e) => {
    if (e.code === 'KeyW' || e.code === 'ArrowUp') moveForward = false;
    if (e.code === 'KeyS' || e.code === 'ArrowDown') moveBackward = false;
    if (e.code === 'KeyA' || e.code === 'ArrowLeft') moveLeft = false;
    if (e.code === 'KeyD' || e.code === 'ArrowRight') moveRight = false;
  });
}

function checkInteractions() {
  if (!player) return;
  npcs.forEach((npc) => {
    if (player.position.distanceTo(npc.position) < 4.2) {
      document.getElementById('dialogue-title').innerText = npc.userData.name;
      document.getElementById('dialogue-text').innerText = npc.userData.dialogue;
      document.getElementById('dialogue-modal').style.display = 'block';

      if (npc.userData.type === 'main_quest' && gameState.mainQuestStep === 0) {
        gameState.mainQuestStep = 1;
        document.getElementById('q-title').innerText = 'Side Quest: चिया पसल';
        document.getElementById('q-desc').innerText = 'गाउँको चिया पसलका दाइसँग भेट्नुहोस्।';
      }
    }
  });
}

window.closeDialogue = function() {
  document.getElementById('dialogue-modal').style.display = 'none';
};

function onWindowResize() {
  if (!camera || !renderer) return;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  if (!scene || !camera || !renderer || !player) return;

  const elapsed = clock.getElapsedTime();
  const speed = 0.16;

  if (moveForward) player.position.z -= speed;
  if (moveBackward) player.position.z += speed;
  if (moveLeft) player.position.x -= speed;
  if (moveRight) player.position.x += speed;

  player.position.x = Math.max(-46, Math.min(46, player.position.x));
  player.position.z = Math.max(-46, Math.min(46, player.position.z));

  clouds.forEach((cloud, index) => {
    cloud.position.x += Math.sin(elapsed * 0.15 + index) * 0.02 + cloud.userData.speed * 0.025;
    cloud.position.z += Math.cos(elapsed * 0.2 + index) * 0.015;
    if (cloud.position.x > 80) cloud.position.x = -80;
    if (cloud.position.x < -80) cloud.position.x = 80;
  });

  const skyPhase = (Math.sin(elapsed * 0.12) + 1) / 2;
  const dayColor = new THREE.Color().setHSL(0.61, 0.82, 0.56 + skyPhase * 0.18);
  scene.background.copy(dayColor);
  scene.fog.color.copy(dayColor.clone().offsetHSL(0, 0, -0.15));

  const sunValue = 0.8 + skyPhase * 0.8;
  sunLight.intensity = 0.35 + sunValue * 1.1;
  moonLight.intensity = 1.0 - sunValue * 0.75;

  if (worldWater) {
    worldWater.material.emissiveIntensity = 0.12 + skyPhase * 0.25;
    worldWater.position.y = 0.55 + Math.sin(elapsed * 1.5) * 0.04;
  }

  camera.position.x = player.position.x;
  camera.position.z = player.position.z + 12;
  camera.position.y = player.position.y + 5.8;
  camera.lookAt(player.position.x, player.position.y + 1.3, player.position.z);

  renderer.render(scene, camera);
}
