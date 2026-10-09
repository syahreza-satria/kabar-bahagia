import type { Built, Ctx, SceneKind } from "./types";

const rnd = (a = 0, b = 1) => a + Math.random() * (b - a);
const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

/** Warna percikan/kembang api; di latar terang dipilih yang lebih pekat agar terlihat. */
export function palette(ctx: Ctx) {
  const { T, primary, light, dark } = ctx;
  return dark
    ? [primary, light, new T.Color("#ffd166"), new T.Color("#ff6b9a"), new T.Color("#6bd6ff")]
    : [primary, primary.clone().lerp(new T.Color("#000"), 0.25), new T.Color("#e0a100"), new T.Color("#d6336c"), new T.Color("#1c8fd1")];
}

function heartGeometry(ctx: Ctx) {
  const { T } = ctx;
  const s = new T.Shape();
  s.moveTo(0.25, 0.25);
  s.bezierCurveTo(0.25, 0.25, 0.2, 0, 0, 0);
  s.bezierCurveTo(-0.3, 0, -0.3, 0.35, -0.3, 0.35);
  s.bezierCurveTo(-0.3, 0.55, -0.1, 0.77, 0.25, 0.95);
  s.bezierCurveTo(0.6, 0.77, 0.8, 0.55, 0.8, 0.35);
  s.bezierCurveTo(0.8, 0.35, 0.8, 0, 0.5, 0);
  s.bezierCurveTo(0.35, 0, 0.25, 0.25, 0.25, 0.25);
  const g = new T.ExtrudeGeometry(s, { depth: 0.25, bevelEnabled: true, bevelSize: 0.06, bevelThickness: 0.06, bevelSegments: 3 });
  g.center();
  return g;
}

type Mode = "float" | "fall" | "rise";

/** Sebaran objek melayang/jatuh/naik; mengembalikan fungsi update. */
function floaters(ctx: Ctx, geo: unknown, mats: unknown[], count: number, mode: Mode, scale: [number, number], edge = false) {
  const { T, scene } = ctx;
  const items = Array.from({ length: count }, (_, i) => {
    const mesh = new T.Mesh(geo as never, mats[i % mats.length] as never);
    mesh.scale.setScalar(rnd(scale[0], scale[1]));
    mesh.position.set((Math.random() - 0.5) * 12, (Math.random() - 0.5) * 18, (Math.random() - 0.5) * 8 - 1);
    // hanya di tepi layar supaya teks tetap terbaca
    if (edge) mesh.position.x = (Math.random() < 0.5 ? 1 : -1) * rnd(3.6, 6.4);
    mesh.rotation.set(rnd(0, 6), rnd(0, 6), rnd(0, 6));
    scene.add(mesh);
    return { mesh, speed: rnd(0.25, 0.75), spin: rnd(0.2, 1), phase: rnd(0, 10), drift: rnd(0.3, 0.9) };
  });
  return (t: number, dt: number) => {
    for (const f of items) {
      const m = f.mesh;
      if (mode === "fall") {
        m.position.y -= f.speed * dt * 2.2;
        m.position.x += Math.sin(t * f.drift + f.phase) * dt * 0.8;
        if (m.position.y < -9) m.position.y = 9;
      } else if (mode === "rise") {
        m.position.y += f.speed * dt * 1.6;
        m.position.x += Math.sin(t * f.drift + f.phase) * dt * 0.5;
        if (m.position.y > 9) m.position.y = -9;
      } else {
        m.position.y += Math.sin(t * f.speed + f.phase) * dt * 0.7;
      }
      m.rotation.x += f.spin * dt;
      m.rotation.y += f.spin * dt * 0.7;
    }
  };
}

const metal = (ctx: Ctx) =>
  new ctx.T.MeshStandardMaterial({ color: ctx.primary, metalness: 1, roughness: 0.28, envMapIntensity: 1.3 });
const soft = (ctx: Ctx) =>
  new ctx.T.MeshStandardMaterial({ color: ctx.light, metalness: 0.2, roughness: 0.55, side: ctx.T.DoubleSide });

/* ------------------------------------------------------------------ */

function rings(ctx: Ctx): Built {
  const { T, scene } = ctx;
  const group = new T.Group();
  const geo = new T.TorusGeometry(1.5, 0.17, 32, 96);
  const m = metal(ctx);
  const a = new T.Mesh(geo, m);
  const b = new T.Mesh(geo, m);
  // dua cincin saling mengait: bidang XY dan XZ
  a.position.x = -0.75;
  b.position.x = 0.75;
  b.rotation.x = Math.PI / 2;
  group.add(a, b);
  scene.add(group);
  const baseY = ctx.mode === "cover" ? 3.2 : 0;
  const dust = floaters(ctx, new T.OctahedronGeometry(0.16), [m, soft(ctx)], ctx.q(16), "float", [0.4, 1.4]);
  group.rotation.set(0.5, 0.4, 0);
  if (ctx.mode === "section") group.scale.setScalar(1.5);
  return {
    update(t, dt, input) {
      group.rotation.y += (input.x * 0.9 - group.rotation.y) * 0.05 * (ctx.mode === "cover" ? 1 : 0) + 0.006 + input.drag;
      group.rotation.x += ((ctx.mode === "cover" ? input.y * 0.4 : 0.5 + input.scroll * 0.8) - group.rotation.x) * 0.05;
      group.position.y = baseY + Math.sin(t * 0.9) * 0.25;
      dust(t, dt);
    },
  };
}

function simpleFloaters(ctx: Ctx, kind: "hearts" | "petals" | "stars" | "wire" | "bubbles"): Built {
  const { T } = ctx;
  let geo: unknown;
  let mats: unknown[];
  let count: number;
  let mode: Mode = "float";
  let scale: [number, number] = [0.5, 1.4];

  if (kind === "hearts") {
    geo = heartGeometry(ctx);
    mats = [soft(ctx), metal(ctx), soft(ctx)];
    count = ctx.q(18);
    scale = [0.5, 1.4];
  } else if (kind === "petals") {
    const g = new T.SphereGeometry(0.5, 20, 12);
    g.scale(0.8, 0.08, 1.2);
    geo = g;
    mats = [soft(ctx), soft(ctx), metal(ctx)];
    count = ctx.q(30);
    mode = "fall";
  } else if (kind === "stars") {
    geo = new T.OctahedronGeometry(0.1);
    mats = [soft(ctx), metal(ctx), soft(ctx)];
    count = ctx.q(90);
    scale = [0.3, 1.2];
  } else if (kind === "wire") {
    geo = new T.IcosahedronGeometry(0.7, 1);
    mats = [new T.MeshBasicMaterial({ color: ctx.primary, wireframe: true, transparent: true, opacity: 0.5 })];
    count = ctx.q(14);
    scale = [0.45, 1.05];
  } else {
    geo = new T.SphereGeometry(0.4, 24, 16);
    mats = [new T.MeshPhysicalMaterial({ color: ctx.light, metalness: 0, roughness: 0.05, transmission: 0.9, thickness: 0.6, transparent: true, opacity: 0.55 })];
    count = ctx.q(26);
    mode = "rise";
  }
  const run = floaters(ctx, geo, mats, count, mode, scale, kind === "wire" && ctx.mode === "cover");
  return { update: (t, dt) => run(t, dt) };
}

/* ---------------------------- baru ---------------------------- */

function galaxy(ctx: Ctx): Built {
  const { T, scene } = ctx;
  const N = ctx.q(ctx.mode === "cover" ? 7000 : 5000);
  const pos = new Float32Array(N * 3);
  const col = new Float32Array(N * 3);
  const inner = ctx.light;
  const outer = ctx.primary.clone().lerp(new T.Color("#6ea8ff"), ctx.dark ? 0.45 : 0.2);
  const c = new T.Color();
  const radius = 7.5;
  for (let i = 0; i < N; i++) {
    const r = Math.random() * radius;
    const branch = ((i % 4) / 4) * Math.PI * 2;
    const spin = r * 1.1;
    const rand = () => Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.35 * r;
    pos[i * 3] = Math.cos(branch + spin) * r + rand();
    pos[i * 3 + 1] = rand() * 0.6;
    pos[i * 3 + 2] = Math.sin(branch + spin) * r + rand();
    c.copy(inner).lerp(outer, r / radius);
    col.set([c.r, c.g, c.b], i * 3);
  }
  const geo = new T.BufferGeometry();
  geo.setAttribute("position", new T.BufferAttribute(pos, 3));
  geo.setAttribute("color", new T.BufferAttribute(col, 3));
  const mat = new T.PointsMaterial({
    size: ctx.mode === "cover" ? 0.1 : 0.13,
    map: ctx.dot,
    sizeAttenuation: true,
    depthWrite: false,
    vertexColors: true,
    transparent: true,
    opacity: ctx.mode === "cover" ? 0.5 : 0.95,
    blending: ctx.dark ? T.AdditiveBlending : T.NormalBlending,
  });
  const pts = new T.Points(geo, mat);
  pts.rotation.x = 1.15;
  scene.add(pts);
  return {
    update(_t, dt, input) {
      pts.rotation.y += dt * 0.08 + input.drag;
      pts.rotation.x = 1.15 + input.y * 0.25;
      pts.rotation.z = input.x * 0.2 + input.scroll * 0.8;
    },
  };
}

function glowTexture(ctx: Ctx) {
  const { T } = ctx;
  const cv = document.createElement("canvas");
  cv.width = cv.height = 64;
  const g = cv.getContext("2d")!;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.35, "rgba(255,255,255,0.35)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  return new T.CanvasTexture(cv);
}

function lanterns(ctx: Ctx): Built {
  const { T, scene } = ctx;
  const body = new T.CylinderGeometry(0.32, 0.22, 0.65, 14, 1, true);
  const flame = new T.SphereGeometry(0.1, 10, 8);
  const glowTex = glowTexture(ctx);
  const items = Array.from({ length: ctx.q(14) }, () => {
    const g = new T.Group();
    g.add(new T.Mesh(body, new T.MeshBasicMaterial({ color: pick([0xff9a3c, 0xffb454, 0xff7a45]), side: T.DoubleSide, transparent: true, opacity: 0.92 })));
    g.add(new T.Mesh(flame, new T.MeshBasicMaterial({ color: 0xfff1a8 })));
    const glow = new T.Sprite(
      new T.SpriteMaterial({ map: glowTex, color: 0xffa94d, transparent: true, depthWrite: false, blending: ctx.dark ? T.AdditiveBlending : T.NormalBlending, opacity: 0.8 }),
    );
    glow.scale.setScalar(2.6);
    g.add(glow);
    g.scale.setScalar(rnd(0.5, 1.0));
    g.position.set((Math.random() - 0.5) * 11, rnd(-9, 9), rnd(-6, 2));
    scene.add(g);
    return { g, glow, speed: rnd(0.3, 0.8), drift: rnd(0.3, 0.8), phase: rnd(0, 10) };
  });
  return {
    update(t, dt) {
      for (const l of items) {
        l.g.position.y += l.speed * dt * 0.9;
        l.g.position.x += Math.sin(t * l.drift + l.phase) * dt * 0.4;
        l.g.rotation.z = Math.sin(t * l.drift + l.phase) * 0.12;
        (l.glow.material as { opacity: number }).opacity = 0.65 + Math.sin(t * 6 + l.phase) * 0.15;
        if (l.g.position.y > 9.5) l.g.position.y = -9.5;
      }
    },
  };
}

function fireworks(ctx: Ctx): Built {
  const { T, scene } = ctx;
  const P = ctx.q(90);
  const cols = palette(ctx);
  const bursts = Array.from({ length: ctx.q(5) < 3 ? 3 : 5 }, (_, bi) => {
    const pos = new Float32Array(P * 3);
    const vel = new Float32Array(P * 3);
    const geo = new T.BufferGeometry();
    geo.setAttribute("position", new T.BufferAttribute(pos, 3));
    const mat = new T.PointsMaterial({
      size: 0.3,
      map: ctx.dot,
      sizeAttenuation: true,
      depthWrite: false,
      transparent: true,
      opacity: 0,
      blending: ctx.dark ? T.AdditiveBlending : T.NormalBlending,
      color: pick(cols),
    });
    const pts = new T.Points(geo, mat);
    pts.frustumCulled = false;
    scene.add(pts);
    return { pos, vel, geo, mat, life: 0, max: 2, delay: bi * 0.7 };
  });

  const spawn = (b: (typeof bursts)[number]) => {
    const ox = rnd(-4.5, 4.5);
    const oy = rnd(-1, 5);
    const oz = rnd(-3, 1);
    const speed = rnd(2.4, 4.4);
    for (let i = 0; i < P; i++) {
      // arah acak di permukaan bola
      const u = Math.random() * 2 - 1;
      const th = Math.random() * Math.PI * 2;
      const s = Math.sqrt(1 - u * u);
      const v = speed * rnd(0.6, 1);
      b.vel.set([s * Math.cos(th) * v, u * v, s * Math.sin(th) * v], i * 3);
      b.pos.set([ox, oy, oz], i * 3);
    }
    b.life = 0;
    b.max = rnd(1.8, 2.6);
    b.mat.color.copy(pick(cols));
  };

  return {
    update(_t, dt) {
      for (const b of bursts) {
        if (b.delay > 0) {
          b.delay -= dt;
          b.mat.opacity = 0;
          if (b.delay <= 0) spawn(b);
          continue;
        }
        b.life += dt;
        for (let i = 0; i < P; i++) {
          const k = i * 3;
          b.vel[k + 1] -= 2.2 * dt;
          b.vel[k] *= 0.985;
          b.vel[k + 2] *= 0.985;
          b.pos[k] += b.vel[k] * dt;
          b.pos[k + 1] += b.vel[k + 1] * dt;
          b.pos[k + 2] += b.vel[k + 2] * dt;
        }
        b.geo.attributes.position.needsUpdate = true;
        const f = b.life / b.max;
        b.mat.opacity = Math.max(0, 1 - f * f);
        b.mat.size = 0.3 * (1 - f * 0.5);
        if (b.life >= b.max) b.delay = rnd(0.2, 1.2);
      }
    },
  };
}

function butterflies(ctx: Ctx): Built {
  const { T, scene } = ctx;
  const wingGeo = new T.CircleGeometry(0.5, 20);
  wingGeo.scale(0.85, 1, 1);
  const cols = [ctx.primary, ctx.light, new T.Color("#ffd166"), new T.Color("#ff9ec4"), new T.Color("#8fd3ff")];
  const items = Array.from({ length: ctx.q(9) }, (_, i) => {
    const mat = new T.MeshBasicMaterial({ color: cols[i % cols.length], side: T.DoubleSide, transparent: true, opacity: 0.92 });
    const g = new T.Group();
    const left = new T.Group();
    const right = new T.Group();
    const lw = new T.Mesh(wingGeo, mat);
    lw.position.x = -0.42;
    left.add(lw);
    const rw = new T.Mesh(wingGeo, mat);
    rw.position.x = 0.42;
    right.add(rw);
    const bodyMesh = new T.Mesh(new T.CapsuleGeometry(0.06, 0.45, 4, 8), new T.MeshBasicMaterial({ color: 0x3a2a20 }));
    g.add(left, right, bodyMesh);
    g.scale.setScalar(rnd(0.32, 0.62));
    scene.add(g);
    return { g, left, right, cx: (Math.random() < 0.5 ? -1 : 1) * rnd(0.5, 2.4), cy: rnd(-5, 6), rx: rnd(1.2, 2.6), ry: rnd(1.2, 3), a: rnd(0.2, 0.5), b: rnd(0.25, 0.6), ph: rnd(0, 10), flap: rnd(9, 14), z: rnd(-3, 1.5), px: 0, py: 0 };
  });
  return {
    update(t, _dt, input) {
      for (const b of items) {
        const x = b.cx + Math.sin(t * b.a + b.ph) * b.rx + input.x * 0.8;
        const y = b.cy + Math.cos(t * b.b + b.ph) * b.ry - input.y * 0.5;
        b.g.rotation.z = Math.atan2(y - b.py, x - b.px) - Math.PI / 2;
        b.px = x;
        b.py = y;
        b.g.position.set(x, y, b.z);
        const w = Math.sin(t * b.flap + b.ph) * 0.95;
        b.left.rotation.y = w;
        b.right.rotation.y = -w;
      }
    },
  };
}

function heart(ctx: Ctx): Built {
  const { T, scene } = ctx;
  const group = new T.Group();
  const geo = heartGeometry(ctx);
  const main = new T.Mesh(
    geo,
    new T.MeshPhysicalMaterial({ color: ctx.primary, metalness: 0.25, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.15, envMapIntensity: 1.2 }),
  );
  const baseScale = ctx.mode === "cover" ? 1.9 : 2.9;
  main.scale.setScalar(baseScale);
  group.add(main);
  const small = Array.from({ length: ctx.q(10) }, (_, i) => {
    const m = new T.Mesh(geo, i % 2 ? soft(ctx) : metal(ctx));
    m.scale.setScalar(0.32);
    scene.add(m);
    return { m, r: rnd(2.8, 4.2), tilt: rnd(0, Math.PI), sp: rnd(0.35, 0.8), ph: rnd(0, 6.28) };
  });
  scene.add(group);
  group.position.y = ctx.mode === "cover" ? 3.2 : 0;
  return {
    update(t, dt, input) {
      // detak ganda ala jantung
      const beat = Math.pow(Math.max(0, Math.sin(t * 5.2)), 8) * 0.18 + Math.pow(Math.max(0, Math.sin(t * 5.2 - 0.9)), 8) * 0.1;
      main.scale.setScalar(baseScale * (1 + beat));
      group.rotation.y += dt * 0.5 + input.drag + (ctx.mode === "cover" ? input.x * 0.01 : 0);
      group.rotation.x += ((ctx.mode === "cover" ? input.y * 0.3 : input.scroll * 0.6 - 0.2) - group.rotation.x) * 0.05;
      for (const s of small) {
        const a = t * s.sp + s.ph;
        s.m.position.set(Math.cos(a) * s.r, Math.sin(a) * s.r * Math.sin(s.tilt) + group.position.y, Math.sin(a) * s.r * Math.cos(s.tilt));
        s.m.rotation.y += dt * 1.5;
      }
    },
  };
}

export function buildScene(kind: SceneKind, ctx: Ctx): Built {
  switch (kind) {
    case "rings":
      return rings(ctx);
    case "galaxy":
      return galaxy(ctx);
    case "lanterns":
      return lanterns(ctx);
    case "fireworks":
      return fireworks(ctx);
    case "butterflies":
      return butterflies(ctx);
    case "heart":
      return heart(ctx);
    default:
      return simpleFloaters(ctx, kind);
  }
}
