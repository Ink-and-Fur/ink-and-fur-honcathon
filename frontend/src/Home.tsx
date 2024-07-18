import { Cat, Dog, PawPrint } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react"
import { Skeleton } from "@/components/ui/skeleton";
import { ImageUpload } from "./PetForm/ImageUpload.tsx";
import { LoggedInLayout } from "./LoggedInLayout.tsx";
import { usePetForm } from "./PetForm/form.tsx";
import { Form, FormField } from "./components/ui/form.tsx";
import { useGetPets } from "./queries/index.ts";
import { useNavigate } from "react-router-dom";
import { cn } from "./lib/utils.ts"

export function SkeletonLoading() {
  return (
    <div className="flex flex-col gap-2 items-center justify-center w-full">
      <div className="flex gap-4 w-full">
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-6 w-1/2" />
      </div>
      <div className="flex gap-4 w-full">
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-6 w-1/2" />
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
              create your pet &lt;3
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
                    placeholder="Paco da Corgi"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </div>
              )}
            />
            <FormField
              control={form.control}
              name="petType"
              render={({ field }) => (
                <div className="grid gap-3">
                  <Label htmlFor="pet_type">cat or dog?</Label>
                  <Select
                    onValueChange={(value) => field.onChange(value)}
                    value={field.value}
                  >
                    <SelectTrigger
                      id="pet_type"
                      className="items-start [&_[data-description]]:hidden"
                      onChange={(value) => console.log(value)}
                    >
                      <SelectValue placeholder="Select a pet type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cat">
                        <div className="flex items-start gap-3 text-muted-foreground">
                          <div className="grid gap-0.5">
                            <p>
                              <span className="font-medium text-foreground">
                                cat
                              </span>
                            </p>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="dog">
                        <div className="flex items-start gap-3 text-muted-foreground">
                          <div className="grid gap-0.5">
                            <p>
                              <span className="font-medium text-foreground">
                                dog
                              </span>
                            </p>
                          </div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
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
        <div className="grid rounded-lg min-w-full lg:p-2.5">
          <div className="rounded-lg border">
            <legend className="ml-3 -mt-2.5 lg:-mt-2.5 lg:ml-2 bg-white inline-flex w-[85px] px-1 text-sm font-medium">
              ur beebees
            </legend>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-4"><span className="sr-only">pet type</span></TableHead>
                  <TableHead>name</TableHead>
                  <TableHead className="w-[100px]">status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pets.jobs.map((pet: { id: number; name: string; type: string; last_update?: string }) => (
                  <TableRow className="p-1 cursor-pointer" key={pet.name} onClick={
                    () => {
                      navigate(`/pet/${pet.name}`)
                    }
                  }>
                    <TableCell className="py-2">
                      {pet.type === "dog" ? <Dog className="inline w-4 h-4 text-muted-foreground" /> : <Cat className="inline w-4 h-4 text-muted-foreground" />}
                    </TableCell>
                    <TableCell className="py-2">
                      {pet.name}
                    </TableCell>
                    <TableCell className={cn("py-2", {
                      "text-green-600": pet?.last_update === "succeeded",
                    })}>
                      {pet?.last_update ?? "unknown"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </>
  )
}
