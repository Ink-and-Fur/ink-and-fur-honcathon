import { useToast } from "@/components/ui/use-toast";
import { useCreatePet } from "@/queries";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { createZipFromFiles } from "./zip";


export const FormSchema = z.object({
  petName: z.string(),
});


// eslint-disable-next-line react-refresh/only-export-components
export function usePetForm() {
  const { images, handleImageUpload } = useImageUpload();
  const { toast } = useToast();

  const { mutate: createPet } = useCreatePet();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      petName: "",
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      const zip = await createZipFromFiles(images);
      createPet(
        {
          name: data.petName,
          zip,
        },
        {
          onSuccess() {
            toast({ title: "Pet created!" });
            // Reset the form state, so dirty fields are no longer dirty
            form.reset(data);
          },
          onError(error) {
            toast({
              title: "No can create pet!",
              description: (
                <pre className="mt-2 w-[340px] rounded-md p-4" >
                  <code className="text-red-400">
                    {isErrorWithMessage(error) ? error.message : "Unknown error"}
                  </code>
                </pre>
              ),
            });
          },
        },
      );
    } catch {
      toast({
        title: "No can create pet!",
        description: (
          <pre className="mt-2 w-[340px] rounded-md p-4" >
            <code className="text-red-400">
              issu wif imagez
            </code>
          </pre>
        ),
      });
    }


  }

  return {
    onSubmit,
    form,
    images,
    handleImageUpload
  };
}

function isErrorWithMessage(e: unknown): e is { message: string } {
  return typeof e === "object" && e !== null && "message" in e;
}

// eslint-disable-next-line react-refresh/only-export-components
function useImageUpload() {
  const [images, setImages] = useState<File[]>([]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setImages([...images, ...Array.from(event.target.files)]);
    }
  };

  return {
    images,
    handleImageUpload,
  };
}
