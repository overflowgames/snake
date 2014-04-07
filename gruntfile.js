module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            dist: {
                src: ['node_modules/node-uuid/uuid.js', 'node_modules/jquery/dist/jquery.js', 'node_modules/socket.io-client/dist/socket.io.js', 'common/controller/controller.js', 'client/js/main.js'],
                dest: 'client/dist.js'
            }
        },
        uglify : {
            main: {
                src: "client/dist.js",
                dest: "client/dist.min.js",
            },
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.registerTask('default', ['concat', 'uglify']);
    grunt.registerTask('test', ['default']);

};