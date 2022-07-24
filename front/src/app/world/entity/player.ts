import { SceneDirective } from "../basics/scene.directive";
import * as THREE from 'three';
import * as ORBIT from 'three/examples/jsm/controls/OrbitControls'
import { AbstractPlayer } from "./abstract-player";
import * as CANNON from 'cannon';
import { threeToCannon, ShapeType } from 'three-to-cannon';
import { DataService } from "src/app/services/data.service";
import { RendererWorldComponent } from "../renderer-world.component";

const directionsKeys = ['w', 'a', 's', 'd'];

export class Player extends AbstractPlayer {
    keyPressed: Map<string, boolean>;
    camera: THREE.Camera;
    orbitControls: ORBIT.OrbitControls;
    rotateQ = new THREE.Quaternion();
    rotateA = new THREE.Vector3(0, 1, 0);
    walkDir = new THREE.Vector3(0, 0, 0);
    walkDirCannon = new CANNON.Vec3(0, 0, 0);
    cameraTarget = new THREE.Vector3();
    world: CANNON.World;
    body!: CANNON.Body;
    cameraBody!: CANNON.Body;
    rayResult: CANNON.RaycastResult = new CANNON.RaycastResult();
    slopeVelocity: THREE.Vector3 = new THREE.Vector3(0, 0, 0);

    rendererCopy:RendererWorldComponent;

    constructor(
        sceneDirective: SceneDirective,
        keyPressed: Map<string, boolean>,
        camera: THREE.Camera,
        orbitControls: ORBIT.OrbitControls,
        username: string,
        world: CANNON.World,
        rendererCopy:RendererWorldComponent
    ) {
        super(sceneDirective, username);
        this.keyPressed = keyPressed;
        this.camera = camera;
        this.orbitControls = orbitControls;
        this.world = world;
        this.rendererCopy = rendererCopy;
    }

    // animation loop
    update(delta: number): void {
        const directionPressed = directionsKeys.some(key => this.keyPressed.get(key));
        let currentAction = directionPressed ? 'walk' : 'idle';
        if (currentAction !== this.activeAction) {
            const to = this.actionMap.get(currentAction);
            const curr = this.actionMap.get(this.activeAction);
            curr?.fadeOut(.2);
            to?.reset().fadeIn(0.2).play();
            this.activeAction = currentAction;
        }
        //get position for debugging
        this.mixer.update(delta);

        this.model.position.x = this.body.position.x;
        this.model.position.y = this.body.position.y - 7;
        this.model.position.z = this.body.position.z;

        this.raycast();
        this.velocity.x = 0;
        this.velocity.z = 0;

        // console.log(this.bodyPosition);

        if (this.activeAction === 'walk') {
            let dir = this.directionOffset();
            this.rotateQ.setFromAxisAngle(this.rotateA, Math.atan2(
                (this.camera.position.x - this.model.position.x),
                (this.camera.position.z - this.model.position.z)) + dir);
            this.model.quaternion.rotateTowards(this.rotateQ, .2);

            this.camera.getWorldDirection(this.walkDir);

            this.walkDir.y = 0;
            this.walkDir.normalize();
            this.walkDir.applyAxisAngle(this.rotateA, dir);

            let vX = -this.walkDir.x * 50;
            let vZ = -this.walkDir.z * 50;
            if (Math.abs(this.velocity.x) < 50 || (vX * this.velocity.x < 0)) {
                this.velocity.x += vX;
            }
            if (Math.abs(this.velocity.z) < 50 || (vZ * this.velocity.z < 0)) {
                this.velocity.z += vZ;
            }

            // update camera target
            this.cameraTarget.set(this.model.position.x, this.model.position.y + 10, this.model.position.z);
            this.orbitControls.target = this.cameraTarget;
        }

    }

    private directionOffset(): number {
        let result = Math.PI;

        if (this.keyPressed.get('w')) {
            if (this.keyPressed.get('a')) {
                result = 5 * Math.PI / 4;
            } else if (this.keyPressed.get('d')) {
                result = 3 * Math.PI / 4;
            }
        } else if (this.keyPressed.get('s')) {
            if (this.keyPressed.get('a')) {
                result = -Math.PI / 4;
            } else if (this.keyPressed.get('d')) {
                result = Math.PI / 4;
            } else {
                result = 0;
            }
        } else if (this.keyPressed.get('a')) {
            result = - Math.PI / 2
        } else if (this.keyPressed.get('d')) {
            result = Math.PI / 2
        }

        return result;
    }

    get quaternion(): THREE.Quaternion {
        return this.model.quaternion;
    }

    get bodyPosition(): CANNON.Vec3 {
        return this.body.position;
    }

    get bodyPositionFloat(): number[] {
        return [Number(this.bodyPosition.x.toFixed(1)),
        Number(this.bodyPosition.y.toFixed(1)) + 2,
        Number(this.bodyPosition.z.toFixed(1))]
    }

    get modelPosition(): THREE.Vector3 {
        return this.model.position;
    }

    get velocity(): CANNON.Vec3 {
        return this.body.velocity;
    }

    addPhysics() {
        let boundingBox: THREE.Mesh = new THREE.Mesh(new THREE.BoxGeometry(3.5, 14, 3.5));
        let material: CANNON.Material = new CANNON.Material("player");
        material.friction = 0.3;
        let body = new CANNON.Body({
            material: material,
            mass: 5,
            allowSleep: false,
            fixedRotation: true,
            collisionFilterGroup: 2,
            collisionFilterMask: 1,
            position: new CANNON.Vec3(this.model.position.x, this.model.position.y + 10, this.model.position.z),
            shape: threeToCannon(boundingBox as any, { type: ShapeType.BOX })?.shape as any
        });

        this.body = body;
        this.world.addBody(body);
    }

    raycast() {
        const start = new CANNON.Vec3(this.bodyPosition.x, this.bodyPosition.y, this.bodyPosition.z);
        const end = new CANNON.Vec3(this.bodyPosition.x + 10, this.bodyPosition.y, this.bodyPosition.z + 10);
        // Cast the ray
        let rayHasHit = (this.world as any).raycastClosest(start, end, {
            collisionFilterMask: ~2
        }, this.rayResult);

        let problemId = (this.rayResult.body as any)?.name;
        if (rayHasHit && problemId && !this.rendererCopy.isInProblem) {
            this.rendererCopy.showProblem(problemId)
        }
    }
}