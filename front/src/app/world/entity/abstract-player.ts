import { SceneDirective } from "../basics/scene.directive";
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import * as THREE from 'three';

export class AbstractPlayer{
    actionMap: Map<string, THREE.AnimationAction> = new Map();
    activeAction!: string;
    mixer!: THREE.AnimationMixer;
    sceneDirective: SceneDirective;
    model!: THREE.Group;
    username!: string;

    constructor(sceneDirective: SceneDirective, username: string) {
        this.sceneDirective = sceneDirective;
        this.username = username;
    }

    load(name: string): Promise<boolean> {
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

    addOneAction(object: THREE.Group, isShift: boolean, name: string): void {
        if (isShift) {
            object.animations[0].tracks.shift();
        }
        const animationAction = this.mixer.clipAction(object.animations[0]);
        this.actionMap.set(name, animationAction);
        if (name === 'idle') {
            animationAction.play();
            this.activeAction = 'idle';
        }
    }

    dispose(): void{
        if(this.model){
            this.model.traverse(temp => {
                this.sceneDirective.remove(temp);
            })
        } 
    }
}