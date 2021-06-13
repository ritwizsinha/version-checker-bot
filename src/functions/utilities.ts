import { Context } from "probot";
import { parseStringPromise } from 'xml2js';

export async function getVersionFromRefWithContext(context: Context, { repo, owner, ref }) {
  const params = {
    owner,
    path: 'pom.xml',
    repo,
    mediaType: {
      format: 'raw'
    }
  }
  if (ref) params['ref'] = ref;
  const { data } = await context.octokit.repos.getContent(params);
  const { project: { version } } = await parseStringPromise(data);
  return version
}

export async function wrapper(promise) {
  try {
    const data = await promise;
    return [data, null];
  } catch (err) {
    return [null, err];
  }
}
