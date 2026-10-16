"use client";

import { useEffect, useId, useState } from "react";
import { MorphIcon } from "morphicons/react";
import { HugeiconsIcon, type HugeiconsIconProps } from "@hugeicons/react";
import {
  ArrowDown02Icon as arrowDown,
  ArrowLeft02Icon as arrowLeft,
  ArrowRight02Icon as arrowRight,
  ArrowUpRight01Icon as arrowUpRight,
  BeanIcon as bean,
  CheckIcon as check,
  ArrowDown01Icon as chevronDown,
  ArrowUp01Icon as chevronUp,
  FlowerIcon as flower,
  HandHeartIcon as handHeart,
  Home01Icon as house,
  Layers01Icon as layers,
  Leaf01Icon as leaf,
  LeafyGreenIcon as leafyGreen,
  Menu01Icon as menu,
  MinusSignIcon as minus,
  PlayIcon as play,
  Add01Icon as plus,
  Plant01Icon as sprout,
  PineTreeIcon as treePine,
  TreesIcon as trees,
  WheatIcon as wheat,
  Cancel01Icon as close,
  Call02Icon as phone,
  Location01Icon as location,
  Mail01Icon as mail,
  Facebook01Icon as facebook,
  InstagramIcon as instagram,
  YoutubeIcon as youtube,
  Linkedin01Icon as linkedin,
} from "@hugeicons/core-free-icons";

// Hugeicons Stroke Rounded is the single source of geometry across the site.
// Existing public names keep page code independent of the icon vendor.
const shapes = {
  ArrowDown: arrowDown,
  ArrowLeft: arrowLeft,
  ArrowRight: arrowRight,
  ArrowUpRight: arrowUpRight,
  Bean: bean,
  Check: check,
  ChevronDown: chevronDown,
  ChevronUp: chevronUp,
  Flower2: flower,
  HandHeart: handHeart,
  House: house,
  Layers3: layers,
  Leaf: leaf,
  LeafyGreen: leafyGreen,
  Menu: menu,
  Minus: minus,
  Play: play,
  Plus: plus,
  Sprout: sprout,
  TreePine: treePine,
  Trees: trees,
  Wheat: wheat,
  X: close,
  Phone: phone,
  Location: location,
  Mail: mail,
  Facebook: facebook,
  Instagram: instagram,
  YouTube: youtube,
  LinkedIn: linkedin,
};
type IconName = keyof typeof shapes;
type IconProps = Omit<
  HugeiconsIconProps,
  "icon" | "altIcon" | "showAlt" | "ref" | "name" | "from" | "to"
>;
const hoverShapes: Partial<Record<IconName, IconName>> = {
  ArrowRight: "ArrowUpRight",
  ArrowUpRight: "ArrowRight",
  Leaf: "LeafyGreen",
  LeafyGreen: "Leaf",
  Sprout: "Flower2",
  Flower2: "Sprout",
  Trees: "TreePine",
  TreePine: "Trees",
};

export function SiteIcon({
  name,
  activeName,
  ...props
}: IconProps & { name: IconName; activeName?: IconName }) {
  const uniqueId = useId();
  const id = props.id ?? `site-icon-${uniqueId}`;
  const [hovered, setHovered] = useState(false);

  // Animate when the whole control is hovered or keyboard-focused, not just its SVG.
  useEffect(() => {
    if (!hoverShapes[name] || activeName) return;
    const svg = document.getElementById(id);
    const control = svg?.closest("button, a, summary") ?? svg;
    if (!control) return;
    const enter = () => setHovered(true);
    const leave = () => setHovered(control.matches(":hover, :focus-within"));
    control.addEventListener("pointerenter", enter);
    control.addEventListener("pointerleave", leave);
    control.addEventListener("focusin", enter);
    control.addEventListener("focusout", leave);
    return () => {
      control.removeEventListener("pointerenter", enter);
      control.removeEventListener("pointerleave", leave);
      control.removeEventListener("focusin", enter);
      control.removeEventListener("focusout", leave);
    };
  }, [id, name, activeName]);

  const target = activeName ?? (hovered ? (hoverShapes[name] ?? name) : name);
  // Static icons retain the official Hugeicons SVG; interactive icons use the
  // same Hugeicons data with the existing morph engine for seamless state changes.
  if (!hoverShapes[name] && !activeName) {
    return (
      <HugeiconsIcon
        size={24}
        strokeWidth={1.7}
        aria-hidden="true"
        {...props}
        id={id}
        data-site-icon={name}
        data-icon-library="hugeicons"
        icon={shapes[name]}
      />
    );
  }
  return (
    <MorphIcon
      size={24}
      strokeWidth={1.7}
      spring={{ stiffness: 180, damping: 24 }}
      reducedMotion="user"
      {...props}
      id={id}
      data-site-icon={name}
      data-icon-library="hugeicons"
      icon={shapes[target]}
    />
  );
}

function createIcon(name: IconName) {
  function Icon(props: IconProps) {
    return <SiteIcon name={name} {...props} />;
  }
  Icon.displayName = name;
  return Icon;
}

export const ArrowDown = createIcon("ArrowDown");
export const ArrowLeft = createIcon("ArrowLeft");
export const ArrowRight = createIcon("ArrowRight");
export const ArrowUpRight = createIcon("ArrowUpRight");
export const Bean = createIcon("Bean");
export const Check = createIcon("Check");
export const ChevronDown = createIcon("ChevronDown");
export const Flower2 = createIcon("Flower2");
export const HandHeart = createIcon("HandHeart");
export const House = createIcon("House");
export const Layers3 = createIcon("Layers3");
export const Leaf = createIcon("Leaf");
export const LeafyGreen = createIcon("LeafyGreen");
export const Play = createIcon("Play");
export const Sprout = createIcon("Sprout");
export const TreePine = createIcon("TreePine");
export const Trees = createIcon("Trees");
export const Wheat = createIcon("Wheat");
export const X = createIcon("X");
