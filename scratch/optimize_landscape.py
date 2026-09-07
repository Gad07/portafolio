import struct
import json
import io
import os
import shutil
from PIL import Image

src_path = 'public/models/landscape_forest__mountains.glb'
bak_path = 'public/models/landscape_forest__mountains.glb.bak'

if not os.path.exists(bak_path):
    shutil.copyfile(src_path, bak_path)
    print('Backup created at', bak_path)

with open(bak_path, 'rb') as f:
    data = f.read()

json_len, _ = struct.unpack_from('<II', data, 12)
gltf = json.loads(data[20:20+json_len].decode('utf-8'))

bin_offset = 20 + json_len
bin_len, _ = struct.unpack_from('<II', data, bin_offset)
bin_data = data[bin_offset+8:bin_offset+8+bin_len]

# Terrain meshes that form the mountains, rocks, cliffs and terrain surface
# Mesh 0: Plane_Material.001_0
# Mesh 6: Plane.006_Material.007_0 (rock)
# Mesh 7: Plane.007_Material.008_0 (mountain cliff)
# Mesh 8: Plane.008_Material.001_0 (terrain ridge)
# Mesh 9: Plane.009_Material.009_0 (high mountain peak)
# Notice Mesh 3686 is the sphere sky dome which we exclude!
terrain_mesh_indices = {0, 6, 7, 8, 9}

# Also keep a curated sample of tree meshes (e.g. first 80 tree clusters) to have 3D trees without 3600 nodes
tree_mesh_indices = set(range(1, 6))

keep_mesh_indices = terrain_mesh_indices | tree_mesh_indices

# Filter nodes: keep root nodes and nodes with meshes in keep_mesh_indices
# Also limit tree node instances to ~150 to keep node count tiny (<200 nodes instead of 7380)
tree_instances_count = 0
keep_nodes = []
old_to_new_node = {}

for old_node_idx, node in enumerate(gltf['nodes']):
    mesh_idx = node.get('mesh')
    if mesh_idx in terrain_mesh_indices:
        old_to_new_node[old_node_idx] = len(keep_nodes)
        keep_nodes.append(dict(node))
    elif mesh_idx in tree_mesh_indices:
        if tree_instances_count < 160:
            tree_instances_count += 1
            old_to_new_node[old_node_idx] = len(keep_nodes)
            keep_nodes.append(dict(node))

print(f'Pruned nodes from {len(gltf["nodes"])} to {len(keep_nodes)}')

# Collect all meshes used by keep_nodes
used_mesh_indices = set()
for node in keep_nodes:
    if 'mesh' in node:
        used_mesh_indices.add(node['mesh'])

old_to_new_mesh = {}
new_meshes = []
for old_m_idx in sorted(used_mesh_indices):
    old_to_new_mesh[old_m_idx] = len(new_meshes)
    new_meshes.append(gltf['meshes'][old_m_idx])

# Update node mesh references
for node in keep_nodes:
    if 'mesh' in node:
        node['mesh'] = old_to_new_mesh[node['mesh']]
    if 'children' in node:
        node['children'] = [old_to_new_node[c] for c in node['children'] if c in old_to_new_node]

# Collect all accessors used by new_meshes
used_accessor_indices = set()
used_material_indices = set()
for m in new_meshes:
    for p in m['primitives']:
        if 'material' in p and p['material'] is not None:
            used_material_indices.add(p['material'])
        if 'indices' in p:
            used_accessor_indices.add(p['indices'])
        for attr, acc_idx in p.get('attributes', {}).items():
            used_accessor_indices.add(acc_idx)

old_to_new_acc = {}
new_accessors = []
for old_acc_idx in sorted(used_accessor_indices):
    old_to_new_acc[old_acc_idx] = len(new_accessors)
    new_accessors.append(gltf['accessors'][old_acc_idx])

# Update mesh accessor references
for m in new_meshes:
    for p in m['primitives']:
        if 'indices' in p:
            p['indices'] = old_to_new_acc[p['indices']]
        for attr in list(p.get('attributes', {}).keys()):
            p['attributes'][attr] = old_to_new_acc[p['attributes'][attr]]

# Collect materials, textures, images used
old_to_new_mat = {}
new_materials = []
used_texture_indices = set()

for old_mat_idx in sorted(used_material_indices):
    old_to_new_mat[old_mat_idx] = len(new_materials)
    mat = gltf['materials'][old_mat_idx]
    new_materials.append(mat)
    
    pbr = mat.get('pbrMetallicRoughness', {})
    if 'baseColorTexture' in pbr:
        used_texture_indices.add(pbr['baseColorTexture']['index'])
    if 'normalTexture' in mat:
        used_texture_indices.add(mat['normalTexture']['index'])

# Update primitive material references
for m in new_meshes:
    for p in m['primitives']:
        if 'material' in p and p['material'] is not None:
            p['material'] = old_to_new_mat[p['material']]

# Collect textures and images
old_to_new_tex = {}
new_textures = []
used_image_indices = set()

for old_t_idx in sorted(used_texture_indices):
    old_to_new_tex[old_t_idx] = len(new_textures)
    tex = gltf['textures'][old_t_idx]
    new_textures.append(tex)
    if 'source' in tex:
        used_image_indices.add(tex['source'])

# Update material texture references
for mat in new_materials:
    pbr = mat.get('pbrMetallicRoughness', {})
    if 'baseColorTexture' in pbr:
        pbr['baseColorTexture']['index'] = old_to_new_tex[pbr['baseColorTexture']['index']]
    if 'normalTexture' in mat:
        mat['normalTexture']['index'] = old_to_new_tex[mat['normalTexture']['index']]

# Collect bufferViews used by accessors
used_bv_indices = set()
for acc in new_accessors:
    if 'bufferView' in acc:
        used_bv_indices.add(acc['bufferView'])

# Rebuild binary buffer with geometry and compressed images
new_bin = bytearray()
new_bvs = []
old_to_new_bv = {}

# 1. Non-image bufferViews
for old_bv_idx in sorted(used_bv_indices):
    while len(new_bin) % 4 != 0:
        new_bin.append(0)
    bv = gltf['bufferViews'][old_bv_idx]
    start = bv.get('byteOffset', 0)
    length = bv['byteLength']
    chunk = bin_data[start:start+length]
    
    new_bv = dict(bv)
    new_bv['byteOffset'] = len(new_bin)
    new_bin.extend(chunk)
    old_to_new_bv[old_bv_idx] = len(new_bvs)
    new_bvs.append(new_bv)

# Update accessor bufferView references
for acc in new_accessors:
    if 'bufferView' in acc:
        acc['bufferView'] = old_to_new_bv[acc['bufferView']]

# 2. Compress and write images
old_to_new_img = {}
new_images = []

for old_img_idx in sorted(used_image_indices):
    img = gltf['images'][old_img_idx]
    old_bv_idx = img['bufferView']
    old_bv = gltf['bufferViews'][old_bv_idx]
    start = old_bv.get('byteOffset', 0)
    length = old_bv['byteLength']
    raw_bytes = bin_data[start:start+length]
    
    im = Image.open(io.BytesIO(raw_bytes))
    # Downscale textures if > 1024
    if im.width > 1024 or im.height > 1024:
        im = im.resize((min(im.width, 1024), min(im.height, 1024)), Image.Resampling.LANCZOS)
    
    out_buf = io.BytesIO()
    if im.mode == 'RGBA':
        # Check if alpha is opaque
        extrema = im.getextrema()
        if extrema[3][0] == 255 and extrema[3][1] == 255:
            im = im.convert('RGB')
            im.save(out_buf, format='JPEG', quality=85, optimize=True)
            img['mimeType'] = 'image/jpeg'
        else:
            im.save(out_buf, format='PNG', optimize=True)
            img['mimeType'] = 'image/png'
    else:
        if im.mode != 'RGB':
            im = im.convert('RGB')
        im.save(out_buf, format='JPEG', quality=85, optimize=True)
        img['mimeType'] = 'image/jpeg'
    
    c_data = out_buf.getvalue()
    while len(new_bin) % 4 != 0:
        new_bin.append(0)
    
    img_bv_idx = len(new_bvs)
    new_bvs.append({
        'buffer': 0,
        'byteOffset': len(new_bin),
        'byteLength': len(c_data)
    })
    new_bin.extend(c_data)
    
    new_img = {
        'bufferView': img_bv_idx,
        'mimeType': img['mimeType']
    }
    old_to_new_img[old_img_idx] = len(new_images)
    new_images.append(new_img)

# Update texture source references
for tex in new_textures:
    if 'source' in tex:
        tex['source'] = old_to_new_img[tex['source']]

# Construct optimized glTF JSON
opt_gltf = {
    'asset': gltf.get('asset', {'version': '2.0'}),
    'scenes': [{'nodes': list(range(len(keep_nodes)))}],
    'scene': 0,
    'nodes': keep_nodes,
    'meshes': new_meshes,
    'accessors': new_accessors,
    'bufferViews': new_bvs,
    'materials': new_materials,
    'textures': new_textures,
    'images': new_images,
    'buffers': [{'byteLength': len(new_bin)}]
}

json_bytes = json.dumps(opt_gltf, separators=(',', ':')).encode('utf-8')
while len(json_bytes) % 4 != 0:
    json_bytes += b' '

total_len = 12 + 8 + len(json_bytes) + 8 + len(new_bin)
header = struct.pack('<4sII', b'glTF', 2, total_len)
json_chunk_hdr = struct.pack('<II', len(json_bytes), 0x4E4F534A)
bin_chunk_hdr = struct.pack('<II', len(new_bin), 0x004E4942)

with open(src_path, 'wb') as f:
    f.write(header)
    f.write(json_chunk_hdr)
    f.write(json_bytes)
    f.write(bin_chunk_hdr)
    f.write(new_bin)

new_size_mb = os.path.getsize(src_path) / 1024 / 1024
print(f'Optimization complete! From 23.8 MB to {new_size_mb:.2f} MB, nodes: {len(keep_nodes)}')
