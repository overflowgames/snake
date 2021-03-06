/*jslint node: true */
module.exports = function (grunt) {
    'use strict';
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            js_desktop: {
                src: ['node_modules/node-uuid/uuid.js', 'node_modules/socket.io-client/socket.io.js', 'common/controller/controller.js', 'client/js/GameView.js', 'client/js/main.js', 'client/js/desktop.js'],
                dest: 'client/dist.js'
            },
            js_mobile: {
                src: ['node_modules/node-uuid/uuid.js', 'node_modules/socket.io-client/socket.io.js', 'common/controller/controller.js', 'client/js/GameView.js', 'client/js/main.js', 'client/js/tactile.js', 'client/js/mobile.main.js'],
                dest: 'client/mobile.dist.js'
            },
            css_desktop: {
                src: ['client/css/main.css', 'client/css/spinner.css'],
                dest: 'client/main.css'
            },
            css_mobile: {
                src: ['client/css/mobile.main.css', 'client/css/spinner.css'],
                dest: 'client/mobile.main.css'
            }
        },
        uglify : {
            main: {
                src: "client/dist.js",
                dest: "client/dist.js"
            },
            mobile: {
                src: "client/mobile.dist.js",
                dest: "client/mobile.dist.js"
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
                    'client/mobile.html': ['client/html/mobile.html']
                }
            }
        },
        cssmin: {
            main: {
                src: 'client/main.css',
                dest: 'client/main.css'
            },
            mobile: {
                src: 'client/mobile.main.css',
                dest: 'client/mobile.main.css'
            }
        },
        copy: {
            html: {
                expand: true,
                cwd: 'client/html',
                src: '*.html',
                dest: 'client/'
            }
        },
        csslint : {
            options: {
                "ids": false
            },
            src: ["client/css/*.css"]
        },
        htmllint: {
            all: ["client/html/*.html"]
        },
        jslint: {
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
                src: ['client/index.html']
            },
            mobile: {
                src: ['client/mobile.html']
            }
        },
        clean: {
            dist: ["client/*.css", "client/*.js"]
        }

    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-csslint');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-jslint');
    grunt.loadNpmTasks('grunt-contrib-nodeunit');
    grunt.loadNpmTasks('grunt-html');
    grunt.loadNpmTasks('grunt-replace');
    grunt.loadNpmTasks('grunt-exec');
    grunt.loadNpmTasks('grunt-inline');
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.registerTask('default', ['concat', "replace", 'uglify', "htmlmin", "cssmin", "inline", "clean"]);
    grunt.registerTask('dev', ['concat', 'copy', 'replace', 'inline', 'clean', 'exec']);
    grunt.registerTask('test', ['jslint', 'csslint', 'htmllint', 'nodeunit', 'default']);
};