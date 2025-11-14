import { ImagePart } from "../types";

/**
 * Converts a File object to a Base64 encoded string.
 * @param file The File object to convert.
 * @returns A promise that resolves with the Base64 string.
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Extract base64 data after the comma (data:image/jpeg;base64,...)
        resolve(reader.result.split(',')[1]);
      } else {
        reject(new Error("Failed to read file as Data URL."));
      }
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Creates an ImagePart object from a base64 string and mime type.
 * @param base64 The base64 encoded image data.
 * @param mimeType The MIME type of the image (e.g., 'image/png', 'image/jpeg').
 * @returns An ImagePart object.
 */
export const createImagePart = (base64: string, mimeType: string): ImagePart => {
  return {
    inlineData: {
      mimeType: mimeType,
      data: base64,
    },
  };
};

/**
 * Generates a placeholder image URL from Picsum.photos.
 * @param width The desired width of the image.
 * @param height The desired height of the image.
 * @returns A URL to a placeholder image.
 */
export const getPlaceholderImageUrl = (width: number, height: number): string => {
  return `https://picsum.photos/${width}/${height}`;
};
