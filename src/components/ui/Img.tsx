/* eslint-disable @next/next/no-img-element */
import type { ImgHTMLAttributes } from "react";

/** Plain <img> for self-hosted static files (SVG logos, the portrait). No image CDN. */
export default function Img(props: ImgHTMLAttributes<HTMLImageElement> & { alt: string }) {
  return <img decoding="async" {...props} alt={props.alt} />;
}
