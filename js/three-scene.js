/* SUNSHINE — WebGL scenes.
   One decorative sculptural hero and one faint ambient field for subpages.
   No colour literals are declared here: materials use their natural defaults
   and are tinted by the stylesheet's warm wash and by the environment map. */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

function makeRenderer(host) {
  try {
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.setSize(host.clientWidth || innerWidth, host.clientHeight || innerHeight, false);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.appendChild(renderer.domElement);
    return renderer;
  } catch (error) {
    host.classList.add('is-fallback');
    return null;
  }
}

function createScene(host, mode) {
  const renderer = makeRenderer(host);
  if (!renderer) return null;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(mode === 'hero' ? 34 : 40, 1, 0.1, 120);
  camera.position.set(0, 0, mode === 'hero' ? 8.6 : 13);

  let environment = null;
  try {
    const pmrem = new THREE.PMREMGenerator(renderer);
    environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = environment;
    pmrem.dispose();
  } catch (error) {
    // Environment map is a nicety; direct lights below are enough.
  }

  const key = new THREE.DirectionalLight();
  key.intensity = mode === 'hero' ? 2.4 : 1.2;
  key.position.set(4, 6, 7);
  scene.add(key);

  const fill = new THREE.DirectionalLight();
  fill.intensity = mode === 'hero' ? 1.1 : 0.5;
  fill.position.set(-6, -3, 4);
  scene.add(fill);

  const rim = new THREE.PointLight();
  rim.intensity = mode === 'hero' ? 26 : 8;
  rim.position.set(-3, 4, -3);
  scene.add(rim);

  const group = new THREE.Group();
  group.position.set(mode === 'hero' ? 1.9 : 3.4, mode === 'hero' ? 0.1 : 0, 0);
  scene.add(group);

  const sculpture = new THREE.Mesh(
    new THREE.TorusKnotGeometry(mode === 'hero' ? 1.62 : 1.2, mode === 'hero' ? 0.44 : 0.3, 240, 32, 2, 3),
    new THREE.MeshPhysicalMaterial({
      metalness: 0.92,
      roughness: 0.16,
      clearcoat: 1,
      clearcoatRoughness: 0.14,
      envMapIntensity: 1.5
    })
  );
  sculpture.rotation.set(0.5, 0.2, -0.35);
  group.add(sculpture);

  // Two very fine orbiting rings read as drawn lines around the form.
  const rings = [];
  for (let index = 0; index < 3; index += 1) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(2.45 + index * 0.42, 0.009, 6, 200),
      new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: mode === 'hero' ? 0.42 - index * 0.08 : 0.2,
        depthWrite: false
      })
    );
    ring.rotation.set(1.05 + index * 0.35, index * 0.6, index * 0.4);
    group.add(ring);
    rings.push(ring);
  }

  // A loose spiral of beads, like a half-finished strand on the table.
  const beadCount = mode === 'hero' ? 46 : 20;
  const beads = new THREE.InstancedMesh(
    new THREE.IcosahedronGeometry(mode === 'hero' ? 0.085 : 0.06, 2),
    new THREE.MeshPhysicalMaterial({ metalness: 0.85, roughness: 0.22, envMapIntensity: 1.2 }),
    beadCount
  );
  const dummy = new THREE.Object3D();
  for (let index = 0; index < beadCount; index += 1) {
    const angle = index * 0.62;
    const radius = 2.05 + Math.sin(index * 0.31) * 0.65;
    dummy.position.set(
      Math.cos(angle) * radius,
      Math.sin(angle * 0.74) * 1.45,
      Math.sin(angle) * radius * 0.55
    );
    const scale = 0.7 + (index % 5) * 0.12;
    dummy.scale.setScalar(scale);
    dummy.rotation.set(angle, angle * 0.5, 0);
    dummy.updateMatrix();
    beads.setMatrixAt(index, dummy.matrix);
  }
  beads.instanceMatrix.needsUpdate = true;
  group.add(beads);

  // Fine drifting dust gives the scene a little depth without noise.
  const dustCount = mode === 'hero' ? 260 : 120;
  const positions = new Float32Array(dustCount * 3);
  for (let index = 0; index < dustCount; index += 1) {
    positions[index * 3] = (Math.random() - 0.5) * 18;
    positions[index * 3 + 1] = (Math.random() - 0.5) * 11;
    positions[index * 3 + 2] = (Math.random() - 0.5) * 8;
  }
  const dustGeometry = new THREE.BufferGeometry();
  dustGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const dust = new THREE.Points(dustGeometry, new THREE.PointsMaterial({
    size: mode === 'hero' ? 0.022 : 0.016,
    transparent: true,
    opacity: mode === 'hero' ? 0.5 : 0.3,
    depthWrite: false
  }));
  scene.add(dust);

  const pointer = { x: 0, y: 0 };
  const current = { x: 0, y: 0 };
  let scrollOffset = 0;
  let running = true;
  const clock = new THREE.Clock();

  function onPointer(event) {
    pointer.x = (event.clientX / innerWidth - 0.5) * 2;
    pointer.y = (event.clientY / innerHeight - 0.5) * 2;
  }
  function onOrientation(event) {
    if (typeof event.gamma !== 'number' || typeof event.beta !== 'number') return;
    pointer.x = THREE.MathUtils.clamp(event.gamma / 35, -1, 1);
    pointer.y = THREE.MathUtils.clamp((event.beta - 45) / 35, -1, 1);
  }
  function onScroll() {
    scrollOffset = scrollY * 0.0006;
  }
  function onVisibility() {
    running = !document.hidden;
    if (running) clock.getDelta();
  }

  if (!reduced) {
    addEventListener('pointermove', onPointer, { passive: true });
    addEventListener('deviceorientation', onOrientation, { passive: true });
    addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
  }

  function resize() {
    const width = host.clientWidth || innerWidth;
    const height = host.clientHeight || innerHeight;
    if (!width || !height) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }
  const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
  observer ? observer.observe(host) : addEventListener('resize', resize);
  resize();

  function animate() {
    requestAnimationFrame(animate);
    if (!running) return;
    const delta = Math.min(clock.getDelta(), 0.05);
    const time = clock.elapsedTime;

    current.x += (pointer.x - current.x) * 0.045;
    current.y += (pointer.y - current.y) * 0.045;

    group.rotation.y += delta * (mode === 'hero' ? 0.11 : 0.05);
    group.rotation.x = current.y * 0.16 + scrollOffset * 0.4;
    sculpture.rotation.z = -0.35 + current.x * 0.12 + Math.sin(time * 0.28) * 0.06;
    sculpture.position.y = Math.sin(time * 0.42) * 0.09;
    group.position.x = (mode === 'hero' ? 1.9 : 3.4) + current.x * (mode === 'hero' ? 0.5 : 0.22);
    group.position.y = (mode === 'hero' ? 0.1 : 0) - current.y * 0.3;

    rings.forEach((ring, index) => {
      ring.rotation.z += delta * (index % 2 === 0 ? 0.08 : -0.06);
    });
    dust.rotation.y = time * 0.012;
    dust.rotation.x = current.y * 0.04;
    camera.position.z = (mode === 'hero' ? 8.6 : 13) + Math.sin(time * 0.18) * 0.16 - Math.abs(scrollOffset) * 1.2;

    renderer.render(scene, camera);
  }
  animate();

  // Static-but-present render for reduced-motion visitors.
  if (reduced) renderer.render(scene, camera);

  function dispose() {
    observer?.disconnect();
    removeEventListener('pointermove', onPointer);
    removeEventListener('deviceorientation', onOrientation);
    removeEventListener('scroll', onScroll);
    document.removeEventListener('visibilitychange', onVisibility);
    environment?.dispose();
    renderer.dispose();
  }
  addEventListener('pagehide', dispose, { once: true });
  return true;
}

export function initThree() {
  const hero = document.querySelector('.webgl-hero');
  const ambient = document.querySelector('.webgl-ambient');
  if (!hero && !ambient) return;
  if (!window.WebGLRenderingContext) {
    hero?.classList.add('is-fallback');
    ambient?.classList.add('is-fallback');
    return;
  }
  if (hero) createScene(hero, 'hero');
  if (ambient) createScene(ambient, 'ambient');
}
