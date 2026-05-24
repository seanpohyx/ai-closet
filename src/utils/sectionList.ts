import { ClothingItem } from "../types/ClothingItem";
import { Outfit } from "../types/Outfit";
import { categories } from "../data/categories";
import { occasions } from "../data/options";

export type GridSection<T> = {
  title: string;
  count: number;
  data: T[][];
};

export const chunkIntoRows = <T>(items: T[], columns: number): T[][] => {
  if (columns <= 0) return [];
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += columns) {
    rows.push(items.slice(i, i + columns));
  }
  return rows;
};

// Group clothing items into sections for a SectionList.
//   - activeCategory === "All" → sections keyed by top-level category, in `categories` order.
//   - otherwise → sections keyed by subcategory in `categories[activeCategory]` order.
// Items with no/unknown category (or, in a specific-category view, no/unknown subcategory)
// land in a final "Uncategorized" section so they remain findable.
// Each section's `data` is an array of rows (T[][]) of length up to `columns`.
export const groupClothingForSectionList = (
  items: ClothingItem[],
  activeCategory: string,
  columns: number
): GridSection<ClothingItem>[] => {
  const buckets = new Map<string, ClothingItem[]>();
  const uncategorized: ClothingItem[] = [];

  const useSubcategoryAxis = activeCategory !== "All" && activeCategory in categories;
  const allowedKeys: string[] = useSubcategoryAxis
    ? (categories as Record<string, string[]>)[activeCategory]
    : Object.keys(categories);

  for (const key of allowedKeys) buckets.set(key, []);

  for (const item of items) {
    if (useSubcategoryAxis) {
      if (item.subcategory && buckets.has(item.subcategory)) {
        buckets.get(item.subcategory)!.push(item);
      } else {
        uncategorized.push(item);
      }
    } else {
      if (item.category && buckets.has(item.category)) {
        buckets.get(item.category)!.push(item);
      } else {
        uncategorized.push(item);
      }
    }
  }

  const sections: GridSection<ClothingItem>[] = [];
  for (const key of allowedKeys) {
    const bucket = buckets.get(key)!;
    if (bucket.length === 0) continue;
    sections.push({ title: key, count: bucket.length, data: chunkIntoRows(bucket, columns) });
  }
  if (uncategorized.length > 0) {
    sections.push({
      title: "Uncategorized",
      count: uncategorized.length,
      data: chunkIntoRows(uncategorized, columns),
    });
  }
  return sections;
};

// Group outfits into sections keyed by occasion (order from src/data/options.ts).
// An outfit with multiple occasions appears in each matching section.
// Outfits with an empty occasion[] land in a final "Other" section.
export const groupOutfitsByOccasion = (
  outfits: Outfit[],
  columns: number
): GridSection<Outfit>[] => {
  const buckets = new Map<string, Outfit[]>();
  for (const occasion of occasions) buckets.set(occasion, []);
  const other: Outfit[] = [];

  for (const outfit of outfits) {
    if (!outfit.occasion || outfit.occasion.length === 0) {
      other.push(outfit);
      continue;
    }
    let matched = false;
    for (const occasion of outfit.occasion) {
      if (buckets.has(occasion)) {
        buckets.get(occasion)!.push(outfit);
        matched = true;
      }
    }
    if (!matched) other.push(outfit);
  }

  const sections: GridSection<Outfit>[] = [];
  for (const occasion of occasions) {
    const bucket = buckets.get(occasion)!;
    if (bucket.length === 0) continue;
    sections.push({ title: occasion, count: bucket.length, data: chunkIntoRows(bucket, columns) });
  }
  if (other.length > 0) {
    sections.push({ title: "Other", count: other.length, data: chunkIntoRows(other, columns) });
  }
  return sections;
};
