import { AfterViewInit, Component, ViewChild, ElementRef, ContentChild, Input, OnDestroy, Output, EventEmitter, OnInit } from '@angular/core';
import { SceneDirective } from './basics/scene.directive';
import * as THREE from 'three';
import { Player } from './entity/player'
import * as ORBIT from 'three/examples/jsm/controls/OrbitControls';
import * as CANNON from 'cannon';
import { Vector3 } from 'three';
import { PlayerService } from '../services/player.service';
import { OtherPlayer } from './entity/other-player';
import { WorldMap } from './entity/world-map';
import { ActivatedRoute } from '@angular/router';
import CannonDebugger from 'cannon-es-debugger';
import { Problem } from './world.component';
import { DataService } from '../services/data.service';


@Component({
  selector: 'three-renderer-world',
  template: '<canvas #canvas></canvas>'
})
export class RendererWorldComponent implements AfterViewInit, OnDestroy {
  width!: number;
  height!: number;

  @ViewChild('canvas') canvasReference!: ElementRef;
  get canvas(): HTMLCanvasElement { return this.canvasReference.nativeElement; }

  @ContentChild(SceneDirective) scene!: SceneDirective
  @Output() loadedEmitter = new EventEmitter<boolean>();
  @Output() positionEmitter = new EventEmitter<number[]>();
  @Output() problemEmitter = new EventEmitter<string>();

  @Input() mapId!: string;
  @Input() problems!: Problem[];
  @Input() isInProblem!: boolean;

  renderer!: THREE.WebGLRenderer;
  camera!: THREE.PerspectiveCamera;
  world!: CANNON.World;

  myPlayer!: Player;
  myPlayerId!: any;
  keyPressed: Map<string, boolean> = new Map();
  otherPlayers: { [key: string]: OtherPlayer } = {};

  worldMap!: WorldMap;
  
  constructor(private playerService: PlayerService,
    private route: ActivatedRoute,
    private dataService: DataService) {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
  }

  ngAfterViewInit() {
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: false });

    this.renderer.setPixelRatio(window.devicePixelRatio * 0.75);
    this.renderer.physicallyCorrectLights = true;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    /**GLTF */
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 800);
    this.camera.position.set(0, 10, 10);

    this.adjustAspect();
    this.initWindowEvt();

    const orbitControls = new ORBIT.OrbitControls(this.camera, this.renderer.domElement);
    orbitControls.enableDamping = true;
    orbitControls.minDistance = 10;
    orbitControls.maxDistance = 20;
    orbitControls.enablePan = false;
    orbitControls.maxPolarAngle = Math.PI / 2 - 0.05;
    orbitControls.minPolarAngle = 0.05;

    orbitControls.target = new Vector3(0, 10, 0);
    orbitControls.update();

    this.initCannon();

    this.myPlayer = new Player(this.scene, this.keyPressed, this.camera, orbitControls, localStorage.getItem('username')!, this.world, this);
    this.worldMap = new WorldMap(this.scene, this.mapId, this.world, this.problems);


    const clock = new THREE.Clock();
    let animationId: number;
    const renderLoop = () => {

      const delta = clock.getDelta();

      this.renderPhysics();

      this.myPlayer.update(delta);

      this.positionEmitter.emit(this.myPlayer.bodyPositionFloat);

      orbitControls.update();

      this.playerService.myMove(this.myPlayer.quaternion, this.myPlayer.walkDir, this.myPlayer.activeAction, this.myPlayer.modelPosition);

      Object.keys(this.otherPlayers).forEach(key => {
        this.otherPlayers[key].update(delta);
      });

      this.renderer.render(this.scene.object, this.camera);

      animationId = requestAnimationFrame(renderLoop);
    };


    this.myPlayer.load(localStorage.getItem('modelName')!).then(() => {
      this.worldMap.load().then(() => {
        this.myPlayer.addPhysics();
        renderLoop();
        this.loadedEmitter.emit(true);
        this.playerService.connect(this.mapId);
        this.initSocket();
      });
    });
  }

  adjustAspect(): void {
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
  }

  initWindowEvt(): void {
    window.addEventListener('resize', () => {
      this.width = window.innerWidth;
      this.height = window.innerHeight;

      this.adjustAspect();
    });

    window.addEventListener('keydown', e => {
      this.keyPressed.set(e.key.toLowerCase(), true);
    });
    window.addEventListener('keyup', e => {
      this.keyPressed.set(e.key.toLowerCase(), false);
    });
  }

  initSocket(): void {
    this.playerService.onMyJoin().subscribe((resp: any) => {
      this.myPlayerId = resp.id;
      for (let one of resp.others) {
        const player = new OtherPlayer(this.scene, one.username);
        player.load(one.modelName).then(() => {
          this.otherPlayers[one.id] = player;
        });
      }
    });
    this.playerService.onOthersJoin().subscribe((one: any) => {
      if (one.username && one.id) {
        const player = new OtherPlayer(this.scene, one.username);
        player.load(one.modelName).then(() => {
          this.otherPlayers[one.id] = player;
        })
      }
    });
    this.playerService.onOthersQuit().subscribe((id: any) => {
      this.otherPlayers[id].dispose();
      delete this.otherPlayers[id];
    });
    this.playerService.onOthersMove().subscribe((resp: any) => {
      Object.keys(this.otherPlayers).forEach(key => {
        let temp = resp[key];
        this.otherPlayers[key].setState(temp.quaternion, temp.walkDir, temp.currentAction, temp.position);
      })
    });
    this.playerService.onOthersCreate().subscribe((resp: any) => {
      this.worldMap.addSocketPortal({
        ifUserDefined: true,
        name: resp.name,
        position: resp.position,
        rotationY: 0
      }).then();
    })
  }

  initCannon(): void {
    this.world = new CANNON.World();
    this.world.doProfiling = true;
    this.world.allowSleep = true;
    this.world.solver.iterations = 50;
    this.world.defaultContactMaterial.contactEquationStiffness = 5e6;
    this.world.defaultContactMaterial.contactEquationRelaxation = 16;
    this.world.gravity.set(0, -10, 0);
    this.world.quatNormalizeSkip = 0;
    this.world.quatNormalizeFast = false;
    this.world.broadphase = new CANNON.NaiveBroadphase();
  }

  renderPhysics(): void {
    this.world.step(1 / 60);
  }

  ngOnDestroy(): void {
    this.playerService.disconnect();
    this.myPlayer.dispose();
    this.worldMap.dispose();
  }

  showProblem(name: string): void {
    this.problemEmitter.emit(name);
  }
}
