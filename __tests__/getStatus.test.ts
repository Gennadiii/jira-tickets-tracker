import {describe, expect, it, beforeEach, jest} from "@jest/globals";
import * as main from "../src";

const defaultParams = {
  jiraUserEmail: 'jiraUserEmail',
  jiraUserToken: 'jiraUserToken',
  jiraAddress: 'https://myProject.atlassian.net',
  key: 'key',
};
let index: typeof main = null;

describe("getStatus", () => {
  beforeEach(async () => {
    jest.restoreAllMocks();
    jest.resetModules();
    index = await import('../src');
  });

  it("returns status if code is 200", async () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    global.fetch = jest.fn(() => ({
      status: 200, json: () =>
        ({fields: {summary: 'summary', status: {name: 'name'}}, key: 'key'})
    }));
    expect(await index.getStatus(defaultParams)).toEqual({networkStatusCode: 200, ticketStatus: "name"});
  });

  it("returns null if code is not 200", async () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    global.fetch = jest.fn(() => ({
      status: 201, json: () =>
        ({fields: {summary: 'summary', status: {name: 'name'}}, key: 'key'})
    }));
    expect(await index.getStatus(defaultParams)).toEqual({networkStatusCode: 201, ticketStatus: null});
  });
});
