import { Probot } from "probot";
import axios from 'axios';

export = (app: Probot) => {
  app.on("issues.opened", async (context) => {
    const issueComment = context.issue({
      body: "Thanks for opening this issue!",
    });
    await context.octokit.issues.createComment(issueComment);
  });

  app.on('pull_request.opened', async (context) => {
    const { pull_request: { diff_url } } = context.payload;
    const owner = context.payload.repository.owner.login  as string;
    const repo = context.payload.repository;
    const repoName = repo.name;
    const { data } = await axios.get(diff_url);
    const regex = /\+[ ]+\<version\>(?<major>\d{1,2}).(?<minor>\d{1,2}).(?<patch>\d{1,2})<\/version>/m;
    const fileDiff = data as string;
    const result = fileDiff.match(regex);
    const major = (result as any)?.groups['major'];
    const minor = (result as any)?.groups['minor'];
    const patch = (result as any)?.groups['patch'];
    const prVersion = `${major}.${minor}.${patch}`;
    const pomFileContents = (await context.octokit.repos.getContent({
      owner,
      repo: repoName,
      path: 'pom.xml',
      mediaType: {
        format: 'raw'
      }
    })).data;
    const regexMain = /<version>(?<major>\d{1,2}).(?<minor>\d{1,2}).(?<patch>\d{1,2})<\/version>/m;
    const mainresult = pomFileContents.toLocaleString().match(regexMain);
    const mainPrVersion = `${(mainresult as any).groups['major']}.${(mainresult as any).groups['minor']}.${(mainresult as any).groups['patch']}`;
    console.log(mainPrVersion, prVersion);
    let issueComment;
    if (mainPrVersion >= prVersion) {
      issueComment = context.issue({
        body: 'The version of package is less than the version in master, please correct',
      });
    } else {
      issueComment = context.issue({
        body: 'The version in the pr is correctly increased'
      })
    }

    await context.octokit.issues.createComment(issueComment);
    // console.log(pomFileContents);
    // console.log(diff_url);
  })
  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
};
