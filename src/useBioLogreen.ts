import { ref, onUnmounted, Ref } from 'vue';
import * as faceapi from 'face-api.js';
import { UseBioLogreenOptions, UseBioLogreenReturn, FaceAuthResponse } from './types';
import { loginWithFaceApi, signupWithFaceApi } from './apiClient';

// A helper type for our internal promise-based capture mechanism
type CaptureCompleter = {
    resolve: (value: FaceAuthResponse) => void;
    reject: (reason?: any) => void;
};

/**
 * The core composable for BioLogreen face authentication in Vue.js.
 *
 * @param options Configuration options for the composable.
 * @returns An object with reactive state and functions to control the process.
 */
export function useBioLogreen(options: UseBioLogreenOptions): UseBioLogreenReturn {
    // --- Reactive State (for the developer's UI) ---
    const isLoading = ref(false);
    const isInitializing = ref(false);
    const faceDetected = ref(false);
    const error = ref<string | null>(null);

    // --- Internal State (for managing the logic) ---
    let stream: MediaStream | null = null;
    let detectionInterval: number | null = null;
    let captureCompleter: CaptureCompleter | null = null;
    let captureMode: 'login' | 'signup' = 'login';
    let signupCustomFields: Record<string, any> | undefined = undefined;
    const baseURL = options.baseURL ?? 'https://api.biologreen.com/v1';
    const modelPath = options.modelPath ?? 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';

    /**
     * Loads the required face-api.js models.
     */
    async function loadModels() {
        try {
            await faceapi.nets.tinyFaceDetector.loadFromUri(modelPath);
        } catch (e) {
            throw new Error(`Failed to load face detection models. Please check the modelPath. Error: ${e}`);
        }
    }

    /**
     * The main detection loop that runs on an interval.
     */
    async function runDetection() {
        if (!options.videoRef.value) return;

        const detections = await faceapi.detectAllFaces(
            options.videoRef.value,
            new faceapi.TinyFaceDetectorOptions()
        );

        const faceIsPresent = detections.length > 0;
        faceDetected.value = faceIsPresent;

        // If a capture has been requested and a face is present, trigger the photo capture.
        if (captureCompleter && faceIsPresent && !isLoading.value) {
            _capturePhoto();
        }
    }

    /**
     * Captures a photo from the video, sends it to the API, and resolves the promise.
     */
    async function _capturePhoto() {
        if (!options.videoRef.value || !captureCompleter) return;
        
        isLoading.value = true;
        const completer = captureCompleter; // Local copy to prevent race conditions
        captureCompleter = null; // Prevent multiple captures

        try {
            const video = options.videoRef.value;
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            const imageBase64 = canvas.toDataURL('image/jpeg').split(',')[1];
            if (!imageBase64) {
                throw new Error("Failed to capture image from video stream.");
            }

            let response: FaceAuthResponse;
            if (captureMode === 'login') {
                response = await loginWithFaceApi(options.apiKey, baseURL, imageBase64);
            } else {
                response = await signupWithFaceApi(options.apiKey, baseURL, imageBase64, signupCustomFields);
            }
            completer.resolve(response);

        } catch (e: any) {
            error.value = e.message || 'An unexpected error occurred during capture.';
            completer.reject(e);
        } finally {
            isLoading.value = false;
        }
    }

    // --- Public Functions (returned to the developer) ---

    const start = async () => {
        if (!options.videoRef.value) {
            error.value = "Video element reference is not available.";
            return;
        }
        isInitializing.value = true;
        error.value = null;
        try {
            await loadModels();
            stream = await navigator.mediaDevices.getUserMedia({ video: true });
            options.videoRef.value.srcObject = stream;
            detectionInterval = window.setInterval(runDetection, 200); // Check for a face 5 times per second
        } catch (e: any) {
            error.value = `Failed to start camera: ${e.message}`;
        } finally {
            isInitializing.value = false;
        }
    };

    const stop = () => {
        if (detectionInterval) {
            clearInterval(detectionInterval);
            detectionInterval = null;
        }
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }
        if (options.videoRef.value) {
            options.videoRef.value.srcObject = null;
        }
        faceDetected.value = false;
    };
    
    const loginWithFace = () => {
        captureMode = 'login';
        signupCustomFields = undefined;
        return new Promise<FaceAuthResponse>((resolve, reject) => {
            captureCompleter = { resolve, reject };
        });
    };
    
    const signupWithFace = (opts?: { customFields?: Record<string, any> }) => {
        captureMode = 'signup';
        signupCustomFields = opts?.customFields;
        return new Promise<FaceAuthResponse>((resolve, reject) => {
            captureCompleter = { resolve, reject };
        });
    };

    // --- Lifecycle Hook ---
    // Automatically stop the camera when the component is unmounted.
    onUnmounted(stop);

    return {
        isLoading,
        isInitializing,
        faceDetected,
        error,
        start,
        stop,
        loginWithFace,
        signupWithFace,
    };
}