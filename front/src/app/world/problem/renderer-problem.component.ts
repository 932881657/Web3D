import { AfterViewInit, Component, ViewChild, ElementRef, ContentChild, Input, OnDestroy } from '@angular/core';
import { SceneDirective } from '../basics/scene.directive';
import * as THREE from 'three';
import CameraControls from 'camera-controls';
import DragControls from 'drag-controls';
import { Mesh, Object3D } from 'three';
import { InstructionDirective } from '../mesh/instruction.directive';
import { ProblemService } from './problem.service';
import { Inst } from 'src/app/services/problem-backend.service';

CameraControls.install({ THREE });
DragControls.install({ THREE });

@Component({
  selector: 'three-renderer-problem',
  template: '<canvas #canvas></canvas>'
})
export class RendererProblemComponent implements AfterViewInit {
  width!: number;
  height!: number;
  @Input() mode: string = "fullscreen";

  @ViewChild('canvas') canvasReference!: ElementRef;
  get canvas(): HTMLCanvasElement { return this.canvasReference.nativeElement; }

  @ContentChild(SceneDirective) scene!: SceneDirective

  renderer!: THREE.WebGLRenderer;
  camera!: THREE.OrthographicCamera;
  cameraControls!: CameraControls;
  dragControls!: DragControls;
  runBtnGroup!: Array<Mesh>;
  stopBtnGroup!: Array<Mesh>;


  dragableObj!: Array<Object3D>;

  insList: Array<Array<number>>;
  insTargetMeshList: Array<Array<Mesh>>;
  insTargetLimitList: Array<number>;
  moveList: Array<Object3D>;
  pageOffset: number;

  isRunning = false;
  limit = 0;

  constructor(public problemService: ProblemService) {
    if (this.mode === 'fullscreen') {
      this.width = window.innerWidth * 0.4;
      this.height = window.innerHeight * 0.85;
    } else if (this.mode === 'xxxx') {
      //TODO
      this.width = 200;
      this.height = 200;
    }
    this.insList = new Array<Array<number>>();
    for (let i = 0; i <= 49; i++)this.insList.push([-1, 0]);
    this.pageOffset = 0;
    this.moveList = new Array<Object3D>();
    this.insTargetMeshList = new Array<Array<Mesh>>();
    this.insTargetLimitList = [];
  }

  ngAfterViewInit() {
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });

    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.physicallyCorrectLights = true;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.camera = new THREE.OrthographicCamera(this.width / - 20, this.width / 20, this.height / 20, this.height / - 20, 1, 100);
    this.camera.position.set(0, 18, 0);
    this.camera.lookAt(0, 0, 0);

    this.adjustAspect();
    this.initWindowEvt();

    this.UIInit();

    /* init controls */
    this.dragableObj = new Array<Object3D>();
    this.cameraControls = new CameraControls(this.camera, this.renderer.domElement);
    this.dragControls = new DragControls(this.dragableObj, this.camera, this.canvas);
    (this.dragControls as any).enabled = true;
    this.cameraControls.enabled = false;
    this.dragControls.addEventListener('dragend', event => {
      let obj = event['object'];
      if (Math.abs(obj.position.x + 12) < 5 && Math.abs(Math.abs(obj.position.z % 10) - 5) < 3) {
        let insLineHeight = obj.position.z - obj.position.z % 10 + (obj.position.z > 0 ? 5 : -5);
        let index = (insLineHeight + 35) / 10 + this.pageOffset;
        if (this.insList[index][0] == -1) {
          obj.position.setX(-12);
          obj.position.setY(obj.position.y);
          obj.position.setZ(insLineHeight);
          this.moveList.push(obj);
          let insIndex = Math.round(10 * (obj.position.y - 13));
          this.insList[index][0] = insIndex;
          let limit = -1;
          switch (insIndex) {
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7: limit = this.limit - 1; break;
            case 8:
            case 9:
            case 10: limit = 49; break;
          }
          this.insTargetLimitList[index] = limit;
          if (limit != -1) {
            this.showInsTarget(index);
          }
        }
      }
      if (Math.abs(obj.position.x - 22) < 10 && Math.abs(obj.position.z - 35) < 10) {
        this.scene.remove(obj);
        for (let i = 0; i < this.dragableObj.length; i++)
          if (this.dragableObj[i] === obj)
            this.dragableObj.splice(i, 1);
      }
    });
    this.dragControls.addEventListener('dragstart', event => {
      if (this.isRunning) return;
      let obj = event['object'];
      if (Math.abs(obj.position.x + 12) < 1 && Math.abs(Math.abs(obj.position.z % 10) - 5) < 1) {
        let insLineHeight = obj.position.z - obj.position.z % 10 + (obj.position.z > 0 ? 5 : -5);
        let index = (insLineHeight + 35) / 10 + this.pageOffset;
        if (this.insList[index][0] != -1) {
          for (let i = 100; i < this.moveList.length; i++)
            if (this.moveList[i] === obj)
              this.moveList.splice(i, 1);
          this.insList[index][0] = -1;
          this.changeInsTarget(index, 0);
          this.hideInsTarget(index);
        }
      }
    });

    this.switchMode(false);

    //animation loop
    const clock = new THREE.Clock();
    let animationId: number;
    const renderLoop = () => {
      const delta = clock.getDelta();

      //TODO update physics
      this.cameraControls.update(delta);

      this.renderer.render(this.scene.object, this.camera);

      animationId = requestAnimationFrame(renderLoop);
    };

    renderLoop();
  }

  adjustAspect(): void {
    this.renderer.setSize(this.width, this.height);
    this.camera.updateProjectionMatrix();
  }

  initWindowEvt(): void {
    window.addEventListener('resize', () => {
      // if (this.mode === 'fullscreen') {
      //   this.width = window.innerWidth;
      //   this.height = window.innerHeight;

      // } else if (this.mode === 'xxxx') {
      //   //TODO
      //   this.width = 200;
      //   this.height = 200;
      // }

      this.adjustAspect();
    });
    this.canvas.addEventListener("click", event => {
      event.preventDefault();
      var raycaster = new THREE.Raycaster();
      var mouse = new THREE.Vector2();
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      mouse.x /= 0.4;
      mouse.y /= 0.85;
      if (Math.abs(mouse.x) < 1 && Math.abs(mouse.y) < 1) {
        raycaster.setFromCamera(mouse, this.camera);
        var intersects = raycaster.intersectObjects(this.scene.meshes);
        let name = intersects[0].object.name
        switch (name) {
          case "pageUp": this.pageMove(-1); break;
          case "pageDown": this.pageMove(1); break;
        }
        if (name.substring(0, 9) === "insTarget" && (!this.isRunning)) {
          if (name.charAt(9) == "A") {
            let index = Number(name.substring(15));
            let current = Number(this.insTargetMeshList[index][0].name.substring(17));

            if (name.charAt(12) == "1")
              this.changeInsTarget(index, current + 10);
            if (name.charAt(12) == "0")
              this.changeInsTarget(index, current + 1);
          }
          if (name.charAt(9) == "M") {
            let index = Number(name.substring(17));
            let current = Number(this.insTargetMeshList[index][0].name.substring(17));
            if (name.charAt(14) == "1")
              this.changeInsTarget(index, current - 10);
            if (name.charAt(14) == "0")
              this.changeInsTarget(index, current - 1);
          }
        }
        if (name == "run") {
          let inst = [];
          for (let i = 0; i < this.insList.length; i++) {
            if (this.insList[i][0] == -1) break;
            let name = "";
            switch (this.insList[i][0]) {
              case 0: name = "inbox"; break;
              case 1: name = "outbox"; break;
              case 2: name = "copyfrom"; break;
              case 3: name = "copyto"; break;
              case 4: name = "add"; break;
              case 5: name = "sub"; break;
              case 6: name = "bump+"; break;
              case 7: name = "bump-"; break;
              case 8: name = "jump"; break;
              case 9: name = "jump_zero"; break;
              case 10: name = "jump_neg"; break;
            }
            let referTo = 0;
            let jumpTo = 0;
            switch (this.insList[i][0]) {
              case 2:
              case 3:
              case 4:
              case 5:
              case 6:
              case 7: referTo = this.insList[i][1]; break;
              case 8:
              case 9:
              case 10: jumpTo = this.insList[i][1]; break;
            }
            inst.push(
              {
                name: name,
                color: "",
                referTo: referTo,
                jumpTo: jumpTo
              }
            );
          }
          this.problemService.problemEventEmitter.emit({
            ins: "run",
            insList: inst,
          });

          this.switchMode(true);
          // console.log(inst);
        }
        if (name == "stop") {
          this.switchMode(false);
          this.problemService.problemEventEmitter.emit({
            ins: "stop"
          });
        }
        if (name == "next" || name == "pre") {
          this.problemService.problemEventEmitter.emit({
            ins: name
          });
        }
      }
    })

    this.problemService.problemEventEmitter.subscribe((value: any) => {
      if (value.ins == "add") {
        console.log(value.message);
        this.addIns(value.message);
      }
    });

    this.problemService.problemEventEmitter.subscribe((value: any) => {
      if (value.ins == "limit") {
        this.limit = value.limit;
      }
    });
    // press f to drag
    // window.addEventListener('keydown', e=>{
    //   this.cameraControls.enabled = false;
    //   (this.dragControls as any).enabled = true;
    // });
    // window.addEventListener('keyup', e=>{
    //   this.cameraControls.enabled = true;
    //   (this.dragControls as any).enabled = false;
    // });
  }



  pageMove(offset: number): void {
    if (this.pageOffset + offset < 0 || this.pageOffset + offset > 45) return
    this.pageOffset += offset;
    for (let i = 0; i < this.moveList.length; i++) {
      this.moveList[i].position.setZ(this.moveList[i].position.z - offset * 10);
    }
  }



  UIInit(): void {
    this.runBtnGroup = new Array<Mesh>();
    this.stopBtnGroup = new Array<Mesh>();
    for (let i = 0; i <= 49; i++) {
      this.addIndex(i);
      this.addInsPosHint(i);
      this.addInsTarget(i);
      this.insTargetLimitList.push(-1);
    }
    this.addPageControlUI();
    this.addDeleteZone();
    this.addStepControl();
  }

  addIns(index: number): void {
    if (this.isRunning) return;
    let picpath = "../../../assets/icons/problem/ins_";
    switch (index) {
      case 0: picpath += "inbox"; break;
      case 1: picpath += "outbox"; break;
      case 2: picpath += "copyfrom"; break;
      case 3: picpath += "copyto"; break;
      case 4: picpath += "add"; break;
      case 5: picpath += "sub"; break;
      case 6: picpath += "bump+"; break;
      case 7: picpath += "bump-"; break;
      case 8: picpath += "jump"; break;
      case 9: picpath += "jump_zero"; break;
      case 10: picpath += "jump_neg"; break;
    }
    picpath += ".png";
    let ins = this.addSimplePicMesh(picpath, 16, 8, 20, 13 + index * 0.1, 0);
    this.dragableObj.push(ins);
  }

  addIndex(index: number): void {
    let text = index.toString();
    if (index <= 9) text = "0" + text;
    let res = this.addTextBlock(text, 25, 150, -25, -35 + index * 10);
    this.moveList.push(res);
    res.name = "index" + index;
  }

  addInsTarget(index: number): void {
    let insTargetMeshPackage = new Array<Mesh>();
    let indexText = index.toString();
    if (index <= 9) indexText = "0" + indexText;
    let text = this.addTextBlock("00", 25, 150, 3, -35 + index * 10);
    let add10 = this.addSimplePicMesh('../../../assets/icons/problem/numAdd.png', 1.6, 1.2, 2.3, 11.1, -35 + index * 10 - 1.6);
    let add1 = this.addSimplePicMesh('../../../assets/icons/problem/numAdd.png', 1.6, 1.2, 3.8, 11.1, -35 + index * 10 - 1.6);
    let minus10 = this.addSimplePicMesh('../../../assets/icons/problem/numMinus.png', 1.6, 1.2, 2.3, 11.1, -35 + index * 10 + 1.6);
    let minus1 = this.addSimplePicMesh('../../../assets/icons/problem/numMinus.png', 1.6, 1.2, 3.8, 11.1, -35 + index * 10 + 1.6);
    text.name = "insTargetText_" + indexText + "_00";
    add10.name = "insTargetAdd10_" + indexText;
    add1.name = "insTargetAdd01_" + indexText;
    minus10.name = "insTargetMinus10_" + indexText;
    minus1.name = "insTargetMinus01_" + indexText;
    insTargetMeshPackage.push(text, add10, add1, minus10, minus1);
    this.insTargetMeshList.push(insTargetMeshPackage);
    this.moveList.push(text, add10, add1, minus10, minus1);
    this.hideInsTarget(index);
  }

  switchMode(run: boolean): void {
    if (run) {
      for (let i = 0; i < this.runBtnGroup.length; i++)
        this.runBtnGroup[i].position.setY(12);
      for (let i = 0; i < this.stopBtnGroup.length; i++)
        this.stopBtnGroup[i].position.setY(-12);
      (this.dragControls as any).enabled = false;
    } else {
      for (let i = 0; i < this.runBtnGroup.length; i++)
        this.runBtnGroup[i].position.setY(-12);
      for (let i = 0; i < this.stopBtnGroup.length; i++)
        this.stopBtnGroup[i].position.setY(12);
      (this.dragControls as any).enabled = true;
    }
    this.isRunning = run;

  }

  changeInsTarget(index: number, target: number) {
    let limit = this.insTargetLimitList[index];
    if (limit != -1 && (target < 0 || target > limit)) return;
    let old = this.insTargetMeshList[index][0];
    let text = target.toString();
    if (target <= 9) text = "0" + text;
    console.log(text);
    let updated = this.addTextBlock(text, 25, 150, 3, old.position.z);
    updated.name = old.name.substring(0, 17) + text;
    this.insTargetMeshList[index][0] = updated;
    this.moveList.push(updated);
    this.insList[index][1] = target;
    this.scene.remove(old);
  }

  hideInsTarget(index: number): void {
    for (let i = 0; i <= 4; i++) {
      this.insTargetMeshList[index][i].position.x = -1000;
    }
  }

  showInsTarget(index: number): void {
    this.insTargetMeshList[index][0].position.x = 3;
    this.insTargetMeshList[index][1].position.x = 2.3;
    this.insTargetMeshList[index][2].position.x = 3.8;
    this.insTargetMeshList[index][3].position.x = 2.3;
    this.insTargetMeshList[index][4].position.x = 3.8;
  }
  addPageControlUI(): void {
    for (let i = 0; i <= 1; i++) {
      let text = i == 0 ? "↑" : "↓"
      this.addTextBlock(text, 65, 135, -31, -37 + i * 74).name = "page" + (i == 0 ? "Up" : "Down");
    }
  }

  addDeleteZone(): void {
    this.addSimplePicMesh('../../../assets/icons/problem/deleteZone.png', 18, 18, 22, 12, 30).name = "deleteZone";
  }

  addInsPosHint(index: number): void {
    let res = this.addSimplePicMesh('../../../assets/icons/problem/insPosHint.png', 20, 8, -12, 11, -35 + index * 10)
    this.moveList.push(res);
    res.name = "insPosHint" + index;
  }

  addStepControl(): void {
    let run = this.addSimplePicMesh('../../../assets/icons/problem/run.png', 20, 6.6, 23, 12, -32); run.name = "run";
    let stop = this.addSimplePicMesh('../../../assets/icons/problem/stop.png', 20, 6.6, 23, -12, -32); stop.name = "stop";
    let next = this.addSimplePicMesh('../../../assets/icons/problem/next.png', 9, 3.5, 18.5, 12, -15.5); next.name = "next";
    let pre = this.addSimplePicMesh('../../../assets/icons/problem/pre.png', 9, 3.5, 18.5, 12, -12); pre.name = "pre";
    this.runBtnGroup.push(stop, next, pre);
    this.stopBtnGroup.push(run);
  }

  addTextBlock(text: string, canvasX: number, canvasY: number, x: number, z: number): Mesh {
    let canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    let ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = "rgb(255,255,255)";
      ctx.font = "bolder 140px Arial ";
      ctx.fillText(text, canvasX, canvasY);
      ctx.globalAlpha = 0.5;
    }

    let texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;

    let material = new THREE.MeshBasicMaterial({
      map: texture
    });

    material.map!.repeat.x = material.map!.repeat.y = 1;
    let object = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(4, 4, 30, 30),
      material
    );
    object.receiveShadow = true;
    object.rotation.x = - Math.PI / 2;

    this.scene.add(object);
    object.position.set(x, 11, z);

    return object;
  }

  addSimplePicMesh(picPath: string, width: number, height: number, posX: number, posY: number, posZ: number): Mesh {
    const loader = new THREE.TextureLoader();

    let tex = loader.load(picPath);
    let material = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true
    });

    material.map!.repeat.x = material.map!.repeat.y = 1;

    let object = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(width, height, 30, 30),
      material
    );
    object.receiveShadow = true;
    object.rotation.x = - Math.PI / 2;

    this.scene.add(object);
    object.position.set(posX, posY, posZ);
    return object;
  }
}
