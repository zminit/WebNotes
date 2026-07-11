import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeScene({ angle, light }: { angle: number; light: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = host.current!; const scene = new THREE.Scene(); scene.background = new THREE.Color(light ? '#edf4fa' : '#071425');
    const camera = new THREE.PerspectiveCamera(48, el.clientWidth / el.clientHeight, .1, 100); camera.position.set(4, 2.5, 5);
    const renderer = new THREE.WebGLRenderer({ antialias: true }); renderer.setSize(el.clientWidth, el.clientHeight); renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); el.appendChild(renderer.domElement);
    const group = new THREE.Group(); scene.add(group);
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(1, 36, 24), new THREE.MeshStandardMaterial({ color: '#8c72ff', roughness: .32, metalness: .12 })); group.add(sphere);
    const small = new THREE.Mesh(new THREE.SphereGeometry(.42, 28, 16), new THREE.MeshStandardMaterial({ color: '#55e7ff', emissive: '#0d7087', emissiveIntensity: .45 })); small.position.set(-.48, .42, .74); group.add(small);
    const cube = new THREE.Mesh(new THREE.BoxGeometry(.78, .78, .78), new THREE.MeshStandardMaterial({ color: '#ffd45b', roughness: .45 })); cube.position.set(1.05, -.25, .05); group.add(cube);
    const grid = new THREE.GridHelper(8, 12, light ? '#6f91ad' : '#285179', light ? '#b8cad9' : '#183755'); grid.position.y = -1.25; scene.add(grid);
    scene.add(new THREE.AmbientLight('#8eb8ff', 1.6)); const keyLight = new THREE.PointLight('#bceeff', 35); keyLight.position.set(3, 5, 4); scene.add(keyLight);
    const ray = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(3, .5, 3), new THREE.Vector3(0, 0, 0)]), new THREE.LineBasicMaterial({ color: light ? '#123f70' : '#55e7ff' })); scene.add(ray);
    const resize = () => { camera.aspect = el.clientWidth / el.clientHeight; camera.updateProjectionMatrix(); renderer.setSize(el.clientWidth, el.clientHeight); };
    addEventListener('resize', resize); let id = 0;
    const tick = () => { group.rotation.y = angle * Math.PI / 180; const a = angle * Math.PI / 180; ray.geometry.setFromPoints([new THREE.Vector3(3 * Math.cos(a), .65, 3 * Math.sin(a)), new THREE.Vector3(0, 0, 0)]); camera.lookAt(0, 0, 0); renderer.render(scene, camera); id = requestAnimationFrame(tick); }; tick();
    return () => { cancelAnimationFrame(id); removeEventListener('resize', resize); renderer.dispose(); el.removeChild(renderer.domElement); };
  }, [angle, light]);
  return <div className="three" ref={host} />;
}
