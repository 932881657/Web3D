import { AfterViewInit, Directive, forwardRef } from '@angular/core';
import * as THREE from 'three';
import { AbstractObjectDirective } from '../basics/abstract-object.directive';

@Directive({
  selector: 'three-ground',
  providers: [{ provide: AbstractObjectDirective, useExisting: forwardRef(() => GroundDirective) }]
})
export class GroundDirective extends AbstractObjectDirective<THREE.Mesh> implements AfterViewInit {

  constructor() { super(); }

  override ngAfterViewInit(): void {
    const loader = new THREE.TextureLoader();

    let tex = loader.load('../../../assets/tex/ground.jpg');

    let material = new THREE.MeshBasicMaterial({
      map: tex
    });

    this.wrapAndRepeatTexture(material.map!);

    this.object = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(80, 80, 100, 100),
      material
    );
    this.object.receiveShadow = true;
    this.object.rotation.x = - Math.PI / 2;
    super.ngAfterViewInit();
  }

  wrapAndRepeatTexture(map: THREE.Texture): void {
    map.repeat.x = map.repeat.y = 1
  }

}
