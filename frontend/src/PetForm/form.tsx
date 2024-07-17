import { useToast } from "@/components/ui/use-toast";
import { useCreatePet } from "@/queries";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";

export const FormSchema = z.object({
  petName: z.string(),
});


export function usePetForm() {
  const { toast } = useToast();

  const { mutate: createPet } = useCreatePet();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      petName: "",
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    createPet(
      {
        name: data.petName,
      },
      {
        onSuccess() {
          toast({ title: "Pet created!" });
          // Reset the form state, so dirty fields are no longer dirty
          form.reset(data);
        },
        onError(error) {
          toast({
            title: "Settings failed to update!",
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
  }

  return {
    onSubmit,
    form,
  };
}

function isErrorWithMessage(e: unknown): e is { message: string } {
  return typeof e === "object" && e !== null && "message" in e;
}