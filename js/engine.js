// ============================================================
// SOLAR SYSTEM ENGINE
// ============================================================
// Naya planet add karne ke liye ye file change nahi karni,
// sirf bodies-data.js mein object add karna hai.
// ============================================================

let scene, camera, renderer, composer, controls, raycaster, mouse;
let bodyEntries = {};
let clickTargets = [];
let clock, elapsed = 0;
let selectedId = null;
let cameraTarget = new THREE.Vector3(0, 0, 0);
let cameraDesiredPos = null;
let isFlying = false;

const DEFAULT_CAM_POS = new THREE.Vector3(0, 40, 95);
const DEFAULT_TARGET = new THREE.Vector3(0, 0, 0);

const textureLoader = new THREE.TextureLoader();
const backBtn = document.getElementById("back-btn");
const nameTag = document.getElementById("name-tag");
const hint = document.getElementById("hint");

init();
animate();

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 5000);
  camera.position.copy(DEFAULT_CAM_POS);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.outputEncoding = THREE.sRGBEncoding;
  document.getElementById("scene-container").appendChild(renderer.domElement);

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 6;
  controls.maxDistance = 900;
  controls.target.copy(DEFAULT_TARGET);

  scene.add(new THREE.AmbientLight(0x1a2438, 0.3));
  const sunLight = new THREE.PointLight(0xfff2d0, 2.6, 0, 0.3);
  sunLight.position.set(0, 0, 0);
  scene.add(sunLight);

  composer = new THREE.EffectComposer(renderer);
  composer.addPass(new THREE.RenderPass(scene, camera));
  const bloomPass = new THREE.UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.7, 0.12
  );
  composer.addPass(bloomPass);

  addStarfield();
  buildBodies();

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();
  clock = new THREE.Clock();

  window.addEventListener("resize", onResize);
  renderer.domElement.addEventListener("click", onClick);
  backBtn.addEventListener("click", unfocusBody);
}

function addStarfield() {
  const brightCount = 700;
  const brightGeo = new THREE.BufferGeometry();
  const brightPos = new Float32Array(brightCount * 3);
  const brightCol = new Float32Array(brightCount * 3);
  for (let i = 0; i < brightCount; i++) {
    const radius = 500 + Math.random() * 900;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);
    brightPos[i*3] = radius * Math.sin(phi) * Math.cos(theta);
    brightPos[i*3+1] = radius * Math.cos(phi);
    brightPos[i*3+2] = radius * Math.sin(phi) * Math.sin(theta);
    const tint = Math.random();
    if (tint < 0.15) { brightCol[i*3]=0.7; brightCol[i*3+1]=0.8; brightCol[i*3+2]=1; }
    else if (tint < 0.3) { brightCol[i*3]=1; brightCol[i*3+1]=0.9; brightCol[i*3+2]=0.7; }
    else { brightCol[i*3]=1; brightCol[i*3+1]=1; brightCol[i*3+2]=1; }
  }
  brightGeo.setAttribute("position", new THREE.BufferAttribute(brightPos, 3));
  brightGeo.setAttribute("color", new THREE.BufferAttribute(brightCol, 3));
  const brightMat = new THREE.PointsMaterial({ size: 1.8, vertexColors: true, transparent: true, opacity: 0.95 });
  scene.add(new THREE.Points(brightGeo, brightMat));

  const faintCount = 3500;
  const faintGeo = new THREE.BufferGeometry();
  const faintPos = new Float32Array(faintCount * 3);
  for (let i = 0; i < faintCount; i++) {
    const radius = 400 + Math.random() * 1000;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);
    faintPos[i*3] = radius * Math.sin(phi) * Math.cos(theta);
    faintPos[i*3+1] = radius * Math.cos(phi);
    faintPos[i*3+2] = radius * Math.sin(phi) * Math.sin(theta);
  }
  faintGeo.setAttribute("position", new THREE.BufferAttribute(faintPos, 3));
  const faintMat = new THREE.PointsMaterial({ color: 0x8fa5c9, size: 0.6, transparent: true, opacity: 0.5 });
  scene.add(new THREE.Points(faintGeo, faintMat));
}

function createSunTexture() {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext("2d");
  const grad = ctx.createRadialGradient(size/2, size/2, size*0.05, size/2, size/2, size*0.7);
  grad.addColorStop(0, "#fff7d6");
  grad.addColorStop(0.4, "#ffd25c");
  grad.addColorStop(0.75, "#ff9a2e");
  grad.addColorStop(1, "#e05c12");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 1100; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 3 + Math.random() * 11;
    const shade = Math.random() > 0.5 ? "rgba(255,235,170,0.16)" : "rgba(190,60,10,0.16)";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI*2);
    ctx.fillStyle = shade;
    ctx.fill();
  }
  return new THREE.CanvasTexture(canvas);
}

function createTargetRing(color) {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext("2d");
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(size/2, size/2, size/2 - 6, 0, Math.PI*2);
  ctx.stroke();
  const tex = new THREE.CanvasTexture(canvas);
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0.4, depthWrite: false });
  return new THREE.Sprite(mat);
}

function buildBodies() {
  SOLAR_BODIES.forEach(data => {
    const group = new THREE.Group();
    scene.add(group);
    const entry = { group, data, angle: Math.random() * Math.PI * 2, paused: false };

    if (data.special === "sun") {
      const geo = new THREE.SphereGeometry(data.radius, 64, 64);
      const mat = new THREE.MeshBasicMaterial({ map: createSunTexture() });
      const mesh = new THREE.Mesh(geo, mat);
      group.add(mesh);
      entry.visualMesh = mesh;
      mesh.userData.id = data.id;
      clickTargets.push(mesh);
    } else {
      const geo = new THREE.SphereGeometry(data.radius, 48, 48);
      const matParams = { color: data.color, roughness: 0.95, metalness: 0 };
      if (data.texture) {
        matParams.map = textureLoader.load(data.texture);
        matParams.color = 0xffffff;
      }
      const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial(matParams));
      group.add(mesh);
      entry.visualMesh = mesh;

      if (data.clouds) {
        const cloudGeo = new THREE.SphereGeometry(data.radius * 1.015, 48, 48);
        const cloudMat = new THREE.MeshStandardMaterial({
          map: textureLoader.load(data.clouds),
          transparent: true, opacity: 0.8, depthWrite: false
        });
        const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
        group.add(cloudMesh);
        entry.clouds = cloudMesh;
      }

      if (data.atmosphere) {
        const atmoGeo = new THREE.SphereGeometry(data.radius * 1.12, 48, 48);
        const atmoMat = new THREE.MeshBasicMaterial({
          color: 0x66ccff, transparent: true, opacity: 0.15,
          side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false
        });
        group.add(new THREE.Mesh(atmoGeo, atmoMat));
      }

      const hitGeo = new THREE.SphereGeometry(Math.max(data.radius * 3.5, 2.5), 12, 12);
      const hitMat = new THREE.MeshBasicMaterial({ visible: false });
      const hitMesh = new THREE.Mesh(hitGeo, hitMat);
      hitMesh.userData.id = data.id;
      group.add(hitMesh);
      clickTargets.push(hitMesh);

      const ring = createTargetRing("#7fd6ff");
      ring.scale.set(data.radius*2.6, data.radius*2.6, 1);
      group.add(ring);
    }

    if (data.orbitRadius > 0) {
      const ringGeo = new THREE.RingGeometry(data.orbitRadius - 0.04, data.orbitRadius + 0.04, 128);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x223148, side: THREE.DoubleSide, transparent: true, opacity: 0.3 });
      const orbitRing = new THREE.Mesh(ringGeo, ringMat);
      orbitRing.rotation.x = Math.PI / 2;
      scene.add(orbitRing);
    }

    bodyEntries[data.id] = entry;
  });
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
}

function onClick(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const hit = raycaster.intersectObjects(clickTargets)[0];
  if (hit) {
    focusBody(hit.object.userData.id);
  } else if (selectedId) {
    unfocusBody();
  }
}

function focusBody(id) {
  if (selectedId && bodyEntries[selectedId]) bodyEntries[selectedId].paused = false;

  const entry = bodyEntries[id];
  if (!entry) return;
  selectedId = id;
  entry.paused = true; // freeze its orbit so the camera can actually settle on it

  const pos = entry.group.position.clone();
  const dist = Math.max(entry.data.radius * 6.5, 11);
  cameraDesiredPos = pos.clone().add(new THREE.Vector3(dist * 0.55, dist * 0.35, dist));
  cameraTarget = pos;
  isFlying = true;

  nameTag.textContent = entry.data.name;
  nameTag.classList.add("visible");
  backBtn.classList.add("visible");
  hint.style.opacity = "0";

  playBodySound(entry.data);
}

function unfocusBody() {
  if (selectedId && bodyEntries[selectedId]) bodyEntries[selectedId].paused = false;
  selectedId = null;

  cameraDesiredPos = DEFAULT_CAM_POS.clone();
  cameraTarget = DEFAULT_TARGET.clone();
  isFlying = true;

  nameTag.classList.remove("visible");
  backBtn.classList.remove("visible");
  hint.style.opacity = "1";

  stopBodySound();
}

function animate() {
  requestAnimationFrame(animate);
  const dt = clock.getDelta();
  elapsed += dt;

  Object.values(bodyEntries).forEach(entry => {
    const { group, data, visualMesh, clouds, paused } = entry;
    if (data.orbitRadius > 0 && !paused) {
      entry.angle += data.orbitSpeed * dt * 10;
      group.position.x = Math.cos(entry.angle) * data.orbitRadius;
      group.position.z = Math.sin(entry.angle) * data.orbitRadius;
    }
    if (visualMesh) visualMesh.rotation.y += (data.rotationSpeed || 0);
    if (clouds) clouds.rotation.y += (data.rotationSpeed || 0) * 1.6;
  });

  if (isFlying && cameraDesiredPos) {
    camera.position.lerp(cameraDesiredPos, 0.07);
    controls.target.lerp(cameraTarget, 0.09);
    if (camera.position.distanceTo(cameraDesiredPos) < 0.4) isFlying = false;
  }
  if (selectedId && bodyEntries[selectedId] && !isFlying) {
    controls.target.copy(bodyEntries[selectedId].group.position);
  }

  controls.update();
  composer.render();
}
