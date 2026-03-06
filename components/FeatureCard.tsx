interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export default function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="card group hover:shadow-lg hover:shadow-olive-200/30 transition-all duration-300">
      <div className="w-12 h-12 rounded-xl bg-olive-100 flex items-center justify-center text-olive-700 mb-5 group-hover:bg-olive-200 transition-colors">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
