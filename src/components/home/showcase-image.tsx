import Image from "next/image";

const photographs = {
  portrait: { src: "/images/showcase/people/portrait.webp", width: 451, height: 900 },
  mugs: { src: "/images/showcase/products/mugs.webp", width: 574, height: 328 },
  dog: { src: "/images/showcase/objects/dog.webp", width: 403, height: 441 },
  original: { src: "/images/showcase/examples/mugs-original.webp", width: 640, height: 426 },
  cutout: { src: "/images/showcase/examples/mugs-cutout.webp", width: 640, height: 426 },
} as const;

export function ShowcaseImage({ name, alt, className, sizes }: {
  name: keyof typeof photographs;
  alt: string;
  className?: string;
  sizes: string;
}) {
  return <Image {...photographs[name]} alt={alt} className={className}
    sizes={sizes} loading="lazy" decoding="async" />;
}
