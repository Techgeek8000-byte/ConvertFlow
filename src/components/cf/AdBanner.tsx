interface AdBannerProps {
  label: string;
}

export default function AdBanner({ label }: AdBannerProps) {
  return (
    <div className="w-full py-3">
      <div className="cf-ad-placeholder w-full h-[90px] flex items-center justify-center">
        <span className="text-[10px] text-slate-600 uppercase tracking-wider">
          Advertisement
        </span>
      </div>
    </div>
  );
}