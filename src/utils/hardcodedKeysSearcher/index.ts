import {readFileSync} from "fs";
import {fsUtil} from "../fs";

export const hardcodedKeysSearcherUtil = {
  find({jiraPrefix, dirPathWithJiraLinks}: findInterface): string[] {
    const filesPaths = fsUtil.getFilesRecursively(dirPathWithJiraLinks);
    const issueLinks = filesPaths
      .flatMap(filePath => findLinksInFile({filePath, jiraPrefix}))
      .filter(Boolean);
    const issueKeys = issueLinks.map(link => link.split("/").pop());
    return [...new Set(issueKeys)];
  }
};

function findLinksInFile({filePath, jiraPrefix}: findLinksInFileInterface): string[] {
  const issueLinkRegExpMatcher = new RegExp(`${jiraPrefix}\\w*-\\w*`, "g");
  const fileContent = readFileSync(filePath).toString();
  if (fileContent.includes(jiraPrefix)) {
    return fileContent.match(issueLinkRegExpMatcher);
  }
}

interface findLinksInFileInterface {
  jiraPrefix: string;
  filePath: string;
}

interface findInterface {
  jiraPrefix: string;
  dirPathWithJiraLinks: string;
}
