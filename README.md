# Jira ticket tracker

0 dependencies 100% unit tested simple tool that helps teams not to forget about jira tickets transferring to certain statuses.

`jira-tickets-tracker` will parse your code and search for jira links in it. It could be a comment or a string. Basically anything starting with https:// and ending with a space like: https://myProject.atlassian.net/browse/MP-42
Note: if you want to mention ticket but don't want to track it just remove the protocol or leave just the key like ```myProject.atlassian.net/browse/MP-42``` or ```MP-42```

It will then check status for every unique found ticket and if the status of the ticket matches the status you want to track it will log the result mentioning the tickets with expected status and exit process with 1.

Flow example:
I'm writing auto tests. Auto test finds a bug and I disable that test until the bug is fixed and I leave a comment with the bug ticket in the code near the test. Then the bug gets fixed and I miss jira notification. But I have a nightly CI job instead that became red notifying that my ticket is in Done status. The job will remain red until I enable my test back and remove the comment with the ticket.

![npm downloads](https://img.shields.io/npm/dm/jira-tickets-tracker.svg?style=flat-square)

## Installation

```bash
$ npm install jira-tickets-tracker --save-dev
```

### Basic usage

The code provided below will log found issues and exit the process with "1". If nothing is found

```typescript
void async function main() {
  try {
    await checkJiraStatuses({
      jiraUserEmail: 'jiraUserEmail',
      jiraUserToken: 'jiraUserToken',
      jiraAddress: 'https://myProject.atlassian.net',
      // make sure it starts with "https://" just copy the link from a browser
      dirPathWithJiraLinks: `${process.cwd()}/specs`,
      // it will search every file inside "specs" directory
      behaviorConfig: [{
          message: 'Please update tests, containing resolved issues', 
          // message to be logged when tickets found
          statusNames: ['Done', 'Complete', 'Closed'],
          // statuses to track. Just write them the same way they are written on the button of Jira UI
        }],
    })
  } catch (e) {
    console.log(e);
  }
}();
```

## Changelog

- 1.0.0 - Initial release
- 1.1.0 - Fixed issue of last slash in jira link
- 1.2.0 - all statuses logging
- 1.2.1 - improved readme

## Contributing
  
  - Create a personal fork of the project on Github.
  - Clone the fork on your local machine. Your remote repo on Github is called `origin`.
  - Add the original repository as a remote called `upstream`.
  ```
  git remote add upstream https://github.com/Gennadiii/jira-tickets-tracker
  git remote -v
  origin  https://github.com/username/jira-tickets-tracker.git (fetch)
  origin  https://github.com/username/jira-tickets-tracker.git (push)
  upstream        https://github.com/Gennadiii/jira-tickets-tracker (fetch)
  upstream        https://github.com/Gennadiii/jira-tickets-tracker (push)
  ```
  - If you created your fork a while ago be sure to pull upstream changes into your local repository.
  ```git merge upstream/develop```
  - Implement fix or feature.
  - Follow the code style of the project, including indentation.
  - Run tests from `__spec__` folder (```npm test```).
  - Write or adopt tests as needed.
  - Make sure you didn't miss any tests (```npm run test-coverage```).
  - Add or change the documentation as needed.
  - Squash your commits.
  - Push your branch to your fork on Github, the remote `origin`.
  - From your fork open a pull request. Target the project's `master`.
