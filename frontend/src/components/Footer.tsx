import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="bg-[#16808c] text-white py-3 fixed bottom-0 left-0 right-0 lg:left-64 z-30">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-2">
          <Logo className="[&>div]:bg-white [&>div]:text-[#16808c] [&>span]:text-white [&>div]:w-7 [&>div]:h-7 [&>span]:text-sm" />
          <div className="text-[10px] text-center md:text-right">
            <p className="mb-0">
              © 2025 Deja App. Todos os direitos reservados à{" "}
              <a 
                href="https://redboxtecnologia.com.br/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-medium hover:text-[#6cced9] transition-colors underline"
              >
                Redbox Tecnologia
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
