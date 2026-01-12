// helpers/inputValidator.js
export function validateInput(input, maxChars) {
  if (typeof input !== "string") {
    throw new Error("Input must be a string");
  }

  const length = input.length;

  if (length === 0) {
    throw new Error("Input cannot be empty");
  }

  if (length > maxChars) {
    throw new Error(
      `Input too large. Max allowed is ${maxChars.toLocaleString()} characters. You sent ${length.toLocaleString()}.`
    );
  }

  return length;
}
