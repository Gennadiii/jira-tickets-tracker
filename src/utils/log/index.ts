export const logUtil = {
  logFoundIssues(
    {ticketsWithError, ticketsWithStatus}: logFoundIssuesInterface
  ): void | never {
    ticketsWithError.length &&
    log({issues: ticketsWithError, message: "Please check these issues manually. I failed to access them"});
    ticketsWithStatus.length &&
    log({issues: ticketsWithStatus, message: "Found tickets by statuses"});
  }
};

function log({issues, message}: logIssuesInterface) {
  console.info(
    `${message}: (${issues.length})${issues
      .map((issue, index) => `\n${index + 1} >>> ${issue}`)
      .join("")}\n`,
  );
}

interface logFoundIssuesInterface {
  ticketsWithError: string[];
  ticketsWithStatus: string[];
}

interface logIssuesInterface {
  issues: string[];
  message: string;
}
