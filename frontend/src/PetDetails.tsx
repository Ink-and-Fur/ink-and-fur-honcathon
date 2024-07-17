import {useParams} from "react-router-dom";

import {useGetPet} from "./queries/index.ts";

export function PetDetails() {
  const { name } = useParams();
  const { data: pet, isPending } = useGetPet(name);
  return (
    <div>
      <h1>{name}</h1>
      {isPending && <p>Loading...</p>}
      {pet && (
        <div>
          <p>{pet.name}</p>
        </div>
      )}
    </div>
  )
}