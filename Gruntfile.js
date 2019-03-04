
module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);
  var path = require('path');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    pkgMeta: grunt.file.readJSON('config/meta.json'),
    dest: grunt.option('target') || 'dist',
    basePath: path.join('<%= dest %>', 'App_Plugins', '<%= pkgMeta.name %>'),

    watch: {
      options: {
        spawn: false,
        atBegin: true
      },
      js: {
        files: ['FavoriteContent/**/*.js'],
        tasks: ['concat:dist']
      },
      html: {
        files: ['FavoriteContent/**/*.html'],
        tasks: ['copy:html']
      },
      dll: {
        files: ['FavoriteContent/Umbraco/FavoriteContent/**/*.cs'] ,
        tasks: ['msbuild:dist', 'copy:dll']
      },
      sass: {
      files: ['FavoriteContent/**/*.scss'],
      tasks: ['sass', 'copy:css']
      },
      css: {
      files: ['FavoriteContent/**/*.css'],
      tasks: ['copy:css']
      },
      manifest: {
      files: ['FavoriteContent/package.manifest'],
      tasks: ['copy:manifest']
      }
    },

    concat: {
      options: {
        stripBanners: false
      },
      dist: {
        src: [
            'FavoriteContent/controllers/favoriteContentController.js'
        ],
        dest: '<%= basePath %>/js/favoriteContent.js'
      }
    },

    copy: {
      dll: {
        cwd: 'FavoriteContent/Umbraco/FavoriteContent/bin/debug/',
        src: 'FavoriteContent.dll',
        dest: '<%= dest %>/bin/',
        expand: true
    },
    html: {
        cwd: 'FavoriteContent/views/',
        src: [
            'favoriteContentView.html'
        ],
        dest: '<%= basePath %>/views/',
        expand: true,
        rename: function(dest, src) {
            return dest + src;
          }
    },
		css: {
			cwd: 'FavoriteContent/css/',
			src: [
				'favoriteContent.css'
			],
			dest: '<%= basePath %>/css/',
			expand: true,
			rename: function(dest, src) {
				return dest + src;
			}
		},
    manifest: {
        cwd: 'FavoriteContent/',
        src: [
            'package.manifest'
        ],
        dest: '<%= basePath %>/',
        expand: true,
        rename: function(dest, src) {
            return dest + src;
        }
    },
    umbraco: {
    cwd: '<%= dest %>',
    src: '**/*',
    dest: 'tmp/umbraco',
    expand: true
  }
},

    umbracoPackage: {
        dist: {
            src: 'tmp/umbraco',
            dest: 'pkg',
            options: {
                name: "<%= pkgMeta.name %>",
                version: '<%= pkgMeta.version %>',
                url: '<%= pkgMeta.url %>',
                license: '<%= pkgMeta.license %>',
                licenseUrl: '<%= pkgMeta.licenseUrl %>',
                author: '<%= pkgMeta.author %>',
                authorUrl: '<%= pkgMeta.authorUrl %>',
                manifest: 'config/package.xml',
                readme: '<%= grunt.file.read("config/readme.txt") %>',
            }
        }
    },

    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      src: {
        src: ['app/**/*.js', 'lib/**/*.js']
      }
  },

  sass: {
		dist: {
			options: {
				style: 'compressed'
			},
			files: {
				'FavoriteContent/css/favoriteContent.css': 'FavoriteContent/sass/favoriteContent.scss'
			}
		}
	},

  clean: {
      build: '<%= grunt.config("basePath").substring(0, 4) == "dist" ? "dist/**/*" : "null" %>',
      tmp: ['tmp'],
      html: [
        'FavoriteContent/views/*.html',
        '!FavoriteContent/views/favoriteContentView.html'
        ],
      js: [
        'FavoriteContent/controllers/*.js',
		'!FavoriteContent/controllers/favoriteContentController.js'
      ],
      css: [
        'FavoriteContent/css/*.css',
        '!FavoriteContent/css/favoriteContent.css'
      ],
	  sass: [
		'FavoriteContent/sass/*.scss',
		'!FavoriteContent/sass/favoriteContent.scss'
	  ]
  },
    msbuild: {
      options: {
        stdout: true,
        verbosity: 'quiet',
        maxCpuCount: 4,
        version: 4.0,
        buildParameters: {
          WarningLevel: 2,
          NoWarn: 1607
        }
    },
    dist: {
        src: ['FavoriteContent/Umbraco/FavoriteContent/FavoriteContent.csproj'],
        options: {
            projectConfiguration: 'Debug',
            targets: ['Clean', 'Rebuild'],
        }
    }
  }
  });

  grunt.registerTask('default', ['concat', 'sass:dist', 'copy:html', 'copy:manifest', 'copy:css', 'clean:html', 'clean:js', 'clean:sass', 'clean:css']);
  grunt.registerTask('umbraco', ['clean:tmp', 'default', 'copy:umbraco', 'umbracoPackage', 'clean:tmp']);
};
