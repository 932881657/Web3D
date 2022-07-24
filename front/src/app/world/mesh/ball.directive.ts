import { AfterViewInit, Directive, forwardRef } from '@angular/core';
import { FrontSide, Mesh, MeshStandardMaterial, SphereBufferGeometry } from 'three';
import { AbstractObjectDirective } from '../basics/abstract-object.directive';

@Directive({
  selector: 'three-mesh-ball',
  providers: [{ provide: AbstractObjectDirective, useExisting: forwardRef(() => BallDirective) }]
})
export class BallDirective extends AbstractObjectDirective<Mesh> implements AfterViewInit {

  constructor() { super(); }

  override ngAfterViewInit(): void {
    this.object = new Mesh(
      new SphereBufferGeometry(2, 20, 20),
      new MeshStandardMaterial({color:'red', side: FrontSide})
    );
    super.ngAfterViewInit();
  }
}
