import {
  Book,
  Code2,
  LifeBuoy,
  PawPrint,
  Share,
  Triangle,
} from "lucide-react"

import { Button } from "@/components/ui/button"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react"
import { Link, Outlet } from "react-router-dom"
import { Skeleton } from "@/components/ui/skeleton"
import { ImageUpload } from "./ImageUpload.tsx";

export function SkeletonLoading() {
  return (
    <div className="h-screen w-screen flex items-center justify-center p-24">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-72 w-72" />
      </div>
    </div>
  )
}

/**
 * @NOTE - I commented out auth for now because it's a pain in the rumpus to test locally
 */
export default function HomeLayout() {
  // const { userId, isLoaded } = useAuth()
  // const navigate = useNavigate()

  // console.log('test', userId)

  // useEffect(() => {
  //   if (isLoaded && !userId) {
  //     navigate("/login")
  //   }
  // }, [isLoaded, navigate, userId])

  // if (!isLoaded) return <SkeletonLoading />

  return (
    <Outlet />
  )
}

export function Home() {
  return (
    <div className="grid h-screen w-full pl-[56px]">
      <aside className="inset-y fixed  left-0 z-20 flex h-full flex-col border-r">
        <div className="border-b p-2">
          <Button variant="outline" size="icon" aria-label="Home">
            <Triangle className="size-5 fill-foreground" />
          </Button>
        </div>
        <nav className="grid gap-1 p-2">
          <Tooltip>
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
          </Tooltip>
          <Tooltip>
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
          </Tooltip>
        </nav>
        <nav className="mt-auto grid gap-1 p-2">
          <Tooltip>
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
          </SignedOut>
        </nav>
      </aside>
      <div className="flex flex-col">
        <header className="sticky top-0 z-10 flex h-[57px] items-center gap-1 border-b bg-background px-4">
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
          <div
            className="relative flex flex-col items-start gap-8"
          >
            <form className="grid w-full items-start gap-6">
              <fieldset className="grid gap-6 rounded-lg border p-4">
                <legend className="-ml-1 px-1 text-sm font-medium">
                  Pet
                </legend>
                <div className="grid gap-3">
                  <Label htmlFor="pet_name">Name</Label>
                  <Input id="pet_name" type="text" placeholder="Larry" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <ImageUpload />
                </div>
              </fieldset>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}
