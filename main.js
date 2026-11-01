// NEPAL WORLD 3D - Standalone Game Engine
// Created by Gajendra Kumar Khadka & Shrijan Khadka

let scene, camera, renderer, player;
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;

const gameState = {
  mainQuestStep: 0,
  sideQuests: { teaStall: false }
};

const npcs = [];

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

  // 4. Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const sunLight = new THREE.DirectionalLight(0xfffaed, 1.2);
  sunLight.position.set(100, 150, 50);
  sunLight.castShadow = true;
  scene.add(sunLight);

  // 5. Build Game Environment
  createTerrain();
  createHimalayas();
  createBageshwariTemple();
  createVillageHouses();
  createNPCs();
  createPlayer();

  // 6. Event Controls
  setupControls();
  window.addEventListener('resize', onWindowResize);

  // Start Animation Loop
  animate();
};

function createTerrain() {
  const geometry = new THREE.PlaneGeometry(300, 300, 64, 64);
  geometry.rotateX(-Math.PI / 2);
  const material = new THREE.MeshStandardMaterial({ color: 0x4d7c38, roughness: 0.9 });
  const terrain = new THREE.Mesh(geometry, material);
  terrain.receiveShadow = true;
  scene.add(terrain);
}

function createHimalayas() {
  for (let i = 0; i < 12; i++) {
    const h = 50 + Math.random() * 40;
    const geom = new THREE.ConeGeometry(25, h, 5);
    const mat = new THREE.MeshStandardMaterial({ color: 0xf0f8ff });
    const mountain = new THREE.Mesh(geom, mat);
    const angle = (i / 12) * Math.PI * 2;
    mountain.position.set(Math.cos(angle) * 130, h / 2 - 5, Math.sin(angle) * 130);
    scene.add(mountain);
  }
}

function createBageshwariTemple() {
  const temple = new THREE.Group();

  // Base
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(14, 2, 14),
    new THREE.MeshStandardMaterial({ color: 0x8b5a2b })
  );
  base.position.y = 1;
  temple.add(base);

  // Body
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(8, 7, 8),
    new THREE.MeshStandardMaterial({ color: 0xb22222 })
  );
  body.position.y = 5.5;
  temple.add(body);

  // Pagoda Roof
  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(7, 4, 4),
    new THREE.MeshStandardMaterial({ color: 0x222222 })
  );
  roof.position.y = 11;
  roof.rotation.y = Math.PI / 4;
  temple.add(roof);

  // Gajur (Golden Pinnacle)
  const gajur = new THREE.Mesh(
    new THREE.ConeGeometry(0.8, 2, 8),
    new THREE.MeshStandardMaterial({ color: 0xffd700 })
  );
  gajur.position.y = 14;
  temple.add(gajur);

  temple.position.set(0, 0, -20);
  scene.add(temple);
}

function createVillageHouses() {
  const positions = [{ x: -20, z: 10 }, { x: 20, z: 15 }];
  positions.forEach(pos => {
    const house = new THREE.Group();
    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(6, 4, 6),
      new THREE.MeshStandardMaterial({ color: 0xc27938 })
    );
    wall.position.y = 2;
    house.add(wall);
    
    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(5, 3, 4),
      new THREE.MeshStandardMaterial({ color: 0x3a3a3a })
    );
    roof.position.y = 5.5;
    roof.rotation.y = Math.PI / 4;
    house.add(roof);

    house.position.set(pos.x, 0, pos.z);
    scene.add(house);
  });
}

function createNPCs() {
  // Pandit NPC (Main Quest)
  const pandit = createHumanoid(0xff0000);
  pandit.position.set(0, 0, -12);
  pandit.userData = {
    name: "पुजारी (Main Quest)",
    type: "main_quest",
    dialogue: "नमस्कार! बागेश्वरी मन्दिरमा स्वागत छ। तपाईंको मुख्य मिसन सफल भयो! अब गाउँका मानिसहरूलाई मद्दत गर्नुहोस्।"
  };
  scene.add(pandit);
  npcs.push(pandit);

  // Tea Stall Owner NPC (Side Quest)
  const teaOwner = createHumanoid(0x0000ff);
  teaOwner.position.set(-18, 0, 8);
  teaOwner.userData = {
    name: "दाइ (चिया पसल - Side Quest)",
    type: "side_quest",
    dialogue: "नमस्ते बाबु! चिया खानुहुन्छ? गाउँमा स्वागत छ!"
  };
  scene.add(teaOwner);
  npcs.push(teaOwner);
}

function createHumanoid(color) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 0.4, 1.5),
    new THREE.MeshStandardMaterial({ color: color })
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

  camera.position.x = player.position.x;
  camera.position.z = player.position.z + 12;
  camera.position.y = player.position.y + 5;
  camera.lookAt(player.position);

  renderer.render(scene, camera);
}
