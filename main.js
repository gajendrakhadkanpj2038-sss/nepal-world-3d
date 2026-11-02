// NEPAL WORLD 3D - Standalone Game Engine
// Created by Gajendra Kumar Khadka & Shrijan Khadka

let scene, camera, renderer, player;
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;

const gameState = {
  mainQuestStep: 0,
  sideQuests: { teaStall: false }
};

const npcs = [];
const worldProps = [];

window.initGame = function() {
  const canvas = document.getElementById('game');
  if (!canvas) return;

  // 1. Scene Setup
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb); // Realistic Himalayan Sky
  scene.fog = new THREE.FogExp2(0xd0e7f0, 0.005);

  // 2. Camera Setup
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 5, 15);

  // 3. Renderer Setup
  renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;

  const textures = createGameTextures();

  // 4. Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);

  const sunLight = new THREE.DirectionalLight(0xfffaed, 1.3);
  sunLight.position.set(100, 150, 50);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.set(2048, 2048);
  scene.add(sunLight);

  const fillLight = new THREE.DirectionalLight(0xaed6ff, 0.35);
  fillLight.position.set(-60, 80, -40);
  scene.add(fillLight);

  // 5. Build Game Environment
  createTerrain(textures.grass);
  createHimalayas(textures.mountain);
  createBageshwariTemple(textures);
  createVillageHouses(textures);
  createWorldProps(textures);
  createNPCs(textures);
  createPlayer();

  // 6. Event Controls
  setupControls();
  window.addEventListener('resize', onWindowResize);

  // Start Animation Loop
  animate();
};

function createGameTextures() {
  const maxAnisotropy = renderer ? renderer.capabilities.getMaxAnisotropy() : 8;

  const grass = makeCanvasTexture({
    base: '#3d7a3d',
    accent: '#5aa357',
    detail: '#2d5e2d',
    type: 'grass'
  });
  grass.wrapS = grass.wrapT = THREE.RepeatWrapping;
  grass.repeat.set(18, 18);
  grass.anisotropy = maxAnisotropy;

  const mountain = makeCanvasTexture({
    base: '#dfe7ef',
    accent: '#aaafb8',
    detail: '#7d8a96',
    type: 'stone'
  });
  mountain.wrapS = mountain.wrapT = THREE.RepeatWrapping;
  mountain.repeat.set(4, 4);
  mountain.anisotropy = maxAnisotropy;

  const stone = makeCanvasTexture({
    base: '#7d7d7d',
    accent: '#a9a9a9',
    detail: '#5a5a5a',
    type: 'stone'
  });
  stone.wrapS = stone.wrapT = THREE.RepeatWrapping;
  stone.repeat.set(4, 4);
  stone.anisotropy = maxAnisotropy;

  const roof = makeCanvasTexture({
    base: '#2b2b2b',
    accent: '#4f4f4f',
    detail: '#171717',
    type: 'roof'
  });
  roof.wrapS = roof.wrapT = THREE.RepeatWrapping;
  roof.repeat.set(3, 1.5);
  roof.anisotropy = maxAnisotropy;

  const wood = makeCanvasTexture({
    base: '#8a5a2b',
    accent: '#b77b42',
    detail: '#5d3417',
    type: 'wood'
  });
  wood.wrapS = wood.wrapT = THREE.RepeatWrapping;
  wood.repeat.set(2, 2);
  wood.anisotropy = maxAnisotropy;

  const flag = makeCanvasTexture({
    base: '#d32f2f',
    accent: '#f5f5f5',
    detail: '#1e2a78',
    type: 'flag'
  });
  flag.wrapS = flag.wrapT = THREE.ClampToEdgeWrapping;

  return { grass, mountain, stone, roof, wood, flag };
}

function makeCanvasTexture({ base, accent, detail, type }) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = base;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 2500; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const size = Math.random() * 4 + 1;
    ctx.fillStyle = i % 3 === 0 ? accent : detail;
    ctx.fillRect(x, y, size, size);
  }

  if (type === 'roof') {
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 3;
    for (let y = 0; y < canvas.height; y += 18) {
      ctx.beginPath();
      ctx.moveTo(0, y + 1);
      ctx.lineTo(canvas.width, y + 1);
      ctx.stroke();
    }
  }

  if (type === 'wood') {
    ctx.strokeStyle = 'rgba(40,20,0,0.35)';
    ctx.lineWidth = 2;
    for (let x = 0; x < canvas.width; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
  }

  if (type === 'stone') {
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    for (let y = 0; y < canvas.height; y += 16) {
      for (let x = 0; x < canvas.width; x += 16) {
        ctx.strokeRect(x + 2, y + 2, 10, 10);
      }
    }
  }

  if (type === 'grass') {
    ctx.strokeStyle = 'rgba(20,60,25,0.25)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 120; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 8, y + 10);
      ctx.stroke();
    }
  }

  if (type === 'flag') {
    ctx.fillStyle = '#d32f2f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f8f8f8';
    ctx.fillRect(canvas.width * 0.5, 0, canvas.width * 0.5, canvas.height);
    ctx.fillStyle = '#1e2a78';
    ctx.fillRect(canvas.width * 0.5, canvas.height * 0.5 - 15, canvas.width * 0.5, 30);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function createTerrain(texture) {
  const geometry = new THREE.PlaneGeometry(300, 300, 64, 64);
  geometry.rotateX(-Math.PI / 2);
  const material = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.92,
    metalness: 0.02
  });
  const terrain = new THREE.Mesh(geometry, material);
  terrain.receiveShadow = true;
  scene.add(terrain);

  const path = new THREE.Mesh(
    new THREE.BoxGeometry(16, 0.3, 30),
    new THREE.MeshStandardMaterial({
      color: 0x9b8d7c,
      roughness: 1,
      map: createStonePathTexture()
    })
  );
  path.position.set(0, 0.15, 6);
  path.rotation.y = Math.PI / 10;
  path.receiveShadow = true;
  scene.add(path);
}

function createStonePathTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#a9a197';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 5000; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const w = Math.random() * 7 + 2;
    const h = Math.random() * 7 + 2;
    ctx.fillStyle = i % 2 === 0 ? '#8e8277' : '#b4a89c';
    ctx.fillRect(x, y, w, h);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  return texture;
}

function createHimalayas(texture) {
  for (let i = 0; i < 12; i++) {
    const h = 50 + Math.random() * 40;
    const geom = new THREE.ConeGeometry(25, h, 7);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 1,
      map: texture
    });
    const mountain = new THREE.Mesh(geom, mat);
    const angle = (i / 12) * Math.PI * 2;
    mountain.position.set(Math.cos(angle) * 130, h / 2 - 4, Math.sin(angle) * 130);
    mountain.castShadow = true;
    mountain.receiveShadow = true;
    scene.add(mountain);
  }
}

function createBageshwariTemple(textures) {
  const temple = new THREE.Group();

  // Base
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(14, 2, 14),
    new THREE.MeshStandardMaterial({ color: 0x9d6b3d, map: textures.wood })
  );
  base.position.y = 1;
  base.castShadow = true;
  base.receiveShadow = true;
  temple.add(base);

  // Body
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(8, 7, 8),
    new THREE.MeshStandardMaterial({ color: 0xc94a3a, map: textures.stone })
  );
  body.position.y = 5.5;
  body.castShadow = true;
  body.receiveShadow = true;
  temple.add(body);

  // Door
  const door = new THREE.Mesh(
    new THREE.BoxGeometry(2, 3.5, 0.8),
    new THREE.MeshStandardMaterial({ color: 0x4d2a18, map: textures.wood })
  );
  door.position.set(0, 2.2, 4.2);
  temple.add(door);

  // Windows
  const windowMaterial = new THREE.MeshStandardMaterial({ color: 0xfff1b5, emissive: 0x7a5a00, emissiveIntensity: 0.2 });
  for (const x of [-2.2, 2.2]) {
    const windowMesh = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.1, 0.5), windowMaterial);
    windowMesh.position.set(x, 4.5, 4.25);
    temple.add(windowMesh);
  }

  // Pagoda Roof
  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(7, 4, 4),
    new THREE.MeshStandardMaterial({ color: 0x222222, map: textures.roof })
  );
  roof.position.y = 11;
  roof.rotation.y = Math.PI / 4;
  roof.castShadow = true;
  temple.add(roof);

  // Gajur (Golden Pinnacle)
  const gajur = new THREE.Mesh(
    new THREE.ConeGeometry(0.8, 2, 8),
    new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0x8a6a00, emissiveIntensity: 0.2 })
  );
  gajur.position.y = 14;
  temple.add(gajur);

  // Small side shrine lamps and stairs
  for (const x of [-3.8, 3.8]) {
    const lamp = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.2, 1.2, 8),
      new THREE.MeshStandardMaterial({ color: 0xb5b5b5, metalness: 0.8, roughness: 0.3 })
    );
    lamp.position.set(x, 1.1, 5.2);
    temple.add(lamp);
  }

  const step = new THREE.Mesh(
    new THREE.BoxGeometry(10, 0.4, 3),
    new THREE.MeshStandardMaterial({ color: 0xc7b299, map: textures.stone })
  );
  step.position.set(0, 0.2, 7.3);
  temple.add(step);

  temple.position.set(0, 0, -20);
  scene.add(temple);
}

function createVillageHouses(textures) {
  const positions = [{ x: -20, z: 10 }, { x: 20, z: 15 }, { x: -10, z: 24 }, { x: 28, z: -8 }];
  positions.forEach((pos, idx) => {
    const house = new THREE.Group();
    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(6, 4, 6),
      new THREE.MeshStandardMaterial({ color: 0xc27938, map: textures.wood })
    );
    wall.position.y = 2;
    wall.castShadow = true;
    wall.receiveShadow = true;
    house.add(wall);

    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(5, 3, 4),
      new THREE.MeshStandardMaterial({ color: 0x3a3a3a, map: textures.roof })
    );
    roof.position.y = 5.5;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    house.add(roof);

    const door = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 2.4, 0.5),
      new THREE.MeshStandardMaterial({ color: 0x5a3216, map: textures.wood })
    );
    door.position.set(0, 1.2, 3.15);
    house.add(door);

    const windowMesh1 = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 0.2),
      new THREE.MeshStandardMaterial({ color: 0xf7d98a, emissive: 0x7d5e1d, emissiveIntensity: 0.2 })
    );
    windowMesh1.position.set(-1.5, 2.3, 3.15);
    house.add(windowMesh1);

    const windowMesh2 = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 0.2),
      new THREE.MeshStandardMaterial({ color: 0xf7d98a, emissive: 0x7d5e1d, emissiveIntensity: 0.2 })
    );
    windowMesh2.position.set(1.5, 2.3, 3.15);
    house.add(windowMesh2);

    house.position.set(pos.x, 0, pos.z);
    house.rotation.y = idx % 2 === 0 ? Math.PI / 6 : -Math.PI / 8;
    scene.add(house);
  });
}

function createWorldProps(textures) {
  const treePositions = [
    [-30, -8], [-18, -22], [22, -20], [28, 8], [-4, 35], [15, 30], [-26, 25], [35, 15], [0, -18], [40, -28]
  ];

  treePositions.forEach(([x, z]) => {
    const tree = createTree(textures);
    tree.position.set(x, 0, z);
    tree.scale.setScalar(1 + Math.random() * 0.8);
    scene.add(tree);
    worldProps.push(tree);
  });

  const flagPole = createNepalFlag(textures);
  flagPole.position.set(-8, 0, -30);
  scene.add(flagPole);
  worldProps.push(flagPole);

  const stoneFence = createStoneFence();
  stoneFence.position.set(0, 0, 22);
  scene.add(stoneFence);
  worldProps.push(stoneFence);
}

function createTree(textures) {
  const tree = new THREE.Group();

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.6, 0.9, 4.5, 10),
    new THREE.MeshStandardMaterial({ color: 0x6b4d2a, map: textures.wood })
  );
  trunk.position.y = 2.2;
  trunk.castShadow = true;
  tree.add(trunk);

  const leaves1 = new THREE.Mesh(
    new THREE.SphereGeometry(2.6, 18, 18),
    new THREE.MeshStandardMaterial({ color: 0x2f7d3a, roughness: 0.9 })
  );
  leaves1.position.y = 5.3;
  leaves1.castShadow = true;
  tree.add(leaves1);

  const leaves2 = new THREE.Mesh(
    new THREE.SphereGeometry(2.1, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0x3d9e4e, roughness: 0.95 })
  );
  leaves2.position.set(1.3, 4.8, 0.6);
  leaves2.castShadow = true;
  tree.add(leaves2);

  const leaves3 = new THREE.Mesh(
    new THREE.SphereGeometry(1.8, 15, 15),
    new THREE.MeshStandardMaterial({ color: 0x4bb95e, roughness: 0.95 })
  );
  leaves3.position.set(-1.2, 5.4, -0.4);
  leaves3.castShadow = true;
  tree.add(leaves3);

  return tree;
}

function createNepalFlag(textures) {
  const flag = new THREE.Group();

  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.12, 8, 8),
    new THREE.MeshStandardMaterial({ color: 0xd6c7b6, metalness: 0.3, roughness: 0.8 })
  );
  pole.position.y = 4;
  flag.add(pole);

  const cloth = new THREE.Mesh(
    new THREE.PlaneGeometry(3.2, 2.1),
    new THREE.MeshStandardMaterial({ map: textures.flag, side: THREE.DoubleSide })
  );
  cloth.position.set(1.8, 4.8, 0);
  cloth.rotation.y = 0.1;
  flag.add(cloth);

  return flag;
}

function createStoneFence() {
  const fence = new THREE.Group();
  for (let i = 0; i < 8; i++) {
    const post = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 1.3, 0.5),
      new THREE.MeshStandardMaterial({ color: 0x8f8f8f, roughness: 1 })
    );
    post.position.set(-8 + i * 2.3, 0.65, 0);
    fence.add(post);
  }

  for (let i = 0; i < 7; i++) {
    const bar = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 0.2, 0.2),
      new THREE.MeshStandardMaterial({ color: 0x7c7c7c, roughness: 1 })
    );
    bar.position.set(-7.1 + i * 2.3, 1.2, 0);
    fence.add(bar);
  }

  return fence;
}

function createNPCs(textures) {
  // Pandit NPC (Main Quest)
  const pandit = createHumanoid(0xff0000, textures);
  pandit.position.set(0, 0, -12);
  pandit.userData = {
    name: 'पुजारी (Main Quest)',
    type: 'main_quest',
    dialogue: 'नमस्कार! बागेश्वरी मन्दिरमा स्वागत छ। तपाईंको मुख्य मिसन सफल भयो! अब तपाईँले गाउँको सहयोग र चिया पसलको यात्रा पूरा गर्न सक्नुहुन्छ।'
  };
  scene.add(pandit);
  npcs.push(pandit);

  // Tea Stall Owner NPC (Side Quest)
  const teaOwner = createHumanoid(0x0000ff, textures);
  teaOwner.position.set(-18, 0, 8);
  teaOwner.userData = {
    name: 'दाइ (चिया पसल - Side Quest)',
    type: 'side_quest',
    dialogue: 'नमस्ते बाबु! चिया खानुहुन्छ? गाउँमा स्वागत छ! आजको खास चिया त नक्कली छैन!'
  };
  scene.add(teaOwner);
  npcs.push(teaOwner);
}

function createHumanoid(color, textures = null) {
  const group = new THREE.Group();

  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: color,
    map: textures && textures.wood ? textures.wood : null,
    roughness: 0.9
  });

  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 0.4, 1.5),
    bodyMaterial
  );
  body.position.y = 1.15;
  group.add(body);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.35, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0xffdbac })
  );
  head.position.y = 2.1;
  group.add(head);

  // Dhaka Topi
  const topi = new THREE.Mesh(
    new THREE.CylinderGeometry(0.37, 0.37, 0.25),
    new THREE.MeshStandardMaterial({ color: 0x800000 })
  );
  topi.position.y = 2.4;
  group.add(topi);

  // Tunic details
  const sash = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 0.2, 0.2),
    new THREE.MeshStandardMaterial({ color: 0xf5d76e })
  );
  sash.position.y = 1.1;
  group.add(sash);

  return group;
}

function createPlayer() {
  player = createHumanoid(0x228b22);
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
  npcs.forEach(npc => {
    if (player.position.distanceTo(npc.position) < 4) {
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
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  const speed = 0.15;
  if (moveForward) player.position.z -= speed;
  if (moveBackward) player.position.z += speed;
  if (moveLeft) player.position.x -= speed;
  if (moveRight) player.position.x += speed;

  // keep player in bounds
  player.position.x = Math.max(-42, Math.min(42, player.position.x));
  player.position.z = Math.max(-42, Math.min(42, player.position.z));

  camera.position.x = player.position.x;
  camera.position.z = player.position.z + 12;
  camera.position.y = player.position.y + 5;
  camera.lookAt(player.position);

  renderer.render(scene, camera);
}

