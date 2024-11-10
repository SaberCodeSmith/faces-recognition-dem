import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as faceapi from 'face-api.js';

@Component({
  selector: 'app-face-recon-second',
  templateUrl: './face-recon-second.component.html',
  styleUrl: './face-recon-second.component.scss'
})
export class FaceReconSecondComponent implements OnInit {
  @ViewChild('inputImage') inputImage!: ElementRef;
  @ViewChild('canvas') canvas!: ElementRef;

  async ngOnInit() {
    await this.loadModels();
    this.processImage();
  }

  async loadModels() {
    const MODEL_URL = '/assets/models';
    await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
    await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
  }

  async processImage() {
    const img = this.inputImage.nativeElement;
    const canvas = this.canvas.nativeElement;
    const displaySize = { width: img.width, height: img.height };

    faceapi.matchDimensions(canvas, displaySize);

    // Detect faces and landmarks
    const detections = await faceapi.detectAllFaces(img, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptors();

    // Load known faces
    const knownFaceDescriptors = await this.loadKnownFaces();
    console.log(knownFaceDescriptors);
    
    const faceMatcher = new faceapi.FaceMatcher(knownFaceDescriptors, 0.6);
    const results = detections.map(d => faceMatcher.findBestMatch(d.descriptor));

    // Draw rectangles around recognized faces
    // const resizedDetections = faceapi.resizeResults(detections, displaySize);
    // faceapi.draw.drawDetections(canvas, resizedDetections);

    // results.forEach((result, i) => {
    //   const box = resizedDetections[i].detection.box;
    //   new faceapi.draw.DrawTextField([result.label], box).draw(canvas);
    // });

    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    const ctx = canvas.getContext('2d');

    // Clear previous drawings
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw rectangles with modern effects
    resizedDetections.forEach(detection => {
      const { x, y, width, height } = detection.detection.box;

      // Draw rectangle with futuristic cyan effect
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.9)'; // Cyan color
      ctx.lineWidth = 4; // Slightly thicker lines for emphasis
      ctx.shadowColor = 'rgba(0, 255, 255, 0.7)'; // Cyan glow effect
      ctx.shadowBlur = 10; // Shadow blur for a glow effect
      ctx.strokeRect(x, y, width, height);
      ctx.shadowBlur = 0; // Remove shadow for other drawings
    });

    // Draw text with custom label background
    results.forEach((result, i) => {
      if (result.label !== 'unknown') {
        const box = resizedDetections[i].detection.box;

        ctx.font = '18px "Roboto", sans-serif'; // Larger font for better visibility
        const text = result.label;

        // Measure text width and height
        const textWidth = ctx.measureText(text).width;
        const padding = 10; // Padding around the text

        // Define background dimensions
        const backgroundWidth = textWidth + 2 * padding;
        const backgroundHeight = 30; // Height of the background rectangle

        // Calculate background position
        const backgroundX = box.x + box.width / 2 - backgroundWidth / 2;
        const backgroundY = box.y - backgroundHeight - padding;

        // Draw custom label background with cyan color
        ctx.fillStyle = 'rgba(0, 255, 255, 0.8)'; // Cyan background for text
        ctx.fillRect(backgroundX, backgroundY, backgroundWidth, backgroundHeight);

        // Draw text on top of the background
        ctx.fillStyle = '#000000'; // Black text for better readability
        ctx.textAlign = 'center'; // Center-align text
        ctx.textBaseline = 'middle'; // Center text vertically
        ctx.fillText(text, box.x + box.width / 2, backgroundY + backgroundHeight / 2); // Position text on top of the box
      }
    });
  }

  async loadKnownFaces() {
    const knownFaces = [
      // { url: '/assets/faces/amy1.png', name: 'Amy 1' },
      // { url: '/assets/faces/amy2.png', name: 'Amy 2' },
      // { url: '/assets/faces/amy3.png', name: 'Amy 3' },
      // { url: '/assets/faces/amy4.png', name: 'Amy 4' },
      // { url: '/assets/faces/amy5.png', name: 'Amy 5' },

      // { url: '/assets/faces/bernadette1.png', name: 'Bernadette 1' },
      // { url: '/assets/faces/bernadette2.png', name: 'Bernadette 2' },
      // { url: '/assets/faces/bernadette3.png', name: 'Bernadette 3' },
      // { url: '/assets/faces/bernadette4.png', name: 'Bernadette 4' },
      // { url: '/assets/faces/bernadette5.png', name: 'Bernadette 5' },

      // { url: '/assets/faces/howard1.png', name: 'howard1' },
      // { url: '/assets/faces/howard2.png', name: 'howard2' },
      // { url: '/assets/faces/howard3.png', name: 'howard3' },
      // { url: '/assets/faces/howard4.png', name: 'howard4' },
      // { url: '/assets/faces/howard5.png', name: 'howard5' },

      // { url: '/assets/faces/leonard1.png', name: 'leonard1' },
      // { url: '/assets/faces/leonard2.png', name: 'leonard3' },
      // { url: '/assets/faces/leonard3.png', name: 'leonard3' },
      // { url: '/assets/faces/leonard4.png', name: 'leonard4' },
      // { url: '/assets/faces/leonard5.png', name: 'leonard5' },

      // { url: '/assets/faces/penny1.png', name: 'penny1' },
      // { url: '/assets/faces/penny2.png', name: 'penny2' },
      // { url: '/assets/faces/penny3.png', name: 'penny3' },
      // { url: '/assets/faces/penny4.png', name: 'penny4' },
      // { url: '/assets/faces/penny5.png', name: 'penny5' },

      // { url: '/assets/faces/raj1.png', name: 'raj1' },
      // { url: '/assets/faces/raj2.png', name: 'raj2' },
      // { url: '/assets/faces/raj3.png', name: 'raj3' },
      // { url: '/assets/faces/raj4.png', name: 'raj4' },
      // { url: '/assets/faces/raj5.png', name: 'raj5' },

      // { url: '/assets/faces/sheldon1.png', name: 'Sheldon 1' },
      // { url: '/assets/faces/sheldon2.png', name: 'Sheldon 2' },
      // { url: '/assets/faces/sheldon3.png', name: 'Sheldon 3' },
      // { url: '/assets/faces/sheldon4.png', name: 'Sheldon 4' },
      // { url: '/assets/faces/sheldon5.png', name: 'Sheldon 5' },

      // { url: '/assets/faces/stuart1.png', name: 'stuart1' },
      // { url: '/assets/faces/stuart2.png', name: 'stuart2' },
      // { url: '/assets/faces/stuart3.png', name: 'stuart3' },
      // { url: '/assets/faces/stuart4.png', name: 'stuart4' },
      // { url: '/assets/faces/stuart5.png', name: 'stuart5' },

      { url: '/assets/faces2/amy.jpg', name: 'Amy' },
      { url: '/assets/faces2/bernadette.jpg', name: 'Bernadette' },
      { url: '/assets/faces2/howard.jpg', name: 'Howard' },
      { url: '/assets/faces2/leonard.jpg', name: 'Leonard' },
      { url: '/assets/faces2/penny.jpg', name: 'Penny' },
      { url: '/assets/faces2/raj.jpg', name: 'Raj' },
      { url: '/assets/faces2/sheldon.jpg', name: 'Sheldon' },
      { url: '/assets/faces2/stuart.jpg', name: 'Stuart' },

      { url: '/assets/friends-faces/rachel.png', name: 'Rachel' },
    ];

    const labeledFaceDescriptors = await Promise.all(knownFaces.map(async face => {
      const img = await faceapi.fetchImage(face.url);

      const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 608,scoreThreshold:0.1 })
      const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
      
      if (!detections) {
        console.error(`No face detected in image: ${face.url}`);
        return null;
      }
      return new faceapi.LabeledFaceDescriptors(face.name, [detections.descriptor]);
    }));

    // Filter out any null values from the array
    return labeledFaceDescriptors.filter(lfd => lfd !== null);
  }
}

