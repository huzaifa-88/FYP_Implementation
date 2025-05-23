# import pyodbc
# import fitz  # PyMuPDF
# import re

# def extract_text_from_pdf(pdf_path):
#     doc = fitz.open(pdf_path)
#     text = ""
#     print("Page Count:", doc.page_count)
#     for page_num in range(doc.page_count):
#         page = doc.load_page(page_num)
#         page_text = page.get_text()
#         text += page_text + "\n"
#     return text

# def parse_pdf(pdf_path):
#     text = extract_text_from_pdf(pdf_path)
#     lines = text.split("\n")
#     entries = []
#     current_entry = {}
#     field_buffer = None
#     print("Text:", text)

#     for line in lines:
#         line = line.strip()

#         # Skip empty or very short lines
#         if not line or len(line) < 5:
#             continue

#         # Detect start of a valid drug entry using "Mizaj"
#         if "Mizaj" in line:
#             if all(k in current_entry for k in ["name", "botanical_name", "parts_used", "constituents", "actions", "uses"]):
#                 entries.append(current_entry)

#             current_entry = {}
#             field_buffer = None
#             match = re.match(r"^(.*?)\s+Mizaj\s*\(.*?\)\s*(.+)$", line)
#             if match:
#                 current_entry["name"] = match.group(1).strip()
#                 current_entry["temperament"] = match.group(2).strip()

#         elif line.lower().startswith("botanical name"):
#             current_entry["botanical_name"] = line.split(":", 1)[-1].strip()
#             field_buffer = None

#         elif line.lower().startswith("ver"):
#             current_entry["vernacular_names"] = line.split(":", 1)[-1].strip()
#             field_buffer = "vernacular_names"

#         elif line.lower().startswith("part used"):
#             current_entry["parts_used"] = line.split(":", 1)[-1].strip()
#             field_buffer = None

#         elif line.lower().startswith("constituents"):
#             current_entry["constituents"] = line.split(":", 1)[-1].strip()
#             field_buffer = "constituents"

#         elif line.lower().startswith("actions"):
#             current_entry["actions"] = line.split(":", 1)[-1].strip()
#             field_buffer = "actions"

#         elif line.lower().startswith("uses"):
#             current_entry["uses"] = line.split(":", 1)[-1].strip()
#             field_buffer = "uses"

#         else:
#             if field_buffer and field_buffer in current_entry:
#                 current_entry[field_buffer] += " " + line.strip()

#     if all(k in current_entry for k in ["name", "botanical_name", "parts_used", "constituents", "actions", "uses"]):
#         entries.append(current_entry)

#     return entries


# connect_to_db = "DRIVER={SQL Server};SERVER=HUZAIFA-PC\\SQLEXPRESS,1433;DATABASE=FYP_Unani;UID=tks;PWD=1234"

# def insert_data(entries):
#     conn = pyodbc.connect(connect_to_db)
#     cursor = conn.cursor()

#     for entry in entries:
#         try:
#             cursor.execute("""
#                 INSERT INTO SingleDrugFormulations 
#                 (name, temperament, botanical_name, vernacular_names, parts_used, constituents, actions, uses)
#                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)
#             """, (
#                 entry.get("name", ""),
#                 entry.get("temperament", ""),
#                 entry.get("botanical_name", ""),
#                 entry.get("vernacular_names", ""),
#                 entry.get("parts_used", ""),
#                 entry.get("constituents", ""),
#                 entry.get("actions", ""),
#                 entry.get("uses", "")
#             ))
#         except Exception as e:
#             print(f"Error inserting entry {entry.get('name', 'Unknown')}: {e}")

#     conn.commit()
#     cursor.close()
#     conn.close()

# def main():
#     pdf_path = input("Please provide the path to the PDF: ")
#     entries = parse_pdf(pdf_path)
#     print(f"Valid entries extracted: {len(entries)}")
#     insert_data(entries)
#     print("Data has been successfully inserted into the database.")

# if __name__ == "__main__":
#     main()




import fitz  # PyMuPDF
import re
import pyodbc

# Database connection
conn = pyodbc.connect('DRIVER={SQL Server};SERVER=HUZAIFA-PC\\SQLEXPRESS,1433;DATABASE=FYP_Unani;UID=tks;PWD=1234')
cursor = conn.cursor()

# def connect_to_db():
#     """Connect to the SQL Server database"""
#     conn = pyodbc.connect('DRIVER={ODBC Driver 17 for SQL Server};'
#                           'SERVER=HUZAIFA-PC\\SQLEXPRESS,1433;'
#                           'DATABASE=FYP_Unani;'
#                           'UID=tks;'
#                           'PWD=1234;')
#     return conn.cursor()

def extract_entries_from_pdf(pdf_path):
    doc = fitz.open(pdf_path)
    all_text = ""

    for page in doc:
        text = page.get_text()
        lines = text.split('\n')
        left_lines = []
        right_lines = []

        for line in lines:
            mid = len(line) // 2
            if line.strip() == "":
                continue
            left_part = line[:mid].strip()
            right_part = line[mid:].strip()
            if left_part:
                left_lines.append(left_part)
            if right_part:
                right_lines.append(right_part)

        all_text += "\n".join(left_lines + right_lines) + "\n"

    return all_text

def parse_entries(text):
    entries = []
    pattern = re.compile(
        r"(?P<name>^[A-Z][^\n]+)\n"
        r"Temperament\s*:\s*(?P<temperament>[^\n]+)\n"
        r"Botanical Name\s*:\s*(?P<botanical_name>[^\n]+)\n"
        # r"Botanical Name \(Urdu\)\s*:\s*(?P<botanical_name_urdu>[^\n]+)\n"
        r"Vernacular Names\s*:\s*(?P<vernacular_names>(?:[^\n]+\n)+?)"
        r"Parts Used\s*:\s*(?P<parts_used>[^\n]+)\n"
        r"Constituents\s*:\s*(?P<constituents>[^\n]+)\n"
        r"Actions\s*:\s*(?P<actions>[^\n]+)\n"
        r"Uses\s*:\s*(?P<uses>[^\n]+)", re.MULTILINE
    )

    for match in pattern.finditer(text):
        vernacular_block = match.group("vernacular_names").strip()
        vernacular_lines = vernacular_block.split("\n")
        vernacular_dict = {}
        for line in vernacular_lines:
            if ':' in line:
                lang, names = line.split(":", 1)
                vernacular_dict[lang.strip()] = [n.strip() for n in names.split(",")]

        entry = {
            "name": match.group("name").strip(),
            "temperament": match.group("temperament").strip(),
            "botanical_name": match.group("botanical_name").strip(),
            "vernacular_names": vernacular_dict,
            "parts_used": match.group("parts_used").strip(),
            "constituents": match.group("constituents").strip(),
            "actions": match.group("actions").strip(),
            "uses": match.group("uses").strip()
        }

        entries.append(entry)

    return entries

def get_or_create_id(table, column, value):
    cursor.execute(f"SELECT {table[:-1]}id FROM {table} WHERE {column} = ?", value)
    row = cursor.fetchone()
    if row:
        return row[0]
    cursor.execute(f"INSERT INTO {table} ({column}) VALUES (?)", value)
    conn.commit()
    cursor.execute(f"SELECT {table[:-1]}id FROM {table} WHERE {column} = ?", value)
    return cursor.fetchone()[0]

def insert_data(entries):
    for entry in entries:
        # Skip incomplete entries
        if not all([entry.get(field) for field in ["name", "temperament", "botanical_name", "vernacular_names", "parts_used", "constituents", "actions", "uses"]]):
            continue

        # Temperament
        temperament_id = get_or_create_id("temperament", "temperamentname", entry["temperament"])

        # Part Used (Source)
        source_id = get_or_create_id("source", "sourcename", entry["parts_used"])

        # Actions
        action_id = get_or_create_id("action", "actiondescription", entry["actions"])

        # Uses
        uses_id = get_or_create_id("uses", "usesdescription", entry["uses"])

        # Vernacular Names
        vernacularname_id = None
        for language, names in entry["vernacular_names"].items():
            lang_id = get_or_create_id("language", "languagename", language)
            for name in names:
                cursor.execute("SELECT vernacularnameid FROM vernacularname WHERE name = ? AND languageid = ?", name, lang_id)
                vn_row = cursor.fetchone()
                if not vn_row:
                    cursor.execute("INSERT INTO vernacularname (name, languageid) VALUES (?, ?)", name, lang_id)
                    conn.commit()
                    cursor.execute("SELECT vernacularnameid FROM vernacularname WHERE name = ? AND languageid = ?", name, lang_id)
                    vn_row = cursor.fetchone()
                if vn_row and vernacularname_id is None:
                    vernacularname_id = vn_row[0]

        # Final Insert
        cursor.execute("""
            INSERT INTO singledrugformulations (
                originalname, botanicalname, vernacularname_id, temperamentid, sourceid, actionid, usesid, bookreference_id, userid
            ) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, 
        entry["name"], entry["botanical_name"], vernacularname_id, 
        temperament_id, source_id, action_id, uses_id, entry.get("book_reference_id", ""), entry.get("userid", ""))

        conn.commit()

def main():
    pdf_path = "pdf_Extractor/Introduction to Ilmul Advia.pdf"  # Change to your PDF path
    text = extract_entries_from_pdf(pdf_path)
    entries = parse_entries(text)
    insert_data(entries)
    print(f"Inserted {len(entries)} entries successfully.")

if __name__ == "__main__":
    main()












# This code is working
# import pyodbc
# import fitz  # PyMuPDF

# def extract_text_from_pdf(pdf_path):
#     """Extracts text from the entire PDF"""
#     doc = fitz.open(pdf_path)
#     text = ""
    
#     for page_num in range(doc.page_count):
#         page = doc.load_page(page_num)
#         page_text = page.get_text()
#         print(f"\n--- PAGE {page_num + 1} ---\n{page_text}") 
#         text += page_text  # Append text of each page
    
#     return text

# def parse_pdf(pdf_path):
#     """Parse the text and extract entries based on keywords"""
#     text = extract_text_from_pdf(pdf_path)
#     entries = []
#     current_entry = {}

#     lines = text.split("\n")

#     for line in lines:
#         line = line.strip()

#         if not line:
#             continue  # Skip empty lines

#         # 1. Name (first non-empty line and not starting with a known label)
#         if not current_entry.get("name") and not any(line.lower().startswith(prefix) for prefix in [
#             "mizaj", "botanical name", "ver", "part used", "constituents", "actions", "uses"
#         ]):
#             current_entry["name"] = line
#             continue

#         # 2. Temperament (Mizaj)
#         if line.lower().startswith("mizaj"):
#             current_entry["temperament"] = line.split(":", 1)[-1].strip()
#             continue

#         # 3. Botanical Name
#         if line.lower().startswith("botanical name"):
#             current_entry["botanical_name"] = line.split(":", 1)[-1].strip()
#             continue

#         # 4. Vernacular Names
#         if line.lower().startswith("ver"):
#             current_entry["vernacular_names"] = line.split(":", 1)[-1].strip()
#             continue

#         # 5. Part Used
#         if line.lower().startswith("part used"):
#             current_entry["parts_used"] = line.split(":", 1)[-1].strip()
#             continue

#         # 6. Constituents
#         if line.lower().startswith("constituents"):
#             current_entry["constituents"] = line.split(":", 1)[-1].strip()
#             continue

#         # 7. Actions
#         if line.lower().startswith("actions"):
#             current_entry["actions"] = line.split(":", 1)[-1].strip()
#             continue

#         # 8. Uses
#         if line.lower().startswith("uses"):
#             current_entry["uses"] = line.split(":", 1)[-1].strip()

#             # At this point we assume an entry is complete
#             # Fill missing fields with empty string
#             all_fields = ["name", "temperament", "botanical_name", "vernacular_names", "parts_used", "constituents", "actions", "uses"]
#             for f in all_fields:
#                 current_entry.setdefault(f, "")

#             entries.append(current_entry)
#             print("Entries at internal function:", entries)
#             current_entry = {}  # Start next entry

#     return entries


# def connect_to_db():
#     """Connect to the SQL Server database"""
#     conn = pyodbc.connect('DRIVER={ODBC Driver 17 for SQL Server};'
#                           'SERVER=HUZAIFA-PC\\SQLEXPRESS,1433;'
#                           'DATABASE=FYP_Unani;'
#                           'UID=tks;'
#                           'PWD=1234;')
#     return conn.cursor()


# def get_or_create(cursor, table, id_col, col, value, extra_cols=None, extra_vals=None):
#     """Check if record exists or create it"""
#     if extra_cols and extra_vals:
#         extra_cols_str = ', '.join(extra_cols)
#         extra_vals_str = ', '.join(f"'{v}'" for v in extra_vals)
#         cursor.execute(f"SELECT {id_col} FROM {table} WHERE {col} = ? AND ({extra_cols_str}) = ({extra_vals_str})", value)
#     else:
#         cursor.execute(f"SELECT {id_col} FROM {table} WHERE {col} = ?", value)
    
#     result = cursor.fetchone()
    
#     if result:
#         return result[0]
#     else:
#         cols = [col] + (extra_cols if extra_cols else [])
#         vals = [value] + (extra_vals if extra_vals else [])
        
#         cols_str = ', '.join(cols)
#         vals_str = ', '.join(f"'{v}'" for v in vals)
        
#         cursor.execute(f"INSERT INTO {table} ({cols_str}) VALUES ({vals_str})")
#         cursor.commit()
#         cursor.execute(f"SELECT {id_col} FROM {table} WHERE {col} = ?", value)
#         result = cursor.fetchone()
#         return result[0]


# def insert_data(entries):
#     """Insert parsed data into the database"""
#     cursor = connect_to_db()
#     print("Connected to DB!")
#     print("Entries:", entries)

#     for entry in entries:
#         print("Go in the loop")

#         # Handle NULLs for missing fields
#         botanical_name = entry.get("botanical_name")
#         botanical_name_urdu = entry.get("botanical_name_urdu")
#         name = entry.get("name")
#         parts_used = entry.get("parts_used")
#         actions = entry.get("actions")
#         uses = entry.get("uses")
#         vernacular_names = entry.get("vernacular_names")
#         temperament = entry.get("temperament")
#         book_reference_id = entry.get("book_reference_id")
#         userid = entry.get("userid")

#         # Get or create related entries (check for nulls)
#         temperament_id = get_or_create(cursor, "temperament", "temperamentid", "typename", temperament, extra_cols=["degree"], extra_vals=[1.0]) if temperament else None
#         source_id = get_or_create(cursor, "source", "sourceid", "sourcename", parts_used) if parts_used else None
#         action_id = get_or_create(cursor, "actions", "actionid", "actionname", actions, extra_cols=["actionname_urdu"], extra_vals=[""]) if actions else None
#         uses_id = get_or_create(cursor, "uses", "usesid", "usesdescription", uses) if uses else None
#         vernacularname_id = get_or_create(cursor, "vernacularnames", "vernacularname_id", "name", vernacular_names) if vernacular_names else None

#         # Insert the main SingleDrugFormulations record
#         cursor.execute(f"""
#             INSERT INTO singledrugformulations (
#                 originalname, botanicalname, botanicalname_urdu, vernacularname_id,
#                 temperamentid, sourceid, actionid, usesid, bookreference_id, userid
#             ) 
#             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
#         """, 
#         name, botanical_name, botanical_name_urdu, vernacularname_id,
#         temperament_id, source_id, action_id, uses_id, book_reference_id, userid)

#         cursor.commit()

#     cursor.close()


# def main():
#     """Main function to handle PDF processing and data insertion"""
#     pdf_path = input("Please provide the path to the PDF: ")
    
#     # Parse the PDF and extract entries
#     entries = parse_pdf(pdf_path)
    
#     # Insert extracted data into the database
#     insert_data(entries)
#     print("Data has been successfully inserted into the database.")


# if __name__ == "__main__":
#     main()






# THis is correct but only one error
# def insert_data(entries):
#     """Insert parsed data into the database"""
#     cursor = connect_to_db()
#     print("Connected to DB!")
    
#     print("Entries:", entries)
#     for entry in entries:
#         print("Go in the loop")
#         # Get or create temperament
#         temperament_id = get_or_create(
#             cursor, "temperament", "temperamentid", "typename", entry["temperament"],
#             extra_cols=["degree"], extra_vals=[1.0]
#         )
        
#         # Get or create source
#         source_id = get_or_create(cursor, "source", "sourceid", "sourcename", entry["parts_used"])

#         # Get or create action
#         action_id = get_or_create(
#             cursor, "actions", "actionid", "actionname", entry["actions"],
#             extra_cols=["actionname_urdu"], extra_vals=[""]
#         )

#         # Get or create uses
#         uses_id = get_or_create(cursor, "uses", "usesid", "usesdescription", entry["uses"])

#         # Get or create vernacular names
#         vernacularname_id = get_or_create(cursor, "vernacularnames", "vernacularname_id", "name", entry["vernacular_names"])

#         # Insert single drug formulation
#         cursor.execute(f"""
#             INSERT INTO singledrugformulations (
#                 originalname, botanicalname, botanicalname_urdu, vernacularname_id, temperamentid, sourceid, actionid, usesid, bookreference_id, userid
#             ) 
#             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
#         """, 
#         entry["botanical_name"], entry.get("botanical_name_urdu", ""), vernacularname_id, 
#         temperament_id, source_id, action_id, uses_id, entry.get("book_reference_id", ""), entry.get("userid", ""))
        
#         # Commit after each insert to ensure data is saved
#         cursor.commit()
        
#     cursor.close()


# def parse_pdf(pdf_path):
#     """Parse the text and extract entries based on keywords"""
#     text = extract_text_from_pdf(pdf_path)
#     entries = []
#     current_entry = {}

#     # Define the required fields for a complete entry
#     required_fields = [
#         "temperament", "botanical_name", "vernacular_names",
#         "parts_used", "constituents", "actions", "uses"
#     ]

#     # Split the text by newlines to process line by line
#     lines = text.split("\n")

#     for line in lines:
#         line = line.strip()  # Remove leading/trailing spaces
#         if line:  # Only process non-empty lines
#             if ":" in line:  # Lines with colon are typically key-value pairs
#                 key, value = line.split(":", 1)  # Split only on the first colon
#                 key = key.strip().lower()
#                 value = value.strip()

#                 # Assign value to corresponding key in current entry
#                 if key == "temperament":
#                     current_entry["temperament"] = value
#                 elif key == "botanical name":
#                     current_entry["botanical_name"] = value
#                 elif key == "vernacular names":
#                     current_entry["vernacular_names"] = value
#                 elif key == "parts used":
#                     current_entry["parts_used"] = value
#                 elif key == "constituents":
#                     current_entry["constituents"] = value
#                 elif key == "actions":
#                     current_entry["actions"] = value
#                 elif key == "uses":
#                     current_entry["uses"] = value

#                 # Check if all required fields are present
#                 if all(field in current_entry for field in required_fields):
#                     entries.append(current_entry)
#                     print("Entries at internal Function:",  entries)
#                     current_entry = {}  # Reset for the next entry

#     # Final check to add the last entry if not yet added
#     if all(field in current_entry for field in required_fields):
#         entries.append(current_entry)

#     print("Entries at Parse-pdf:", entries)
#     return entries