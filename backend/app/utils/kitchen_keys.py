import secrets

# Excludes ambiguous characters: 0/O, 1/l/i
ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789"
KEY_LENGTH = 6


def generate_kitchen_key(username=None):
    """Generate a unique, human-friendly kitchen key.

    Format: {username}_{6 random chars} when username is provided,
    otherwise kitchen_{6 random chars} (legacy format).
    Caller must verify uniqueness against the database.
    """
    suffix = "".join(secrets.choice(ALPHABET) for _ in range(KEY_LENGTH))
    if username:
        clean = "".join(c for c in username.lower() if c.isalnum())[:8]
        return clean + "_" + suffix
    return "kitchen_" + suffix
