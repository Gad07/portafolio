import { GLTFLoader } from 'three-stdlib';
import fs from 'fs';

const loader = new GLTFLoader();

const files = ['drums.glb', 'guitar.glb', 'bass.glb', 'violin.glb', 'piano.glb'];

files.forEach(f => {
  const p = 'public/models/' + f;
  const buffer = fs.readFileSync(p);
  const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);

  loader.parse(
    arrayBuffer,
    '',
    (gltf) => {
      console.log('=== Model:', f);
      gltf.scene.traverse(child => {
        if (child.isMesh) {
          child.geometry.computeBoundingBox();
          const size = child.geometry.boundingBox.getSize(new (child.geometry.boundingBox.min.constructor)());
          console.log('  Mesh:', child.name || 'unnamed', 'size:', size.x.toFixed(2), size.y.toFixed(2), size.z.toFixed(2));
        }
      });
    },
    (err) => console.error('Error parsing', f, err)
  );
});
