import { useQueryClient, useMutation } from "@tanstack/react-query";

// TODO - Add zip file...
function createPet({ name, zip }: { name: string; zip: Blob }) {
  const formData = new FormData();
  formData.append("name", name);
  formData.append("file", zip);

  return fetch("/api/jobs", {
    method: "POST",
    body: formData,
  }).then((r) => r.json());
}

export function useCreatePet() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: createPet,
    onSuccess: () => {
      // Invalidate and refetch requestor requests
      queryClient.invalidateQueries({
        queryKey: ["pets"],
      });
    },
  });

  return mutation;
}