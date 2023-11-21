import fs from "fs";

export const fsUtil = {
  // GET
  getFilesRecursively(dir: string, result: string[] = []): string[] {
    let files = null;
    try {
      files = fs.readdirSync(dir);
    } catch (err) {
      throw new Error(`failed to get files: ${err}`);
    }
    files.forEach((file: string) => {
      const name = `${dir}/${file}`;
      if (fs.statSync(name).isDirectory()) {
        this.getFilesRecursively(name, result);
      } else {
        result.push(name);
      }
    });
    return result;
  },
};
