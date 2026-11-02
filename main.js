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

window.initGame = function() {
  try {
    const canvas = document.getElementById('game');
    if (!canvas) {
      console.error("Canvas not found");
      return;
    }

    if (!window.THREE) {
      console.error("Three.js not loaded");
      return;
    }

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.FogExp2(0xcfe8ff, 0.004);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 6, 14);

    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true
    });
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
    console.log("Game initialized successfully");
  } catch (error) {
    console.error("Game initialization failed:", error);
  }
};

function makeNoiseTexture(baseColor, accentColor) {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext('2d');
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const noise = Math.random() * 30;
      const r = Math.max(0, Math.min(255, baseColor.r + noise));
      const g = Math.max(0, Math.min(255, baseColor.g + noise));
      const b = Math.max(0, Math.min(255, baseColor.b + noise));
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.fillRect(x, y, 1, 1);
    }
  }

  for (let i = 0; i < 2000; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 2 + Math.random() * 4;
    ctx.fillStyle = accentColor;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  return new THREE.CanvasTexture(canvas);
}

function createTerrain() {
  const groundTexture = makeNoiseTexture({ r: 70, g: 125, b: 60 }, '#2a6d2a');
  groundTexture.wrapS = THREE.RepeatWrapping;
  groundTexture.wrapT = THREE.RepeatWrapping;
  groundTexture.repeat.set(30, 30);

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
  for (let i = 0; i < 12; i++) {
    const h = 45 + Math.random() * 40;
    const mountain = new THREE.Mesh(
      new THREE.ConeGeometry(18 + Math.random() * 18, h, 7),
      new THREE.MeshStandardMaterial({
        color: 0xe7f0ff,
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

  const baseMat = new THREE.MeshStandardMaterial({ color: 0x8c5a2b, roughness: 0.9 });
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xb31217, roughness: 0.8 });
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x1f1f1f, roughness: 0.9 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xffd84d, emissive: 0x4a3600, roughness: 0.4 });

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

  const stairs = new THREE.Mesh(new THREE.BoxGeometry(5, 0.7, 2), new THREE.MeshStandardMaterial({ color: 0xd7c29d }));
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

  housePositions.forEach((pos) => {
    const house = new THREE.Group();

    const wallMat = new THREE.MeshStandardMaterial({ color: 0xd38a4a, roughness: 0.9 });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x3b3b3b, roughness: 0.9 });

    const wall = new THREE.Mesh(new THREE.BoxGeometry(6, 4, 6), wallMat);
    wall.position.y = 2;
    house.add(wall);

    const roof = new THREE.Mesh(new THREE.ConeGeometry(5.2, 3.5, 4), roofMat);
    roof.position.y = 5.9;
    roof.rotation.y = Math.PI / 4;
    house.add(roof);

    const door = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 2.2, 0.4),
      new THREE.MeshStandardMaterial({ color: 0x7a4b2a })
    );
    door.position.set(0, 1.1, 3.1);
    house.add(door);

    const teaStand = new THREE.Mesh(
      new THREE.BoxGeometry(2.5, 1.5, 2.5),
      new THREE.MeshStandardMaterial({ color: 0x8a5a2d })
    );
    teaStand.position.set(0, 0.75, 3.8);
    house.add(teaStand);

    house.position.set(pos.x, 0, pos.z);
    scene.add(house);
  });
}

function createTrees() {
  for (let i = 0; i < 18; i++) {
    const tree = new THREE.Group();

    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.45, 0.6, 3.2, 8),
      new THREE.MeshStandardMaterial({ color: 0x6d4d2c })
    );
    trunk.position.y = 1.6;
    tree.add(trunk);

    const leaves = new THREE.Mesh(
      new THREE.SphereGeometry(2.2, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0x2f9d46 })
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

  const bodyMat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.9 });
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xf0d0a8 });

  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 1.6), bodyMat);
  body.position.y = 1.15;
  group.add(body);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.35, 18, 18), skinMat);
  head.position.y = 2.1;
  group.add(head);

  const topi = new THREE.Mesh(
    new THREE.CylinderGeometry(0.38, 0.38, 0.22),
    new THREE.MeshStandardMaterial({ color: 0x5d0a0a })
  );
  topi.position.y = 2.45;
  group.add(topi);

  return group;
}

function createNPCs() {
  const pandit = createHumanoid(0xff3b30);
  pandit.position.set(0, 0, -11);
  pandit.userData = {
    name: "पुजारी (Main Quest)",
    type: "main_quest",
    dialogue: "नमस्कार! बागेश्वरी मन्दिरमा स्वागत छ। तपाईंको मुख्य मिसन सफल भयो!"
  };
  scene.add(pandit);
  npcs.push(pandit);

  const teaOwner = createHumanoid(0x1e88e5);
  teaOwner.position.set(-18, 0, 8);
  teaOwner.userData = {
    name: "दाइ (चिया पसल - Side Quest)",
    type: "side_quest",
    dialogue: "नमस्ते बाबु! चिया खानुहुन्छ? गाउँमा स्वागत छ!"
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
        document.getElementById('q-title').innerText = "Side Quest: चिया पसल";
        document.getElementById('q-desc').innerText = "गाउँको चिया पसलका दाइसँग भेट्नुहोस्।";
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
