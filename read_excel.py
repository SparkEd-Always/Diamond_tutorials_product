import pandas as pd

# Read the Excel file
file_path = r"D:\Projects\sparked\market_research\fedena\fedena_features.xlsx"
df = pd.read_excel(file_path)

# Display the structure
print("Columns:", df.columns.tolist())
print(f"\nTotal rows: {len(df)}")
print("\nFirst 5 rows:")
print(df.head())

# Show all URLs if there's a URL column
if 'URL' in df.columns or 'Link' in df.columns or any('url' in col.lower() for col in df.columns):
    url_col = None
    for col in df.columns:
        if 'url' in col.lower() or 'link' in col.lower():
            url_col = col
            break

    if url_col:
        print(f"\nAll URLs from {url_col} column:")
        for i, url in enumerate(df[url_col], 1):
            print(f"{i}. {url}")