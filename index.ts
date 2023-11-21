import {hardcodedKeysSearcherUtil, apiUtil, logUtil} from "./src/utils";
import {checkJiraStatusesInterface} from "./index.interface";

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
  let hardcodedIssueKeys = hardcodedKeysSearcherUtil.find({jiraPrefix: issuePrefix, dirPathWithJiraLinks});
  console.info(`Found ${hardcodedIssueKeys.length} tickets`);
  let newHardcodedKeys = [];
  for (const config of behaviorConfig) {
    const {statusNames, message} = config;
    const linksWithStatus: string[] = [];
    const linksWithError: string[] = [];
    for (const hardcodedIssueKey of hardcodedIssueKeys) {
      const issueLinkFromRequest = issuePrefix + hardcodedIssueKey;
      const jiraIssue = await apiUtil.getIssue({
        jiraAddress: cleanJiraAddress,
        jiraUserEmail,
        jiraUserToken,
        key: hardcodedIssueKey
      });
      const {json, statusCode, statusName, actualKey} = jiraIssue;
      switch (statusCode) {
        case 404:
          console.error(`ticket not found: ${issueLinkFromRequest}`);
          linksWithError.push(issueLinkFromRequest);
          break;
        case 200:
          if (!statusName) {
            console.error(
              `Different data structure for ticket ${issueLinkFromRequest}: ${JSON.stringify(json, null, 4)}`);
            break;
          }
          if (statusNames.includes(statusName)) {
            const issueLinkFromResponse = issuePrefix + actualKey;
            linksWithStatus.push(
              issueLinkFromRequest === issueLinkFromResponse
                ? issueLinkFromResponse
                : `${issueLinkFromRequest} > ${issueLinkFromResponse}`,
            );
          } else {
            newHardcodedKeys.push(hardcodedIssueKey);
          }
          break;
        default:
          linksWithError.push(issueLinkFromRequest);
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
  process.exit(shouldFail ? 1 : 0);
}
