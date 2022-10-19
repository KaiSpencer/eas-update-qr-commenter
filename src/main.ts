import * as core from '@actions/core'
import * as github from '@actions/github'

const expoQRBaseURL =
  'https://qr.expo.dev/eas-update?appScheme=exp&host=u.expo.dev&updateId='

async function run(): Promise<void> {
  try {
    const commentTitle = core.getInput('comment-title', {required: true})

    const iosBuildID = core.getInput('ios-build-id', {required: true})
    const androidBuildID = core.getInput('android-build-id', {required: true})

    const iosQR = expoQRBaseURL + iosBuildID
    const androidQR = expoQRBaseURL + androidBuildID

    const token = core.getInput('repo-token', {required: true})
    const octokit = github.getOctokit(token)
    const {repo, issue} = github.context

    // use the commit sha to get the commit message from octokit
    const commit = await octokit.rest.repos.getCommit({
      owner: repo.owner,
      repo: repo.repo,
      ref: github.context.sha
    })

    const commitMessage = commit.data.commit.message

    const defaultMessage =
      `# EAS Update Success\n` +
      `## Commit Message\n${commitMessage}\n` +
      `Commit: ${JSON.stringify(github.context.payload)}\n` +
      `${commentTitle}\n` +
      `\n|iOS|Android|` +
      `\n|:-:|:-:|` +
      `\n|![iOS Build QR](${iosQR})|![Android Build QR](${androidQR})|`

    await octokit.rest.issues.createComment({
      owner: repo.owner,
      repo: repo.repo,
      issue_number: issue.number,
      body: defaultMessage
    })
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
