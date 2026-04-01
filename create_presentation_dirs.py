import os

base = r"c:\Users\Pan3s\Downloads\AppMangaTy\appMangaTy\src\features"

features = ['creators', 'unlocked-chapters', 'earnings', 'wallet']
subdirs = ['presentation/view-models', 'presentation/components']

for feature in features:
    for subdir in subdirs:
        path = os.path.join(base, feature, subdir)
        os.makedirs(path, exist_ok=True)
        print(f"✓ {path}")

print("\n✅ All presentation directories created!")
