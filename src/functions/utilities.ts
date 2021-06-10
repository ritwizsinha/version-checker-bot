import { Context } from "probot";
import { toJson } from "xml2json";

export async function getVersionFromRefWithContext(context: Context, { repo, owner, ref}) {
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
  const jsonStringData = toJson(data.toLocaleString());
  const jsonConfigObject = JSON.parse(jsonStringData);
  return jsonConfigObject['project']['version'];
}

export async function wrapper(promise) {
  try {
    const data = await promise;
    return [data, null];
  } catch (err) {
    return [null, err];
  }
} 