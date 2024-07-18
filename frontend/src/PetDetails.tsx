import { useParams } from "react-router-dom";

import { useGetPet } from "./queries/index.ts";
import { useMemo } from "react";

export function PetDetails() {
  const { name } = useParams();
  const { data: pet, isPending } = useGetPet(name ?? "");
  const lastUpdateStatus = pet?.last_update;
  const lastUpdate = useMemo(() => {
    return pet?.updates.find((update) => update.status === lastUpdateStatus)
  }, [pet?.updates, lastUpdateStatus]);
  return (
    <div>
      {isPending && <p>Loading...</p>}
      {pet && (
        <div>
          <h1>{pet.name}</h1>
          <p>status: {lastUpdateStatus ?? "unknown"}</p>
          <p>updated at: {lastUpdate?.completed_at || lastUpdate?.created_at}</p>
        </div>
      )}
    </div>
  );
}
