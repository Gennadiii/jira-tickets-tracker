export interface checkJiraStatusesInterface extends accessInterface {
  behaviorConfig: Array<{
    statusNames: string[];
    message: string;
  }>;
  dirPathWithJiraLinks: string;
}

interface accessInterface {
  jiraAddress: string;
  jiraUserEmail: string;
  jiraUserToken: string;
}

export interface getStatusInterface extends accessInterface {
  key: string;
}

export interface findLinksInterface {
  jiraPrefix: string;
  dirPathWithJiraLinks: string;
}

export interface logIssuesInterface {
  jiraAddress: string;
  dirPathWithJiraLinks: string;
}
