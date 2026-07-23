// ============================================================
// SOLAR SYSTEM ENGINE
// ============================================================
// Ye file stable hai — naya planet add karne ke liye ye file
// change nahi karni, sirf bodies-data.js mein object add karna hai.
// ============================================================

let scene, camera, renderer, controls, raycaster, mouse;
let bodyEntries = {};      // id -> { group, data, angle, visualMesh, clouds, corona[] }
let clickTargets = [];     // flat list of invisible hit-spheres for raycasting
let clock, elapsed = 0;
let selectedId = null;
let cameraTarget = new THREE.Vector3(0, 0, 0);
let cameraDesiredPos = null;
let isFlying = false;

const textureLoader = new THREE.TextureLoader();

const infoPanel = document.getElementById("info-panel");
const infoName = document.getElementById("info-name");
const infoFacts = document.getElementById("info-facts");
const hint = document.getElementById("hint");

init();
animate();

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 5000);
  camera.position.set(0, 45, 100);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  document.getElementById("scene-container").appendChild(renderer.domElement);

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 6;
  controls.maxDistance = 900;
  controls.target.set(0, 0, 0);

  scene.add(new THREE.AmbientLight(0x223344, 0.35));
  const sunLight = new THREE.PointLight(0xffffff, 2.2, 0, 0.35);
  sunLight.position.set(0, 0, 0);
  scene.add(sunLight);

  addStarfield();
  buildBodies();

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();
  clock = new THREE.Clock();

  window.addEventListener("resize", onResize);
  renderer.domElement.addEventListener("click", onClick);
  document.getElementById("close-info").addEventListener("click", closeInfo);
}

function addStarfield() {
  const starGeo = new THREE.BufferGeometry();
  const starCount = 3000;
  const positions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const radius = 600 + Math.random() * 900;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.cos(phi);
    positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
  }
  starGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 1.1, sizeAttenuation: true });
  scene.add(new THREE.Points(starGeo, starMat));
}

// ---------- procedural sun surface texture (canvas, no download needed) ----------
function createSunTexture() {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext("2d");

  const grad = ctx.createRadialGradient(size/2, size/2, size*0.1, size/2, size/2, size*0.7);
  grad.addColorStop(0, "#fff3c4");
  grad.addColorStop(0.4, "#ffcf4d");
  grad.addColorStop(0.75, "#ff9d2e");
  grad.addColorStop(1, "#ff6a1f");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // granulation blotches
  for (let i = 0; i < 900; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 4 + Math.random() * 14;
    const shade = Math.random() > 0.5 ? "rgba(255,220,140,0.18)" : "rgba(200,70,10,0.18)";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI*2);
    ctx.fillStyle = shade;
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

// ---------- corona glow sprite (canvas radial gradient, additive) ----------
function createCoronaSprite(innerColor, outerColor, size, opacity) {
  const canvasSize = 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvasSize; canvas.height = canvasSize;
  const ctx = canvas.getContext("2d");
  const grad = ctx.createRadialGradient(canvasSize/2, canvasSize/2, 0, canvasSize/2, canvasSize/2, canvasSize/2);
  grad.addColorStop(0, innerColor);
  grad.addColorStop(0.5, outerColor);
  grad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvasSize, canvasSize);

  const tex = new THREE.CanvasTexture(canvas);
  const mat = new THREE.SpriteMaterial({
    map: tex, transparent: true, opacity,
    blending: THREE.AdditiveBlending, depthWrite: false
  });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(size, size, 1);
  return sprite;
}

// ---------- small billboard ring to show a body is clickable ----------
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
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0.45, depthWrite: false });
  return new THREE.Sprite(mat);
}

function buildBodies() {
  SOLAR_BODIES.forEach(data => {
    const group = new THREE.Group();
    scene.add(group);
    const entry = { group, data, angle: Math.random() * Math.PI * 2, corona: [] };

    if (data.special === "sun") {
      const geo = new THREE.SphereGeometry(data.radius, 64, 64);
      const mat = new THREE.MeshBasicMaterial({ map: createSunTexture() });
      const mesh = new THREE.Mesh(geo, mat);
      group.add(mesh);
      entry.visualMesh = mesh;

      const c1 = createCoronaSprite("rgba(255,255,230,0.9)", "rgba(255,190,60,0.6)", data.radius*3.4, 0.55);
      const c2 = createCoronaSprite("rgba(255,170,60,0.6)", "rgba(255,90,20,0.25)", data.radius*5.2, 0.35);
      group.add(c1, c2);
      entry.corona.push(c1, c2);

      // sun is huge — click target = the sun mesh itself is big enough
      mesh.userData.id = data.id;
      clickTargets.push(mesh);
    } else {
      const geo = new THREE.SphereGeometry(data.radius, 48, 48);
      const matParams = { color: data.color, roughness: 0.9, metalness: 0 };
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
          transparent: true, opacity: 0.85, depthWrite: false
        });
        const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
        group.add(cloudMesh);
        entry.clouds = cloudMesh;
      }

      if (data.atmosphere) {
        const atmoGeo = new THREE.SphereGeometry(data.radius * 1.12, 48, 48);
        const atmoMat = new THREE.MeshBasicMaterial({
          color: 0x66ccff, transparent: true, opacity: 0.18,
          side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false
        });
        group.add(new THREE.Mesh(atmoGeo, atmoMat));
      }

      // invisible larger hit-sphere so small/far bodies are easy to click
      const hitGeo = new THREE.SphereGeometry(Math.max(data.radius * 3.5, 2.5), 12, 12);
      const hitMat = new THREE.MeshBasicMaterial({ visible: false });
      const hitMesh = new THREE.Mesh(hitGeo, hitMat);
      hitMesh.userData.id = data.id;
      group.add(hitMesh);
      clickTargets.push(hitMesh);

      // subtle ring to hint "this is clickable"
      const ring = createTargetRing("#7fd6ff");
      ring.scale.set(data.radius*2.6, data.radius*2.6, 1);
      group.add(ring);
    }

    // orbit ring on the ecliptic
    if (data.orbitRadius > 0) {
      const ringGeo = new THREE.RingGeometry(data.orbitRadius - 0.04, data.orbitRadius + 0.04, 128);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x2a3a55, side: THREE.DoubleSide, transparent: true, opacity: 0.35 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      scene.add(ring);
    }

    bodyEntries[data.id] = entry;
  });
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onClick(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const hit = raycaster.intersectObjects(clickTargets)[0];
  if (hit) focusBody(hit.object.userData.id);
}

function focusBody(id) {
  const entry = bodyEntries[id];
  if (!entry) return;
  selectedId = id;

  const pos = entry.group.position.clone();
  const dist = Math.max(entry.data.radius * 7, 12);
  cameraDesiredPos = pos.clone().add(new THREE.Vector3(dist * 0.6, dist * 0.4, dist));
  cameraTarget = pos;
  isFlying = true;

  showInfo(entry.data);
  narrateFacts(entry.data.facts);
  hint.style.opacity = "0";
}

function showInfo(data) {
  infoName.textContent = data.name;
  infoFacts.innerHTML = "";
  data.facts.forEach(f => {
    const li = document.createElement("li");
    li.textContent = f;
    infoFacts.appendChild(li);
  });
  infoPanel.classList.add("visible");
}

function closeInfo() {
  infoPanel.classList.remove("visible");
  stopNarration();
  selectedId = null;
}

function animate() {
  requestAnimationFrame(animate);
  const dt = clock.getDelta();
  elapsed += dt;

  Object.values(bodyEntries).forEach(entry => {
    const { group, data, visualMesh, clouds, corona } = entry;
    if (data.orbitRadius > 0) {
      entry.angle += data.orbitSpeed * dt * 10;
      group.position.x = Math.cos(entry.angle) * data.orbitRadius;
      group.position.z = Math.sin(entry.angle) * data.orbitRadius;
    }
    if (visualMesh) visualMesh.rotation.y += (data.rotationSpeed || 0);
    if (clouds) clouds.rotation.y += (data.rotationSpeed || 0) * 1.6;
    if (corona && corona.length) {
      const pulse = 1 + Math.sin(elapsed * 0.8) * 0.05;
      corona.forEach((c, i) => { c.scale.set(c.scale.x, c.scale.x, 1); });
      const base1 = data.radius * 3.4, base2 = data.radius * 5.2;
      corona[0].scale.set(base1*pulse, base1*pulse, 1);
      corona[1].scale.set(base2*(1/pulse), base2*(1/pulse), 1);
    }
  });

  if (isFlying && cameraDesiredPos) {
    camera.position.lerp(cameraDesiredPos, 0.06);
    controls.target.lerp(cameraTarget, 0.08);
    if (camera.position.distanceTo(cameraDesiredPos) < 0.5) isFlying = false;
  }
  if (selectedId && bodyEntries[selectedId] && !isFlying) {
    controls.target.lerp(bodyEntries[selectedId].group.position, 0.05);
  }

  controls.update();
  renderer.render(scene, camera);
}
