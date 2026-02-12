import { Link, useLocation } from "react-router-dom";
import { Moon, Sun, Sparkles, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent">
            LandingCraft AI
          </span>
        </Link>

        <nav className="flex items-center gap-2">
          <Button variant={location.pathname === "/" ? "secondary" : "ghost"} size="sm" asChild>
            <Link to="/">Generator</Link>
          </Button>
          <Button variant={location.pathname === "/history" ? "secondary" : "ghost"} size="sm" asChild>
            <Link to="/history">
              <History className="mr-1 h-4 w-4" />
              History
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </nav>
      </div>
    </header>
  );
}
