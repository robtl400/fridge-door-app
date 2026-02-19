const USERNAME_REGEX = /^[a-zA-Z0-9]+$/;
const USERNAME_MAX_LENGTH = 8;

export function validateUsername(value) {
  const trimmed = value.slice(0, USERNAME_MAX_LENGTH);
  if (trimmed && !trimmed.match(USERNAME_REGEX)) {
    return { value: trimmed, error: "Letters and numbers only" };
  }
  return { value: trimmed, error: "" };
}

export { USERNAME_MAX_LENGTH };
