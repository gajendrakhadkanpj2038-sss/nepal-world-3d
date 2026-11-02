let scene, camera, renderer, player;
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
const npcs = [];
const gameState = {
  mainQuestStep: 0,
  sideQuests: { teaStall: false }
};

let cameraYaw = Math.PI;
let cameraPitch = 0.5;
let cameraDistance = 12;
let mouseX = 0, mouseY = 0;

function createCanvasTexture(drawFn, size = 256) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  drawFn(ctx, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = renderer ? renderer.capabilities.getMaxAnisotropy() : 8;
  return texture;
}

function createGrassTexture() {
  return createCanvasTexture((ctx, size) => {
    ctx.fillStyle = '#5aa34a';
    ctx.fillRect(0, 0, size, size);

    for (let i = 0; i < 2000; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const s = 1 + Math.random() * 4;
      const shade = 60 + Math.random() * 80;
      ctx.fillStyle = `rgba(${shade}, ${shade + 30}, ${shade - 10}, 0.7)`;
      ctx.fillRect(x, y, s, s);
    }

    for (let i = 0; i < 900; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      ctx.strokeStyle = 'rgba(17, 90, 22, 0.35)';
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 4 + Math.random() * 8, y + 5 + Math.random() * 8);
      ctx.stroke();
    }
  }, 256);
}

function createRockTexture() {
  return createCanvasTexture((ctx, size) => {
    ctx.fillStyle = '#8d8d8d';
    ctx.fillRect(0, 0, size, size);

    for (let i = 0; i < 8000; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const w = 2 + Math.random() * 6;
      const h = 2 + Math.random() * 6;
      ctx.fillStyle = `rgba(${120 + Math.random() * 50}, ${120 + Math.random() * 50}, ${120 + Math.random() * 50}, 0.55)`;
      ctx.fillRect(x, y, w, h);
    }
  }, 256);
}

function createTempleWallTexture() {
  return createCanvasTexture((ctx, size) => {
    ctx.fillStyle = '#b31217';
    ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 5000; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const s = 1 + Math.random() * 3;
      ctx.fillStyle = `rgba(${100 + Math.random() * 30}, 0, 0, 0.55)`;
      ctx.fillRect(x, y, s, s);
    }
  }, 256);
}

function createRoofTexture() {
  return createCanvasTexture((ctx, size) => {
    ctx.fillStyle = '#202020';
    ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < size; i += 16) {
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, size);
      ctx.stroke();
    }
    for (let j = 0; j < size; j += 16) {
      ctx.beginPath();
      ctx.moveTo(0, j);
      ctx.lineTo(size, j);
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(0,0,0,0.18)';
    for (let i = 0; i < size; i += 32) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 16, size);
      ctx.stroke();
    }
  }, 256);
}

function createWoodTexture() {
  return createCanvasTexture((ctx, size) => {
    ctx.fillStyle = '#8f5a2c';
    ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < size; i += 8) {
      ctx.strokeStyle = 'rgba(70, 36, 12, 0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, size);
      ctx.stroke();
    }
    for (let j = 0; j < size; j += 18) {
      ctx.strokeStyle = 'rgba(255, 210, 160, 0.25)';
      ctx.beginPath();
      ctx.moveTo(0, j);
      ctx.lineTo(size, j);
      ctx.stroke();
    }
  }, 256);
}

function createMountainTexture() {
  return createCanvasTexture((ctx, size) => {
    const g = ctx.createLinearGradient(0, 0, 0, size);
    g.addColorStop(0, '#f5f7ff');
    g.addColorStop(0.55, '#dfeaf8');
    g.addColorStop(1, '#bfcfdb');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);

    for (let i = 0; i < 2000; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = 2 + Math.random() * 8;
      ctx.fillStyle = `rgba(255,255,255,${0.1 + Math.random() * 0.25})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }, 256);
}

function createLeafTexture() {
  return createCanvasTexture((ctx, size) => {
    ctx.fillStyle = '#2f9d46';
    ctx.fillRect(0, 0, size, size);

    for (let i = 0; i < 1300; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = 2 + Math.random() * 5;
      ctx.fillStyle = `rgba(${70 + Math.random() * 60}, ${120 + Math.random() * 60}, ${45 + Math.random() * 60}, 0.7)`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }, 256);
}

function createClothTexture() {
  return createCanvasTexture((ctx, size) => {
    ctx.fillStyle = '#d8d8d8';
    ctx.fillRect(0, 0, size, size);
    for (let x = 0; x < size; x += 22) {
      ctx.fillStyle = 'rgba(0,0,0,0.08)';
      ctx.fillRect(x, 0, 2, size);
    }
    for (let y = 0; y < size; y += 20) {
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.fillRect(0, y, size, 2);
    }
  }, 256);
}

function createSkinTexture() {
  return createCanvasTexture((ctx, size) => {
    ctx.fillStyle = '#f0d0a8';
    ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 1200; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const s = 1 + Math.random() * 3;
      ctx.fillStyle = `rgba(170, 120, 90, ${0.08 + Math.random() * 0.14})`;
      ctx.fillRect(x, y, s, s);
    }
  }, 256);
}

window.initGame = function() {
  try {
    const canvas = document.getElementById('game');
    if (!canvas) {
      console.error('Canvas not found');
      return;
    }

    if (!window.THREE) {
      console.error('Three.js not loaded');
      return;
    }

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.FogExp2(0xcfe8ff, 0.004);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 6, 14);

    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xfff4d6, 1.3);
    sun.position.set(60, 120, 30);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    scene.add(sun);

    createTerrain();
    createHimalayas();
    createTemple();
    createVillage();
    createTrees();
    createNPCs();
    createPlayer();
    setupControls();

    window.addEventListener('resize', onWindowResize);
    animate();
    console.log('Game initialized successfully');
  } catch (error) {
    console.error('Game initialization failed:', error);
  }
};

function createTerrain() {
  const groundTexture = createGrassTexture();
  groundTexture.repeat.set(35, 35);

  const groundMaterial = new THREE.MeshStandardMaterial({
    map: groundTexture,
    roughness: 0.95,
    metalness: 0.02
  });

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(350, 350, 64, 64), groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);
}

function createHimalayas() {
  const mountainTexture = createMountainTexture();

  for (let i = 0; i < 12; i++) {
    const h = 45 + Math.random() * 40;
    const mountain = new THREE.Mesh(
      new THREE.ConeGeometry(18 + Math.random() * 18, h, 7),
      new THREE.MeshStandardMaterial({
        map: mountainTexture,
        roughness: 1,
        metalness: 0
      })
    );

    const angle = (i / 12) * Math.PI * 2;
    const radius = 120 + Math.random() * 20;
    mountain.position.set(
      Math.cos(angle) * radius,
      h * 0.45,
      Math.sin(angle) * radius
    );
    mountain.castShadow = true;
    mountain.receiveShadow = true;
    scene.add(mountain);
  }
}

function createTemple() {
  const temple = new THREE.Group();

  const baseTexture = createRockTexture();
  const wallTexture = createTempleWallTexture();
  const roofTexture = createRoofTexture();
  const goldTexture = createCanvasTexture((ctx, size) => {
    ctx.fillStyle = '#ffd84d';
    ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 1500; i++) {
      ctx.fillStyle = `rgba(255, 204, 0, ${0.15 + Math.random() * 0.4})`;
      ctx.fillRect(Math.random() * size, Math.random() * size, 4, 4);
    }
  }, 256);
  const woodTexture = createWoodTexture();

  const baseMat = new THREE.MeshStandardMaterial({ map: baseTexture, roughness: 0.9 });
  const wallMat = new THREE.MeshStandardMaterial({ map: wallTexture, roughness: 0.8 });
  const roofMat = new THREE.MeshStandardMaterial({ map: roofTexture, roughness: 0.9 });
  const goldMat = new THREE.MeshStandardMaterial({ map: goldTexture, emissive: 0x4a3600, roughness: 0.4 });
  const stairsMat = new THREE.MeshStandardMaterial({ map: woodTexture, roughness: 0.85 });

  const base = new THREE.Mesh(new THREE.BoxGeometry(16, 2, 16), baseMat);
  base.position.y = 1;
  temple.add(base);

  const body = new THREE.Mesh(new THREE.BoxGeometry(9, 8, 9), wallMat);
  body.position.y = 6;
  temple.add(body);

  const roof = new THREE.Mesh(new THREE.ConeGeometry(8.2, 5, 4), roofMat);
  roof.position.y = 12.2;
  roof.rotation.y = Math.PI / 4;
  temple.add(roof);

  const gajur = new THREE.Mesh(new THREE.ConeGeometry(1.1, 2.4, 8), goldMat);
  gajur.position.y = 15.5;
  temple.add(gajur);

  const stairs = new THREE.Mesh(new THREE.BoxGeometry(5, 0.7, 2), stairsMat);
  stairs.position.set(0, 1.5, 9);
  temple.add(stairs);

  temple.position.set(0, 0, -20);
  scene.add(temple);
}

function createVillage() {
  const housePositions = [
    { x: -22, z: 10 },
    { x: 28, z: 14 },
    { x: -10, z: 25 },
    { x: 18, z: -18 }
  ];

  const wallTexture = createWoodTexture();
  const roofTexture = createRoofTexture();
  const doorTexture = createWoodTexture();

  housePositions.forEach((pos) => {
    const house = new THREE.Group();

    const wallMat = new THREE.MeshStandardMaterial({ map: wallTexture, roughness: 0.9 });
    const roofMat = new THREE.MeshStandardMaterial({ map: roofTexture, roughness: 0.9 });
    const doorMat = new THREE.MeshStandardMaterial({ map: doorTexture, roughness: 0.8 });

    const wall = new THREE.Mesh(new THREE.BoxGeometry(6, 4, 6), wallMat);
    wall.position.y = 2;
    house.add(wall);

    const roof = new THREE.Mesh(new THREE.ConeGeometry(5.2, 3.5, 4), roofMat);
    roof.position.y = 5.9;
    roof.rotation.y = Math.PI / 4;
    house.add(roof);

    const door = new THREE.Mesh(new THREE.BoxGeometry(1.5, 2.2, 0.4), doorMat);
    door.position.set(0, 1.1, 3.1);
    house.add(door);

    const teaStand = new THREE.Mesh(
      new THREE.BoxGeometry(2.5, 1.5, 2.5),
      new THREE.MeshStandardMaterial({ map: createWoodTexture(), roughness: 0.8 })
    );
    teaStand.position.set(0, 0.75, 3.8);
    house.add(teaStand);

    house.position.set(pos.x, 0, pos.z);
    scene.add(house);
  });
}

function createTrees() {
  const trunkTexture = createWoodTexture();
  const leafTexture = createLeafTexture();

  for (let i = 0; i < 18; i++) {
    const tree = new THREE.Group();

    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.45, 0.6, 3.2, 8),
      new THREE.MeshStandardMaterial({ map: trunkTexture, roughness: 0.9 })
    );
    trunk.position.y = 1.6;
    tree.add(trunk);

    const leaves = new THREE.Mesh(
      new THREE.SphereGeometry(2.2, 12, 12),
      new THREE.MeshStandardMaterial({ map: leafTexture, roughness: 0.8 })
    );
    leaves.position.y = 4.4;
    tree.add(leaves);

    const angle = (i / 18) * Math.PI * 2;
    const radius = 42 + Math.random() * 30;
    const x = Math.cos(angle) * radius + (Math.random() - 0.5) * 20;
    const z = Math.sin(angle) * radius + (Math.random() - 0.5) * 20;
    tree.position.set(x, 0, z);
    scene.add(tree);
  }
}

function createHumanoid(color) {
  const group = new THREE.Group();

  const shirtTexture = createClothTexture();
  const skinTexture = createSkinTexture();
  const topiTexture = createCanvasTexture((ctx, size) => {
    ctx.fillStyle = '#5d0a0a';
    ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 500; i++) {
      ctx.fillStyle = `rgba(255,255,255,${0.03 + Math.random() * 0.1})`;
      ctx.fillRect(Math.random() * size, Math.random() * size, 3, 3);
    }
  }, 256);

  const bodyMat = new THREE.MeshStandardMaterial({ map: shirtTexture, roughness: 0.9 });
  const skinMat = new THREE.MeshStandardMaterial({ map: skinTexture, roughness: 0.9 });
  const topiMat = new THREE.MeshStandardMaterial({ map: topiTexture, roughness: 0.9 });

  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 1.6), bodyMat);
  body.position.y = 1.15;
  group.add(body);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.35, 18, 18), skinMat);
  head.position.y = 2.1;
  group.add(head);

  const topi = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.22), topiMat);
  topi.position.y = 2.45;
  group.add(topi);

  return group;
}

function createNPCs() {
  const pandit = createHumanoid(0xff3b30);
  pandit.position.set(0, 0, -11);
  pandit.userData = {
    name: 'पुजारी (Main Quest)',
    type: 'main_quest',
    dialogue: 'नमस्कार! बागेश्वरी मन्दिरमा स्वागत छ। तपाईंको मुख्य मिसन सफल भयो!'
  };
  scene.add(pandit);
  npcs.push(pandit);

  const teaOwner = createHumanoid(0x1e88e5);
  teaOwner.position.set(-18, 0, 8);
  teaOwner.userData = {
    name: 'दाइ (चिया पसल - Side Quest)',
    type: 'side_quest',
    dialogue: 'नमस्ते बाबु! चिया खानुहुन्छ? गाउँमा स्वागत छ!'
  };
  scene.add(teaOwner);
  npcs.push(teaOwner);
}

function createPlayer() {
  player = createHumanoid(0x2bb673);
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

  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(e.clientY / window.innerHeight) * 2 + 1;

    cameraYaw -= e.movementX * 0.0025;
    cameraPitch = THREE.MathUtils.clamp(cameraPitch - e.movementY * 0.0018, -0.9, 1.2);
  });
}

function checkInteractions() {
  npcs.forEach((npc) => {
    if (player.position.distanceTo(npc.position) < 4) {
      const title = document.getElementById('dialogue-title');
      const text = document.getElementById('dialogue-text');
      title.innerText = npc.userData.name;
      text.innerText = npc.userData.dialogue;
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
  requestAnimationFrame(animate);

  if (!player || !camera || !renderer) return;

  const speed = 0.16;

  if (moveForward) player.position.z -= speed;
  if (moveBackward) player.position.z += speed;
  if (moveLeft) player.position.x -= speed;
  if (moveRight) player.position.x += speed;

  const desiredX = player.position.x + Math.sin(cameraYaw) * cameraDistance;
  const desiredY = player.position.y + Math.sin(cameraPitch) * cameraDistance * 0.9 + 5.5;
  const desiredZ = player.position.z + Math.cos(cameraYaw) * cameraDistance;

  camera.position.x += (desiredX - camera.position.x) * 0.12;
  camera.position.y += (desiredY - camera.position.y) * 0.12;
  camera.position.z += (desiredZ - camera.position.z) * 0.12;

  camera.lookAt(player.position.x, player.position.y + 1.5, player.position.z);

  renderer.render(scene, camera);
}
