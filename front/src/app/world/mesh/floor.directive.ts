import { AfterViewInit, Directive, forwardRef, Input } from '@angular/core';
import * as THREE from 'three';
import { AbstractObjectDirective } from '../basics/abstract-object.directive';

@Directive({
  selector: 'three-floor',
  providers: [{ provide: AbstractObjectDirective, useExisting: forwardRef(() => FloorDirective) }]
})
export class FloorDirective extends AbstractObjectDirective<THREE.Mesh> implements AfterViewInit {

  @Input() color!: string;

  constructor() { super(); }

  override ngAfterViewInit(): void {

    let material = new THREE.MeshLambertMaterial({
      color: Number(this.color)
    });

    this.object = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(10000, 10000),
      material
    );
    this.object.receiveShadow = true;
    this.object.rotation.x = - Math.PI / 2;
    super.ngAfterViewInit();
  }

}
