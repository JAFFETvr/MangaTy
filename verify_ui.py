# Verificar archivos creados
import os

base = r"c:\Users\Pan3s\Downloads\AppMangaTy\appMangaTy\src\features"

features = {
    'creators': {
        'presentation/view-models': ['CreatorViewModel.ts', 'index.ts'],
        'presentation/components': ['CreatorCard.tsx', 'CreatorBadge.tsx', 'CreatorDashboardScreen.tsx', 'CreatorsListScreen.tsx', 'index.ts'],
        'presentation': ['index.ts'],
    },
    'unlocked-chapters': {
        'presentation/view-models': ['UnlockChapterViewModel.ts', 'index.ts'],
        'presentation/components': ['UnlockChapterButton.tsx', 'ChapterListItem.tsx', 'MangaChaptersSection.tsx', 'index.ts'],
        'presentation': ['index.ts'],
    },
    'earnings': {
        'presentation/view-models': ['EarningsViewModel.ts', 'index.ts'],
        'presentation/components': ['EarningsDashboard.tsx', 'EarningItem.tsx', 'EarningsList.tsx', 'index.ts'],
        'presentation': ['index.ts'],
        'domain/use-cases': ['GetCreatorEarningStats.ts'],
    },
    'wallet': {
        'presentation/view-models': ['WalletViewModel.ts', 'index.ts'],
        'presentation/components': ['WalletHeader.tsx', 'TransactionItem.tsx', 'TransactionList.tsx', 'WalletStatsCard.tsx', 'WalletScreen.tsx', 'index.ts'],
        'presentation': ['index.ts'],
        'domain/use-cases': ['GetWalletTransactions.ts', 'GetWalletBalance.ts', 'GetTransactionStats.ts'],
    },
}

print("=== Verificando archivos UI creados ===\n")

all_ok = True
for feature, folders in features.items():
    print(f"📁 {feature}/")
    for folder, files in folders.items():
        folder_path = os.path.join(base, feature, folder)
        for file in files:
            file_path = os.path.join(folder_path, file)
            exists = os.path.exists(file_path)
            status = "✅" if exists else "❌"
            if not exists:
                all_ok = False
            print(f"   {status} {folder}/{file}")
    print()

# Also check app routes
routes_dir = r"c:\Users\Pan3s\Downloads\AppMangaTy\appMangaTy\app"
routes = ['wallet.tsx', 'creator-dashboard.tsx', 'creators.tsx']

print("📁 app/ (routes)")
for route in routes:
    path = os.path.join(routes_dir, route)
    exists = os.path.exists(path)
    status = "✅" if exists else "❌"
    if not exists:
        all_ok = False
    print(f"   {status} {route}")

print()
if all_ok:
    print("🎉 Todos los archivos creados correctamente!")
else:
    print("⚠️ Algunos archivos faltan")
