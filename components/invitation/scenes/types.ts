export type ThreeNS = typeof import("three");

export type SceneKind =
  | "rings"
  | "hearts"
  | "petals"
  | "stars"
  | "wire"
  | "bubbles"
  | "galaxy"
  | "lanterns"
  | "fireworks"
  | "butterflies"
  | "heart";

/** cover: latar layar penuh; section: kanvas di dalam satu section. */
export type SceneMode = "cover" | "section";

export type SceneInput = {
  /** posisi pointer/kemiringan HP, -1..1 */
  x: number;
  y: number;
  /** progres scroll section (0..1), khusus mode section */
  scroll: number;
  /** pertambahan rotasi dari seretan (radian) pada frame ini */
  drag: number;
};

export type Built = { update: (t: number, dt: number, input: SceneInput) => void };

export type Ctx = {
  T: ThreeNS;
  scene: InstanceType<ThreeNS["Scene"]>;
  primary: InstanceType<ThreeNS["Color"]>;
  light: InstanceType<ThreeNS["Color"]>;
  /** latar gelap: pakai blending additive; latar terang: blending normal */
  dark: boolean;
  mode: SceneMode;
  /** skala jumlah objek menurut kemampuan perangkat */
  q: (n: number) => number;
  env: boolean;
  /** tekstur titik bulat lembut untuk material Points */
  dot: InstanceType<ThreeNS["CanvasTexture"]>;
};
