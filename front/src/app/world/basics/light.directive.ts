import { AfterViewInit, Directive, Input, forwardRef } from '@angular/core';
import { AbstractObjectDirective } from './abstract-object.directive';
import * as THREE from 'three';

@Directive({
  selector: 'three-light',
  providers: [{ provide: AbstractObjectDirective, useExisting: forwardRef(() => LightDirective) }]
})
export class LightDirective extends AbstractObjectDirective<THREE.Light> implements AfterViewInit {

  @Input() mode!: string;
  @Input() color!: string;
  constructor() { super(); }

  override ngAfterViewInit(): void {
    let light;
    switch (this.mode) {
      case 'hemi':
        light = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
        light.color.setHSL(0.6, 1, 0.6);
        light.groundColor.setHSL(0.095, 1, 0.75);
        break;
      case 'dir':
        light = new THREE.DirectionalLight(0xffffff, 1);
        light.color.setHSL(0.1, 1, 0.95);
        light.position.multiplyScalar(30);
        light.castShadow = true;
        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;
        const d = 50;
        light.shadow.camera.left = - d;
        light.shadow.camera.right = d;
        light.shadow.camera.top = d;
        light.shadow.camera.bottom = - d;
        light.shadow.camera.far = 3500;
        light.shadow.bias = - 0.0001;
        break;
      case 'ambient':
        // light = new THREE.AmbientLight(0xffffff, 0.8);
        light = new THREE.AmbientLight(0xffffff, 1.0);
        break;
      case 'point':
        light = new THREE.PointLight(0xffffff, 2.0);
        light.color.setHex(Number(this.color));
        break;
    }
    this.object = light as THREE.Light;
    super.ngAfterViewInit();
  }

}
