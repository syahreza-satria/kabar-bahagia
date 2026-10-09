import { buildScene, palette } from "./builders";
import type { Ctx, SceneInput, SceneKind, SceneMode } from "./types";

const NEEDS_ENV: SceneKind[] = ["rings", "heart", "hearts", "bubbles", "stars", "petals"];

function isDark(css: string) {
  const m = css.trim().match(/^#([0-9a-f]{6})$/i);
  if (!m) return false;
  const n = parseInt(m[1], 16);
  const lum = (0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255;
  return lum < 0.4;
}

/**
 * Menjalankan satu adegan Three.js pada kanvas: renderer, kamera, cahaya, input pointer/seret,
 * ledakan percikan saat diketuk, dan jeda otomatis saat tidak terlihat. Mengembalikan fungsi dispose.
 */
export async function mountScene(
  canvas: HTMLCanvasElement,
  kind: SceneKind,
  mode: SceneMode,
  interactive: boolean,
): Promise<(() => void) | null> {
  const T = await import("three");

  let renderer: InstanceType<typeof T.WebGLRenderer>;
  try {
    renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: true });
  } catch {
    return null; // WebGL tidak tersedia: tampilan tetap utuh tanpa 3D
  }
  const low = window.innerWidth < 520 || (navigator.hardwareConcurrency ?? 8) <= 4;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, low ? 1.5 : 2));

  const css = getComputedStyle(canvas);
  const primary = new T.Color(css.getPropertyValue("--inv-scene").trim() || css.getPropertyValue("--inv-primary").trim() || "#c9a45c");
  const light = primary.clone().lerp(new T.Color("#ffffff"), 0.55);
  const dark = isDark(css.getPropertyValue("--inv-bg"));

  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.z = 14;

  const cleanups: (() => void)[] = [];
  const env = NEEDS_ENV.includes(kind);
  if (env) {
    // peta lingkungan studio: tanpa ini material logam terlihat hitam
    const { RoomEnvironment } = await import("three/examples/jsm/environments/RoomEnvironment.js");
    const pmrem = new T.PMREMGenerator(renderer);
    const tex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = tex;
    cleanups.push(() => {
      tex.dispose();
      pmrem.dispose();
    });
  }
  scene.add(new T.AmbientLight("#ffffff", 0.9));
  const key = new T.DirectionalLight("#ffffff", 2.2);
  key.position.set(4, 6, 8);
  scene.add(key);
  const rim = new T.PointLight(light, 30, 40);
  rim.position.set(-6, -3, 6);
  scene.add(rim);

  const dotCanvas = document.createElement("canvas");
  dotCanvas.width = dotCanvas.height = 64;
  const dg = dotCanvas.getContext("2d")!;
  const grad = dg.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.45, "rgba(255,255,255,0.9)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  dg.fillStyle = grad;
  dg.fillRect(0, 0, 64, 64);
  const dot = new T.CanvasTexture(dotCanvas);

  const ctx: Ctx = {
    dot,
    T,
    scene,
    primary,
    light,
    dark,
    mode,
    env,
    q: (n) => Math.max(1, Math.round(n * (low ? 0.6 : 1))),
  };
  const built = buildScene(kind, ctx);

  /* ---------- ledakan percikan saat diketuk ---------- */
  const SPARKS = 36;
  const sparkCols = palette(ctx);
  const sparks = Array.from({ length: 3 }, () => {
    const pos = new Float32Array(SPARKS * 3);
    const vel = new Float32Array(SPARKS * 3);
    const geo = new T.BufferGeometry();
    geo.setAttribute("position", new T.BufferAttribute(pos, 3));
    const mat = new T.PointsMaterial({
      size: 0.28,
      map: dot,
      sizeAttenuation: true,
      depthWrite: false,
      transparent: true,
      opacity: 0,
      blending: dark ? T.AdditiveBlending : T.NormalBlending,
    });
    const pts = new T.Points(geo, mat);
    pts.frustumCulled = false;
    scene.add(pts);
    return { pos, vel, geo, mat, life: 99 };
  });
  let sparkIdx = 0;
  const burstAt = (clientX: number, clientY: number) => {
    const r = canvas.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const ndc = new T.Vector3(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1, 0.5).unproject(camera);
    const dir = ndc.sub(camera.position).normalize();
    const p = camera.position.clone().add(dir.multiplyScalar(-camera.position.z / dir.z));
    const b = sparks[sparkIdx++ % sparks.length];
    for (let i = 0; i < SPARKS; i++) {
      const a = Math.random() * Math.PI * 2;
      const u = Math.random() * 2 - 1;
      const s = Math.sqrt(1 - u * u);
      const v = 2 + Math.random() * 3;
      b.vel.set([s * Math.cos(a) * v, u * v + 1, s * Math.sin(a) * v], i * 3);
      b.pos.set([p.x, p.y, p.z], i * 3);
    }
    b.life = 0;
    b.mat.color.copy(sparkCols[Math.floor(Math.random() * sparkCols.length)]);
  };

  /* ---------- input ---------- */
  const input: SceneInput = { x: 0, y: 0, scroll: 0, drag: 0 };
  const target = { x: 0, y: 0 };
  let dragging = false;
  let lastX = 0;
  let dragVel = 0;

  const onMove = (e: PointerEvent) => {
    target.x = (e.clientX / window.innerWidth - 0.5) * 2;
    target.y = (e.clientY / window.innerHeight - 0.5) * 2;
  };
  const onTilt = (e: DeviceOrientationEvent) => {
    if (e.gamma == null || e.beta == null) return;
    target.x = Math.max(-1, Math.min(1, e.gamma / 30));
    target.y = Math.max(-1, Math.min(1, (e.beta - 45) / 30));
  };
  const onTapWindow = (e: PointerEvent) => burstAt(e.clientX, e.clientY);

  if (mode === "cover") {
    window.addEventListener("pointermove", onMove);
    window.addEventListener("deviceorientation", onTilt);
    window.addEventListener("pointerdown", onTapWindow);
    cleanups.push(() => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("deviceorientation", onTilt);
      window.removeEventListener("pointerdown", onTapWindow);
    });
  }
  if (interactive) {
    const down = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      canvas.setPointerCapture(e.pointerId);
      burstAt(e.clientX, e.clientY);
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      dragVel = (e.clientX - lastX) * 0.012;
      lastX = e.clientX;
    };
    const up = () => (dragging = false);
    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);
    cleanups.push(() => {
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", up);
    });
  }

  /* ---------- ukuran & visibilitas ---------- */
  const resize = () => {
    const holder = canvas.parentElement ?? canvas;
    const w = holder.clientWidth;
    const h = holder.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas.parentElement ?? canvas);
  resize();

  let visible = true;
  const io = new IntersectionObserver((entries) => (visible = entries[0]?.isIntersecting ?? true));
  io.observe(canvas);

  /* ---------- loop ---------- */
  const start = performance.now();
  let last = start;
  let raf = 0;
  const loop = () => {
    raf = requestAnimationFrame(loop);
    const now = performance.now();
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (!visible || document.hidden) return;
    const t = (now - start) / 1000;

    // input halus + inersia seretan
    input.x += (target.x - input.x) * 0.06;
    input.y += (target.y - input.y) * 0.06;
    if (!dragging) dragVel *= 0.93;
    input.drag = dragVel;
    if (mode === "section") {
      const r = canvas.getBoundingClientRect();
      input.scroll = Math.min(1, Math.max(0, (window.innerHeight - r.top) / (window.innerHeight + r.height)));
    }

    built.update(t, dt, input);

    for (const b of sparks) {
      if (b.life > 1.2) continue;
      b.life += dt;
      for (let i = 0; i < SPARKS; i++) {
        const k = i * 3;
        b.vel[k + 1] -= 4 * dt;
        b.pos[k] += b.vel[k] * dt;
        b.pos[k + 1] += b.vel[k + 1] * dt;
        b.pos[k + 2] += b.vel[k + 2] * dt;
      }
      b.geo.attributes.position.needsUpdate = true;
      b.mat.opacity = Math.max(0, 1 - b.life / 1.2);
    }

    camera.position.x += (input.x * 1.6 - camera.position.x) * 0.04;
    camera.position.y += (-input.y * 1.0 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
  };
  loop();

  return () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    io.disconnect();
    cleanups.forEach((c) => c());
    scene.traverse((o) => {
      const obj = o as unknown as { geometry?: { dispose: () => void }; material?: unknown };
      obj.geometry?.dispose();
      const mats = Array.isArray(obj.material) ? obj.material : obj.material ? [obj.material] : [];
      for (const m of mats as { map?: { dispose: () => void } | null; dispose: () => void }[]) {
        m.map?.dispose();
        m.dispose();
      }
    });
    renderer.dispose();
    // lepas konteks WebGL segera (browser membatasi jumlahnya); tidak semua perangkat mendukung ekstensinya
    if (renderer.getContext().getExtension("WEBGL_lose_context")) renderer.forceContextLoss();
  };
}
