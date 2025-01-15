import {readFileSync} from "fs";
import {fsUtil} from "../fs";
import {findLinksInterface} from "../../index.interface";

export const hardcodedKeysSearcherUtil = {
  find(params: findLinksInterface): string[] {
    const issueLinks = getLinks(params);
    const issueKeys = issueLinks.map(link => link.split("/").pop());
    return [...new Set(issueKeys)];
  },

  getKeysCount(params: findLinksInterface): Array<{link: string; count: number}> {
    const links = getLinks(params);
    return links.reduce((result, link) => {
      const existing = result.find(item => item.link === link);
      existing ? existing.count++ : result.push({ link, count: 1 });
      return result;
    }, []);
  }
};

function findLinksInFile({filePath, jiraPrefix}: findLinksInFileInterface): string[] {
  const issueLinkRegExpMatcher = new RegExp(`${jiraPrefix}\\w*-\\w*`, "g");
  const fileContent = readFileSync(filePath).toString();
  if (fileContent.includes(jiraPrefix)) {
    return fileContent.match(issueLinkRegExpMatcher);
  }
}

function getLinks({jiraPrefix, dirPathWithJiraLinks}: findLinksInterface): string[] {
  const filesPaths = fsUtil.getFilesRecursively(dirPathWithJiraLinks);
  return filesPaths
    .flatMap(filePath => findLinksInFile({filePath, jiraPrefix}))
    .filter(Boolean);
}

interface findLinksInFileInterface {
  jiraPrefix: string;
  filePath: string;
}
