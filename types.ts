import { GenerateContentResponse, Modality } from "@google/genai";

export type ImagePart = {
  inlineData: {
    mimeType: string;
    data: string;
  };
};

export interface ChatMessage {
  role: 'user' | 'model';
  parts: (ImagePart | { text: string })[];
}

export interface VideoOperation {
  name: string;
  done: boolean;
  response?: {
    generatedVideos?: Array<{
      video?: {
        uri: string;
        aspectRatio: string;
        resolution: string;
      };
    }>;
  };
  error?: {
    code: number;
    message: string;
  };
}

export enum AppMode {
  OUTFIT_TRY_ON = 'outfit-try-on',
  IMAGE_GENERATOR = 'image-generator',
  IMAGE_EDITOR = 'image-editor',
  IMAGE_ANALYZER = 'image-analyzer',
  VIDEO_GENERATOR = 'video-generator',
}

export enum AspectRatio {
  ASPECT_RATIO_1_1 = '1:1',
  ASPECT_RATIO_3_4 = '3:4',
  ASPECT_RATIO_4_3 = '4:3',
  ASPECT_RATIO_9_16 = '9:16',
  ASPECT_RATIO_16_9 = '16:9',
}

export enum VideoResolution {
  R720P = '720p',
  R1080P = '1080p',
}

export interface ImageUploadData {
  file: File;
  base64: string;
}

export interface GenerationConfig {
  aspectRatio: AspectRatio;
  prompt: string;
}

export interface ImageAnalysisResult {
  analysis: string;
  imageUrl: string;
}

export interface ChatTurn {
  role: 'user' | 'model';
  content: string;
  isStreaming?: boolean;
}

export interface FunctionCallResponsePart {
  name: string;
  id: string;
  args: Record<string, unknown>;
}

export interface GenerationStreamResult {
  text: string;
  functionCalls?: FunctionCallResponsePart[];
}

export interface ModelApiResponse {
  text: string;
  groundingChunks?: Array<{
    web?: {
      uri: string;
      title: string;
    };
    maps?: {
      uri: string;
      title: string;
      placeAnswerSources?: Array<{ reviewSnippets: Array<{ uri: string }> }>;
    };
  }>;
}
