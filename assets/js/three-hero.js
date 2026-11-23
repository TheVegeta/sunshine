import * as THREE from 'three';

export function initHeroCanvas() {
  const container = document.querySelector('#hero-canvas');
  if (!container) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 8);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  const ambient = new THREE.AmbientLight(0xfff6ea, 1.1);
  scene.add(ambient);
  const key = new THREE.DirectionalLight(0xfff2df, 1.8);
  key.position.set(4, 5, 6);
  scene.add(key);
  const fill = new THREE.PointLight(0xc9a87a, 1.2, 30);
  fill.position.set(-5, -2, 5);
  scene.add(fill);

  const material = new THREE.MeshPhysicalMaterial({
    color: 0xd8c0a0,
    metalness: 0.55,
    roughness: 0.28,
    clearcoat: 0.8,
    clearcoatRoughness: 0.25,
    reflectivity: 0.7,
  });
  const matte = new THREE.MeshStandardMaterial({ color: 0xe8ddd0, metalness: 0.15, roughness: 0.6 });

  const group = new THREE.Group();
  scene.add(group);

  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.35, 0.17, 48, 120), material);
  ring.rotation.x = Math.PI * 0.42;
  ring.rotation.y = Math.PI * 0.15;
  group.add(ring);

  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.08, 32, 100), matte);
  ring2.position.set(1.1, -0.5, -0.4);
  ring2.rotation.x = Math.PI * 0.62;
  ring2.rotation.y = -Math.PI * 0.25;
  group.add(ring2);

  const beadGeo = new THREE.SphereGeometry(0.13, 32, 32);
  for (let i = 0; i < 18; i++) {
    const bead = new THREE.Mesh(beadGeo, i % 3 === 0 ? material : matte);
    const a = (i / 18) * Math.PI * 2;
    const r = 2.1 + Math.sin(i * 1.7) * 0.25;
    bead.position.set(Math.cos(a) * r, Math.sin(a * 1.3) * 0.8, Math.sin(a) * r * 0.45);
    bead.scale.setScalar(0.7 + (i % 4) * 0.18);
    group.add(bead);
  }

  // Soft particles
  const pCount = 90;
  const pPos = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount; i++) {
    pPos[i * 3] = (Math.random() - 0.5) * 14;
    pPos[i * 3 + 1] = (Math.random() - 0.5) * 10;
    pPos[i * 3 + 2] = (Math.random() - 0.5) * 6 - 1;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({ color: 0xb79b77, size: 0.035, transparent: true, opacity: 0.55, depthWrite: false });
  const points = new THREE.Points(pGeo, pMat);
  scene.add(points);

  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  const onPointer = (e) => {
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = (e.clientY / window.innerHeight) * 2 - 1;
    pointer.tx = x; pointer.ty = y;
  };
  window.addEventListener('pointermove', onPointer, { passive: true });

  let scrollY = 0;
  const onScroll = () => { scrollY = window.scrollY || 0; };
  window.addEventListener('scroll', onScroll, { passive: true });

  function resize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  const clock = new THREE.Clock();
  let raf;
  function animate() {
    raf = requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    pointer.x += (pointer.tx - pointer.x) * 0.035;
    pointer.y += (pointer.ty - pointer.y) * 0.035;

    const scrollFactor = Math.min(scrollY / (window.innerHeight * 1.2), 1);
    group.rotation.y = t * 0.12 + pointer.x * 0.35;
    group.rotation.x = Math.sin(t * 0.2) * 0.08 + pointer.y * 0.18 + scrollFactor * 0.25;
    group.position.y = Math.sin(t * 0.35) * 0.08 - scrollFactor * 0.35;
    ring2.rotation.z = t * 0.08;
    points.rotation.y = t * 0.015 + pointer.x * 0.04;
    points.position.y = -scrollFactor * 0.2;

    if (!reduce) renderer.render(scene, camera);
  }

  if (reduce) {
    renderer.render(scene, camera);
  } else {
    animate();
  }

  // cleanup on page hide for sanity
  window.addEventListener('pagehide', () => { cancelAnimationFrame(raf); renderer.dispose(); }, { once: true });
}