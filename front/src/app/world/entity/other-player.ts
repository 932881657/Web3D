import { SceneDirective } from '../basics/scene.directive';
import * as THREE from 'three';
import { AbstractPlayer } from './abstract-player';
import SpriteText from 'three-spritetext';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';


export class OtherPlayer extends AbstractPlayer {
    quaternion: THREE.Quaternion = new THREE.Quaternion(0, 0, 0, 0);
    walkDir: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
    currentAction: string = "idle";
    textObject!: SpriteText;

    constructor(sceneDirective: SceneDirective, username: string) {
        super(sceneDirective, username);

    }

    // animation loop
    update(delta: number): void {
        if (this.currentAction !== this.activeAction) {
            const to = this.actionMap.get(this.currentAction);
            const curr = this.actionMap.get(this.activeAction);
            curr?.fadeOut(.2);
            to?.reset().fadeIn(0.2).play();
            this.activeAction = this.currentAction;
        }
        this.mixer.update(delta);

        // update and position
        if (this.activeAction === 'walk') {
            this.model.quaternion.set(this.quaternion.x, this.quaternion.y, this.quaternion.z, this.quaternion.w)
            const moveX = -this.walkDir.x * 8 * delta;
            const moveZ = -this.walkDir.z * 8 * delta;
            this.model.position.x += moveX;
            this.model.position.z += moveZ;
        }
        this.textObject.position.set(
            this.model.position.x,
            this.model.position.y + 14,
            this.model.position.z
        );
    }

    setState(quaternion: number[], walkDir: number[], currentAction: string, position: number[]) {
        this.quaternion.set(quaternion[0], quaternion[1], quaternion[2], quaternion[3]);
        this.walkDir.set(walkDir[0], walkDir[1], walkDir[2]);
        this.currentAction = currentAction;
        this.model.position.set(position[0], position[1], position[2]);
    }

    override dispose(): void{
        if(this.model){
            this.model.traverse(temp => {
                this.sceneDirective.remove(temp);
            })
        }
        if(this.textObject){
            this.sceneDirective.remove(this.textObject);
        }
    }

    override load(name: string): Promise<boolean> {
        const loader = new FBXLoader();
        let baseUrl = '../../../assets/model/' + name + '/';
        return new Promise((resolve, reject) => {
            loader.load(baseUrl + 'model.fbx', object => {
                object.scale.set(.075, .075, .075);
                object.position.set(0, 10, 0);
                object.rotation.y = Math.PI;
                object.traverse(node => {
                    if ((node as THREE.Mesh).isMesh) {
                        node.castShadow = true;
                        ((node as THREE.Mesh).material as any).side = THREE.DoubleSide;
                    }
                });
                this.sceneDirective.add(object);
                this.model = object;
                this.textObject = new SpriteText(this.username);
                this.textObject.textHeight = 1;
                this.textObject.color = 'yellow';
                // this.textObject.fontSize = 3;
                this.sceneDirective.add(this.textObject);

                this.mixer = new THREE.AnimationMixer(object);

                this.addOneAction(object, false, 'tpose');

                loader.load(baseUrl + 'walk.fbx', object3 => {
                    this.addOneAction(object3, true, 'walk');
                    loader.load(baseUrl + 'idle.fbx', object5 => {
                        this.addOneAction(object5, false, 'idle');
                        resolve(true);
                    })
                })
            });
        });
    }
}