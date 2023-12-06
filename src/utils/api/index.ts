export const apiUtil = {
  async getIssue(
    {jiraAddress, jiraUserEmail, jiraUserToken, key}: getIssueInterface
  ): Promise<issueInterface> {
    const encodedCredentials = Buffer.from(
      `${jiraUserEmail}:${jiraUserToken}`
    ).toString("base64");
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Basic ${encodedCredentials}`,
    };
    const response = await fetch(`${jiraAddress}/rest/api/latest/issue/${key}?fields=status,summary`, {
      method: "GET",
      headers: headers,
    });
    const json = await response.json();
    return {
      statusName: json.fields?.status?.name,
      statusCode: response.status,
      actualKey: json.key,
      summary: json.fields?.summary,
      json,
    };
  }
};

interface getIssueInterface {
  key: string;
  jiraAddress: string;
  jiraUserEmail: string;
  jiraUserToken: string;
}

interface issueInterface {
  statusCode: number;
  statusName: string;
  actualKey: string;
  summary: string;
  json: Record<string, unknown>;
}
