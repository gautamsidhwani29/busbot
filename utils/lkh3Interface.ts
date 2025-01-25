export async function runLKH3(inputFile: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(`LKH ${inputFile}`, (error, stdout, stderr) => {
      if (error) {
        reject(`LKH-3 execution error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`LKH-3 stderr: ${stderr}`);
      }
      resolve(stdout);
    });
  });
}