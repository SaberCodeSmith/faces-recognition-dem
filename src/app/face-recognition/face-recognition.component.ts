import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FaceRecognitionService } from '../face-recognition.service';
import { tap } from 'rxjs/operators';
import * as faceapi from 'face-api.js';

@Component({
  selector: 'app-face-recognition',
  templateUrl: './face-recognition.component.html',
  styleUrls: ['./face-recognition.component.scss']
})
export class FaceRecognitionComponent implements OnInit {
  @ViewChild('imageElement') imageElement!: ElementRef<HTMLImageElement>;
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;

  constructor(private faceRecognitionService: FaceRecognitionService) { }

  ngOnInit(): void {
    this.initializeFaceApi();
  }

  async initializeFaceApi() {
    await this.faceRecognitionService.loadModels();
    await this.faceRecognitionService.loadKnownFaces().toPromise();
  }

  onImageUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const img = this.imageElement.nativeElement;
        img.src = reader.result as string;
        img.onload = () => {
          this.resizeCanvas();
          this.detectAndRecognizeFaces(img);
        };
      };
      reader.readAsDataURL(file);
    }
  }

  resizeCanvas() {
    const img = this.imageElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    canvas.width = img.width;
    canvas.height = img.height;
  }

  detectAndRecognizeFaces(image: HTMLImageElement) {
    this.faceRecognitionService.detectAllFaces(image).pipe(
      tap(detections => {
        console.log(detections);
        const recognizedFaces = this.faceRecognitionService.recognizeFaces(detections);
        this.drawDetections(recognizedFaces, image);
      })
    ).subscribe();
  }

  drawDetections(recognizedFaces: any, image: HTMLImageElement) {
    const canvas = this.canvasElement.nativeElement;
    const displaySize = { width: image.width, height: image.height };
    faceapi.matchDimensions(canvas, displaySize);
    const resizedDetections = faceapi.resizeResults(recognizedFaces.map((rf: { detection: any; }) => rf.detection), displaySize);
    // faceapi.draw.drawDetections(canvas, resizedDetections);
    // faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    this.drawRecognitionResults(canvas, resizedDetections, recognizedFaces);
  }

  drawRecognitionResults(canvas: HTMLCanvasElement, resizedDetections: { [x: string]: { detection: { box: any; }; }; }, recognizedFaces: any[]) {
    const context = canvas.getContext('2d');
    if(context) {
      recognizedFaces.forEach((recognizedFace: string, i: string | number) => {
        const box = resizedDetections[i].detection.box;
        const text = recognizedFace.match.name;
        context.fillStyle = 'rgba(0, 0, 255, 0.5)';
        context.fillRect(box.x, box.y - 20, box.width, 20);
        context.fillStyle = '#fff';
        context.fillText(text, box.x, box.y - 5);
      });
    }
  }
}
