interface SectionHeadingProps {
  label?: string;
  title: string;
  description?: string;
  center?: boolean;
}

export default function SectionHeading({
  label,
  title,
  description,
  center = false,
}: SectionHeadingProps) {
  return (
    <div className={`mb-12 ${center ? "text-center" : ""}`}>
      {label && (
        <span className="text-olive-500 text-sm font-medium tracking-wide uppercase mb-3 block">
          {label}
        </span>
      )}
      <h2 className="mb-4">{title}</h2>
      {description && (
        <p className="text-gray-600 max-w-2xl leading-relaxed text-base md:text-lg">
          {description}
        </p>
      )}
    </div>
  );
}
