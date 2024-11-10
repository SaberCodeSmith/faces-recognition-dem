import { Injectable } from '@angular/core';
import * as faceapi from 'face-api.js';
import { from, Observable, of } from 'rxjs';
import { switchMap, catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FaceRecognitionService {
  private knownFaces: { name: string; descriptors: Float32Array[] }[] = [];

  constructor() { }

  async loadModels(): Promise<void> {
    const MODEL_URL = '/assets/models';
    await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
    await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
  }

  loadKnownFaces(): Observable<void> {
    return from(this.loadFacesFromAssets()).pipe(
      switchMap(() => of(void 0)), // Convert to Observable<void>
      catchError(error => {
        console.error('Error loading known faces:', error);
        return of(void 0);
      })
    );
  }

  private async loadFacesFromAssets(): Promise<void> {
    const imageNames = ['rachel.png','sheldon5.png']; // Replace with actual file names
    const imagePromises = imageNames.map(name => this.loadFaceImage(name));
    const faceDescriptors = await Promise.all(imagePromises);
    this.knownFaces = faceDescriptors;
  }

  private async resizeImage(image: HTMLImageElement, maxSize: number): Promise<HTMLImageElement> {
    return new Promise<HTMLImageElement>((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const scale = Math.min(maxSize / image.width, maxSize / image.height);
      canvas.width = image.width * scale;
      canvas.height = image.height * scale;
      ctx?.drawImage(image, 0, 0, canvas.width, canvas.height);
  
      const resizedImage = new Image();
      resizedImage.src = canvas.toDataURL();
      resizedImage.onload = () => resolve(resizedImage);
    });
  }

  private async loadFaceImage(name: string): Promise<{ name: string; descriptors: Float32Array[] }> {
    const img = new Image();
    img.src = `/assets/faces/${name}`;
    
    // Wait for the image to load
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = (error) => reject(error);
    });
    
    // Resize the image
    const resizedImg = await this.resizeImage(img, 2400); // Adjust maxSize as needed
    
    try {
      const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 608,scoreThreshold:0.2 })
      const detectionx = await faceapi.tinyFaceDetector(img,options)
      console.log(name);
      console.log(detectionx);
      

      const detections = await faceapi.detectAllFaces(resizedImg).withFaceLandmarks().withFaceDescriptors();
      
      if (detections.length === 0) {
        console.warn(`No faces detected in image ${name}.`);
      }
      
      return {
        name: name.replace('.jpg', ''),
        descriptors: detections.map(det => det.descriptor)
      };
    } catch (error) {
      console.error(`Error detecting faces in image ${name}:`, error);
      return { name: name.replace('.jpg', ''), descriptors: [] };
    }
  } 

  detectAllFaces(image: HTMLImageElement): Observable<faceapi.WithFaceDescriptor<faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection; }, faceapi.FaceLandmarks68>>[]> {
    return from(this.detectFacesAsync(image));
  }

  private async detectFacesAsync(image: HTMLImageElement): Promise<faceapi.WithFaceDescriptor<faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection; }, faceapi.FaceLandmarks68>>[]> {
    return await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors();
  }

  recognizeFaces(detections: faceapi.WithFaceDescriptor<faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection; }, faceapi.FaceLandmarks68>>[]) {
    return detections.map(detection => {
      const bestMatch = this.findBestMatch(detection.descriptor);
      return {
        detection,
        match: bestMatch
      };
    });
  }

  private findBestMatch(descriptor: Float32Array) {
    let bestMatch = { name: 'unknown', distance: Infinity };

    this.knownFaces.forEach(knownFace => {
      knownFace.descriptors.forEach(knownDescriptor => {
        const distance = faceapi.euclideanDistance(descriptor, knownDescriptor);
        if (distance < bestMatch.distance) {
          bestMatch = { name: knownFace.name, distance };
        }
      });
    });

    return bestMatch;
  }
}
