import logo from "../img/deja-logo.png";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="w-14 h-14 rounded-lg overflow-hidden flex items-center justify-center">
        <img
          src={logo}
          alt="Logo Deja"
          className="w-full h-full object-cover"
        />
      </div>
      <span className="text-3xl font-bold text-[#16808c]">Deja</span>
    </div>
  );
}
