let scene, camera, renderer, player;
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;

const npcs = [];
const gameState = {
  mainQuestStep: 0,
  sideQuests: { teaStall: false }
};

let cameraYaw = Math.PI;
let cameraPitch = 0.52;
let cameraDistance = 12.5;
let isGameStarted = false;
let clock;

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
    ctx.fillStyle = '#5aa74e';
    ctx.fillRect(0, 0, size, size);

    for (let i = 0; i < 3500; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const shade = 70 + Math.random() * 80;
      ctx.fillStyle = `rgba(${shade}, ${shade + 28}, ${shade - 18}, 0.72)`;
      ctx.fillRect(x, y, 2, 2);
    }

    for (let i = 0; i < 900; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      ctx.strokeStyle = 'rgba(12, 78, 20, 0.28)';
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 4 + Math.random() * 8, y + 5 + Math.random() * 8);
      ctx.stroke();
    }
  }, 256);
}

function createMountainTexture() {
  return createCanvasTexture((ctx, size) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, size);
    gradient.addColorStop(0, '#f4f9ff');
    gradient.addColorStop(0.55, '#dfeaf7');
    gradient.addColorStop(1, '#becfd9');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    for (let i = 0; i < 1800; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = 2 + Math.random() * 9;
      ctx.fillStyle = `rgba(255,255,255,${0.08 + Math.random() * 0.22})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }, 256);
}

function createRockTexture() {
  return createCanvasTexture((ctx, size) => {
    ctx.fillStyle = '#8d8d8d';
    ctx.fillRect(0, 0, size, size);

    for (let i = 0; i < 7000; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const w = 2 + Math.random() * 6;
      const h = 2 + Math.random() * 6;
      ctx.fillStyle = `rgba(${120 + Math.random() * 50}, ${120 + Math.random() * 50}, ${120 + Math.random() * 50}, 0.65)`;
      ctx.fillRect(x, y, w, h);
    }
  }, 256);
}

function createTempleWallTexture() {
  return createCanvasTexture((ctx, size) => {
    ctx.fillStyle = '#b71d1d';
    ctx.fillRect(0, 0, size, size);

    for (let i = 0; i < 4500; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const s = 1 + Math.random() * 3;
      ctx.fillStyle = `rgba(${100 + Math.random() * 30}, 0, 0, 0.45)`;
      ctx.fillRect(x, y, s, s);
    }
  }, 256);
}

function createRoofTexture() {
  return createCanvasTexture((ctx, size) => {
    ctx.fillStyle = '#1e1e1e';
    ctx.fillRect(0, 0, size, size);

    for (let i = 0; i < size; i += 16) {
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, size);
      ctx.stroke();
    }

    for (let j = 0; j < size; j += 16) {
      ctx.strokeStyle = 'rgba(0,0,0,0.12)';
      ctx.beginPath();
      ctx.moveTo(0, j);
      ctx.lineTo(size, j);
      ctx.stroke();
    }
  }, 256);
}

function createWoodTexture() {
  return createCanvasTexture((ctx, size) => {
    ctx.fillStyle = '#8d5a2d';
    ctx.fillRect(0, 0, size, size);

    for (let i = 0; i < size; i += 8) {
      ctx.strokeStyle = 'rgba(60, 28, 10, 0.72)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, size);
      ctx.stroke();
    }

    for (let y = 0; y < size; y += 18) {
      ctx.strokeStyle = 'rgba(255, 210, 160, 0.22)';
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(size, y);
      ctx.stroke();
    }
  }, 256);
}

function createLeafTexture() {
  return createCanvasTexture((ctx, size) => {
    ctx.fillStyle = '#2e9d47';
    ctx.fillRect(0, 0, size, size);

    for (let i = 0; i < 1300; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = 2 + Math.random() * 5;
      ctx.fillStyle = `rgba(${65 + Math.random() * 60}, ${120 + Math.random() * 70}, ${45 + Math.random() * 60}, 0.72)`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }, 256);
}

function createSkinTexture() {
  return createCanvasTexture((ctx, size) => {
    ctx.fillStyle = '#f0d0a8';
    ctx.fillRect(0, 0, size, size);

    for (let i = 0; i < 1000; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const s = 1 + Math.random() * 3;
      ctx.fillStyle = `rgba(170, 120, 90, ${0.06 + Math.random() * 0.16})`;
      ctx.fillRect(x, y, s, s);
    }
  }, 256);
}

function createClothTexture() {
  return createCanvasTexture((ctx, size) => {
    ctx.fillStyle = '#dddddd';
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

window.initGame = function() {
  if (isGameStarted) return;
  isGameStarted = true;

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
    scene.background = new THREE.Color(0x88c9f6);
    scene.fog = new THREE.FogExp2(0xdfefff, 0.004);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 6, 14);

    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;

    const ambient = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xfff3d6, 1.35);
    sun.position.set(90, 140, 40);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    scene.add(sun);

    clock = new THREE.Clock();

    createGround();
    createRoad();
    createHimalayas();
    createTemple();
    createHouses();
    createTrees();
    createClouds();
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

function createGround() {
  const groundTexture = createGrassTexture();
  groundTexture.repeat.set(30, 30);

  const material = new THREE.MeshStandardMaterial({
    map: groundTexture,
    roughness: 0.95,
    metalness: 0.02
  });

  const plane = new THREE.Mesh(new THREE.PlaneGeometry(350, 350, 64, 64), material);
  plane.rotation.x = -Math.PI / 2;
  plane.receiveShadow = true;
  scene.add(plane);
}

function createRoad() {
  const roadTexture = createWoodTexture();
  roadTexture.repeat.set(18, 1);

  const road = new THREE.Mesh(
    new THREE.BoxGeometry(20, 0.18, 150),
    new THREE.MeshStandardMaterial({
      map: roadTexture,
      roughness: 0.9
    })
  );
  road.position.set(0, 0.12, 0);
  road.receiveShadow = true;
  scene.add(road);
}

function createHimalayas() {
  const mountainTexture = createMountainTexture();

  for (let i = 0; i < 12; i++) {
    const h = 45 + Math.random() * 40;
    const mountain = new THREE.Mesh(
      new THREE.ConeGeometry(20 + Math.random() * 16, h, 7),
      new THREE.MeshStandardMaterial({
        map: mountainTexture,
        roughness: 1,
        metalness: 0
      })
    );

    const angle = (i / 12) * Math.PI * 2;
    const radius = 125 + Math.random() * 20;

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
    ctx.fillStyle = '#ffd74b';
    ctx.fillRect(0, 0, size, size);

    for (let i = 0; i < 1200; i++) {
      ctx.fillStyle = `rgba(255, 210, 80, ${0.15 + Math.random() * 0.35})`;
      ctx.fillRect(Math.random() * size, Math.random() * size, 4, 4);
    }
  }, 256);

  const baseMaterial = new THREE.MeshStandardMaterial({ map: baseTexture, roughness: 0.9 });
  const wallMaterial = new THREE.MeshStandardMaterial({ map: wallTexture, roughness: 0.8 });
  const roofMaterial = new THREE.MeshStandardMaterial({ map: roofTexture, roughness: 0.9 });
  const goldMaterial = new THREE.MeshStandardMaterial({
    map: goldTexture,
    emissive: 0x4b3700,
    roughness: 0.45
  });
  const stairsMaterial = new THREE.MeshStandardMaterial({
    map: createWoodTexture(),
    roughness: 0.85
  });

  const base = new THREE.Mesh(new THREE.BoxGeometry(16, 2, 16), baseMaterial);
  base.position.y = 1;
  temple.add(base);

  const body = new THREE.Mesh(new THREE.BoxGeometry(9, 8, 9), wallMaterial);
  body.position.y = 6;
  temple.add(body);

  const roof = new THREE.Mesh(new THREE.ConeGeometry(8.2, 5, 4), roofMaterial);
  roof.position.y = 12.2;
  roof.rotation.y = Math.PI / 4;
  temple.add(roof);

  const gajur = new THREE.Mesh(new THREE.ConeGeometry(1.1, 2.4, 8), goldMaterial);
  gajur.position.y = 15.5;
  temple.add(gajur);

  const stairs = new THREE.Mesh(new THREE.BoxGeometry(5, 0.7, 2), stairsMaterial);
  stairs.position.set(0, 1.5, 9);
  temple.add(stairs);

  temple.position.set(0, 0, -20);
  scene.add(temple);
}

function createHouses() {
  const housePositions = [
    { x: -22, z: 10 },
    { x: 28, z: 14 },
    { x: 0, z: 28 }
  ];

  const wallTexture = createWoodTexture();
  const roofTexture = createRoofTexture();

  housePositions.forEach((pos) => {
    const house = new THREE.Group();

    const wallMaterial = new THREE.MeshStandardMaterial({
      map: wallTexture,
      roughness: 0.9
    });

    const roofMaterial = new THREE.MeshStandardMaterial({
      map: roofTexture,
      roughness: 0.9
    });

    const doorMaterial = new THREE.MeshStandardMaterial({
      map: createWoodTexture(),
      roughness: 0.8
    });

    const wall = new THREE.Mesh(new THREE.BoxGeometry(6, 4, 6), wallMaterial);
    wall.position.y = 2;
    house.add(wall);

    const roof = new THREE.Mesh(new THREE.ConeGeometry(5.2, 3.6, 4), roofMaterial);
    roof.position.y = 5.9;
    roof.rotation.y = Math.PI / 4;
    house.add(roof);

    const door = new THREE.Mesh(new THREE.BoxGeometry(1.5, 2.2, 0.4), doorMaterial);
    door.position.set(0, 1.1, 3.1);
    house.add(door);

    const stall = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 1.5, 2.4),
      new THREE.MeshStandardMaterial({
        map: createWoodTexture(),
        roughness: 0.85
      })
    );
    stall.position.set(0, 0.75, 3.9);
    house.add(stall);

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
      new THREE.CylinderGeometry(0.48, 0.6, 3.4, 8),
      new THREE.MeshStandardMaterial({
        map: trunkTexture,
        roughness: 0.9
      })
    );
    trunk.position.y = 1.7;
    tree.add(trunk);

    const leaves = new THREE.Mesh(
      new THREE.SphereGeometry(2.3, 12, 12),
      new THREE.MeshStandardMaterial({
        map: leafTexture,
        roughness: 0.8
      })
    );
    leaves.position.y = 4.5;
    tree.add(leaves);

    const angle = (i / 18) * Math.PI * 2;
    const radius = 42 + Math.random() * 28;
    const x = Math.cos(angle) * radius + (Math.random() - 0.5) * 18;
    const z = Math.sin(angle) * radius + (Math.random() - 0.5) * 18;

    tree.position.set(x, 0, z);
    scene.add(tree);
  }
}

function createClouds() {
  const cloudMaterial = new THREE.MeshStandardMaterial({
    color: 0xf8fbff,
    roughness: 1,
    transparent: true,
    opacity: 0.82
  });

  for (let i = 0; i < 8; i++) {
    const cloud = new THREE.Group();

    const puff1 = new THREE.Mesh(new THREE.SphereGeometry(3.2, 18, 18), cloudMaterial);
    puff1.position.set(-6, 0, 0);
    cloud.add(puff1);

    const puff2 = new THREE.Mesh(new THREE.SphereGeometry(3.7, 18, 18), cloudMaterial);
    puff2.position.set(4, 0, 0);
    cloud.add(puff2);

    const puff3 = new THREE.Mesh(new THREE.SphereGeometry(2.7, 18, 18), cloudMaterial);
    puff3.position.set(0, 1.7, 0);
    cloud.add(puff3);

    cloud.position.set(
      (Math.random() - 0.5) * 220,
      30 + Math.random() * 30,
      -40 - Math.random() * 60
    );
    scene.add(cloud);
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

  const bodyMaterial = new THREE.MeshStandardMaterial({
    map: shirtTexture,
    roughness: 0.9
  });

  const skinMaterial = new THREE.MeshStandardMaterial({
    map: skinTexture,
    roughness: 0.9
  });

  const topiMaterial = new THREE.MeshStandardMaterial({
    map: topiTexture,
    roughness: 0.9
  });

  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 1.7), bodyMaterial);
  torso.position.y = 1.45;
  group.add(torso);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.35, 18, 18), skinMaterial);
  head.position.y = 2.5;
  group.add(head);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.25), skinMaterial);
  neck.position.y = 2.0;
  group.add(neck);

  const topi = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.2), topiMaterial);
  topi.position.y = 2.8;
  group.add(topi);

  const leftArm = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.82, 10), bodyMaterial);
  leftArm.position.set(-0.52, 1.45, 0);
  leftArm.rotation.z = 0.4;
  group.add(leftArm);

  const rightArm = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.82, 10), bodyMaterial);
  rightArm.position.set(0.52, 1.45, 0);
  rightArm.rotation.z = -0.4;
  group.add(rightArm);

  const leftLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.17, 1.0, 10), bodyMaterial);
  leftLeg.position.set(-0.18, 0.4, 0);
  group.add(leftLeg);

  const rightLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.17, 1.0, 10), bodyMaterial);
  rightLeg.position.set(0.18, 0.4, 0);
  group.add(rightLeg);

  group.userData = {
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    torso,
    head
  };

  return group;
}

function createNPCs() {
  const pandit = createHumanoid(0xff3b30);
  pandit.position.set(0, 0, -11);
  pandit.userData.npcType = 'main_quest';
  pandit.userData.name = 'पुजारी (Main Quest)';
  pandit.userData.dialogue = 'नमस्कार! बागेश्वरी मन्दिरमा स्वागत छ। तपाईंको मुख्य मिसन सफल भयो!';
  scene.add(pandit);
  npcs.push(pandit);

  const teaOwner = createHumanoid(0x1e88e5);
  teaOwner.position.set(-18, 0, 8);
  teaOwner.userData.npcType = 'side_quest';
  teaOwner.userData.name = 'दाइ (चिया पसल - Side Quest)';
  teaOwner.userData.dialogue = 'नमस्ते बाबु! चिया खानुहुन्छ? गाउँमा स्वागत छ!';
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

  window.addEventListener('mousemove', (event) => {
    cameraYaw -= event.movementX * 0.0025;
    cameraPitch = THREE.MathUtils.clamp(
      cameraPitch - event.movementY * 0.0018,
      -0.9,
      1.2
    );
  });
}

function getMovementVector() {
  const forward = {
    x: -Math.sin(cameraYaw),
    z: -Math.cos(cameraYaw)
  };

  const right = {
    x: Math.cos(cameraYaw),
    z: -Math.sin(cameraYaw)
  };

  let moveX = 0;
  let moveZ = 0;

  if (moveForward) {
    moveX += forward.x;
    moveZ += forward.z;
  }

  if (moveBackward) {
    moveX -= forward.x;
    moveZ -= forward.z;
  }

  if (moveLeft) {
    moveX -= right.x;
    moveZ -= right.z;
  }

  if (moveRight) {
    moveX += right.x;
    moveZ += right.z;
  }

  const length = Math.hypot(moveX, moveZ);
  if (length > 0) {
    moveX /= length;
    moveZ /= length;
  }

  return { x: moveX, z: moveZ };
}

function updateHumanoidAnimation(character, isMoving, dt) {
  if (!character || !character.userData) return;

  const swing = isMoving ? Math.sin(performance.now() * 0.012) * 0.8 : 0;
  const armSwing = isMoving ? Math.sin(performance.now() * 0.012) * 0.9 : 0;

  character.userData.leftArm.rotation.x = armSwing;
  character.userData.rightArm.rotation.x = -armSwing;
  character.userData.leftLeg.rotation.x = -swing;
  character.userData.rightLeg.rotation.x = swing;
}

function checkInteractions() {
  npcs.forEach((npc) => {
    if (player.position.distanceTo(npc.position) < 4) {
      const title = document.getElementById('dialogue-title');
      const text = document.getElementById('dialogue-text');

      title.innerText = npc.userData.name;
      text.innerText = npc.userData.dialogue;

      document.getElementById('dialogue-modal').style.display = 'block';

      if (npc.userData.npcType === 'main_quest' && gameState.mainQuestStep === 0) {
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

  const dt = clock.getDelta();
  const moveVector = getMovementVector();
  const movementMagnitude = Math.hypot(moveVector.x, moveVector.z);

  const speed = 8.5;
  if (movementMagnitude > 0) {
    player.position.x += moveVector.x * speed * dt;
    player.position.z += moveVector.z * speed * dt;
    player.rotation.y = Math.atan2(moveVector.x, moveVector.z);
  }

  const maxDistance = 92;
  player.position.x = THREE.MathUtils.clamp(player.position.x, -maxDistance, maxDistance);
  player.position.z = THREE.MathUtils.clamp(player.position.z, -maxDistance, maxDistance);

  updateHumanoidAnimation(player, movementMagnitude > 0.01, dt);

  npcs.forEach((npc) => {
    const idle = Math.sin(performance.now() * 0.004 + npc.position.x) * 0.2;
    updateHumanoidAnimation(npc, false, dt);
    npc.userData.leftArm.rotation.x += idle * 0.01;
    npc.userData.rightArm.rotation.x -= idle * 0.01;
  });

  const desiredX = player.position.x + Math.sin(cameraYaw) * cameraDistance;
  const desiredY = player.position.y + Math.sin(cameraPitch) * cameraDistance * 0.9 + 5.5;
  const desiredZ = player.position.z + Math.cos(cameraYaw) * cameraDistance;

  camera.position.x += (desiredX - camera.position.x) * 0.12;
  camera.position.y += (desiredY - camera.position.y) * 0.12;
  camera.position.z += (desiredZ - camera.position.z) * 0.12;

  camera.lookAt(player.position.x, player.position.y + 1.5, player.position.z);

  renderer.render(scene, camera);
}
