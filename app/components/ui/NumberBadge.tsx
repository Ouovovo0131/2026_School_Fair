interface NumberBadgeProps {
  value: number;
  className?: string;
}

export default function NumberBadge({ value, className = "" }: NumberBadgeProps) {
  return (
    <span className={`number-sticker ${className}`}>
      {String(value).padStart(2, "0")}
    </span>
  );
}
