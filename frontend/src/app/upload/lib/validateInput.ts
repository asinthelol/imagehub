export default async function validateInput(
  inputRef: React.RefObject<HTMLInputElement>,
  type: "fileInput" | "textInput"
): Promise<boolean> {

  if(!inputRef.current) {
    return Promise.resolve(false);
  }

  let data: string | File | null = null;

  if(type === "fileInput") {
    if(!inputRef.current.files || inputRef.current.files.length === 0) {
      return Promise.resolve(false);
    }

    data = inputRef.current.files[0];
  } else if(type === "textInput") {
    if (!inputRef.current.value.trim()) {
      return Promise.resolve(false);
    }

    data = inputRef.current.value;
  }

  try {
    const response = await fetch("http://localhost:5216/api/Validation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ type, data })
    });

    const isValid = response.ok
    
    return Promise.resolve(isValid);
  } catch (error) {
    console.error("Failed to validate input", error);
    return Promise.resolve(false);
  }
}