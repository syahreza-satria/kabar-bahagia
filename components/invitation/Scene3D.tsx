"use client";

import { useEffect, useRef } from "react";

export type SceneKind = "rings" | "hearts" | "petals" | "stars";

/**
 * Adegan Three.js untuk cover: cincin emas, hati, atau kelopak 3D yang bereaksi pada
 * kursor/sentuhan. Three.js dimuat dinamis supaya tidak memperlambat render awal.
 */
export default function Scene3D({ kind }: { kind: SceneKind }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const THREE = await import("three");
      const canvas = canvasRef.current;
      if (disposed || !canvas) return;

      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      } catch {
        return; // WebGL tidak tersedia: cover tetap tampil tanpa 3D
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      const primary = new THREE.Color(getComputedStyle(canvas).getPropertyValue("--inv-primary").trim() || "#c9a45c");
      const light = primary.clone().lerp(new THREE.Color("#ffffff"), 0.55);

      const scene = new THREE.Scene();
      // peta lingkungan studio: tanpa ini material logam terlihat hitam
      const { RoomEnvironment } = await import("three/examples/jsm/environments/RoomEnvironment.js");
      const pmrem = new THREE.PMREMGenerator(renderer);
      const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      scene.environment = envTexture;
      if (disposed) {
        envTexture.dispose();
        pmrem.dispose();
        renderer.dispose();
        return;
      }
      const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
      camera.position.z = 14;
      scene.add(new THREE.AmbientLight("#ffffff", 0.9));
      const key = new THREE.DirectionalLight("#ffffff", 2.2);
      key.position.set(4, 6, 8);
      scene.add(key);
      const rim = new THREE.PointLight(light, 30, 40);
      rim.position.set(-6, -3, 6);
      scene.add(rim);

      const disposables: { dispose: () => void }[] = [];
      const track = <T extends { dispose: () => void }>(o: T) => (disposables.push(o), o);
      const group = new THREE.Group();
      scene.add(group);

      const metal = track(new THREE.MeshStandardMaterial({ color: primary, metalness: 1, roughness: 0.28, envMapIntensity: 1.3 }));
      const soft = track(new THREE.MeshStandardMaterial({ color: light, metalness: 0.2, roughness: 0.55, side: THREE.DoubleSide }));

      type Floater = { mesh: InstanceType<typeof THREE.Mesh>; speed: number; spin: number; phase: number; drift: number };
      const floaters: Floater[] = [];

      if (kind === "rings") {
        const geo = track(new THREE.TorusGeometry(1.5, 0.17, 32, 96));
        const a = new THREE.Mesh(geo, metal);
        const b = new THREE.Mesh(geo, metal);
        // dua cincin saling mengait: bidang XY dan XZ, jarak pusat = jari-jari
        a.position.x = -0.75;
        b.position.x = 0.75;
        b.rotation.x = Math.PI / 2;
        group.rotation.set(0.5, 0.4, 0);
        group.add(a, b);
        group.position.y = 3.2;
      }

      const count = kind === "rings" ? 16 : kind === "hearts" ? 18 : kind === "stars" ? 90 : 30;
      let geo: InstanceType<typeof THREE.BufferGeometry>;
      if (kind === "hearts") {
        const s = new THREE.Shape();
        s.moveTo(0.25, 0.25);
        s.bezierCurveTo(0.25, 0.25, 0.2, 0, 0, 0);
        s.bezierCurveTo(-0.3, 0, -0.3, 0.35, -0.3, 0.35);
        s.bezierCurveTo(-0.3, 0.55, -0.1, 0.77, 0.25, 0.95);
        s.bezierCurveTo(0.6, 0.77, 0.8, 0.55, 0.8, 0.35);
        s.bezierCurveTo(0.8, 0.35, 0.8, 0, 0.5, 0);
        s.bezierCurveTo(0.35, 0, 0.25, 0.25, 0.25, 0.25);
        geo = new THREE.ExtrudeGeometry(s, { depth: 0.25, bevelEnabled: true, bevelSize: 0.06, bevelThickness: 0.06, bevelSegments: 3 });
        geo.center();
      } else if (kind === "petals") {
        geo = new THREE.SphereGeometry(0.5, 20, 12);
        geo.scale(0.8, 0.08, 1.2);
      } else {
        geo = new THREE.OctahedronGeometry(kind === "stars" ? 0.1 : 0.16);
      }
      track(geo);

      for (let i = 0; i < count; i++) {
        const mesh = new THREE.Mesh(geo as unknown as ConstructorParameters<typeof THREE.Mesh>[0], kind === "rings" ? (i % 3 ? metal : soft) : i % 3 ? soft : metal);
        const scale = kind === "stars" ? 0.3 + Math.random() * 0.9 : kind === "rings" ? 0.5 + Math.random() * 1.1 : 0.5 + Math.random() * 0.9;
        mesh.scale.setScalar(scale);
        mesh.position.set((Math.random() - 0.5) * 12, (Math.random() - 0.5) * 18, (Math.random() - 0.5) * 8 - 1);
        mesh.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
        scene.add(mesh);
        floaters.push({
          mesh,
          speed: 0.25 + Math.random() * 0.5,
          spin: 0.2 + Math.random() * 0.8,
          phase: Math.random() * 10,
          drift: 0.3 + Math.random() * 0.6,
        });
      }

      const target = { x: 0, y: 0 };
      const onPointer = (e: PointerEvent) => {
        target.x = (e.clientX / window.innerWidth - 0.5) * 2;
        target.y = (e.clientY / window.innerHeight - 0.5) * 2;
      };
      const onTilt = (e: DeviceOrientationEvent) => {
        if (e.gamma == null || e.beta == null) return;
        target.x = Math.max(-1, Math.min(1, e.gamma / 30));
        target.y = Math.max(-1, Math.min(1, (e.beta - 45) / 30));
      };
      window.addEventListener("pointermove", onPointer);
      window.addEventListener("deviceorientation", onTilt);

      const resize = () => {
        const parent = canvas.parentElement;
        if (!parent) return;
        const { clientWidth: w, clientHeight: h } = parent;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      const ro = new ResizeObserver(resize);
      if (canvas.parentElement) ro.observe(canvas.parentElement);
      resize();

      const start = performance.now();
      let last = start;
      let raf = 0;
      const loop = () => {
        raf = requestAnimationFrame(loop);
        if (document.hidden) return;
        const now = performance.now();
        const t = (now - start) / 1000;
        const dt = Math.min((now - last) / 1000, 0.05);
        last = now;

        group.rotation.y += (target.x * 0.9 - group.rotation.y) * 0.05 + 0.006;
        group.rotation.x += (target.y * 0.4 - group.rotation.x) * 0.05;
        group.position.y = 3.2 + Math.sin(t * 0.9) * 0.25;

        for (const f of floaters) {
          const m = f.mesh;
          if (kind === "petals") {
            m.position.y -= f.speed * dt * 2.2;
            m.position.x += Math.sin(t * f.drift + f.phase) * dt * 0.8;
            if (m.position.y < -9) m.position.y = 9;
          } else {
            m.position.y += Math.sin(t * f.speed + f.phase) * dt * 0.7;
          }
          m.rotation.x += f.spin * dt;
          m.rotation.y += f.spin * dt * 0.7;
        }
        // parallax kamera mengikuti pointer / kemiringan HP
        camera.position.x += (target.x * 1.6 - camera.position.x) * 0.04;
        camera.position.y += (-target.y * 1.0 - camera.position.y) * 0.04;
        camera.lookAt(0, 0, 0);
        renderer.render(scene, camera);
      };
      loop();

      cleanup = () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        window.removeEventListener("pointermove", onPointer);
        window.removeEventListener("deviceorientation", onTilt);
        disposables.forEach((d) => d.dispose());
        envTexture.dispose();
        pmrem.dispose();
        renderer.dispose();
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, [kind]);

  return <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full" />;
}
