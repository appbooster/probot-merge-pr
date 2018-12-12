const getConfig = require('probot-config')

const DEFAULT_CONFIG = {
  command: '@appbooster-bot merge',
  branch_merge_methods: {
    master: 'squash',
    production: 'merge',
  },
}

module.exports = (robot) => {
  robot.on(
    ['issue_comment.created', 'issue_comment.edited'],
    async (context) => {
      const { github, log } = context
      const { issue, comment } = context.payload
      const { pull_request, state } = issue
      const { user } = comment
      if (!pull_request || state !== 'open' || user.type !== 'User') {
        log('Not an opened pull request or comment not from User')

        return
      }
      const permissions = await github.repos.reviewUserPermissionLevel(
        context.repo({
          username: user.login,
        })
      )

      const level = permissions.data.permission
      if (level !== 'admin' && level !== 'write') {
        log("User doesn't have a permission to merge")

        return
      }

      const { command, branch_merge_methods } = await getConfig(
        context,
        'merge-pr.yml',
        DEFAULT_CONFIG
      )

      if (comment.body !== command) {
        return
      }

      log('Merge command received')

      const {
        data: {
          base: { ref: baseBranch },
        },
      } = await github.pullRequests.get(
        context.repo({
          number: issue.number,
        })
      )

      const merge_method = branch_merge_methods[baseBranch] || 'squash'

      try {
        await github.pullRequests.merge(
          context.repo({
            number: issue.number,
            merge_method,
          })
        )
      } catch (err) {
        if (err.code === 405) {
          const { message } = JSON.parse(err.message)
          github.issues.createComment(
            context.issue({
              body: `Failed to merge PR: ${message}`,
            })
          )
        }
      }
    }
  )
}
