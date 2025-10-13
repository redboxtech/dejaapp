import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="bg-[#16808c] text-white py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo className="[&>div]:bg-white [&>div]:text-[#16808c] [&>span]:text-white" />
          <div className="text-sm text-center md:text-right">
            <p className="mb-1">
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
