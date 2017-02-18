/*global describe, beforeEach, it*/
'use strict';

const fs = require('fs');
const path = require('path');
const helpers = require('yeoman-test');
const assert = require('yeoman-assert');
const answers = require('../test_helpers/prompt-answer-factory')({
	"gruntModules": [
		"grunt-postcss-separator"
	]
});


describe('grunt-postcss-separator', function () {
	const srcPath = "resources/";
	const helperPath = "helpers/";

	beforeEach(function (done) {
		helpers.run(path.join(__dirname, '../generators/app'))
			.inDir(path.join(__dirname, 'tmp'))
			.withOptions({
				'skip-install': true,
				'skip-welcome-message': true
			})
			.withPrompts(answers)
			.on('end', done);
	});

	it('adds references to package.json', function () {
		assert.fileContent('package.json', /grunt-postcss-separator/);
	});

	it('creates helper files', function () {
		assert.file(helperPath + "_grunt/postcssSeparator.js");
	});

	it('adds task to Gruntfile.js file', function () {
		assert.fileContent("Gruntfile.js", /\'postcssSeparator\'/);
	});
});