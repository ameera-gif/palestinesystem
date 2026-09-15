import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-accent text-white shadow-sm hover:bg-accent-dark hover:shadow-md",
  secondary: "bg-brand text-white shadow-sm hover:bg-brand-dark hover:shadow-md",
  outline: "border border-border bg-surface text-ink hover:bg-brand-light hover:border-brand/30",
  ghost: "text-ink hover:bg-black/5",
  danger: "bg-danger text-white shadow-sm hover:opacity-90 hover:shadow-md",
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: "text-sm px-3 py-1.5 rounded-md gap-1.5",
  md: "text-sm px-4 py-2.5 rounded-lg gap-2",
  lg: "text-base px-6 py-3 rounded-lg gap-2",
};

type BaseProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children?: React.ReactNode;
};

type ButtonAsButton = BaseProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type ButtonAsLink = BaseProps & { href: string } & Omit<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    "href"
  >;

export function Button(props: ButtonAsButton | ButtonAsLink) {
  const { variant = "primary", size = "md", className, children, ...rest } = props;
  const classes = cn(
    // ring-accent (not ring-brand) deliberately: several button variants sit
    // on the dark-green hero/trust sections, where a same-hue green ring
    // would nearly disappear against the background. The red accent stays
    // visible on both the ivory and dark-green surfaces the button appears
    // on, and ring-offset is skipped for the same reason — a fixed offset
    // color would only be correct on one of the two backgrounds.
    "inline-flex items-center justify-center font-medium transition-all duration-150 ease-out hover:-translate-y-0.5 active:translate-y-0 active:shadow-none disabled:opacity-50 disabled:pointer-events-none disabled:hover:translate-y-0 disabled:hover:shadow-none whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-bright",
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    className,
  );

  if ("href" in props && props.href) {
    const { href, ...anchorRest } = rest as Omit<ButtonAsLink, keyof BaseProps>;
    return (
      <Link href={href} className={classes} {...anchorRest}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}
