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

    const defaultMessage =
      `# EAS Update Success\n\n\n\n` +
      `${JSON.stringify(github.context)}\n\n\n` +
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
