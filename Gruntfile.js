var webpackConfig = require('./webpack.config');

module.exports = function( grunt ) {
	'use strict';

	var remapify = require( 'remapify' ),
		fs = require( 'fs' ),
		pkgInfo = grunt.file.readJSON( 'package.json' );

	var getBuildFiles = function() {
		return [
			'**',
			'!node_modules/**',
			'!docs/**',
			'!build/**',
			'!bin/**',
			'!.git/**',
			'!tests/**',
			'!.github/**',
			'!.travis.yml',
			'!.jscsrc',
			'!.jshintignore',
			'!.jshintrc',
			'!ruleset.xml',
			'!README.md',
			'!phpunit.xml',
			'!vendor/**',
			'!Gruntfile.js',
			'!package.json',
			'!package-lock.json',
			'!npm-debug.log',
			'!composer.json',
			'!composer.lock',
			'!.gitignore',
			'!.gitmodules',

			'!assets/dev/**',
			'!assets/**/*.map',
			'!*~'
		];
	};

	require( 'matchdep' ).filterDev( 'grunt-*' ).forEach( grunt.loadNpmTasks );

	// Project configuration
	grunt.initConfig( {
		pkg: grunt.file.readJSON( 'package.json' ),

		banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
				'<%= grunt.template.today("dd-mm-yyyy") %> */',

		checktextdomain: {
			standard: {
				options:{
					text_domain: 'elementor',
					correct_domain: true,
					keywords: [
						// WordPress keywords
						'__:1,2d',
						'_e:1,2d',
						'_x:1,2c,3d',
						'esc_html__:1,2d',
						'esc_html_e:1,2d',
						'esc_html_x:1,2c,3d',
						'esc_attr__:1,2d',
						'esc_attr_e:1,2d',
						'esc_attr_x:1,2c,3d',
						'_ex:1,2c,3d',
						'_n:1,2,4d',
						'_nx:1,2,4c,5d',
						'_n_noop:1,2,3d',
						'_nx_noop:1,2,3c,4d'
					]
				},
				files: [ {
					src: [
						'**/*.php',
						'!docs/**',
						'!node_modules/**',
						'!build/**',
						'!tests/**',
						'!.github/**',
						'!vendor/**',
						'!*~'
					],
					expand: true
				} ]
			}
		},

		usebanner: {
			dist: {
				options: {
					banner: '<%= banner %>'
				},
				files: {
					src: [
						'assets/js/*.js',
						'assets/css/*.css'
					]
				}
			}
		},

		jshint: {
			options: {
				jshintrc: '.jshintrc'
			},
			all: [
				'Gruntfile.js',
				'assets/js/dev/**/*.js'
			]
		},

		sass: {
			dist: {
				options: {
					sourceMap: true
				},
				files: [ {
					expand: true,
					cwd: 'assets/dev/scss/direction',
					src: '*.scss',
					dest: 'assets/css',
					ext: '.css'
				} ]
			}
		},

		postcss: {
			dev: {
				options: {
					map: true,

					processors: [
						require( 'autoprefixer' )( {
							browsers: 'last 10 versions'
						} )
					]
				},
				files: [ {
					src: [
						'assets/css/*.css',
						'!assets/css/*.min.css'
					]
				} ]
			},
			minify: {
				options: {
					processors: [
						require( 'autoprefixer' )( {
							browsers: 'last 10 versions'
						} ),
						require( 'cssnano' )( {
							reduceIdents: false
						} )
					]
				},
				files: [ {
					expand: true,
					src: [
						'assets/css/*.css',
						'!assets/css/*.min.css'
					],
					ext: '.min.css'
				} ]
			}
		},

		watch:  {
			styles: {
				files: [
					'assets/dev/scss/**/*.scss',
					'modules/**/*.scss',
					'!assets/dev/scss/frontend/breakpoints/proxy.scss'
				],
				tasks: [ 'styles:true' ],
				options: {
					spawn: false,
					livereload: true
				}
			},

			scripts: {
				files: [
					'assets/dev/js/**/*.js',
					'modules/**/*.js'
				],
				tasks: [ 'scripts:true' ],
				options: {
					spawn: false,
					livereload: true
				}
			}
		},

		wp_readme_to_markdown: {
			github: {
				options: {
					wordpressPluginSlug: 'elementor',
					travisUrlRepo: 'https://travis-ci.org/pojome/elementor',
					gruntDependencyStatusUrl: 'https://david-dm.org/pojome/elementor',
					coverallsRepo: 'pojome/elementor',
					screenshot_url: 'assets/{screenshot}.png'
				},
				files: {
					'README.md': 'readme.txt'
				}
			}
		},

		bumpup: {
			options: {
				updateProps: {
					pkg: 'package.json'
				}
			},
			file: 'package.json'
		},

		replace: {
			plugin_main: {
				src: [ 'elementor.php' ],
				overwrite: true,
				replacements: [
					{
						from: /Version: \d{1,1}\.\d{1,2}\.\d{1,2}/g,
						to: 'Version: <%= pkg.version %>'
					},
					{
						from: /ELEMENTOR_VERSION', '.*?'/g,
						to: 'ELEMENTOR_VERSION\', \'<%= pkg.version %>\''
					},
					{
						from: /ELEMENTOR_PREVIOUS_STABLE_VERSION', '.*?'/g,
						to: 'ELEMENTOR_PREVIOUS_STABLE_VERSION\', \'<%= grunt.config.get( \'prev_stable_version\' ) %>\''
					}
				]
			},

			readme: {
				src: [ 'readme.txt' ],
				overwrite: true,
				replacements: [
					{
						from: /Stable tag: \d{1,1}\.\d{1,2}\.\d{1,2}/g,
						to: 'Stable tag: <%= pkg.version %>'
					}
				]
			},

			packageFile: {
				src: [ 'package.json' ],
				overwrite: true,
				replacements: [
					{
						from: /prev_stable_version": ".*?"/g,
						to: 'prev_stable_version": "<%= grunt.config.get( \'prev_stable_version\' ) %>"'
			}
				]
			}
		},

		shell: {
			git_add_all: {
				command: [
					'git add --all',
					'git commit -m "Bump to <%= pkg.version %>"'
				].join( '&&' )
			}
		},

		release: {
			options: {
				bump: false,
				npm: false,
				commit: false,
				tagName: 'v<%= version %>',
				commitMessage: 'released v<%= version %>',
				tagMessage: 'Tagged as v<%= version %>'
			}
		},

		copy: {
			main: {
				src: getBuildFiles(),
				expand: true,
				dest: 'build/'
			},
			secondary: {
				src: getBuildFiles(),
				expand: true,
				dest: '/tmp/elementor-builds/<%= pkg.version %>/'
			}
		},

		qunit: {
			src: 'tests/qunit/index.html'
		},

		clean: {
			//Clean up build folder
			main: [
				'build'
			],
			qunit: [
				'tests/qunit/index.html',
				'tests/qunit/preview.html'
			]
		},

		webpack: {
			options: {
				stats: !process.env.NODE_ENV || process.env.NODE_ENV === 'development'
			},
			dev: webpackConfig.dev,
			prod: webpackConfig.prod
		}
	} );

	// Default task(s).
	grunt.registerTask( 'default', [
		'i18n',
		'wp_readme_to_markdown',
		'scripts',
		'styles'
	] );

	grunt.registerTask( 'i18n', [
		'checktextdomain'
	] );

	grunt.registerTask( 'scripts', function( isDevMode ) {
		grunt.task.run( 'jshint' );
		if ( ! isDevMode ) {
			grunt.task.run('webpack:prod');
		} else {
			grunt.task.run('webpack:dev');
		}
	} );

	grunt.registerTask( 'styles', function( isDevMode ) {
		grunt.task.run( 'sass' );

		if ( ! isDevMode ) {
			grunt.task.run( 'postcss' );
			grunt.task.run( 'css_templates' );
		}
	} );

	grunt.registerTask( 'css_templates', function() {
		grunt.task.run( 'css_templates_proxy:templates' );

		grunt.config( 'sass.dist', {
			files: [ {
				expand: true,
				cwd: 'assets/dev/scss/direction',
				src: [ 'frontend.scss', 'frontend-rtl.scss' ],
				dest: 'assets/css/templates',
				ext: '.css'
			} ]
		} );

		grunt.task.run( 'sass' );

		grunt.config( 'postcss.minify.files.0.src', [
			'assets/css/templates/*.css',
			'!assets/css/templates/*.min.css'
		] );

		grunt.task.run( 'postcss:minify' );

		grunt.task.run( 'css_templates_proxy:values' );
	} );

	// Writing the proxy file as a grunt task, in order to fit in with the tasks queue
	grunt.registerTask( 'css_templates_proxy', function( mode ) {
		fs.writeFileSync( 'assets/dev/scss/frontend/breakpoints/proxy.scss', '@import "' + mode + '";' );
	} );

	grunt.registerTask( 'build', [
		'default',
		'usebanner',
		'clean',
		'copy',
		'default' // Remove banners for GitHub
	] );

	grunt.registerTask( 'publish', function( releaseType ) {
		releaseType = releaseType ? releaseType : 'patch';

		var prevStableVersion = 'patch' === releaseType ? pkgInfo.prev_stable_version : pkgInfo.version;

		grunt.config.set( 'prev_stable_version', prevStableVersion );

		grunt.task.run( 'default' );
		grunt.task.run( 'bumpup:' + releaseType );
		grunt.task.run( 'replace' );
		grunt.task.run( 'shell:git_add_all' );
		grunt.task.run( 'release' );
	} );

	grunt.registerTask( 'test', [
		'qunit',
		'clean:qunit'
	] );
};
