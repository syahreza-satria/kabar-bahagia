import { Marcellus, Nunito_Sans } from "next/font/google";

export const display = Marcellus({ variable: "--font-inv-display", subsets: ["latin"], weight: "400" });
export const body = Nunito_Sans({ variable: "--font-inv-body", subsets: ["latin"], weight: ["300", "400", "600"] });
