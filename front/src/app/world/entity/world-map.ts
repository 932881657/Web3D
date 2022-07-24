import * as THREE from 'three';
import { SceneDirective } from "../basics/scene.directive";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { threeToCannon, ShapeType } from 'three-to-cannon';
import * as CANNON from 'cannon';
import { Problem } from '../world.component';


export class WorldMap {
    mixer!: THREE.AnimationMixer;
    sceneDirective: SceneDirective;
    mapModel!: THREE.Group;
    mapId: string;
    mapUrl: string = '../../../assets/model/map/';
    portalUrl: string = '../../../assets/model/portal/'
    world: CANNON.World;

    problems: Problem[];

    constructor(sceneDirective: SceneDirective,
        mapId: string,
        world: CANNON.World,
        problems: Problem[]
    ) {
        this.sceneDirective = sceneDirective;
        this.mapId = mapId;
        this.world = world;
        this.problems = problems;
    }

    load(): Promise<boolean> {
        switch (this.mapId) {
            case 'camp':
                return this.loadCamp();
            case 'island':
                return this.loadIsland();
            case 'forest':
                return this.loadForest();
        }
        return this.loadCamp();
    }

    loadCamp(): Promise<boolean> {
        const gltfLoader = new GLTFLoader();
        return new Promise((resolve) => {
            gltfLoader.setPath(this.mapUrl + 'camp/').load('scene.gltf', gltf => {
                this.mapModel = gltf.scene;
                this.preprocess(this.mapModel, {
                    scale: 13,
                    position: [5, 0, -130],
                    rotationY: -Math.PI * 3 / 8
                });
                this.addPhysicsCamp();
                this.addOriginalPortal(gltfLoader, 3, resolve);
            });
        })
    }

    loadIsland(): Promise<boolean> {
        const gltfLoader = new GLTFLoader();
        return new Promise((resolve) => {
            gltfLoader.setPath(this.mapUrl + 'island/').load('scene.gltf', gltf => {
                this.mapModel = gltf.scene;
                this.preprocess(this.mapModel, {
                    scale: 0.3,
                    position: [-50, 140, -460],
                    rotationY: 0
                });
                this.addPhysicsIsland();
                this.addOriginalPortal(gltfLoader, 1, resolve);
            });
        })
    }

    loadForest(): Promise<boolean> {
        const objLoader = new OBJLoader();
        const gltfLoader = new GLTFLoader();
        const mtlLoader = new MTLLoader();
        let url = {
            model: this.mapUrl + 'lava/model.obj',
            tex: this.mapUrl + 'lava/model.mtl'
        };
        return new Promise((resolve) => {
            mtlLoader.load(url.tex, mat => {
                mat.preload();
                objLoader.setMaterials(mat);
                objLoader.load(url.model, object => {
                    this.mapModel = object;
                    this.preprocess(this.mapModel, {
                        scale: 0.04,
                        position: [0, 5, 243],
                        rotationY: 0
                    });
                    this.addPhysicsForest();
                    this.addOriginalPortal(gltfLoader, 4, resolve);
                });
            });

        });
    }

    setMatrix(model: THREE.Object3D, scale: number, position: number[], rotationY: number) {
        model.scale.set(scale, scale, scale);
        model.position.set(position[0], position[1], position[2]);
        model.rotation.y = rotationY;
    }

    preprocess(model: THREE.Group, config: any): void {
        this.setMatrix(model, config.scale, config.position, config.rotationY);
        model.traverse(node => {
            if ((node as THREE.Mesh).isMesh) {
                node.castShadow = true;
                ((node as THREE.Mesh).material as any).side = THREE.DoubleSide;
            }
        })
        this.sceneDirective.add(model);
    }

    addPhysicsCamp() {
        // ground
        this.addBoxToWorld({
            size: [350, 10, 330],
            position: [0, -4, -130],
            rotation: [0, 0, 0]
        });
        // trees
        let treeCoordinates = [[56, -4, -82], [97, -4, -121.5], [65, -4, -171.5], [15.7, -4, -202.5],
        [-105.4, -4, -79.5], [-64.7, -4, -118.7], [-97, -4, -168.5], [-85.7, -4, -217.4], [-9, -4, -250.3],
        [62, -4, -232], [-42.6, -4, -191.8]];
        for (let treeCoordinate of treeCoordinates) {
            this.addBoxToWorld({
                size: [10, 50, 10],
                position: treeCoordinate,
                rotation: [0, 0, 0]
            });
        }
        // others
        this.addBoxToWorld({
            size: [20, 14, 20],
            position: [-70.9, 0, -93.2],
            rotation: [0, 0, 0]
        });
        this.addBoxToWorld({
            size: [70, 10, 10],
            position: [-30, 0, -75.3],
            rotation: [0, Math.PI * 0.7, 0]
        });
        this.addBoxToWorld({
            size: [45, 7, 7],
            position: [25, 0, -70.3],
            rotation: [0, Math.PI * 1.25, 0]
        });
        this.addBoxToWorld({
            size: [90, 10, 10],
            position: [3.3, 3, -213.3],
            rotation: [0, Math.PI * 0.9, 0]
        });
        this.addBoxToWorld({
            size: [25, 25, 25],
            position: [102.3, 3, -73.7],
            rotation: [0, 0, 0]
        });
        // walls
        this.addBoxToWorld({
            size: [400, 50, 5],
            position: [-1.6, 0, 30.7],
            rotation: [0, 0, 0]
        });
        this.addBoxToWorld({
            size: [400, 50, 5],
            position: [0.5, 0, -291],
            rotation: [0, 0, 0]
        });
        this.addBoxToWorld({
            size: [400, 50, 5],
            position: [-170, 0, -148],
            rotation: [0, Math.PI / 2, 0]
        });
        this.addBoxToWorld({
            size: [400, 50, 5],
            position: [175, 0, -157],
            rotation: [0, Math.PI / 2, 0]
        });

    }

    addPhysicsIsland() {
        // ground
        this.addBoxToWorld({
            size: [2000, 10, 2000],
            position: [0, -4, -440],
            rotation: [0, 0, 0]
        });
        // others
        this.addBoxToWorld({
            size: [30, 50, 30],
            position: [-217, -4, -520],
            rotation: [0, 0, 0]
        });
        // others
        this.addBoxToWorld({
            size: [230, 100, 200],
            position: [-305, -4, -738],
            rotation: [0, 0, 0]
        });
        this.addBoxToWorld({
            size: [50, 100, 50],
            position: [-73, -4, -818],
            rotation: [0, 0, 0]
        });
        this.addBoxToWorld({
            size: [200, 100, 70],
            position: [218, -4, -782],
            rotation: [0, 0, 0]
        });
        this.addBoxToWorld({
            size: [70, 100, 70],
            position: [286, -4, -728],
            rotation: [0, 0, 0]
        });
        // walls
        this.addBoxToWorld({
            size: [2000, 50, 5],
            position: [1000, 0, -440],
            rotation: [0, Math.PI / 2, 0]
        });
        this.addBoxToWorld({
            size: [2000, 50, 5],
            position: [-1000, 0, -440],
            rotation: [0, Math.PI / 2, 0]
        });
        this.addBoxToWorld({
            size: [2000, 50, 5],
            position: [0, 0, 560],
            rotation: [0, 0, 0]
        });
        this.addBoxToWorld({
            size: [2000, 50, 5],
            position: [0, 0, -1440],
            rotation: [0, 0, 0]
        });
    }

    addPhysicsForest() {
        this.addBoxToWorld({
            size: [700, 10, 600],
            position: [0, -4, 200],
            rotation: [0, 0, 0]
        });
        // stones
        let stoneCoordinates = [[60, 0, -67], [52, 0, -87], [27, 0, 182], [17, 0, 227.7],
        [-66, 0, 249], [-57, 0, 236], [-29, 0, 255], [-12.6, 0, 246.3],
        [7.5, 0, 264.3], [18.4, 0, 278.4], [47.8, 0, 267.8], [-30.7, 0, 238.5],
        [33, 0, 274.3], [49.1, 0, 235.5], [78.2, 0, 248.5], [65.7, 0, 255.8],
        [59, 0, 240], [56.5, 0, 268.5], [32.2, 0, 232.1], [40.3, 0, 219.4],
        [91.5, 0, 251.3], [-88.4, 0, 321.6], [-8.2, 0, 272.4], [4.57, 0, 279]]
        for (let stoneCoordinate of stoneCoordinates) {
            this.addBoxToWorld({
                size: [15, 20, 15],
                position: stoneCoordinate,
                rotation: [0, 0, 0]
            });
        }
        // walls
        this.addBoxToWorld({
            size: [700, 50, 5],
            position: [-350, -4, 200],
            rotation: [0, Math.PI / 2, 0]
        });
        this.addBoxToWorld({
            size: [700, 50, 5],
            position: [350, -4, 200],
            rotation: [0, Math.PI / 2, 0]
        });
        this.addBoxToWorld({
            size: [700, 50, 5],
            position: [0, -4, 500],
            rotation: [0, 0, 0]
        });
        this.addBoxToWorld({
            size: [700, 50, 5],
            position: [0, -4, -100],
            rotation: [0, 0, 0]
        });

    }

    dispose(): void {
        if(this.mapModel){
            this.mapModel.traverse(node => {
                this.sceneDirective.remove(node);
            })
        }
    }

    addBoxToWorld(config: any): void {
        let box = new THREE.Mesh(new THREE.BoxGeometry(config.size[0], config.size[1], config.size[2]));

        const body = new CANNON.Body({
            position: new CANNON.Vec3(config.position[0], config.position[1], config.position[2]),
            collisionFilterGroup: 1,
            collisionFilterMask: 2,
            allowSleep: true,
            mass: 0,
            shape: threeToCannon(box as any, { type: ShapeType.BOX })?.shape as any
        });

        body.quaternion.setFromEuler(config.rotation[0], config.rotation[1], config.rotation[2]);
        body.sleep();
        body.computeAABB();
        this.world.addBody(body);
    }

    addPortalBoxToWorld(name: string, position: number[]): void {
        let box = new THREE.Mesh(new THREE.BoxGeometry(5, 10, 1));

        const body = new CANNON.Body({
            position: new CANNON.Vec3(position[0], 10, position[2]),
            collisionFilterGroup: 3,
            allowSleep: true,
            mass: 0,
            shape: threeToCannon(box as any, { type: ShapeType.BOX })?.shape as any
        });
        (body as any).name = name;
        body.sleep();
        body.computeAABB();
        this.world.addBody(body);
    }

    private addOriginalPortal(gltfLoader:GLTFLoader, scale:number, resolve:any):void {
        gltfLoader.setPath(this.portalUrl + this.mapId + '/').load('scene.gltf', gltf => {
            let portalModel = gltf.scene;

            this.problems.filter(problem => !problem.ifUserDefined).forEach((problem) => {
                this.addPortalBoxToWorld(problem.name, problem.position);
                this.preprocess(portalModel.clone(), {
                    scale: scale,
                    position: problem.position,
                    rotationY: problem.rotationY
                });
            });
            gltfLoader.setPath(this.portalUrl + 'user/').load('scene.gltf', gltf => {
                let portalModel = gltf.scene;

                this.problems.filter(problem => problem.ifUserDefined).forEach((problem) => {
                    this.addPortalBoxToWorld(problem.name, problem.position);
                    this.preprocess(portalModel.clone(), {
                        scale: 1,
                        position: problem.position,
                        rotationY: problem.rotationY
                    });
                });
                resolve(true);
            })
        })
    }

    addSocketPortal(problem: Problem): Promise<boolean> {
        const gltfLoader = new GLTFLoader();
        return new Promise((resolve) => {
            gltfLoader.setPath(this.portalUrl + 'user/').load('scene.gltf', gltf => {
                let portalModel = gltf.scene;
                this.addPortalBoxToWorld(problem.name, [problem.position[0], problem.position[1], problem.position[2]]);
                this.preprocess(portalModel.clone(), {
                    scale: 1,
                    position: problem.position,
                    rotationY: 0
                });
                resolve(true);
            });
        });

    }
}