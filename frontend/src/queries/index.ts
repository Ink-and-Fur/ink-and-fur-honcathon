import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";

function getPets() {
  return fetch("/api/jobs").then((r) => r.json());
}

export function useGetPets() {
  const query = useQuery({
    queryKey: ["pets"],
    queryFn: getPets,
  });

  return query;
}

function getPet(name: string) {
  return fetch(`/api/jobs/${name}`).then((r) => r.json());
}

export function useGetPet(name: string) {
  const query = useQuery({
    queryKey: ["pets", name],
    queryFn: () => getPet(name),
  });

  return query;
}

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

function generatePetPicture({ name, prompt, negative }: { name: string; prompt: string; negative: string }) {
  return fetch("/api/generate", {
    method: "POST",
    body: JSON.stringify({ name, prompt, negative }),
  }).then((r) => r.json());
}

export function useGeneratePetPicture() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: generatePetPicture,
    onSuccess: () => {
      // Invalidate and refetch requestor requests
      queryClient.invalidateQueries({
        queryKey: ["pets"],
      });
    },
  });

  return mutation;
}