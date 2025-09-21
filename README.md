BioLogreen Vue.js SDK

The official Vue.js SDK for the Bio-Logreen Facial Authentication API.

This SDK provides a headless Vue Composable (useBioLogreen) that manages camera access, real-time face detection, and API communication, giving you the flexibility to build a completely custom UI for your login and signup flows. (IT PROVIDES NO UI, SO YOU CAN CUSTOMISE YOUR UI)

Features

Headless by Design: Provides all the logic; you provide the UI.

Fully Reactive: Built with Vue's Composition API, providing reactive state (isLoading, faceDetected, etc.).

Promise-Based API: Modern async/await friendly functions (signupWithFace, loginWithFace) for clean component logic.

TypeScript Support: Fully typed for a superior developer experience.

Installation

npm install biologreen-vue-sdk face-api.js


Setup & Configuration

This SDK relies on face-api.js for face detection, which requires model files to be available in your application.

Download AI Models: You must download the tiny_face_detector model weights from the face-api.js repository.

Host the Models: Place the downloaded model files in your project's /public/models directory. The SDK will automatically fetch them from this location.

Quick Start: Usage Example

Here is a complete example of a login component that uses the useBioLogreen composable.

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useBioLogreen } from 'biologreen-vue-sdk';

// A ref to hold the video element from the template
const videoElement = ref<HTMLVideoElement | null>(null);

const {
  isLoading,
  isInitializing,
  faceDetected,
  error,
  start,
  loginWithFace,
  signupWithFace,
} = useBioLogreen({
  apiKey: 'YOUR_PROJECT_API_KEY',
  videoRef: videoElement,
  baseURL: 'http://localhost:8000/v1' // Optional: for local testing
});

// Start the camera when the component is mounted
onMounted(() => {
  start();
});

const handleSignup = async () => {
  try {
    const response = await signupWithFace();
    alert(`Signup Success! User ID: ${response.user_id}`);
  } catch (err: any) {
    alert(`Signup Failed: ${err.message}`);
  }
};
</script>

<template>
  <div>
    <h1>Bio-Logreen Authentication</h1>
    <div v-if="isInitializing">Initializing Camera and AI Models...</div>
    <div style="position: relative; width: 640px;">
      <video ref="videoElement" autoplay muted playsinline></video>
      <div v-if="isLoading" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); color: white; display: flex; align-items: center; justify-content: center;">
        Processing...
      </div>
    </div>
    <div v-if="!isInitializing">
      <p>Face Detected: {{ faceDetected ? 'Yes' : 'No' }}</p>
      <button @click="handleSignup" :disabled="isLoading">Sign Up</button>
    </div>
    <div v-if="error" style="color: red;">
      <p>Error: {{ error }}</p>
    </div>
  </div>
</template>


API Reference

useBioLogreen({ apiKey, videoRef, baseURL })

Parameters

apiKey (string, required): Your project's secret API key.

videoRef (Ref<HTMLVideoElement | null>, required): A Vue ref attached to your <video> element.

baseURL (string, optional): A custom base URL for the Bio-Logreen API. Defaults to the production URL.

Return Values

isLoading (Ref<boolean>): A reactive boolean that is true when an API call is in progress.

isInitializing (Ref<boolean>): A reactive boolean that is true while the camera and AI models are loading.

faceDetected (Ref<boolean>): A reactive boolean that is true when a face is visible in the camera.

error (Ref<string | null>): A reactive string containing an error message if an operation failed.

start(): An async function to initialize the camera and start face detection.

stop(): A function to stop the camera and clean up resources.

signupWithFace(options): An async function to trigger a signup. Returns a Promise.

loginWithFace(): An async function to trigger a login. Returns a Promise.

<template>
  <div class="camera-container">
    <!-- 5. Attach the ref to a video element and build your custom UI -->
    <video ref="videoElement" autoplay muted playsinline class="video-feed"></video>
    
    <!-- This is your custom UI. An overlay that turns green when a face is detected -->
    <div class="overlay" :class="{ detected: faceDetected }"></div>

    <!-- Show loading states and errors from the composable -->
    <div v-if="isLoading" class="spinner">Processing...</div>
    <div v-if="error" class="error-message">{{ error }}</div>

    <button @click="handleLogin" :disabled="isLoading" class="action-button">
      Login with Face
    </button>

Contributing
Suggestions and contributions are welcome. Please open an issue or a pull request on the GitHub repository to suggest changes.

License
This SDK is licensed under the MIT License with The Commons Clause. See the LICENSE file for more details.

