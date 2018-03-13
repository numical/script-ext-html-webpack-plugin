/* eslint-env jasmine */
/* global since:false */
'use strict';

const path = require('path');
const fs = require('fs');
const OUTPUT_DIR = path.join(__dirname, '../../dist');

module.exports = (err, stats, expected, done) => {
  testError(err);
  if (!err) {
    testCompilation(stats.compilation.errors);
    testCompilation(stats.compilation.warnings);
    testFilesExistence(expected.files, true);
    testFilesExistence(expected.not.files, false);
    testFileContent('index.html', expected.html, true);
    testFileContent('index.html', expected.not.html, false);
    testFileContent('index_bundle.js', expected.js, true);
    testFileContent('index_bundle.js', expected.not.js, false);
  }
  done();
};

function testError (err) {
  expect(err).toBeFalsy();
}

function testCompilation (msgs) {
  msgs = (msgs || []).join('\n');
  expect(msgs).toBe('');
}

function testFilesExistence (expectedFiles, expectedToExist) {
  expectedFiles.forEach((filename) => {
    testFileExistence(filename, expectedToExist);
  });
}

function testFileExistence (filename, expectedToExist) {
  const fileExists = fs.existsSync(path.join(OUTPUT_DIR, filename));
  const msg = expectedToExist
    ? `file ${filename} should exist`
    : `file ${filename} should not exist`;
  since(msg).expect(fileExists).toBe(expectedToExist);
  return fileExists;
}

function testFileContent (filename, expectedContents, expectedToExist) {
  if (expectedContents.length > 0) {
    const content = getFileContent(filename);
    since(`file ${filename} should have content`).expect(content).not.toBeNull();
    expectedContents.forEach((expectedContent) => {
      if (expectedToExist) {
        const msg = `file ${filename} should include ${expectedContent}`;
        testContentExists(content, expectedContent, msg);
      } else {
        const msg = `file ${filename} should not include ${expectedContent}`;
        testContentDoesNotExist(content, expectedContent, msg);
      }
    });
  }
}

function getFileContent (filename) {
  const fileExists = testFileExistence(filename, true);
  return fileExists ? fs.readFileSync(path.join(OUTPUT_DIR, filename)).toString() : null;
}

function testContentExists (content, expectedContent, msg) {
  if (expectedContent instanceof RegExp) {
    since(msg).expect(content).toMatch(expectedContent);
  } else {
    since(msg).expect(content).toContain(expectedContent);
  }
}

function testContentDoesNotExist (content, expectedContent, msg) {
  if (expectedContent instanceof RegExp) {
    since(msg).expect(content).not.toMatch(expectedContent);
  } else {
    since(msg).expect(content).not.toContain(expectedContent);
  }
}
