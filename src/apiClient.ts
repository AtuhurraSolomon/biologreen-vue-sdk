import { FaceAuthResponse } from './types';

/**
 * A helper function to handle all POST requests to the BioLogreen API.
 * @param endpoint The API endpoint to hit (e.g., '/auth/signup-face').
 * @param payload The JSON payload to send.
 * @param apiKey Your secret API key.
 * @param baseURL The base URL of the API.
 * @returns A promise that resolves with the API response.
 */
async function post<T>(
    endpoint: string,
    payload: Record<string, any>,
    apiKey: string,
    baseURL: string
): Promise<T> {
    const response = await fetch(`${baseURL}${endpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-API-KEY': apiKey,
        },
        body: JSON.stringify(payload),
    });

    const responseData = await response.json();

    if (!response.ok) {
        const errorMessage = responseData.detail || 'An unknown API error occurred.';
        throw new Error(errorMessage);
    }

    return responseData as T;
}

/**
 * Calls the signup endpoint of the BioLogreen API.
 */
export function signupWithFaceApi(
    apiKey: string,
    baseURL: string,
    imageBase64: string,
    customFields?: Record<string, any>
): Promise<FaceAuthResponse> {
    const payload: Record<string, any> = { image_base64: imageBase64 };
    if (customFields) {
        payload.custom_fields = customFields;
    }
    return post<FaceAuthResponse>('/auth/signup-face', payload, apiKey, baseURL);
}

/**
 * Calls the login endpoint of the BioLogreen API.
 */
export function loginWithFaceApi(
    apiKey: string,
    baseURL: string,
    imageBase64: string
): Promise<FaceAuthResponse> {
    const payload = { image_base64: imageBase64 };
    return post<FaceAuthResponse>('/auth/login-face', payload, apiKey, baseURL);
}