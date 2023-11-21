export interface checkJiraStatusesInterface {
  behaviorConfig: Array<{
    statusNames: string[];
    message: string;
  }>;
  jiraAddress: string;
  jiraUserEmail: string;
  jiraUserToken: string;
  dirPathWithJiraLinks: string;
}