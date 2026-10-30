import {
  Bus,
  Clapperboard,
  HeartPulse,
  Receipt,
  ShoppingBag,
  Tag,
  Utensils,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

/** Literal class strings, so Tailwind sees every one of them at build time. */
const TONES = [
  "bg-cat-1-bg text-cat-1-fg",
  "bg-cat-2-bg text-cat-2-fg",
  "bg-cat-3-bg text-cat-3-fg",
  "bg-cat-4-bg text-cat-4-fg",
  "bg-cat-5-bg text-cat-5-fg",
  "bg-cat-6-bg text-cat-6-fg",
] as const;

/** Default categories get a fixed icon and tone so they never change colour. */
const KNOWN: Record<string, { icon: LucideIcon; tone: number }> = {
  food: { icon: Utensils, tone: 2 },
  transport: { icon: Bus, tone: 0 },
  bills: { icon: Receipt, tone: 5 },
  shopping: { icon: ShoppingBag, tone: 1 },
  entertainment: { icon: Clapperboard, tone: 4 },
  health: { icon: HeartPulse, tone: 3 },
  other: { icon: Tag, tone: 5 },
  uncategorized: { icon: Tag, tone: 5 },
};

/** Same name, same tone, every time and on every device. */
const toneForName = (name: string): number => {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.codePointAt(0)!) >>> 0;
  return hash % TONES.length;
};

const SIZES = {
  sm: "h-8 w-8 rounded-lg text-sm [&>svg]:h-4 [&>svg]:w-4",
  md: "h-10 w-10 rounded-xl text-base [&>svg]:h-5 [&>svg]:w-5",
  lg: "h-12 w-12 rounded-2xl text-lg [&>svg]:h-6 [&>svg]:w-6",
} as const;

type CategoryAvatarProps = {
  category: string;
  size?: keyof typeof SIZES;
  className?: string;
};

/** Rounded tile for a category: an icon for the defaults, the initial otherwise. */
const CategoryAvatar = ({
  category,
  size = "md",
  className,
}: CategoryAvatarProps) => {
  const name = category.trim();
  const known = KNOWN[name.toLowerCase()];
  const Icon = known?.icon;
  const initial = Array.from(name)[0]?.toUpperCase() ?? "?";
  const tone = TONES[known?.tone ?? toneForName(name.toLowerCase())];

  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center font-semibold",
        SIZES[size],
        tone,
        className,
      )}
    >
      {Icon ? <Icon /> : initial}
    </span>
  );
};

export default CategoryAvatar;
