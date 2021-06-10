import { Probot } from "probot";
import { getVersionFromRefWithContext, wrapper} from './functions/utilities';


export = (app: Probot) => {

  app.on('pull_request.opened', async (context) => {
    const { ref } = context.payload.pull_request.head
    const owner = context.payload.repository.owner.login  as string;
    const repoName = context.payload.repository.name;
    const [ versionStringOnPr, err ] = await wrapper(getVersionFromRefWithContext(context, { repo: repoName, owner, ref })); 
    if (err) {
      console.log(err);
      return;
    }

    const [ versionStringOnMaster, err2 ] = await wrapper(getVersionFromRefWithContext(context, { repo: repoName,owner, ref: null }));
    if (err2) {
      console.log(err2);
      return;
    }
    console.log(versionStringOnMaster, versionStringOnPr);
    if (versionStringOnPr <= versionStringOnMaster) {
      const comment = context.issue({
        body: "Please update the version to be greater than master"
      });
      await context.octokit.issues.createComment(comment);
    }
  });
  
  app.on('pull_request.closed', async (context) => {
    context.octokit.config
    const { merge_commit_sha: mergeCommitSha, merged } = context.payload.pull_request; 
    if (!merged || !mergeCommitSha) return;
    console.log(mergeCommitSha);
    const owner = context.payload.repository.owner.login  as string;
    const repoName = context.payload.repository.name;
    try {
      const [ mainBranchVersion, err ] = await wrapper(getVersionFromRefWithContext(context, { repo: repoName, owner, ref: null }));
      if (err) {
        console.log(err);
        return;
      }
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
  });

  app.on("")
};
