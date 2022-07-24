import { AfterViewInit, Directive, forwardRef ,Input} from '@angular/core';
import * as THREE from 'three';
import { AbstractObjectDirective } from '../basics/abstract-object.directive';
@Directive({
  selector: 'three-instruction',
  providers: [{ provide: AbstractObjectDirective, useExisting: forwardRef(() => InstructionDirective) }]
})
export class InstructionDirective extends AbstractObjectDirective<THREE.Mesh> implements AfterViewInit{
  @Input() ins_type: number = 0;

  constructor() {super();  }
  override ngAfterViewInit(): void {
    const loader = new THREE.TextureLoader();

    let tex = loader.load('../../../assets/icons/problem/default.jpg');
    let material = new THREE.MeshBasicMaterial({
      map: tex
    });

    material.map!.repeat.x = material.map!.repeat.y = 1;

    this.object = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(20, 10, 30, 30),
      material
    );
    this.object.receiveShadow = true;
    this.object.rotation.x = - Math.PI / 2;
    super.ngAfterViewInit();
  }



}
