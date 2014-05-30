module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            dist: {
                src: ['node_modules/node-uuid/uuid.js', 'node_modules/socket.io-client/dist/socket.io.js', 'common/controller/controller.js', 'client/js/main.js', 'client/js/desktop.js'],
                dest: 'client/dist.js'
            },
            dist_mobile: {
                src: ['node_modules/node-uuid/uuid.js', 'node_modules/socket.io-client/dist/socket.io.js', 'common/controller/controller.js', 'client/js/main.js', 'client/js/tactile.js', 'client/js/mobile.main.js'],
                dest: 'client/mobile.dist.js'
            }
        },
        uglify : {
            main: {
                src: "client/dist.js",
                dest: "client/dist.js",
            },
            mobile: {
                src: "client/mobile.dist.js",
                dest: "client/mobile.dist.js",
            }
        },
        asset_cachebuster: {
            options: {
                buster: Date.now(),
                ignore: [],
                htmlExtension: 'html'
            },
            build: {
                files: {
                    'client/index.html': ['client/html/index.html'],
                    'client/mobile.html': ['client/html/mobile.html']
                }
            }
        },
        htmlmin: { 
            dist: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true
                },
                files: {
                    'client/index.html': ['client/html/index.html'],
                    'client/mobile.html': ['client/html/mobile.html'],
                }
            }
        },
        cssmin: {
            main: {
                src: 'client/css/main.css',
                dest: 'client/main.css'
            },
            mobile: {
                src: 'client/css/mobile.main.css',
                dest: 'client/mobile.main.css'
            },
        },
        copy: {
            css: {
                expand: true,
                cwd: 'client/css',
                src: '*.css',
                dest: 'client/',
            },
        },
        csslint : {
            options: {
                "ids": false,
                "known-properties": false
            },
            src:["client/css/*.css"]
        },
        htmllint: {
            all: ["client/html/*.html"]
        },
        jshint: {
            all: ['gruntfile.js', 'common/**/*.js', 'server/*.js', 'client/js/*.js']
        },
        nodeunit: {
            all: ['test/test-*.js']
        },
        replace: {
            dist: {
                options: {
                    patterns: [{
                        match: 'URL_SOCKETIO_SERVER',
                        replacement: process.env.SOCKETIO_SERVER || ''
                    }]
                },
                files: [{
                    expand: true,
                    flatten: true,
                    src: ['client/*.js'],
                    dest: 'client'
                }]
            }
        },
        exec: {
            server : {
                command: "node server/app.js"
            }
        },
        inline: {
            desktop: {
                src: ['client/index.html'],
            },
            mobile: {
                src: ['client/mobile.html'],
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-asset-cachebuster');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-csslint');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-nodeunit');
    grunt.loadNpmTasks('grunt-html');
    grunt.loadNpmTasks('grunt-replace');
    grunt.loadNpmTasks('grunt-exec');
    grunt.loadNpmTasks('grunt-inline');

    
    grunt.registerTask('default', ['concat', "replace", 'uglify', "htmlmin", "cssmin", "inline"]);
    grunt.registerTask('dev', ['concat', 'asset_cachebuster', 'copy:css', 'replace', 'exec']);
    grunt.registerTask('test', ['csslint', 'htmllint', 'jshint', 'nodeunit', 'default']);
};