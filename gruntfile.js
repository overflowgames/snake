module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            dist: {
                src: ['node_modules/node-uuid/uuid.js', 'node_modules/socket.io-client/dist/socket.io.js', 'common/controller/controller.js', 'client/js/main.js'],
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
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-asset-cachebuster');

    grunt.registerTask('default', ['concat', 'uglify', 'asset_cachebuster']);
    grunt.registerTask('dev', ['concat', 'asset_cachebuster']);
    grunt.registerTask('test', ['default']);
};