import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./button.module.scss";

type Variant = "primary" | "solid" | "secondary" | "ghost" | "danger";

type CommonProps = {
  variant?: Variant;
  icon?: string;
  children: ReactNode;
  className?: string;
};

type ButtonProps =
  | (CommonProps & { href: string } & Omit<React.ComponentProps<typeof Link>, "href" | "className" | "children">)
  | (CommonProps & { href?: undefined } & ButtonHTMLAttributes<HTMLButtonElement>);

/** Renders a <Link> when given an href, otherwise a <button>. */
export default function Button(props: ButtonProps) {
  const { variant = "primary", icon, children, className, ...rest } = props;
  const classes = `${styles.button} ${styles[variant]} ${className ?? ""}`;
  const content = (
    <>
      {children}
      {icon && (
        <span className="material-symbols-outlined" aria-hidden="true">
          {icon}
        </span>
      )}
    </>
  );

  if (props.href !== undefined) {
    const { href, ...linkRest } = rest as Omit<React.ComponentProps<typeof Link>, "className" | "children">;
    return (
      <Link className={classes} href={href} {...linkRest}>
        {content}
      </Link>
    );
  }

  const buttonRest = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button className={classes} type={buttonRest.type ?? "button"} {...buttonRest}>
      {content}
    </button>
  );
}
