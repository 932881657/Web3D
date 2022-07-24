import { AfterViewInit, Directive, forwardRef } from '@angular/core';
import { AbstractObjectDirective } from './abstract-object.directive';
import { Scene, Color, Fog, Mesh } from 'three';

@Directive({
  selector: 'three-scene',
  providers: [{ provide: AbstractObjectDirective, useExisting: forwardRef(() => SceneDirective) }]
})
export class SceneDirective extends AbstractObjectDirective<Scene> implements AfterViewInit {

  constructor() { super(); }

  override ngAfterViewInit(): void {
    let scene = new Scene();
    scene.background = new Color().setHSL(0.6, 0, 1);
    scene.fog = new Fog(scene.background, 1, 5000);
    this.object = scene;
    super.ngAfterViewInit();
  }

  get meshes():Mesh[] {
    let result: any[] = [];
    (this.object as Scene).traverse(obj => {
      if((obj as any).isMesh){
        result.push(obj);
      }
    });
    return result;
  }

  add(obj: any): void{
    this.object.add(obj);
  }

  remove(obj: any): void{
    this.object.remove(obj);
  }
}
