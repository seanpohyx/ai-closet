import { fal } from "@fal-ai/client";
import * as FileSystem from "expo-file-system/legacy";
import * as ImageManipulator from "expo-image-manipulator";

fal.config({ credentials: process.env.EXPO_PUBLIC_FAL_KEY });

export type TryOnRequest = {
  outfitImageUri: string;
  userPhotoUri: string;
};

export type TryOnResponse = {
  resultImageUri: string;
};

const uploadToFal = async (imageUri: string): Promise<string> => {
  const jpeg = await ImageManipulator.manipulateAsync(imageUri, [], {
    compress: 0.9,
    format: ImageManipulator.SaveFormat.JPEG,
  });
  const blob = await fetch(jpeg.uri).then((r) => r.blob());
  const url = await fal.storage.upload(blob);
  console.debug("[VTON Service] Uploaded image:", url);
  return url;
};

export const virtualTryOn = async (request: TryOnRequest): Promise<TryOnResponse> => {
  console.debug("[VTON Service] Request Initiated Time:", new Date().toISOString());
  try {
    console.debug("[VTON Service] Uploading images to fal.ai storage...");
    const [personImageUrl, clothingImageUrl] = await Promise.all([
      uploadToFal(request.userPhotoUri),
      uploadToFal(request.outfitImageUri),
    ]);

    console.debug("[VTON Service] Submitting try-on request...");
    const result = await fal.subscribe("fal-ai/image-apps-v2/virtual-try-on", {
      input: {
        person_image_url: personImageUrl,
        clothing_image_url: clothingImageUrl,
      },
      logs: false,
    });

    console.debug("[VTON Service] Process Complete Time:", new Date().toISOString());

    const imageUrl = (result.data as any)?.images?.[0]?.url;

    if (!imageUrl) {
      console.error("[VTON Service] Unexpected result shape:", JSON.stringify(result.data));
      throw new Error("No image URL in result");
    }

    // Download result into the documents directory so it survives cache
    // eviction and Expo Go sandbox path changes between launches.
    const localUri = `${FileSystem.documentDirectory}try-on-${Date.now()}.jpg`;
    const downloadResumable = FileSystem.createDownloadResumable(imageUrl, localUri);
    const downloadResult = await downloadResumable.downloadAsync();
    console.debug("[VTON Service] Download Complete Time:", new Date().toISOString());

    if (downloadResult?.status === 200) {
      return { resultImageUri: downloadResult.uri };
    }
    throw new Error("Failed to download result image");
  } catch (error) {
    console.error("Virtual try-on error:", error);
    throw error;
  }
};
