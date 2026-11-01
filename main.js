// NEPAL WORLD 3D - Main Engine Script
// Developed for Gajendra Kumar Khadka & Shrijan Khadka

let scene, camera, renderer, player, controls;
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let velocity = new THREE.Vector3();
let direction = new THREE.Vector3();

// Game State & Quests
const gameState = {
  mainQuestStep: 0, // 0: Visit Temple, 1: Temple Done -> Unlock Side Quests, 2: Completed All
  sideQuests: {
    teaStall: false,
    chhauniFlag: false
  }
};

const npcs = [];
const interactables = [];

window.initGame = function() {
  // 1. Scene Setup
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb); // Realistic Sky Blue
  scene.fog = new THREE.FogExp2(0xd0e7f0, 0.005); // Realistic Mountain Mist/Fog

  // 2. Camera Setup
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 5, 15);

  // 3. Renderer Setup
  renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('game'), antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // 4. Realistic Lighting Systems
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  const sunLight = new THREE.DirectionalLight(0xfffaed, 1.2);
  sunLight.position.set(100, 150, 50);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.camera.near = 0.5;
  sunLight.shadow.camera.far = 500;
  const d = 100;
  sunLight.shadow.camera.left = -d;
  sunLight.shadow.camera.right = d;
  sunLight.shadow.camera.top = d;
  sunLight.shadow.camera.bottom = -d;
  scene.add(sunLight);

  // 5. Build Environment
  createTerrain();
  createHimalayasBackground();
  createBageshwariTemple();
  createVillageHouses();
  createNPCs();

  // 6. Player Setup
  createPlayer();

  // 7. Event Listeners
  setupControls();

  window.addEventListener('resize', onWindowResize);

  // Render Loop
  animate();
};

// Realistic Himalayan Terrain with Hills & Valleys
function createTerrain() {
  const size = 300;
  const geometry = new THREE.PlaneGeometry(size, size, 120, 120);
  geometry.rotateX(-Math.PI / 2);

  const pos = geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    // Height map generated using sine waves for realistic Nepal terrain terrain
    let y = Math.sin(x * 0.03) * Math.cos(z * 0.03) * 4;
    y += Math.sin(x * 0.08) * 1.5;
    
    // Flat space for temple/village at center
    if (Math.abs(x) < 30 && Math.abs(z) < 30) {
      y *= 0.1;
    }
    pos.setY(i, y);
  }
  geometry.computeVertexNormals();

  const material = new THREE.MeshStandardMaterial({
    color: 0x4d7c38, // Nepalese Green Hills
    roughness: 0.9,
    metalness: 0.1
  });

  const terrain = new THREE.Mesh(geometry, material);
  terrain.receiveShadow = true;
  scene.add(terrain);
}

// Background Snowy Mountain Range
function createHimalayasBackground() {
  const compGroup = new THREE.Group();
  for (let i = 0; i < 15; i++) {
    const height = 60 + Math.random() * 40;
    const radius = 25 + Math.random() * 15;
    const geom = new THREE.ConeGeometry(radius, height, 5);
    const mat = new THREE.MeshStandardMaterial({ color: 0xf0f8ff, roughness: 0.5 });
    const mountain = new THREE.Mesh(geom, mat);
    
    const angle = (i / 15) * Math.PI * 2;
    const dist = 140 + Math.random() * 20;
    mountain.position.set(Math.cos(angle) * dist, height / 2 - 10, Math.sin(angle) * dist);
    compGroup.add(mountain);
  }
  scene.add(compGroup);
}

// Bageshwari Temple Model
function createBageshwariTemple() {
  const temple = new THREE.Group();

  // Base Platform
  const baseGeom = new THREE.BoxGeometry(16, 2, 16);
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b });
  const base = new THREE.Mesh(baseGeom, baseMat);
  base.position.y = 1;
  base.castShadow = true;
  base.receiveShadow = true;
  temple.add(base);

  // Main Sanctum (Garbhagriha)
  const bodyGeom = new THREE.BoxGeometry(10, 8, 10);
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xb22222 }); // Nepali Red Terracotta
  const body = new THREE.Mesh(bodyGeom, bodyMat);
  body.position.y = 6;
  body.castShadow = true;
  temple.add(body);

  // Pagoda Style Roof 1
  const roof1Geom = new THREE.ConeGeometry(9, 4, 4);
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.3 });
  const roof1 = new THREE.Mesh(roof1Geom, roofMat);
  roof1.position.y = 12;
  roof1.rotation.y = Math.PI / 4;
  roof1.castShadow = true;
  temple.add(roof1);

  // Golden Gajur (Pinnacle)
  const gajurGeom = new THREE.ConeGeometry(0.8, 2.5, 8);
  const gajurMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.8, roughness: 0.2 });
  const gajur = new THREE.Mesh(gajurGeom, gajurMat);
  gajur.position.y = 14.5;
  temple.add(gajur);

  temple.position.set(0, 0, -20);
  scene.add(temple);
}

// Traditional Village Houses
function createVillageHouses() {
  const housePositions = [
    { x: -25, z: 10 }, { x: 25, z: 15 }, { x: -20, z: -10 }
  ];

  housePositions.forEach(pos => {
    const house = new THREE.Group();
    // Mud wall base
    const wallGeom = new THREE.BoxGeometry(6, 4, 6);
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xc27938 });
    const wall = new THREE.Mesh(wallGeom, wallMat);
    wall.position.y = 2;
    wall.castShadow = true;
    house.add(wall);

    // Slate Roof
    const roofGeom = new THREE.ConeGeometry(5, 2.5, 4);
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x3a3a3a });
    const roof = new THREE.Mesh(roofGeom, roofMat);
    roof.position.y = 5.2;
    roof.rotation.y = Math.PI / 4;
    house.add(roof);

    house.position.set(pos.x, 0, pos.z);
    scene.add(house);
  });
}

// Create NPCs and Interactive Characters
function createNPCs() {
  // 1. Temple Pandit (Main Quest)
  const pandit = createHumanoidMesh(0xff0000, 0xffffff);
  pandit.position.set(0, 2, -12);
  pandit.userData = {
    name: "पुजारी (Main Quest Panditji)",
    type: "main_quest",
    dialogue: "नमस्कार! मन्दिरमा स्वागत छ। तपाईंको पहिलो मुख्य मिसन पूरा भयो! अब तपाईंले गाउँका अन्य मानिसहरूलाई मद्दत गर्न सक्नुहुन्छ (Side Quests Unlocked)।"
  };
  scene.add(pandit);
  npcs.push(pandit);

  // 2. Local Tea Shop Owner (Side Quest 1)
  const shopkeeper = createHumanoidMesh(0x0000ff, 0x8b4513);
  shopkeeper.position.set(-20, 2, 10);
  shopkeeper.userData = {
    name: "दाइ (चिया पसल)",
    type: "side_quest_1",
    dialogue: "नमस्ते बाबु! के तपाईंले मेरो हराएको चिया पकाउने सानो कसौडी भेटाउनुभयो?"
  };
  scene.add(shopkeeper);
  npcs.push(shopkeeper);
}

function createHumanoidMesh(shirtColor, pantsColor) {
  const group = new THREE.Group();

  const torso = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.5, 1.5),
    new THREE.MeshStandardMaterial({ color: shirtColor })
  );
  torso.position.y = 1.25;
  torso.castShadow = true;
  group.add(torso);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.4, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0xffdbac })
  );
  head.position.y = 2.3;
  head.castShadow = true;
  group.add(head);

  // Dhaka Topi Accent for Realistic Vibe
  const topi = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 0.42, 0.3),
    new THREE.MeshStandardMaterial({ color: 0x800000 })
  );
  topi.position.y = 2.65;
  group.add(topi);

  return group;
}

// Player Representation
function createPlayer() {
  player = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.5, 1.8),
    new THREE.MeshStandardMaterial({ color: 0x228b22 })
  );
  body.position.y = 0.9;
  player.add(body);
  player.position.set(0, 0, 15);
  scene.add(player);
}

// Keyboard & Interaction System
function setupControls() {
  document.addEventListener('keydown', (e) => {
    switch (e.code) {
      case 'KeyW': case 'ArrowUp': moveForward = true; break;
      case 'KeyS': case 'ArrowDown': moveBackward = true; break;
      case 'KeyA': case 'ArrowLeft': moveLeft = true; break;
      case 'KeyD': case 'ArrowRight': moveRight = true; break;
      case 'KeyE': checkInteractions(); break;
    }
  });

  document.addEventListener('keyup', (e) => {
    switch (e.code) {
      case 'KeyW': case 'ArrowUp': moveForward = false; break;
      case 'KeyS': case 'ArrowDown': moveBackward = false; break;
      case 'KeyA': case 'ArrowLeft': moveLeft = false; break;
      case 'KeyD': case 'ArrowRight': moveRight = false; break;
    }
  });
}

function checkInteractions() {
  npcs.forEach(npc => {
    const dist = player.position.distanceTo(npc.position);
    if (dist < 4) {
      openDialogue(npc.userData.name, npc.userData.dialogue);
      handleQuestProgress(npc.userData.type);
    }
  });
}

function openDialogue(title, text) {
  document.getElementById('dialogue-title').innerText = title;
  document.getElementById('dialogue-text').innerText = text;
  document.getElementById('dialogue-modal').style.display = 'block';
}

window.closeDialogue = function() {
  document.getElementById('dialogue-modal').style.display = 'none';
};

function handleQuestProgress(type) {
  const qTitle = document.getElementById('q-title');
  const qDesc = document.getElementById('q-desc');

  if (type === 'main_quest' && gameState.mainQuestStep === 0) {
    gameState.mainQuestStep = 1;
    qTitle.innerText = "Side Quest: चिया पसललाई सहयोग";
    qDesc.innerText = "गाउँको चिया पसलका दाइ (Blue Shirt) सँग कुरा गर्नुहोस् र Side Quest सुरु गर्नुहोस्।";
  } else if (type === 'side_quest_1' && gameState.mainQuestStep === 1) {
    gameState.sideQuests.teaStall = true;
    qTitle.innerText = "सबै Quests सम्पन्न!";
    qDesc.innerText = "बधाई छ! तपाईंले Nepal World 3D का सबै मुख्य र साइड मिसनहरू सफलतापूर्वक पूरा गर्नुभयो।";
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Game Loop & Smooth Movement
function animate() {
  requestAnimationFrame(animate);

  const speed = 0.2;
  if (moveForward) player.position.z -= speed;
  if (moveBackward) player.position.z += speed;
  if (moveLeft) player.position.x -= speed;
  if (moveRight) player.position.x += speed;

  // Third-person Camera Follow Logic
  camera.position.x = player.position.x;
  camera.position.z = player.position.z + 12;
  camera.position.y = player.position.y + 6;
  camera.lookAt(player.position);

  renderer.render(scene, camera);
}
