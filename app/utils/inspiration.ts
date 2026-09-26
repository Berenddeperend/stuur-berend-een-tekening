export type InspirationVocab = {
  adjectives: string[];
  subjects: string[];
  activities: string[];
  /**
   * Article to place in front of the adjective. Omitted for locales that bake
   * an invariant article into the lead sentence — Dutch says "Teken een ..."
   * with no agreement to resolve, so there is nothing for the component to add.
   */
  article?: (adjective: string) => string;
};

/**
 * The three lists are kept the same length and in the same order across
 * locales on purpose: the pick is stored as three *positions* rather than
 * three words (see InspirationGenerator.vue), so switching NL <-> EN shows the
 * same creature doing the same thing in the other language instead of
 * re-rolling. Keep translations aligned line-for-line when editing.
 */
export const inspirationVocab: Record<string, InspirationVocab> = {
  nl: {
    adjectives:
      "grote kleine schattige sterke dronken sexy onhandige gladde muzikale hongerige".split(" "),
    subjects:
      "kip hamster hond kat pony schildpad walvis acrobaat clown detective dokter bouwvakker muzikant cowboy politicus dino".split(
        " ",
      ),
    activities: [
      "op stelten",
      "in de kroeg",
      "aan het fietsen",
      "op vakantie",
      "in de bergen",
      "aan het tekenen",
      "aan het skinny dippen",
      "in een trein",
      "op een skateboard",
      "in bad",
      "aan het zingen",
      "aan het zeilen",
      "aan het eten",
    ],
  },
  en: {
    // Dutch adjectives are inflected ("grote", "kleine"); English has no
    // agreement, so these are plain base forms.
    adjectives: "big tiny adorable strong drunk sexy clumsy slippery musical hungry".split(" "),
    subjects:
      "chicken hamster dog cat pony turtle whale acrobat clown detective doctor builder musician cowboy politician dino".split(
        " ",
      ),
    activities: [
      "on stilts",
      "at the pub",
      "riding a bike",
      "on holiday",
      "in the mountains",
      "drawing",
      "skinny dipping",
      "on a train",
      "on a skateboard",
      "in the bath",
      "singing",
      "sailing",
      "eating",
    ],
    article: (adjective) => (/^[aeiou]/i.test(adjective) ? "an" : "a"),
  },
};
