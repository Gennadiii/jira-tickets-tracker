import {hardcodedKeysSearcherUtil, apiUtil, logUtil} from "./utils";
import {checkJiraStatusesInterface, getStatusInterface} from "./index.interface";
import {issueToLogInterface} from "./utils/log";

export async function getStatus(params: getStatusInterface): Promise<statusInterface> {
  const {statusName, statusCode} = (await apiUtil.getIssue(params));
  return {networkStatusCode: statusCode, ticketStatus: statusCode === 200 ? statusName : null};
}

export async function checkJiraStatuses({
                                          jiraAddress,
                                          jiraUserEmail,
                                          jiraUserToken,
                                          dirPathWithJiraLinks,
                                          behaviorConfig
                                        }: checkJiraStatusesInterface): Promise<void> {
  let shouldFail = false;
  const cleanJiraAddress = jiraAddress.replace(/\/$/, '');
  const issuePrefix = `${cleanJiraAddress}/browse/`;
  const statusesCounter: { [key: string]: number } = {};
  let hardcodedIssueKeys = hardcodedKeysSearcherUtil.find({jiraPrefix: issuePrefix, dirPathWithJiraLinks});
  console.info(`Found ${hardcodedIssueKeys.length} tickets`);
  let newHardcodedKeys = [];
  for (const config of behaviorConfig) {
    const {statusNames, message} = config;
    const linksWithStatus: issueToLogInterface[] = [];
    const linksWithError: issueToLogInterface[] = [];
    for (const hardcodedIssueKey of hardcodedIssueKeys) {
      const issueLinkFromRequest = issuePrefix + hardcodedIssueKey;
      const jiraIssue = await apiUtil.getIssue({
        jiraAddress: cleanJiraAddress,
        jiraUserEmail,
        jiraUserToken,
        key: hardcodedIssueKey
      });
      const {json, statusCode, statusName, actualKey, summary} = jiraIssue;
      switch (statusCode) {
        case 404:
          console.error(`ticket not found: ${issueLinkFromRequest}`);
          linksWithError.push({link: issueLinkFromRequest});
          break;
        case 200:
          if (!statusName) {
            console.error(
              `Different data structure for ticket ${issueLinkFromRequest}: ${JSON.stringify(json, null, 4)}`);
            break;
          }
          if (statusesCounter[statusName]) {
            statusesCounter[statusName]++;
          } else {
            statusesCounter[statusName] = 1;
          }
          if (statusNames.includes(statusName)) {
            const issueLinkFromResponse = issuePrefix + actualKey;
            const link = issueLinkFromRequest === issueLinkFromResponse
              ? issueLinkFromResponse
              : `${issueLinkFromRequest} > ${issueLinkFromResponse}`;
            linksWithStatus.push({link, summary});
          } else {
            newHardcodedKeys.push(hardcodedIssueKey);
          }
          break;
        default:
          linksWithError.push({link: issueLinkFromRequest});
          console.error(
            `On request for ${issueLinkFromRequest} Jira API responded with error: ${JSON.stringify(json, null, 4)}`,
          );
      }
    }
    if ((linksWithError.length + linksWithStatus.length) > 0) {
      shouldFail = true;
    }
    shouldFail && console.info(`${message} - statuses: ${statusNames.join(', ')}`);
    logUtil.logFoundIssues({ticketsWithError: linksWithError, ticketsWithStatus: linksWithStatus});
    hardcodedIssueKeys = [...newHardcodedKeys];
    newHardcodedKeys = [];
  }
  shouldFail || console.info("Just another typical day, nothing is found");
  logUtil.logAllStatusesByStatusesCounter(statusesCounter);
  process.exit(shouldFail ? 1 : 0);
}

interface statusInterface {
  ticketStatus: string;
  networkStatusCode: number;
}
