import { useState, useRef, useEffect } from "react";
import { mat4, vec3, vec4 } from "gl-matrix";

const degreesToRadians = (degrees: number) => {
  return (degrees * Math.PI) / 180;
};

const radiansToDegrees = (radians: number) => {
  return (radians * 180) / Math.PI;
};

class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d")!;
  }

  get domElement() {
    return this.canvas;
  }

  setSize(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  render() {
    const ctx = this.ctx;
    const canvas = this.canvas;

    // clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // vertices to draw
    const aspect = canvas.width / canvas.height;
    const fov = 45;
    const near = 0.1;

    const h = 2 * near * Math.tan(degreesToRadians(fov) / 2);
    const w = aspect * h;
    const fovx = Math.atan(w / (2 * near));
    const fovxDegrees = radiansToDegrees(fovx);

    console.log({ aspect, width: canvas.width, height: canvas.height, h, w });
    console.log({ foxyDegrees: fov, fovxDegrees });

    const projectionMatrix = mat4.perspectiveNO(
      mat4.create(),
      degreesToRadians(fov),
      aspect,
      0.1,
      1000,
    );

    const modelMatrix = mat4.create();
    mat4.translate(modelMatrix, modelMatrix, [0, 0, -10]);
    mat4.rotateY(modelMatrix, modelMatrix, degreesToRadians(45));
    mat4.rotateX(modelMatrix, modelMatrix, degreesToRadians(45));

    console.log(modelMatrix);

    // const triangles = [
    //   [
    //     [-1, 1, 1],
    //     [1, -1, 1],
    //     [-1, -1, 1],
    //   ],
    // ];

    const triangles = [
      // Front (z = 1)
      [
        [-1, 1, 1],
        [1, -1, 1],
        [-1, -1, 1],
      ],
      [
        [-1, 1, 1],
        [1, 1, 1],
        [1, -1, 1],
      ],

      // Back (z = -1)
      [
        [-1, 1, -1],
        [-1, -1, -1],
        [1, -1, -1],
      ],
      [
        [-1, 1, -1],
        [1, -1, -1],
        [1, 1, -1],
      ],

      // Left (x = -1)
      [
        [-1, 1, -1],
        [-1, -1, 1],
        [-1, -1, -1],
      ],
      [
        [-1, 1, -1],
        [-1, 1, 1],
        [-1, -1, -1],
      ],

      // Right (x = 1)
      [
        [1, 1, -1],
        [1, -1, 1],
        [1, -1, -1],
      ],
      [
        [1, 1, -1],
        [1, 1, 1],
        [1, -1, -1],
      ],

      // Top (y = 1)
      [
        [-1, 1, 1],
        [-1, 1, -1],
        [1, 1, -1],
      ],
      [
        [-1, 1, 1],
        [1, 1, -1],
        [1, 1, 1],
      ],

      // Bottom (y = -1)
      [
        [-1, -1, 1],
        [1, -1, -1],
        [-1, -1, -1],
      ],
      [
        [-1, -1, 1],
        [1, -1, 1],
        [1, -1, -1],
      ],
    ];

    for (const triangle of triangles) {
      ctx.strokeStyle = "green";
      ctx.lineWidth = 1;
      ctx.beginPath();

      let i = 0;
      for (const vertex of triangle) {
        const worldVertex = vec4.transformMat4(
          vec4.create(),
          [...vertex, 1],
          modelMatrix,
        );

        const ndc = vec4.transformMat4(
          vec4.create(),
          worldVertex,
          projectionMatrix,
        );

        const x = ndc[0] / ndc[3];
        const y = ndc[1] / ndc[3];

        // transform to screen coordinates
        const screenX = (x + 1) / 2;
        const screenY = -((y - 1) / 2);

        const pixelX = screenX * canvas.width;
        const pixelY = screenY * canvas.height;

        if (i === 0) {
          ctx.moveTo(pixelX, pixelY);
        } else {
          ctx.lineTo(pixelX, pixelY);
        }

        i++;
      }

      ctx.closePath();
      ctx.stroke();

      for (const vertex of triangle) {
        const worldVertex = vec4.transformMat4(
          vec4.create(),
          [...vertex, 1],
          modelMatrix,
        );

        console.log({ worldVertex });

        const ndc = vec4.transformMat4(
          vec4.create(),
          worldVertex,
          projectionMatrix,
        );

        const x = ndc[0] / ndc[3];
        const y = ndc[1] / ndc[3];

        // transform to screen coordinates
        const screenX = (x + 1) / 2;
        const screenY = -((y - 1) / 2);

        const pixelX = screenX * canvas.width;
        const pixelY = screenY * canvas.height;

        ctx.fillStyle = "green";
        ctx.beginPath();
        ctx.arc(pixelX, pixelY, 6, 0, Math.PI * 2); // full circle
        ctx.fill();
      }
    }
  }
}

function App() {
  const canvasWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvasWrapper = canvasWrapperRef.current!;

    const renderer = new Renderer();
    const { width, height } = canvasWrapper.getBoundingClientRect();
    renderer.setSize(width, height);

    renderer.render();

    canvasWrapper.appendChild(renderer.domElement);
    return () => {
      canvasWrapper.removeChild(renderer.domElement);
    };
  }, []);

  return <div className="w-full h-full" ref={canvasWrapperRef}></div>;
}

export default App;
