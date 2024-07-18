import { useParams } from "react-router-dom";
import { useMemo, useState } from "react";

import { useGetPet } from "./queries/index.ts";
import {
  Bird,
  Book,
  Bot,
  Code2,
  CornerDownLeft,
  LifeBuoy,
  Mic,
  Paperclip,
  Rabbit,
  Settings,
  Settings2,
  Share,
  SquareTerminal,
  Triangle,
  Turtle,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "./components/ui/button.tsx";

const prompts = {
  custom: "a custom prompt",
  sailor:
    "a TOK dog in a sailor costume, oil painting, royal navy, high seas, deep focus, fantasy, matte",
  pirate:
    "a TOK dog in a pirate costume, charcoal drawing, high seas, scallywag, eyepatch, fantasy, matte",
  wanted:
    "a potrait of a TOK dog in an Old West 'wanted' poster, pencil sketch",
  "art-deco-1":
    "an Art Deco style portrait of a TOK dog, by Tamara de Lempicka, with sleek lines and luxurious details",
  "art-deco-2":
    "a TOK dog, Art Deco portrait by Sonia Delaunay, vibrant colors, rhythmic geometric patterns",
  fantasy:
    "a fantasy style portrait painting of a TOK dog in the style of francois boucher oil painting, rpg portrait",
  "art-nouveau":
    "a painting of a cute TOK dog by gustav klimt, art nouveau, watercolor, floral accents",
  "pop-art-1":
    "a 1960s illustrated pop art portrait of a TOK dog by David Hockney, close-up, flat areas of color, bold lines, geometric shapes",
  "pop-art-2":
    "a portrait of a TOK dog in a 1970s hippie costume, painting by Robert Rauschenberg, in the style of pop art",
};

export function PetDetails() {
  const { name } = useParams();
  const { data: pet, isPending } = useGetPet(name ?? "");
  const lastUpdateStatus = pet?.last_update;
  const lastUpdate = useMemo(() => {
    return pet?.updates.find((update) => update.status === lastUpdateStatus);
  }, [pet?.updates, lastUpdateStatus]);
  const [value, setValue] = useState("sailor");
  const [prompt, setPrompt] = useState("");
  const [negative, setNegative] = useState("");
  return (
    <div>
      {isPending && <p>Loading...</p>}
      {pet && (
        <div>
          <h1>{pet.name}</h1>
          <p>status: {lastUpdateStatus ?? "unknown"}</p>
          <p>
            updated at: {lastUpdate?.completed_at || lastUpdate?.created_at}
          </p>
        </div>
      )}
      {lastUpdateStatus === "succeeded" && (
        <form className="grid w-full items-start gap-6 overflow-auto p-4 pt-0">
          <fieldset className="grid gap-6 rounded-lg border p-4">
            <legend className="-ml-1 px-1 text-sm font-medium">
              Generate a photo
            </legend>
            <div className="grid gap-3">
              <Label htmlFor="prompt">Prompt</Label>
              <Select onValueChange={(value) => setValue(value)} value={value}>
                <SelectTrigger
                  id="model"
                  className="items-start [&_[data-description]]:hidden"
                  onChange={(value) => console.log(value)}
                >
                  <SelectValue placeholder="Select a prompt" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(prompts).map(([id, prompt]) => (
                    <SelectItem key={id} value={id}>
                      <div className="flex items-start gap-3 text-muted-foreground">
                        <div className="grid gap-0.5">
                          <p>
                            <span className="font-medium text-foreground">
                              {id}
                            </span>
                          </p>
                          <p className="text-xs" data-description>
                            {prompt}
                          </p>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Textarea
                id="prompt"
                placeholder="Enter a custom prompt"
                disabled={value !== "custom"}
                value={(value === "custom"
                  ? prompt
                  : prompts[value as keyof typeof prompts]).replaceAll(
                    "TOK",
                    pet?.name,
                  )}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <Textarea
                id="negative"
                placeholder="Enter a negative prompt"
                value={negative}
                onChange={(e) => setNegative(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="ml-auto gap-1.5 text-sm"
            >
              <Share className="size-3.5" />
              Generate
            </Button>
          </fieldset>
        </form>
      )}
    </div>
  );
}
