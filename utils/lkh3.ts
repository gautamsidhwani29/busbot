export async function runLKH3(parFilePath: string): Promise<string> {
  const response = await fetch("/api/run-lkh3", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ parFilePath }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.text();
}