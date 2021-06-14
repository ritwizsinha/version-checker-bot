import { getVersionFromRefWithContext } from './utilities';
import { greater_version_number_than_master, error_in_checking_versions } from '../constants';

export async function checkPRVersionWithMain(context): Promise<string> {
    const { ref } = context.payload.pull_request.head
    const owner = context.payload.repository.owner.login as string;
    const repoName = context.payload.repository.name;
    try {
        const versionStringOnPr = await getVersionFromRefWithContext(context, { repo: repoName, owner, ref });
        const versionStringOnMaster = await getVersionFromRefWithContext(context, { repo: repoName, owner, ref: null });

        console.log(versionStringOnMaster, versionStringOnPr);
        if (versionStringOnPr <= versionStringOnMaster) {
            return greater_version_number_than_master;
        }
        return "";
    }
    catch (err) {
        console.log(err);
        return error_in_checking_versions;
    }
}

export async function createTagOnMergeToMain(context) {
    const { merge_commit_sha: mergeCommitSha } = context.payload.pull_request;
    const owner = context.payload.repository.owner.login as string;
    const repoName = context.payload.repository.name;
    try {
      const mainBranchVersion = await getVersionFromRefWithContext(context, { repo: repoName, owner, ref: null });

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

      await context.octokit.rest.git.createRef({
        owner,
        repo: repoName,
        ref: `refs/tags/v${mainBranchVersion}`,
        sha,
      });
    } catch (err) {
      console.log(err);
    }
}

// export async function didSonarTestRunAndPass(context: Context) {

//   // Is the check turned on
   
//   // Get the config file containing project key

//   // Get the project key

//   // Call the sonar api

//   // Get the status

//   // If status is failing return a comment with the details
// }