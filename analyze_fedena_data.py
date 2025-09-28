import pandas as pd
import re

# Read the Excel file
df = pd.read_excel("D:\\Projects\\sparked\\Fedena_Complete_Features_Extracted.xlsx")

print("=== FEDENA FEATURES ANALYSIS ===")
print(f"Total modules: {len(df)}")
print(f"Columns: {list(df.columns)}")
print()

# Analyze the structure of features
print("=== FEATURES STRUCTURE ANALYSIS ===")

# Count total features across all modules
total_features = 0
feature_patterns = []

for idx, row in df.iterrows():
    features_text = row['Features']
    if pd.notna(features_text):
        # Split by newlines and count bullet points
        feature_lines = [line.strip() for line in str(features_text).split('\n') if line.strip().startswith('-')]
        total_features += len(feature_lines)

        # Analyze patterns in first 3 modules for structure understanding
        if idx < 3:
            print(f"\n--- {row['Module Name']} ---")
            print(f"Number of features: {len(feature_lines)}")
            print("Sample features:")
            for i, feature in enumerate(feature_lines[:3]):
                print(f"  {i+1}. {feature}")

print(f"\nTotal features across all modules: {total_features}")
print(f"Average features per module: {total_features/len(df):.1f}")

# Categorize features by type for product development insights
print("\n=== PRODUCT DEVELOPMENT CATEGORIES ===")

categories = {
    "User Management": ["user", "login", "access", "privilege", "role", "authentication"],
    "Data Management": ["data", "import", "export", "backup", "database", "record"],
    "Communication": ["sms", "email", "messaging", "notification", "alert", "communication"],
    "Academic": ["student", "exam", "grade", "attendance", "assignment", "course", "batch"],
    "Financial": ["fee", "payment", "finance", "transaction", "invoice", "collection"],
    "Reporting": ["report", "analytics", "dashboard", "analysis", "generate"],
    "Integration": ["integration", "sync", "api", "connect", "third-party"],
    "Mobile": ["mobile", "app", "device", "biometric"],
    "Customization": ["custom", "template", "configure", "personalize", "theme"]
}

category_counts = {cat: 0 for cat in categories}

for idx, row in df.iterrows():
    features_text = str(row['Features']).lower()
    module_name = row['Module Name']

    for category, keywords in categories.items():
        if any(keyword in features_text for keyword in keywords):
            category_counts[category] += 1

print("Modules by category:")
for category, count in sorted(category_counts.items(), key=lambda x: x[1], reverse=True):
    print(f"  {category}: {count} modules")

# Sample some key modules for product development reference
print("\n=== KEY MODULES FOR PRODUCT DEVELOPMENT ===")

key_modules = ["User Management", "Student Information", "Finance", "Examination", "Messaging System"]

for module in key_modules:
    module_data = df[df['Module Name'] == module]
    if not module_data.empty:
        print(f"\n--- {module} ---")
        features = str(module_data.iloc[0]['Features'])
        feature_list = [line.strip() for line in features.split('\n') if line.strip().startswith('-')]
        print(f"Features count: {len(feature_list)}")
        print("Key features:")
        for feature in feature_list[:5]:  # Show first 5 features
            print(f"  {feature}")