import { useParams } from "react-router-dom";

import { useGetPet } from "./queries/index.ts";

export function PetDetails() {
  const { name } = useParams();
  const { data: pet, isPending } = useGetPet(name);
  const latestUpdate = pet.updates.reverse()[0];
  return (
    <div>
      {isPending && <p>Loading...</p>}
      {pet && (
        <div>
          <h1>{pet.name}</h1>
          <p>status: {latestUpdate.status}</p>
          <p>updated at: {latestUpdate.created_at}</p>
        </div>
      )}
    </div>
  );
}
