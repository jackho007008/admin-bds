import Image from "next/image";

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
}

export function Logo({ width = 180, height = 120, className }: LogoProps) {
  return (
    <div className={className}>
      <Image
        src="/images/logo.png"
        alt="Villa Booking Logo"
        width={width}
        height={height}
        priority
        className="object-contain"
      />
    </div>
  );
}
