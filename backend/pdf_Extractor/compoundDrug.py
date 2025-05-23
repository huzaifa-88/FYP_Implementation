import pandas as pd
import pyodbc

# Database connection
conn = pyodbc.connect(
    r'DRIVER={SQL Server};SERVER=HUZAIFA-PC\SQLEXPRESS,1433;DATABASE=FYP_Unani;UID=tks;PWD=1234;'
)
cursor = conn.cursor()

# Load CSV
df = pd.read_csv(r"pdf_Extractor\compoundDrugformulations_output.csv", encoding='ISO-8859-1')

# Generic helper to get or create and return ID
def get_or_create_id(table, column, value, id_column=None):
    try:
        value = str(value).strip()
        if not value or value.lower() == 'nan':
            print(f"⚠️ Empty or NaN value for table '{table}' — skipping insert.")
            return None
    except Exception as e:
        print(f"⚠️ Error processing value '{value}' for table '{table}': {e}")
        return None

    if not id_column:
        id_column = table.lower() + "id"

    try:
        cursor.execute(f"SELECT {id_column} FROM {table} WHERE {column} = ?", value)
        row = cursor.fetchone()
        if row:
            return row[0]

        cursor.execute(
            f"INSERT INTO {table} ({column}) OUTPUT INSERTED.{id_column} VALUES (?)",
            (value,)
        )
        return cursor.fetchone()[0]

    except Exception as e:
        print(f"❌ Error inserting into {table}.{column}: '{value}' — {e}")
        return None

# Iterate over rows
for index, row in df.iterrows():
    try:
        name = str(row.get("Name")).strip() if pd.notna(row.get("Name")) else None
        if not name:
            print(f"⚠️ Row {index + 1}: No name — skipping.")
            continue

        # Check if this compound drug already exists
        cursor.execute("SELECT compounddrugid FROM CompoundDrugFormulation WHERE compounddrugname = ?", name)
        if cursor.fetchone():
            print(f"ℹ️ Row {index + 1}: '{name}' already exists — skipping.")
            continue

        description = str(row.get("Description")).strip() if pd.notna(row.get("Description")) else None
        action = str(row.get("Action")).strip() if pd.notna(row.get("Action")) else None
        uses = str(row.get("Uses")).strip() if pd.notna(row.get("Uses")) else None
        chief_ingredient = str(row.get("Chief Ingredient")).strip() if pd.notna(row.get("Chief Ingredient")) else None
        ingredients = str(row.get("Ingredients")).strip() if pd.notna(row.get("Ingredients")) else None
        preparation = str(row.get("Preparation")).strip() if pd.notna(row.get("Preparation")) else None
        dose = str(row.get("Dose")).strip() if pd.notna(row.get("Dose")) else None

        # Foreign key inserts
        action_id = get_or_create_id("Action", "actionname", action)
        uses_id = get_or_create_id("Uses", "usesdescription", uses)
        dose_id = get_or_create_id("dosequantity", "dose", dose)

        # Insert main compound drug
        cursor.execute("""
            INSERT INTO CompoundDrugFormulation (
                compounddrugname, description, chiefingredient, Ingredients,
                preparation, actionid, usesid, dosequantityid, bookreference_id, userid
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            name, description, chief_ingredient, ingredients,
            preparation, action_id, uses_id, dose_id,
            None,  # bookreference_id
            None   # userid
        ))

    except Exception as e:
        print(f"❌ Error on row {index + 1}: {e}")

# Commit and close
conn.commit()
conn.close()

print("✅ Compound drug data inserted successfully.")

