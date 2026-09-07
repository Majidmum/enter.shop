import { useTexture } from '@react-three/drei';
import type { RefObject } from 'react';
import type { Group } from 'three';

export default function ProductMesh({ image, groupRef }: { image: string; groupRef: RefObject<Group> }) {
  const texture = useTexture(image);

  return (
    <group ref={groupRef}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2.2, 2.8, 0.14]} />
        {/* Порядок граней box-геометрии: +x, -x, +y, -y, +z (перед), -z (зад) */}
        <meshStandardMaterial attach="material-0" color="#e5e7eb" />
        <meshStandardMaterial attach="material-1" color="#e5e7eb" />
        <meshStandardMaterial attach="material-2" color="#e5e7eb" />
        <meshStandardMaterial attach="material-3" color="#e5e7eb" />
        <meshStandardMaterial attach="material-4" map={texture} />
        <meshStandardMaterial attach="material-5" color="#1f2937" />
      </mesh>
    </group>
  );
}
