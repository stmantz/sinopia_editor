---
name: Tagged Release
about: Steps for Tagged Release
title: Tagged Release Checklist
labels: ''
assignees: ''

---

- [ ] Product owner assigned Release notes
  - [ ] Updates `NewsItem.js` component.
  - [ ] Sinopia [Wiki](https://github.com/LD4P/sinopia/wiki/Latest-Release,-What's-Next)
- [ ] Create release.
  - [ ] Pull latest master.
  - For the sinopia_editor only (sinopia_indexing_pipeline does not need to update the version number in the package.json file):
    - [ ] Check out a branch and update the version in *package.json*
    - [ ] `npm i` to regenerate *package-lock.json* (see note below)
    - [ ] `npm publish` to publish the version to [npm registry](https://npmjs.com).
    - [ ] Commit change to branch and push; create PR for version bump.  (You can't push directly to master, since it's a protected branch).
    - [ ] Once PR is merged, publish a [new release](https://github.com/LD4P/sinopia_editor/releases/new) with a version like `v1.0.2` and wait for Circleci to complete building and pushing docker images.
- [ ] AWS Images for supporting projects - the Sinopia stack requires
  a number of other projects to run successfully both locally and on AWS. If any of
  these projects changed between tagged releases, you will need to update and tag the
  latest image on Dockerhub along with corresponding update to Terraform with the tagged
  release.
  - [ ] Sinopia Indexing Pipeline https://github.com/LD4P/sinopia_indexing_pipeline
    - [ ] Publish a [new release](https://github.com/LD4P/sinopia_indexing_pipeline/releases/new) with a version like `v1.0.2` and wait for Circleci to complete building and pushing docker images.
  - [ ] Sinopia Exporter https://github.com/LD4P/sinopia_exporter
    - [ ] Publish a [new release](https://github.com/LD4P/sinopia_exporter/releases/new) with a version like `v1.0.2` and wait for Circleci to complete building and pushing docker images.
  - [ ] Sinopia API https://github.com/LD4P/sinopia_api
    - [ ] Publish a [new release](https://github.com/LD4P/sinopia_api/releases/new) with a version like `v1.0.2` and wait for Circleci to complete building and pushing docker images.

- [ ] Deploy to staging
  - [ ] Follow [instructions](https://github.com/sul-dlss/terraform-aws/tree/master/organizations/staging/sinopia#deploying-a-release-to-staging) for pushing a release to staging. Make sure to update versions to Sinopia Editor, Sinopia Indexing Pipeline, and Sinopia Exporter.
  - [ ] Submit a new terraform PR.
- [ ] Product owner decides whether to deploy to production (which may not occur for every tagged release)
  - [ ] Create a new terraform PR for production, making similar changes to staging.
  - [ ] Request that Ops deploy to production.


  **NOTE**: if *package-lock.json* has links to unsecured http:// registries, try
  deleting *package-lock.json*, remove the node modules `rm -rf ./node_modules`,
  run `npm cache clean --force`, and then run `npm i --prefer-online`
