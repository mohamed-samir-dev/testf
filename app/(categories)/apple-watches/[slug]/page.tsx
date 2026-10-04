import { slugConfigs } from "../../../lib/categoryConfig";

export { default, generateMetadata } from "../../[slug]/page";
export const revalidate = 18000;

export function generateStaticParams() {
  return Object.entries(slugConfigs)
    .filter(([_, config]) => config.parentHref === "/apple-watches")
    .map(([slug]) => ({ slug }));
}
