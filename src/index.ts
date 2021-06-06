import { Probot } from "probot";
import axios from 'axios';

import { getVersion } from './functions/getVersion';

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

    if (!result) return;
    const major = (result as any)?.groups['major'];
    const minor = (result as any)?.groups['minor'];
    const patch = (result as any)?.groups['patch'];
    const prVersion = `${major}.${minor}.${patch}`;
    const mainPrVersion = await getVersion({
      getContent: context.octokit.repos.getContent,
      owner,
      repoName,
    });
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
  });
  
  app.on('pull_request.closed', async (context) => {
    const { merge_commit_sha: mergeCommitSha, merged } = context.payload.pull_request; 
    if (!merged || !mergeCommitSha) return;
    console.log(mergeCommitSha);
    const owner = context.payload.repository.owner.login  as string;
    const repo = context.payload.repository;
    const repoName = repo.name;
    try {
      const mainBranchVersion = await getVersion({
        getContent: context.octokit.rest.repos.getContent,
        owner,
        repoName,
      });
      console.log(mainBranchVersion);
      const { data: { sha } } = await context.octokit.rest.git.createTag({
          tag: `v${mainBranchVersion}`,
          object: mergeCommitSha,
          message: "Creating tag on merge",
          tagger: {
            name: owner,
            email: "abc@gmail.com",
          },
          type: 'commit',
          owner,
          repo: repoName, 
      });
      console.log("Tag sha", sha);
      await context.octokit.rest.git.createRef({
        owner,
        repo: repoName,
        ref: `refs/tags/v${mainBranchVersion}`,
        sha,
      });
    } catch (err) {
      console.log(err);
    }
    
  })
  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
};
