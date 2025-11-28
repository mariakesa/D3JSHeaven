import json
import numpy as np

# ---------------------------------------------------------------------
# 1. Load ImageNet-1K label names
# ---------------------------------------------------------------------

# Official mapping from class index → label name:
# If you don't have imagenet_classes.txt, this block will download them.
import os
LABEL_PATH = "imagenet1000_clsidx_to_labels.txt"

if not os.path.exists(LABEL_PATH):
    import urllib.request
    print("Downloading ImageNet label file...")
    url = "https://raw.githubusercontent.com/pytorch/hub/master/imagenet_classes.txt"
    urllib.request.urlretrieve(url, LABEL_PATH)

with open(LABEL_PATH, "r") as f:
    imagenet_labels = [line.strip() for line in f.readlines()]

# ---------------------------------------------------------------------
# 2. Load your PCA results (eigenlogits / eigenvectors)
# ---------------------------------------------------------------------
JSON_PATH = "vit_pca.json"

with open(JSON_PATH, "r") as f:
    data = json.load(f)

# eigenvectors.shape = (3, 1000)
# but eigenlogits is also fine — gives same ordering
eigenvectors = np.array(data["eigenvectors"])   # shape (3, 1000)

print(f"Loaded eigenvectors: {eigenvectors.shape}")

# ---------------------------------------------------------------------
# 3. For each PC, sort the 1000 ImageNet labels by loading
# ---------------------------------------------------------------------

def print_top_labels(pc_index, k=20):
    """Prints top + bottom k labels for PC."""
    v = eigenvectors[pc_index]   # 1000-D vector
    order = np.argsort(v)       # ascending

    pc_name = f"PC{pc_index+1}"
    print("\n======================================================")
    print(f" SEMANTIC SIGNATURE OF {pc_name}")
    print("======================================================")

    print(f"\nTop {k} MOST POSITIVE semantic labels:")
    for idx in order[-k:][::-1]:   # reversed for descending
        print(f"  + {v[idx]: .4f}   {imagenet_labels[idx]}")

    print(f"\nTop {k} MOST NEGATIVE semantic labels:")
    for idx in order[:k]:
        print(f"  - {v[idx]: .4f}   {imagenet_labels[idx]}")

# Print for PC1, PC2, PC3
print_top_labels(0, k=20)
print_top_labels(1, k=20)
print_top_labels(2, k=20)
