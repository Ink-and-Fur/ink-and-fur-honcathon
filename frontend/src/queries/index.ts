import { useQueryClient, useMutation } from "@tanstack/react-query";

function createPet({ content }: { content: object }) {
  return fetch("/v0/jobs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content,
    }),
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
