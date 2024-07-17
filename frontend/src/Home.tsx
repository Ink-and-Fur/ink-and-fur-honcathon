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
import { LoggedInLayout } from "./LoggedInLayout.tsx"

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
    <LoggedInLayout />
  )
}

export function Home() {
  return (
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
  )
}
