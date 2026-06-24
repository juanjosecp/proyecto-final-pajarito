import sys

def split_obj(obj_filepath, base_out, tapa_out):
    # We will collect vertices and faces for Base and Tapa
    base_vertices = []
    base_faces = []
    tapa_vertices = []
    tapa_faces = []

    current_part = "base" # base or tapa
    
    # We need a mapping from global vertex index to local vertex index for base and tapa
    global_to_base_v = {}
    global_to_tapa_v = {}
    
    global_v_count = 0
    
    with open(obj_filepath, 'r') as f:
        for line in f:
            if line.startswith('o '):
                obj_name = line.strip().split()[1]
                if obj_name == 'Cubo.002':
                    current_part = "tapa"
                else:
                    current_part = "base"
            elif line.startswith('v '):
                global_v_count += 1
                parts = line.strip().split()
                if len(parts) >= 4:
                    v = (float(parts[1]), float(parts[2]), float(parts[3]))
                    if current_part == "base":
                        base_vertices.append(v)
                        global_to_base_v[global_v_count] = len(base_vertices)
                    else:
                        tapa_vertices.append(v)
                        global_to_tapa_v[global_v_count] = len(tapa_vertices)
            elif line.startswith('f '):
                parts = line.strip().split()[1:]
                face_indices = []
                for p in parts:
                    v_idx = int(p.split('/')[0])
                    face_indices.append(v_idx)
                
                # Check which part this face belongs to by checking the first vertex
                v_first = face_indices[0]
                if v_first in global_to_base_v:
                    # mapped to base
                    mapped_face = [global_to_base_v[idx] for idx in face_indices]
                    base_faces.append(mapped_face)
                elif v_first in global_to_tapa_v:
                    mapped_face = [global_to_tapa_v[idx] for idx in face_indices]
                    tapa_faces.append(mapped_face)

    def write_dat(filepath, vertices, faces):
        with open(filepath, 'w') as f:
            for i, v in enumerate(vertices):
                f.write(f"{i+1} {v[0]:.4f} {v[1]:.4f} {v[2]:.4f}\n")
            f.write("Faces:\n")
            for face in faces:
                face_str = " ".join(str(idx) for idx in face)
                f.write(f"{face_str}.\n")

    write_dat(base_out, base_vertices, base_faces)
    write_dat(tapa_out, tapa_vertices, tapa_faces)
    print(f"Base: {len(base_vertices)} vertices, {len(base_faces)} faces -> {base_out}")
    print(f"Tapa: {len(tapa_vertices)} vertices, {len(tapa_faces)} faces -> {tapa_out}")

if __name__ == '__main__':
    split_obj('../laptop_detallada3.obj', 'laptop_base.txt', 'laptop_tapa.txt')
