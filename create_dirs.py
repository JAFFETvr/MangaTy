import os

base = r"c:\Users\Pan3s\Downloads\AppMangaTy\appMangaTy\src\features\creators"

directories = [
    "domain/entities",
    "domain/repositories", 
    "domain/use-cases",
    "data/datasources",
    "data/repositories",
    "presentation/components",
    "presentation/view-models"
]

for d in directories:
    path = os.path.join(base, d)
    os.makedirs(path, exist_ok=True)
    print(f"Created: {path}")

print("\n✅ All directories created successfully!")
