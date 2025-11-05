import logo from "../img/deja-logo.png";

export function Logo({ className = "", showText = true, compact = false }: { className?: string; showText?: boolean; compact?: boolean }) {
  return (
    <div className={`flex items-center ${compact ? 'justify-center' : 'gap-3'} ${className}`}>
      <div className={`${compact ? 'w-10 h-10' : 'w-14 h-14'} rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0`}>
        <img
          src={logo}
          alt="Logo Deja"
          className="w-full h-full object-cover"
        />
      </div>
      {showText && <span className="text-3xl font-bold text-[#16808c]">Deja</span>}
    </div>
  );
}
