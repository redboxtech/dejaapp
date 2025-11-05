import { Logo } from "./Logo";

export function Footer({ isCollapsed }: { isCollapsed?: boolean }) {
  const hasSidebar = isCollapsed !== undefined;
  
  return (
    <footer 
      className="bg-[#16808c] text-white py-3 fixed left-0 right-0 z-20 transition-all duration-300"
      style={{
        bottom: "0",
        ...(hasSidebar ? {
          marginLeft: isCollapsed ? "5rem" : "16rem",
          width: isCollapsed ? "calc(100% - 5rem)" : "calc(100% - 16rem)",
        } : {
          marginLeft: "0",
          width: "100%",
        }),
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-2">
          <Logo className="[&>div]:bg-white [&>div]:text-[#16808c] [&>span]:text-white [&>div]:w-5 [&>div]:h-5 [&>span]:text-xs" />
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
