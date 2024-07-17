import { Share } from "lucide-react";
import { Outlet } from "react-router-dom";
import { Button } from "./components/ui/button";

export function LoggedInLayout() {
  return (
    <div className="grid h-screen w-full pl-[56px]">
      <aside className="inset-y fixed left-0 z-20 flex h-full flex-col ">
        <div className="py-1 px-2">
          <Button variant="outline" size="icon" aria-label="Home">
            <img src="/ink-and-fur-logo-md.png" alt="Ink &amp; Fur" className="size-6" />
          </Button>
        </div>
        <nav className="grid gap-1 p-2">
          {/* <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-lg"
                aria-label="Pets"
              >
                <PawPrint className="size-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={5}>
              Pets
            </TooltipContent>
          </Tooltip> */}
          {/* <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-lg"
                aria-label="API"
              >
                <Code2 className="size-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={5}>
              API
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-lg"
                aria-label="Documentation"
              >
                <Book className="size-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={5}>
              Documentation
            </TooltipContent>
          </Tooltip> */}
        </nav>
        <nav className="mt-auto grid gap-1 p-2">
          {/* <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="mt-auto rounded-lg"
                aria-label="Help"
              >
                <LifeBuoy className="size-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={5}>
              Help
            </TooltipContent>
          </Tooltip>
          <SignedIn>
            <Button
              variant="ghost"
              size="icon"
              className="mt-auto rounded-lg"
              aria-label="Account"
            >
              <UserButton afterSignOutUrl='/login' />
            </Button>
          </SignedIn>
          <SignedOut>
            <Link to="/login">Log In</Link>
          </SignedOut> */}
        </nav>
      </aside>
      <div className="flex flex-col">
        <header className="sticky top-0 z-10 flex h-[57px] items-center gap-1 bg-background px-4">
          <h1 className="text-xl font-semibold">Ink &amp; Fur</h1>
          <Button
            variant="outline"
            size="sm"
            className="ml-auto gap-1.5 text-sm"
          >
            <Share className="size-3.5" />
            Share
          </Button>
        </header>
        <main className="grid flex-1 gap-4 overflow-auto p-4 md:grid-cols-2">
          <Outlet />
        </main>
      </div>
    </div>
  )
}