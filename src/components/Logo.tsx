import { Link } from "@tanstack/react-router";

type LogoProps = {
  className?: string;
  showText?: boolean;
  textClassName?: string;
  imageClassName?: string;
  asLink?: boolean;
};

export function Logo({
  className = "",
  showText = true,
  textClassName = "text-lg",
  imageClassName = "size-8",
  asLink = true,
}: LogoProps) {
  const content = (
    <>
      <img
        src="/sahay-logo.png"
        alt=""
        className={`${imageClassName} invert dark:invert-0`}
        aria-hidden
      />
      {showText && (
        <span className={`font-brand tracking-tight ${textClassName}`}>Sahay</span>
      )}
    </>
  );

  const baseClass = `inline-flex items-center gap-2.5 ${className}`;

  if (asLink) {
    return (
      <Link to="/" className={baseClass}>
        {content}
      </Link>
    );
  }

  return <div className={baseClass}>{content}</div>;
}
