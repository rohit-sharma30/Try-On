import { GoogleGenAI, Modality, Type, GenerateContentResponse, FunctionDeclaration, GenerateContentParameters } from "@google/genai";
import { ImagePart, AspectRatio, VideoOperation, VideoResolution, ModelApiResponse, GenerationStreamResult } from '../types';

/**
 * Initializes and returns a new GoogleGenAI instance.
 * It's important to create a new instance right before making an API call
 * to ensure it uses the most up-to-date API key from the dialog.
 */
const getGeminiClient = () => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

const handleApiError = (error: any, feature: string) => {
  console.error(`Gemini API Error for ${feature}:`, error);
  let errorMessage = `Failed to ${feature}. Please try again.`;
  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'object' && error !== null && 'message' in error) {
    errorMessage = (error as { message: string }).message;
  }
  return errorMessage;
};

// ============================================================================
// Image Analysis (gemini-2.5-flash)
// ============================================================================
export const analyzeImage = async (imagePart: ImagePart, prompt: string): Promise<ModelApiResponse> => {
  try {
    const ai = getGeminiClient();
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ parts: [imagePart, { text: prompt }] }],
      config: {
        maxOutputTokens: 1024, // Reasonable limit for analysis
        thinkingConfig: { thinkingBudget: 256 }, // Allocate some tokens for thinking
      },
    });
    return { text: response.text };
  } catch (error: any) {
    throw new Error(handleApiError(error, "analyze image"));
  }
};

// ============================================================================
// Image Generation (imagen-4.0-generate-001)
// ============================================================================
export const generateImage = async (prompt: string, aspectRatio: AspectRatio): Promise<string> => {
  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: aspectRatio,
      },
    });

    const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
    return `data:image/jpeg;base64,${base64ImageBytes}`;
  } catch (error: any) {
    throw new Error(handleApiError(error, "generate image"));
  }
};

// ============================================================================
// Image Editing (gemini-2.5-flash-image)
// ============================================================================
export const editImage = async (baseImage: ImagePart, prompt: string): Promise<string> => {
  try {
    const ai = getGeminiClient();
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [{ parts: [baseImage, { text: prompt }] }],
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    const imagePart = response.candidates?.[0]?.content?.parts?.[0] as ImagePart;
    if (imagePart && imagePart.inlineData) {
      return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
    }
    throw new Error("No image data returned from API.");
  } catch (error: any) {
    throw new Error(handleApiError(error, "edit image"));
  }
};

// ============================================================================
// Outfit Try-on (using gemini-2.5-flash-image as the core image manipulation model)
// ============================================================================

export const generateOutfitTryOn = async (
  userReferenceImages: ImagePart[],
  modelOutfitImage: ImagePart,
  userPrompt: string,
): Promise<string> => {
  try {
    const ai = getGeminiClient();

    // Step 1: Analyze the model outfit image for outfit, pose, and style
    const modelImageAnalysisPrompt = `Analyze this image in detail and describe the outfit (style, color, fit, length, material), the model's pose, the overall style, and any visible body parts. Focus only on these aspects and ignore background elements or unrelated details.`;
    const modelAnalysisResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ parts: [modelOutfitImage, { text: modelImageAnalysisPrompt }] }],
      config: {
        maxOutputTokens: 512,
        thinkingConfig: { thinkingBudget: 128 },
      },
    });
    const modelDescription = modelAnalysisResponse.text;
    if (!modelDescription) {
      throw new Error("Failed to analyze model outfit image.");
    }

    // Step 2: Analyze the user's facial and body features from a primary reference image
    // For simplicity, use the first reference image.
    const userReferenceImage = userReferenceImages[0];
    const userAnalysisPrompt = `Analyze this image and describe the person's facial features (face shape, hair style and color, eye color, notable features) and overall body type/shape. Focus on details that help identify and recreate the person accurately.`;
    const userAnalysisResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ parts: [userReferenceImage, { text: userAnalysisPrompt }] }],
      config: {
        maxOutputTokens: 512,
        thinkingConfig: { thinkingBudget: 128 },
      },
    });
    const userDescription = userAnalysisResponse.text;
    if (!userDescription) {
      throw new Error("Failed to analyze user reference image.");
    }

    // Step 3: Construct a comprehensive prompt for gemini-2.5-flash-image
    const combinedPrompt = `Based on the following user description and outfit details, generate an image of the user wearing the described outfit in a realistic setting.
    User Features: ${userDescription}
    Outfit and Pose Details from Model: ${modelDescription}
    Additional user modifications/preferences: ${userPrompt}
    Critically, maintain the user's exact facial and body features as closely as possible from the provided reference image. Focus on seamless integration of the outfit onto the user's body while preserving their identity.`;

    // The base image for the try-on will be the primary user reference image.
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [{ parts: [userReferenceImage, { text: combinedPrompt }] }],
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    const imagePart = response.candidates?.[0]?.content?.parts?.[0] as ImagePart;
    if (imagePart && imagePart.inlineData) {
      return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
    }
    throw new Error("No image data returned from API for try-on generation.");
  } catch (error: any) {
    throw new Error(handleApiError(error, "generate outfit try-on"));
  }
};

// ============================================================================
// Video Generation (veo-3.1-fast-generate-preview)
// ============================================================================
export const generateVideo = async (
  prompt: string,
  aspectRatio: AspectRatio,
  resolution: VideoResolution,
): Promise<string> => {
  try {
    const ai = getGeminiClient();

    // Check for API key selection
    // The user must select their own API key for Veo models.
    if (typeof window.aistudio !== 'undefined' && typeof window.aistudio.hasSelectedApiKey === 'function') {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        if (typeof window.aistudio.openSelectKey === 'function') {
          await window.aistudio.openSelectKey();
          // Assume key selection was successful to avoid race condition
        } else {
          throw new Error("API key not selected for video generation. Cannot open key selection dialog.");
        }
      }
    } else {
      console.warn("window.aistudio not available, assuming API key is set via environment for Veo model.");
    }


    let operation: VideoOperation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: resolution,
        aspectRatio: aspectRatio,
      },
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
      try {
        operation = await ai.operations.getVideosOperation({ operation: operation });
      } catch (opError: any) {
        // If "Requested entity was not found." on subsequent calls, prompt to select key again
        if (opError.message && opError.message.includes("Requested entity was not found.")) {
          if (typeof window.aistudio !== 'undefined' && typeof window.aistudio.openSelectKey === 'function') {
            await window.aistudio.openSelectKey();
          }
          throw new Error("Video generation operation not found. Please re-select your API key and try again. Billing info: ai.google.dev/gemini-api/docs/billing");
        }
        throw opError; // Re-throw other operation errors
      }
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (downloadLink) {
      // The response.body contains the MP4 bytes. You must append an API key when fetching from the download link.
      return `${downloadLink}&key=${process.env.API_KEY}`;
    }
    throw new Error("No video URI found in the operation response.");
  } catch (error: any) {
    throw new Error(handleApiError(error, "generate video"));
  }
};


// ============================================================================
// Google Search Grounding (gemini-2.5-flash with tools)
// ============================================================================
export const generateContentWithGoogleSearch = async (prompt: string): Promise<ModelApiResponse> => {
  try {
    const ai = getGeminiClient();
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        maxOutputTokens: 1024,
        thinkingConfig: { thinkingBudget: 256 },
      },
    });
    return {
      text: response.text,
      groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks,
    };
  } catch (error: any) {
    throw new Error(handleApiError(error, "generate content with Google Search"));
  }
};

// ============================================================================
// Chat functionality with streaming
// ============================================================================

export const streamChatResponse = async (
  history: GenerateContentParameters['contents'],
  currentMessage: string,
  onNewText: (text: string) => void,
  onComplete: (finalText: string) => void,
  onError: (error: string) => void,
) => {
  try {
    const ai = getGeminiClient();
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: 'You are a helpful assistant. Provide concise and relevant answers.',
        maxOutputTokens: 1024,
        thinkingConfig: { thinkingBudget: 256 },
      },
    });

    // Ensure contents are correctly formatted. history is an array of parts.
    const currentContents = [...history, { role: 'user', parts: [{ text: currentMessage }] }];

    const result = await chat.sendMessageStream({ contents: currentContents });
    let fullText = '';
    for await (const chunk of result) {
      if (chunk.text) {
        fullText += chunk.text;
        onNewText(fullText);
      }
    }
    onComplete(fullText);
  } catch (error: any) {
    onError(handleApiError(error, "stream chat response"));
  }
};
