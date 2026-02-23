import { mat4 } from "gl-matrix";

import { degreesToRadians } from "./utils";

export interface ICamera {
  projectionMatrix: mat4;
  updateProjectionMatrix(): void;
}

export interface IPerspectiveCameraArgs {
  fov: number;
  aspect: number;
  near: number;
  far: number;
}

export class PerspectiveCamera implements ICamera {
  public fov: number;
  public aspect: number;
  public near: number;
  public far: number;

  // @ts-expect-error the projection matrix is initialized in the constructor after calling `uopdateProjectionMatrix()`
  private _projectionMatrix: mat4;

  constructor({ fov, aspect, near, far }: IPerspectiveCameraArgs) {
    this.fov = fov;
    this.aspect = aspect;
    this.near = near;
    this.far = far;

    this.updateProjectionMatrix();
  }

  get projectionMatrix(): mat4 {
    return this._projectionMatrix;
  }

  updateProjectionMatrix() {
    this._projectionMatrix = mat4.perspectiveNO(
      mat4.create(),
      degreesToRadians(this.fov),
      this.aspect,
      this.near,
      this.far,
    );
  }
}
