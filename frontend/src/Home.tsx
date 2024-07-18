import { PawPrint } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipTrigger,
// } from "@/components/ui/tooltip"
// import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react"
import { Skeleton } from "@/components/ui/skeleton";
import { ImageUpload } from "./PetForm/ImageUpload.tsx";
import { LoggedInLayout } from "./LoggedInLayout.tsx";
import { usePetForm } from "./PetForm/form.tsx";
import { Form, FormField } from "./components/ui/form.tsx";
import { useGetPets } from "./queries/index.ts";
import { useNavigate } from "react-router-dom";

export function SkeletonLoading() {
  return (
    <div className="h-screen w-screen flex items-center justify-center p-24">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-72 w-72" />
      </div>
    </div>
  );
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

  return <LoggedInLayout />;
}

export function Home() {
  const { data: pets, isPending } = useGetPets();
  const { form, onSubmit, images, handleImageUpload, handleRemoveImage } =
    usePetForm();
  const navigate = useNavigate();

  if (isPending) return <SkeletonLoading />;

  return (
    <>
      <Form {...form}>
        <form
          className="grid w-full items-start gap-6"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <fieldset className="grid gap-6 rounded-lg border p-4">
            <legend className="-ml-1 px-1 text-sm font-medium">
              Pet
            </legend>
            <FormField
              control={form.control}
              name="petName"
              render={({ field }) => (
                <div className="grid gap-3">
                  <Label htmlFor="pet_name">Name</Label>
                  <Input
                    id="pet_name"
                    type="text"
                    placeholder="Larry"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </div>
              )}
            />
            <div className="grid gap-4">
              <ImageUpload
                images={images}
                handleImageUpload={handleImageUpload}
                handleRemoveImage={handleRemoveImage}
              />
            </div>
            <Button type="submit">
              <PawPrint className="w-4 h-4 mr-2" />
            </Button>
          </fieldset>
        </form>
      </Form>
      {pets?.jobs.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pets.jobs.map((pet: { id: number; name: string }) => (
              <TableRow
                key={pet.name}
                onClick={() => {
                  navigate(`/pet/${pet.name}`);
                }}
              >
                <TableCell>{pet.name}</TableCell>
                <TableCell>
                  {/* Add any action buttons or links here */}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </>
  );
}
