import {describe, expect, it, beforeEach, jest} from "@jest/globals";
import * as main from "../src";

const defaultParams = {
  jiraUserEmail: 'jiraUserEmail',
  jiraUserToken: 'jiraUserToken',
  jiraAddress: 'https://myProject.atlassian.net',
  dirPathWithJiraLinks: `${process.cwd()}/__tests__/testData/nestedData`,
  behaviorConfig: [{message: 'message', statusNames: ['statusName1', 'statusName2']}],
};
let logInfoMock = null;
let logErrorMock = null;
let index: typeof main = null;

describe("exit", () => {
  beforeEach(async () => {
    jest.restoreAllMocks();
    jest.resetModules();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    jest.spyOn(process, 'exit').mockImplementation(() => null);
    logInfoMock = jest.spyOn(console, 'info').mockImplementation(() => null);
    logErrorMock = jest.spyOn(console, 'error').mockImplementation(() => null);
    index = await import('../src');
  });

  it("404", async () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    global.fetch = jest.fn(() => ({
      status: 404, json: () =>
        ({fields: {summary: 'summary', status: {name: 'name'}}, key: 'key'})
    }));
    await index.checkJiraStatuses(defaultParams);
    expect(logErrorMock).toBeCalledWith("ticket not found: https://myProject.atlassian.net/browse/MP-42");
  });

  it("500", async () => {
    const json = {fields: {status: {name: 'name'}}, key: 'key'};
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    global.fetch = jest.fn(() => ({
      status: 500, json: () => json,
    }));
    await index.checkJiraStatuses(defaultParams);
    expect(logErrorMock).toBeCalledWith(
      `On request for https://myProject.atlassian.net/browse/MP-42 Jira API responded with error: ${
        JSON.stringify(json, null, 4)}`);
  });

  it("200 with different data structure", async () => {
    const json = {something: 'else'};
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    global.fetch = jest.fn(() => ({
      status: 200, json: () => json,
    }));
    await index.checkJiraStatuses(defaultParams);
    expect(logErrorMock).toBeCalledWith(
      `Different data structure for ticket https://myProject.atlassian.net/browse/MP-42: ${
        JSON.stringify(json, null, 4)}`);
  });

  it("final info", async () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    global.fetch = jest.fn().mockImplementationOnce(() => ({
      status: 500, json: () =>
        ({fields: {summary: 'name', status: {name: 'name'}}, key: 'key'})
    })).mockImplementationOnce(() => ({
      status: 200, json: () =>
        ({fields: {summary: 'statusName1', status: {name: 'statusName1'}}, key: 'MP-7'})
    })).mockImplementationOnce(() => ({
      status: 200, json: () =>
        ({fields: {summary: 'statusName2', status: {name: 'statusName2'}}, key: 'MP-15'})
    })).mockImplementationOnce(() => ({
      status: 200, json: () =>
        ({fields: {summary: 'name', status: {name: 'name'}}, key: 'key'})
    })).mockImplementationOnce(() => ({
      status: 200, json: () =>
        ({fields: {summary: 'statusName3', status: {name: 'statusName3'}}, key: 'MP-42'})
    }));
    await index.checkJiraStatuses({
      ...defaultParams,
      dirPathWithJiraLinks: `${process.cwd()}/__tests__/testData`,
      behaviorConfig: [
        {
          message: 'message', statusNames: ['statusName1', 'statusName2']
        },
        {
          message: 'message2', statusNames: ['statusName3']
        }]
    });
    expect(logInfoMock).toBeCalledTimes(7);
    expect(logInfoMock).toHaveBeenNthCalledWith(2, 'message - statuses: statusName1, statusName2');
    expect(logInfoMock).toHaveBeenNthCalledWith(3, `Please check these issues manually. I failed to access them: (1)
1 >>> https://myProject.atlassian.net/browse/MP-18
`);
    expect(logInfoMock).toHaveBeenNthCalledWith(4, `Found tickets by statuses: (2)
1 >>> https://myProject.atlassian.net/browse/MP-7
\tstatusName1
2 >>> https://myProject.atlassian.net/browse/MP-15
\tstatusName2
`);
    expect(logInfoMock).toHaveBeenNthCalledWith(5, 'message2 - statuses: statusName3');
    expect(logInfoMock).toHaveBeenNthCalledWith(6, `Found tickets by statuses: (1)
1 >>> https://myProject.atlassian.net/browse/MP-42
\tstatusName3
`);
  });

  it("count issues", async () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    global.fetch = jest.fn().mockImplementationOnce(() => ({
      status: 500, json: () =>
        ({fields: {summary: 'name', status: {name: 'name'}}, key: 'key'})
    })).mockImplementationOnce(() => ({
      status: 200, json: () =>
        ({fields: {summary: 'statusName1', status: {name: 'statusName1'}}, key: 'MP-7'})
    })).mockImplementationOnce(() => ({
      status: 200, json: () =>
        ({fields: {summary: 'statusName2', status: {name: 'statusName2'}}, key: 'MP-15'})
    })).mockImplementationOnce(() => ({
      status: 200, json: () =>
        ({fields: {summary: 'name', status: {name: 'name'}}, key: 'key'})
    })).mockImplementationOnce(() => ({
      status: 200, json: () =>
        ({fields: {summary: 'statusName3', status: {name: 'statusName3'}}, key: 'MP-42'})
    }));
    index.logIssues({
      dirPathWithJiraLinks: `${process.cwd()}/__tests__/testData`,
      jiraAddress: 'https://myProject.atlassian.net'
    });
    expect(logInfoMock).toBeCalledTimes(4);
    expect(logInfoMock).toHaveBeenNthCalledWith(1, "https://myProject.atlassian.net/browse/MP-18 --- 1");
    expect(logInfoMock).toHaveBeenNthCalledWith(2, "https://myProject.atlassian.net/browse/MP-7 --- 1");
    expect(logInfoMock).toHaveBeenNthCalledWith(3, 'https://myProject.atlassian.net/browse/MP-15 --- 2');
    expect(logInfoMock).toHaveBeenNthCalledWith(4, 'https://myProject.atlassian.net/browse/MP-42 --- 1');
  });

  it("ticket redirects", async () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    global.fetch = jest.fn().mockImplementationOnce(() => ({
      status: 200, json: () =>
        ({fields: {summary: 'statusName1', status: {name: 'statusName1'}}, key: 'anotherKey'})
    }));
    await index.checkJiraStatuses(defaultParams);
    expect(logInfoMock).toBeCalledTimes(4);
    expect(logInfoMock).toHaveBeenNthCalledWith(2, 'message - statuses: statusName1, statusName2');
    expect(logInfoMock).toHaveBeenNthCalledWith(3, `Found tickets by statuses: (1)
1 >>> https://myProject.atlassian.net/browse/MP-42 > https://myProject.atlassian.net/browse/anotherKey
\tstatusName1
`);
  });

  it("logs success", async () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    global.fetch = jest.fn().mockImplementationOnce(() => ({
      status: 200, json: () =>
        ({fields: {status: {name: 'anotherStatus'}}, key: 'anotherKey'})
    }));
    await index.checkJiraStatuses(defaultParams);
    expect(logInfoMock).toBeCalledTimes(3);
    expect(logInfoMock).toHaveBeenNthCalledWith(1, 'Found 1 tickets');
    expect(logInfoMock).toHaveBeenNthCalledWith(2, 'Just another typical day, nothing is found');
  });

  it("logs all statuses", async () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const fetchMock = global.fetch = jest.fn();
    fetchMock.mockImplementationOnce(() => ({
      status: 200, json: () =>
        ({fields: {status: {name: 'status1'}}, key: 'anotherKey'})
    }));
    fetchMock.mockImplementationOnce(() => ({
      status: 200, json: () =>
        ({fields: {status: {name: 'status2'}}, key: 'anotherKey'})
    }));
    fetchMock.mockImplementationOnce(() => ({
      status: 200, json: () =>
        ({fields: {status: {name: 'status1'}}, key: 'anotherKey'})
    }));
    fetchMock.mockImplementationOnce(() => ({
      status: 200, json: () =>
        ({fields: {status: {name: 'status1'}}, key: 'anotherKey'})
    }));
    await index.checkJiraStatuses({
      ...defaultParams,
      dirPathWithJiraLinks: `${process.cwd()}/__tests__/testData`,
    });
    expect(logInfoMock).toBeCalledTimes(3);
    expect(logInfoMock).toHaveBeenNthCalledWith(1, 'Found 4 tickets');
    expect(logInfoMock).toHaveBeenNthCalledWith(2, 'Just another typical day, nothing is found');

    expect(logInfoMock).toHaveBeenNthCalledWith(3, `All found statuses:
status1: 3
status2: 1`);
  });
});
