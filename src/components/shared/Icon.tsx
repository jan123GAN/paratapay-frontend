import React from "react";
import * as Icons from "lucide-react";

interface IconProps {
  name: keyof typeof Icons;
  size?: number;
  color?: string;
  className?: string;
}

const Icon: React.FC<IconProps> = ({ name, size = 24, color, className }) => {
  const LucideIcon = Icons[name] as React.ComponentType<Icons.LucideProps>;

  return LucideIcon ? (
    <LucideIcon size={size} color={color} className={className} />
  ) : null;
};

export default Icon;