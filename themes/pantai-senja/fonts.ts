import { Fraunces, Nunito, Pacifico } from "next/font/google";

export const display = Fraunces({ variable: "--font-inv-display", subsets: ["latin"], weight: ["400", "600"] });
export const body = Nunito({ variable: "--font-inv-body", subsets: ["latin"], weight: ["300", "400", "600"] });
export const script = Pacifico({ variable: "--font-inv-script", subsets: ["latin"], weight: "400" });
