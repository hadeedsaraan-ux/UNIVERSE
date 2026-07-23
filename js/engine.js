// ============================================================
// SOLAR SYSTEM ENGINE
// ============================================================
// Ye file stable hai — naya planet add karne ke liye ye file
// change nahi karni, sirf bodies-data.js mein object add karna hai.
// ============================================================

let scene, camera, renderer, controls, raycaster, mouse;
let bodyMeshes = {};       // id -> { mesh, data, angle }
let clock;
let selectedId = null;
let cameraTarget = new THREE.Vector3(0, 0, 0);
let cameraDesiredPos = null;
let isFlying = false;

const infoPanel = document.getElementById("info-panel");
const infoName = document.getElementById("info-name");
const infoFacts = document.getElementById("info-facts");
const hint = document.getElementById("hint");

init();
animate();

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 5000);
  camera.position.set(0, 60, 140);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  document.getElementById("scene-container").appendChild(renderer.domElement);

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 8;      // zoom in limit
  controls.maxDistance = 800;    // zoom out limit — poora system dekh sakein
  controls.target.set(0, 0, 0);

  // ambient + point light (sun-like)
  scene.add(new THREE.AmbientLight(0x334155, 0.5));
  const sunLight = new THREE.PointLight(0xffffff, 2, 0, 0.4);
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
  const starCount = 2500;
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
  const stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);
}

function buildBodies() {
  SOLAR_BODIES.forEach(data => {
    const geo = new THREE.SphereGeometry(data.radius, 48, 48);
    const matParams = { color: data.color };
    if (data.type === "star") {
      matParams.emissive = data.emissive || data.color;
      matParams.emissiveIntensity = 1;
    }
    const mat = data.type === "star"
      ? new THREE.MeshBasicMaterial({ color: data.color })
      : new THREE.MeshStandardMaterial(matParams);

    const mesh = new THREE.Mesh(geo, mat);
    mesh.userData.id = data.id;
    scene.add(mesh);

    // orbit ring (only for bodies that actually orbit something)
    if (data.orbitRadius > 0) {
      const ringGeo = new THREE.RingGeometry(data.orbitRadius - 0.04, data.orbitRadius + 0.04, 128);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x2a3a55, side: THREE.DoubleSide, transparent: true, opacity: 0.35 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      scene.add(ring);
    }

    bodyMeshes[data.id] = {
      mesh,
      data,
      angle: Math.random() * Math.PI * 2
    };
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
  const meshList = Object.values(bodyMeshes).map(b => b.mesh);
  const hit = raycaster.intersectObjects(meshList)[0];
  if (hit) {
    focusBody(hit.object.userData.id);
  }
}

function focusBody(id) {
  const entry = bodyMeshes[id];
  if (!entry) return;
  selectedId = id;

  const pos = entry.mesh.position.clone();
  const dist = Math.max(entry.data.radius * 6, 10);
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

  // orbit + rotate each body
  Object.values(bodyMeshes).forEach(entry => {
    const { mesh, data } = entry;
    if (data.orbitRadius > 0) {
      entry.angle += data.orbitSpeed * dt * 10;
      mesh.position.x = Math.cos(entry.angle) * data.orbitRadius;
      mesh.position.z = Math.sin(entry.angle) * data.orbitRadius;
    }
    mesh.rotation.y += (data.rotationSpeed || 0);
  });

  // smooth camera fly-to when a body is selected
  if (isFlying && cameraDesiredPos) {
    camera.position.lerp(cameraDesiredPos, 0.06);
    controls.target.lerp(cameraTarget, 0.08);
    if (camera.position.distanceTo(cameraDesiredPos) < 0.5) isFlying = false;
  }

  // keep camera target following the selected body if it's orbiting
  if (selectedId && bodyMeshes[selectedId]) {
    const followPos = bodyMeshes[selectedId].mesh.position;
    if (!isFlying) controls.target.lerp(followPos, 0.05);
  }

  controls.update();
  renderer.render(scene, camera);
}
