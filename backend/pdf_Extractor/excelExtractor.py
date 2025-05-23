# -------------------------Temparament is NULL because it is not in Excel file

import pandas as pd
import pyodbc

# Database connection
conn = pyodbc.connect(
    r'DRIVER={SQL Server};SERVER=HUZAIFA-PC\SQLEXPRESS,1433;DATABASE=FYP_Unani;UID=tks;PWD=1234;'
)
cursor = conn.cursor()

# Load CSV
df = pd.read_csv(r"pdf_Extractor\singledrug_output.csv", encoding='ISO-8859-1')

# Helper function to get or insert and return ID
def get_or_create_id(table, column, value, id_column=None):
    if pd.isna(value) or not value.strip():
        print(f"Skipping empty value for table {table}")
        return None
    value = value.strip()
    if not id_column:
        id_column = table.lower() + "id"
    try:
        cursor.execute(f"SELECT {id_column} FROM {table} WHERE {column} = ?", value)
        row = cursor.fetchone()
        if row:
            return row[0]
        cursor.execute(f"INSERT INTO {table} ({column}) OUTPUT INSERTED.{id_column} VALUES (?)", value)
        return cursor.fetchone()[0]
    except Exception as e:
        print(f"❌ Error inserting into {table} - {column}: {value} | {e}")
        return None


# Helper function to check for existing drugs
def drug_exists(name):
    cursor.execute("SELECT 1 FROM SingleDrugFormulations WHERE originalname = ?", name)
    return cursor.fetchone() is not None

# Iterate and insert
for index, row in df.iterrows():
    try:
        name = row.get("Name (Roman Urdu)")
        botanical_name = row.get("Botanical Name")
        constituents = row.get("Constituents")
        other_names = row.get("Other Names")
        source_name = row.get("Source Names")
        uses = row.get("Uses")
        action = row.get("Action")
        temperament = row.get("Temperament")

        if drug_exists(name):
            print(f"Skipping duplicate drug: {name}")
            continue

        # Foreign keys
        source_id = get_or_create_id("Source", "sourcename", source_name)
        uses_id = get_or_create_id("Uses", "usesdescription", uses)
        action_id = get_or_create_id("Action", "actionname", action)
        temperament_id = get_or_create_id("Temperament", "temperamentname", temperament)  # ✅ Corrected table and column

        cursor.execute("""
            INSERT INTO SingleDrugFormulations (
                originalname, temperamentid, botanicalname, botanicalname_urdu,
                vernacularname, sourceid, constituents, actionid, usesid,
                bookreference_id, userid
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL)
        """, (
            name, temperament_id, botanical_name, None, other_names,
            source_id, constituents, action_id, uses_id
        ))

    except Exception as e:
        print(f"Error on row {index + 1}: {e}")

# Commit and close
conn.commit()
conn.close()

print("✅ Data inserted successfully.")







# import pandas as pd
# import pyodbc

# # Database connection
# conn = pyodbc.connect(
#     r'DRIVER={SQL Server};SERVER=HUZAIFA-PC\SQLEXPRESS,1433;DATABASE=FYP_Unani;UID=tks;PWD=1234;'
# )
# cursor = conn.cursor()

# # Load Excel or CSV
# df = pd.read_csv(r"pdf_Extractor\singledrug_output.csv", encoding='ISO-8859-1')

# # Helper function to get or insert and return ID
# def get_or_create_id(table, column, value):
#     if pd.isna(value) or not value:
#         return None
#     id_column = table.lower() + "id" if table.lower() != "vernacularnames" else "vernacularname_id"
#     cursor.execute(f"SELECT {id_column} FROM {table} WHERE {column} = ?", value)
#     row = cursor.fetchone()
#     if row:
#         return row[0]
#     cursor.execute(f"INSERT INTO {table} ({column}) OUTPUT INSERTED.{id_column} VALUES (?)", value)
#     return cursor.fetchone()[0]

# # Iterate over rows
# for index, row in df.iterrows():
#     try:
#         name = row.get("Name (Roman Urdu)")
#         botanical_name = row.get("Botanical Name")
#         constituents = row.get("Constituents")
#         other_names = row.get("Other Names")
#         source_name = row.get("Source Names")
#         uses = row.get("Uses")
#         action = row.get("Action")
#         temperament = row.get("Temperament") if "Temperament" in row else None

#         # Insert or get foreign keys with correct column names
#         vernacular_id = get_or_create_id("VernacularNames", "name", other_names)
#         source_id = get_or_create_id("Source", "sourcename", source_name)
#         uses_id = get_or_create_id("Uses", "usesdescription", uses)
#         action_id = get_or_create_id("Action", "actionname", action)  # ✅ FIXED COLUMN NAME 'actionname'
#         temperament_id = get_or_create_id("Temparament", "temparamentname", temperament)


#         cursor.execute("""
#             INSERT INTO SingleDrugFormulations (
#                 originalname, botanicalname, botanicalname_urdu, vernacularname_id,
#                 temperamentid, sourceid, constituents, actionid, usesid,
#                 bookreference_id, userid
#             )
#             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL)
#         """, (
#             name, botanical_name, None, vernacular_id,
#             temperament_id, source_id, constituents, action_id, uses_id
#         ))

#     except Exception as e:
#         print(f"Error on row {index + 1}: {e}")

# # Commit and close
# conn.commit()
# conn.close()

# print("✅ Data inserted successfully.")
