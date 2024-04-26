import {describe, expect, it} from "@jest/globals";
import {checkJiraStatuses} from "../index";

const defaultParams = {
  jiraUserEmail: 'jiraUserEmail',
  jiraUserToken: 'jiraUserToken',
  jiraAddress: 'https://myProject.atlassian.net',
  dirPathWithJiraLinks: "notExistedPath",
  behaviorConfig: [{message: 'message', statusNames: ['statusName1', 'statusName2']}],
};

describe("fs", () => {
  it("throws on bad path", async () => {
    await expect(async () => checkJiraStatuses(defaultParams)).rejects
      .toThrow(/failed to get files: Error: ENOENT: no such file or directory, scandir .*/);
  });

});
