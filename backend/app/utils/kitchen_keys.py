import secrets

# Excludes ambiguous characters: 0/O, 1/l/i
ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789"
KEY_LENGTH = 6
PREFIX = "kitchen_"


def generate_kitchen_key():
    """Generate a unique, human-friendly kitchen key.

    Format: kitchen_ + 6 random chars from an unambiguous alphabet.
    Caller must verify uniqueness against the database.
    """
    suffix = "".join(secrets.choice(ALPHABET) for _ in range(KEY_LENGTH))
    return PREFIX + suffix
