# probot-merge-pr

[Probot](https://github.com/probot/probot) app that merges PR after comment. It can choose a merge strategy based on configuration.

Based on [uber-workflow bot](https://github.com/uber-workflow/probot-app-merge-pr)

## Config

Config file: `.github/merge-pr.yml`. Config strategy is one of `squash`, `merge` or `rebase`. Default config:

```yml
command: '@appbooster-bot merge',
branch_merge_methods:
  master: squash
  production: merge
```

## Setup

```sh
# Install dependencies
yarn

# Run the bot
yarn start
```
