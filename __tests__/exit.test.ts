import {describe, expect, it, beforeEach, jest} from "@jest/globals";
import * as main from "../index";

const defaultParams = {
  jiraUserEmail: 'jiraUserEmail',
  jiraUserToken: 'jiraUserToken',
  jiraAddress: 'https://myProject.atlassian.net',
  dirPathWithJiraLinks: `${process.cwd()}/__tests__/testData/nestedData`,
  behaviorConfig: [{message: 'message', statusNames: ['statusName1', 'statusName2']}],
};
let processExitMock = null;
let index: typeof main = null;

describe("exit", () => {
  beforeEach(async () => {
    jest.restoreAllMocks();
    jest.resetModules();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    processExitMock = jest.spyOn(process, 'exit').mockImplementation(() => null);
    jest.spyOn(console, 'info').mockImplementation(() => null);
    jest.spyOn(console, 'error').mockImplementation(() => null);
    index = await import('../index');
  });

  it("exits with 0 if no tickets found", async () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    global.fetch = jest.fn(() => ({
      status: 200, json: () =>
        ({fields: {status: {name: 'name'}}, key: 'key'})
    }));
    await index.checkJiraStatuses(defaultParams);
    expect(processExitMock).toBeCalledWith(0);
  });

  it("exits with 1 if tickets with statuses found", async () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    global.fetch = jest.fn(() => ({
      status: 200, json: () =>
        ({fields: {status: {name: 'statusName1'}}, key: 'key'})
    }));
    await index.checkJiraStatuses(defaultParams);
    expect(processExitMock).toBeCalledWith(1);
  });

  it("handles last slash in jira link", async () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    global.fetch = jest.fn(() => ({
      status: 200, json: () =>
        ({fields: {status: {name: 'statusName1'}}, key: 'key'})
    }));
    await index.checkJiraStatuses({...defaultParams, jiraAddress: 'https://myProject.atlassian.net/'});
    expect(processExitMock).toBeCalledWith(1);
  });

  it("exits with 1 if tickets with errors found", async () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    global.fetch = jest.fn(() => ({
      status: 500, json: () =>
        ({fields: {status: {name: 'name'}}, key: 'key'})
    }));
    await index.checkJiraStatuses(defaultParams);
    expect(processExitMock).toBeCalledWith(1);
  });
});
