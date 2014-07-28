module.exports = {
	options: {
		assets: '<%%= paths.dev %>',
		data: '<%%= paths.src %>/data/**/*.{json,yml}',
		helpers: '<%%= paths.src %>/templates/helpers/**/*.js',
		layoutdir: '<%%= paths.src %>/templates/layouts/',
		layout: 'tpl_default.hbs',
		partials: '<%%= paths.src %>/templates/partials/**/*.hbs'
	},
	pages: {
		options: {<% if(plugin && plugin.length > 0){ %>
		plugins: [<% if(typeof plugin === 'object'){ _.each(plugin, function(name, i) { %>'<%= name %>'<% if(i < (plugin.length - 1)) { %>,<% } }); } else { %>'<%= name %>'<%} %>],<%}
_.each(plugin, function(name, i) { if(name == 'permalinks') { %>
			permalinks: {
				preset: 'pretty'
			},<% } if(name == 'assemble-contrib-contextual') { %>
			contextual: {
				dest: 'tmp/'
			},<% } }); %>
		},
		files: [{
			cwd: '<%%= paths.src %>/templates/pages/',
			dest: '<%%= paths.dev %>/',
			expand: true,
			flatten: true,
			src: ['**/*.hbs']
		}]
	},
	ajax: {
		options: {
			layout: 'tpl_ajax.hbs'
		},
		files: [{
			cwd: '<%%= paths.src %>/templates/ajax/',
			dest: '<%%= paths.dev %>/ajax-content',
			expand: true,
			flatten: true,
			src: ['**/*.hbs']
		}]
	}<% if (features && features.length > 0 && features.indexOf('installDocs') != -1) { %>,
	docs: {
		files: [
		{
			cwd: '<%%= paths.src %>/templates/docs/',
			dest: '<%%= paths.dev %>/docs',
			expand: true,
			flatten: true,
			src: ['**/*.hbs']
			}
		]
	}<% } %>
};