
export async function getVersion ({
    getContent,
    owner,
    repoName
}) {
    const pomFileContents = (await getContent({
        owner,
        repo: repoName,
        path: 'pom.xml',
        mediaType: {
          format: 'raw'
        }
      })).data;
      const regexMain = /<version>(?<major>\d{1,2}).(?<minor>\d{1,2}).(?<patch>\d{1,2})<\/version>/m;
      const mainresult = pomFileContents.toLocaleString().match(regexMain);
      return `${(mainresult as any).groups['major']}.${(mainresult as any).groups['minor']}.${(mainresult as any).groups['patch']}`;
}