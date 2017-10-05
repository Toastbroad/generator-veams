'use strict';

const path = require('path');
const helpers = require('../lib/helpers');
const config = require('../lib/config');
const configFile = helpers.getProjectConfig();
const types = [
	'component',
	'utility'
];

exports.construct = function () {
	this.argument('name', {
		type: String,
		required: true
	});

	this.argument('path', {
		type: String,
		required: true
	});

	// This method adds support for flags
	this.option('config');
	this.option('component');
};

exports.questions = function () {
	let prompts = [];
	let _this = this;

	if (!this.options.name) {
		prompts = prompts.concat([
			{
				type: 'input',
				name: 'bpName',
				message: 'Define a blueprint name:',
				validate: function (answer) {
					const done = this.async();

					if (!answer) {
						done("Please add a blueprint name!");
						return;
					}
					done(true);
				}
			}
		])
	}

	prompts = prompts.concat([
		{
			type: 'confirm',
			name: 'bpWithWrapWith',
			message: 'Do you want to use this blueprint as wrap-writh template?',
			default: false
		},
		{
			type: 'confirm',
			name: 'bpWithJs',
			message: 'Do you want to add JavaScript to this blueprint?',
			default: true
		} //,
		// {
		// 	when: function (answers) {
		// 		return answers.bpWithJs === true;
		// 	},
		// 	name: 'bpAdditionalFiles',
		// 	message: 'Do you want to scaffold further files for your blueprint?',
		// 	type: 'checkbox',
		// 	choices: [
		// 		{
		// 			name: 'Service File',
		// 			value: 'bpWithService',
		// 			checked: false
		// 		},
		// 		{
		// 			name: 'Test Specs File',
		// 			value: 'bpWithTest',
		// 			checked: false
		// 		},
		// 		{
		// 			name: 'Usage File',
		// 			value: 'bpWithUsage',
		// 			checked: false
		// 		}
		// 	]
		// }
	]);

	if (!this.options.component && !this.options.utility && !this.options.custom) {
		prompts = prompts.concat([
			{
				name: 'bpTypeName',
				type: 'list',
				message: 'What type is your blueprint?',
				choices: [
					{
						name: 'component',
						value: 'component',
						checked: true
					},
					{
						name: 'utility',
						value: 'utility',
						checked: false
					},
					{
						name: 'custom',
						value: 'custom',
						checked: false
					}
				]
			}
		]);
	}

	prompts = prompts.concat([
		{
			when: function (answers) {
				return _this.options.custom || answers.bpTypeName === 'custom';
			},
			type: 'input',
			name: 'customTypeName',
			message: 'How do you call your custom type?',
			default: ''
		},
		{
			when: function (answers) {
				return answers.customTypeName;
			},
			type: 'input',
			name: 'customTypePrefix',
			message: 'How do you want to prefix your custom type?',
			default: ''
		}
	]);

	return prompts;
};

exports.save = function (props) {
	const cutter = (str) => {
		return str ? str.charAt(0) : '';
	};
	const prefixer = (str) => {
		return str ? str + '-' : '';
	};

	this.path = this.options.path;
	this.name = this.options.name ? this.options.name : props.bpName;
	this.bpTypeName = props.bpTypeName === 'global' ? '' : props.bpTypeName;
	this.bpTypePrefix = this.bpTypeName ? prefixer(cutter(this.bpTypeName)) : '';
	this.customTypeName = props.customTypeName || false;
	this.customTypePrefix = props.customTypePrefix || false;
	this.bpWrapWith = props.bpWithWrapWith;
	this.bpWithJs = props.bpWithJs || false;
	this.bpAdditionalFiles = props.bpAdditionalFiles || [];
	this.cleanPathType = this.bpTypeName === 'utility' ? 'utilitie' : this.bpTypeName;

	if (this.options.component ||
		this.options.utility ||
		this.options.custom ||
		this.bpTypeName === 'custom') {
		if (this.options.component) {
			this.bpTypeName = 'component';
			this.bpTypePrefix = 'c-';
		} else if (this.options.utility) {
			this.bpTypeName = 'utility';
			this.bpTypePrefix = 'u-';
		} else if (this.options.custom || this.bpTypeName === 'custom') {
			this.bpTypeName = this.customTypeName;
			this.bpTypePrefix = prefixer(this.customTypePrefix);
		}
	}

	this.filename = helpers.hyphenate(this.name);
	this.bpName = helpers.toCamelCase(this.name);
	this.bpJsName = helpers.capitalizeFirstLetter(this.bpName);
};

exports.setup = function () {
	let checkConfig = function (type) {
		return configFile &&
			configFile &&
			configFile.paths &&
			configFile.paths.blueprints &&
			configFile.paths.blueprints[type]
	};

	this.jsPath = this.path + '/' + this.filename + '/scripts/';
	this.scssPath = this.path + '/' + this.filename + '/styles/';
	this.partialsPath = this.path + '/' + this.filename + '/templates/';
	this.dataPath = this.path + '/' + this.filename + '/data/';
	this.rootFolderPath = this.path + '/' + this.filename + '/';


	this.dataFile = checkConfig('data') ? process.cwd() + '/' + configFile.paths.blueprints.data : 'data/bp.json.ejs';
	this.dataFileExtension = path.extname(helpers.deleteFileExtension(this.dataFile));

	this.tplFile = checkConfig('partial') ? process.cwd() + '/' + configFile.paths.blueprints.partial : 'templates/bp.hbs.ejs';
	this.tplFileExtension = path.extname(helpers.deleteFileExtension(this.tplFile));

	this.styleFile = checkConfig('style') ? process.cwd() + '/' + configFile.paths.blueprints.style : 'styles/bp.scss.ejs';
	this.styleFileExtension = path.extname(helpers.deleteFileExtension(this.styleFile));

	this.usageFile = checkConfig('readme') ? process.cwd() + '/' + configFile.paths.blueprints.readme : 'usage/README.md.ejs';
	this.usageFileExtension = path.extname(helpers.deleteFileExtension(this.usageFile));

	this.insertpointsFile = checkConfig('insertpoints') ? process.cwd() + '/' + configFile.paths.blueprints.insertpoints : 'usage/INSERTPOINTS.md.ejs';
	this.insertpointsFileExtension = path.extname(helpers.deleteFileExtension(this.usageFile));

	this.jsFile = checkConfig('js') ? process.cwd() + '/' + configFile.paths.blueprints.js : 'scripts/bp.js.ejs';
	this.jsFileExtension = path.extname(helpers.deleteFileExtension(this.jsFile));
};


exports.scaffold = function () {
	this.fs.copyTpl(
		this.templatePath('usage/settings.json.ejs'),
		this.rootFolderPath + `${this.filename}.settings.json`,
		this
	);

	this.fs.copyTpl(
		this.templatePath(this.dataFile),
		this.dataPath + this.filename + '-bp' + this.dataFileExtension,
		this
	);
	this.fs.copyTpl(
		this.templatePath(this.tplFile),
		this.partialsPath + this.bpTypePrefix + this.filename + this.tplFileExtension,
		this
	);
	this.fs.copyTpl(
		this.templatePath(this.styleFile),
		this.scssPath + '/_' + this.bpTypePrefix + this.filename + this.styleFileExtension,
		this
	);
	this.fs.copyTpl(
		this.templatePath(this.usageFile),
		this.rootFolderPath + '/README' + this.usageFileExtension,
		this
	);
	this.fs.copyTpl(
		this.templatePath(this.insertpointsFile),
		this.rootFolderPath + '/INSERTPOINTS' + this.insertpointsFileExtension,
		this
	);
	if (this.bpWithJs) {
		this.fs.copyTpl(
			this.templatePath(this.jsFile),
			this.jsPath + this.filename + this.jsFileExtension,
			this
		);
	}

	if (this.options.tmp) {
		this.fs.copyTpl(
			this.templatePath(this.insertpointsFile),
			'tmp/' + this.filename + '/INSERTPOINTS.md',
			this
		);
	}
};

exports.postInstall = function () {
	helpers.deleteSettingsFile();
};