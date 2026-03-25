import { PropsWithChildren } from "react";

interface ComicCardProps extends PropsWithChildren {
  highlighted?: boolean;
  className?: string;
  onClick?: () => void;
}

export default function ComicCard({
  highlighted = false,
  className = "",
  onClick,
  children,
}: ComicCardProps) {
  const highlightClass = highlighted ? "comic-card-highlight" : "comic-card-default";
  const interactiveClass = onClick ? "comic-card-interactive" : "";

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`comic-card ${highlightClass} ${interactiveClass} ${className}`}>
        {children}
      </button>
    );
  }

  return <div className={`comic-card ${highlightClass} ${className}`}>{children}</div>;
}
