import { AfterViewInit, ContentChildren, Directive, Input, QueryList } from '@angular/core';
import { Object3D, Vector3 } from 'three';

@Directive({
  selector: 'appAbstractObject'
})
export class AbstractObjectDirective<T extends Object3D> implements AfterViewInit {
  public object!: T;
  @Input() position: number[] = [0,0,0];

  @ContentChildren(AbstractObjectDirective, { descendants: true })
  childNodes!: QueryList<AbstractObjectDirective<any>>;

  constructor() { }

  // add child nodes
  ngAfterViewInit(): void {
    if (this.childNodes && this.childNodes.length > 1) {
      this.object.add(...this.childNodes
        .filter(node => node !== this && node.object !== undefined)
        .map(({ object }) => object));
    }
    this.object.position.set(this.position[0], this.position[1], this.position[2]);
  }
}
