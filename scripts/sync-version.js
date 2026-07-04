#!/usr/bin/env node
// Invoked by semantic-release's @semantic-release/exec `prepareCmd` as
// `node scripts/sync-version.js ${nextRelease.version}`. This app doesn't use
// @semantic-release/npm (nothing here is published to a registry), so nothing
// else bumps package.json's version field automatically — this script writes
// the computed version into both package.json and app.json's expo.version so
// neither drifts from the tagged release.
const fs = require('fs');
const path = require('path');

const version = process.argv[2];
if (!version) {
  console.error('sync-version: no version argument provided');
  process.exit(1);
}

function setVersion(relativePath, apply) {
  const filePath = path.join(__dirname, '..', relativePath);
  const json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  apply(json);
  fs.writeFileSync(filePath, JSON.stringify(json, null, 2) + '\n');
  console.log(`sync-version: ${relativePath} -> ${version}`);
}

setVersion('package.json', (json) => {
  json.version = version;
});
setVersion('app.json', (json) => {
  json.expo.version = version;
});
