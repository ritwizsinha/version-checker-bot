import { Probot } from "probot";
import { checkPRVersionWithMain, createTagOnMergeToMain } from './functions/usecases';
import { feature_testing_pom, feature_create_tag_on_merge, feature_did_sonar_run } from './constants';

import { load } from 'js-yaml';

export default (app: Probot) => {
  app.on(['pull_request.opened', 'pull_request.reopened', 'pull_request.synchronize'], async (context) => {
    try {
      const config = (await context.config('bot.yml')) as any;
      console.log(config);
      const shouldRun = config[feature_testing_pom]['detect'];
      if (!shouldRun) return;
  
      const givenBranches = config[feature_testing_pom]['branches'] as Array<{ from: string, to: string }>;
      const { head: { ref: fromBranch }, base: { ref: toBranch } } = context.payload.pull_request;
      if (givenBranches.filter((item) => item.from === fromBranch && item.to === toBranch).length === 0) return;
  
      const commentText = await checkPRVersionWithMain(context);
      if (commentText === "") return;
      const comment = context.issue({
        body: commentText,
      });
      await context.octokit.issues.createComment(comment);
  
  
      // Checking for sonar test
      const shouldRunSonarTest = config[feature_did_sonar_run]['detect'];
      if (!shouldRunSonarTest) return;
  
      const projectKeyFile = config[feature_did_sonar_run]['project-key-file'];
      const owner = context.payload.repository.owner.login as string;
      const repoName = context.payload.repository.name;
      const params = {
        owner,
        path: projectKeyFile,
        repo: repoName,
        mediaType: {
          format: 'raw'
        }
      }
  
      const { data } = await context.octokit.repos.getContent(params);
      const yamlJSON = load(data.toLocaleString());
      console.log(yamlJSON);
    } catch (err) {
      console.log(err);
    }
    
  });

  app.on('pull_request.closed', async (context) => {
    const { merge_commit_sha: mergeCommitSha, merged } = context.payload.pull_request;
    if (!merged || !mergeCommitSha) return;

    const config = (await context.config('bot.yml')) as any;
    const { detect: shouldRun, from, to } = config[feature_create_tag_on_merge];
    if (!shouldRun) return;

    const { head: { ref: fromBranch }, base: { ref: toBranch } } = context.payload.pull_request;

    if (fromBranch !== from || toBranch !== to) return;
    return createTagOnMergeToMain(context);
  });
};

