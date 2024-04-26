import {describe, expect, it, beforeEach, jest} from "@jest/globals";
import * as main from "../src";

const defaultParams = {
  jiraUserEmail: 'jiraUserEmail',
  jiraUserToken: 'jiraUserToken',
  jiraAddress: 'https://myProject.atlassian.net',
  dirPathWithJiraLinks: `${process.cwd()}/__tests__/testData/nestedData`,
  behaviorConfig: [{message: 'message', statusNames: ['statusName', 'statusName2']}],
};
let fetchMock = null;
let processExitMock = null;
let index: typeof main = null;

describe("fetch", () => {
  beforeEach(async () => {
    jest.restoreAllMocks();
    jest.resetModules();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    global.fetch = fetchMock = jest.fn(() => ({
      status: 200, json: () =>
        ({fields: {status: {name: 'name'}}, key: 'key'})
    }));
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    processExitMock = jest.spyOn(process, 'exit').mockImplementation(() => null);
    jest.spyOn(console, 'info').mockImplementation(() => null);
    jest.spyOn(console, 'error').mockImplementation(() => null);
    index = await import('../src');
  });

  it("calls fetch with provided parameters", async () => {
    await index.checkJiraStatuses(defaultParams);
    expect(fetchMock).toBeCalledTimes(1);
    expect(fetchMock).toBeCalledWith(
      "https://myProject.atlassian.net/rest/api/latest/issue/MP-42?fields=status,summary", {
        headers: {
          Authorization: "Basic amlyYVVzZXJFbWFpbDpqaXJhVXNlclRva2Vu",
          "Content-Type": "application/json"
        }, method: "GET"
      });
  });

  it("handles different data structure", async () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    global.fetch = fetchMock = jest.fn(() => ({
      status: 200, json: () => ({})
    }));
    await index.checkJiraStatuses(defaultParams);
    expect(processExitMock).toBeCalledWith(0);
  });
});
