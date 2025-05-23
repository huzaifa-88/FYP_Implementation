import re
import nltk
nltk.download('punkt_tab')

# If running for the first time, uncomment this:
# nltk.download('punkt')

from nltk.tokenize import sent_tokenize

def parse_preparation_steps(text):
    # Normalize whitespace
    text = re.sub(r'\s+', ' ', text.strip())

    # Use NLTK to split into sentences
    sentences = sent_tokenize(text)

    # Further split on "and", "then" etc., to isolate steps
    step_verbs = r"\b(soak|wash|boil|mesh|filter|make|mix|dry|grind|roast|add|cook|knead|prepare|cool)\b"

    steps = []
    for sentence in sentences:
        # Split on "and", "then", etc., but only if followed by a verb
        split_parts = re.split(r'\b(?:and|then|after that|followed by)\b(?=\s+' + step_verbs + ')', sentence, flags=re.IGNORECASE)
        for part in split_parts:
            part = part.strip()
            if re.search(step_verbs, part, re.IGNORECASE):
                steps.append(part[0].upper() + part[1:])  # Capitalize first letter

    # Format with numbering
    formatted = [f"{i + 1}. {step}" for i, step in enumerate(steps)]
    return formatted

# Example input
input_text = """
Make the powder of all drugs except Zafran (Crocussativa gynacium) Musk       (Moschcus moschiferus secretion) Amber(Ambra grasea secretion). Make Qiwam       (Basic Solution of Particular consistency) of Asl (Honey), sugar and Aab Seb       Sheereen (Pyrusmalus fruit juice). Mix the powder of drugs. Lastly mix       solution of Zafran (Crocus sativa gynacium)Musk (Moschcus       moschiferussecretion) Amber (Ambra grasea secretion).
"""

# Parse and print result
parsed_steps = parse_preparation_steps(input_text)
for step in parsed_steps:
    print(step)
