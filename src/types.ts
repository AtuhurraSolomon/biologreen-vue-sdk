import { Ref } from 'vue';

/**
 * Represents the successful JSON response from the BioLogreen API.
 * This should match the API's output.
 */
export interface FaceAuthResponse {
    user_id: number;
    is_new_user: boolean;
    custom_fields?: Record<string, any>;
}

/**
 * Configuration options for the useBioLogreen composable.
 */
export interface UseBioLogreenOptions {
    apiKey: string;
    videoRef: Ref<HTMLVideoElement | null>;
    baseURL?: string;
    modelPath?: string; // Optional path to face-api.js models
}

/**
 * The object returned by the useBioLogreen composable.
 * It contains all the reactive state and functions a developer needs.
 */
export interface UseBioLogreenReturn {
    // --- Reactive State ---
    isLoading: Ref<boolean>;
    isInitializing: Ref<boolean>;
    faceDetected: Ref<boolean>;
    error: Ref<string | null>;

    // --- Core Functions ---
    start: () => Promise<void>;
    stop: () => void;
    loginWithFace: () => Promise<FaceAuthResponse>;
    signupWithFace: (options?: { customFields?: Record<string, any> }) => Promise<FaceAuthResponse>;
}
