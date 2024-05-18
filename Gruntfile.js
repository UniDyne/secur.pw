module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        meta: {
            site_name: 'secur.pw',
            build_date: '<%= grunt.template.today("yyyymmddHHMM") %>',
            version_string: '<=% pkg.version %>-<%= meta.build_date %>'
        },
        env: {},

        trilliantBuild: {
            options: grunt.file.readJSON('conf/templates.json')
        },

        trilliantServe: {
            options: grunt.file.readJSON("conf/test_server.json")
        },

        concat: {
            options: {
                sourceMap: true,
                process: true
            },
            site: {
                src: ['src/site/app.js'],
                dest: 'www/js/app.js'
            },

            utils: {
                src: ['src/site/utils.js'],
                dest: 'www/js/utils.js'
            }
        },

        copy: {
            js: {
                expand: true,
                cwd: 'src/pages/',
                src: ['*'],
                dest: 'www/js/'
            },

            assets: {
                expand: true,
                cwd: 'assets/',
                src: ['**'],
                dest: 'www/'
            }
        }
    });


    grunt.config.merge({
        buildTemplates: {
            options: {  }
        }
    });
    
    
    /*================================
        Register Plugins
    ================================*/

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('trilliant-static');

    //grunt.loadTasks('./src/grunt');


    /*================================
        Target & Target Settings
    ================================*/
    
    let target = grunt.option('target') || 'dev';
    if(target != 'dev') grunt.config.merge(grunt.file.readJSON(`conf/${target}.json`));


    /*================================
        Basic Tasks
    ================================*/

    const Tasks = {
        default: ['jsbuild', 'templates', 'copy:assets'],
        templates: ['trilliantBuild'],
        jsbuild: ['concat:site', 'concat:utils', 'copy:js'],
        deploy: (target != 'dev') ? ['default','stage'] : ['default'],
        test: ['default','trilliantServe']
    };

    Object.keys(Tasks).map( k => grunt.registerTask(k, Tasks[k]) );

    grunt.registerTask("stage", "Deploy to GitHub.", function() {
        let done = this.async();

        //grunt.file.copy("www", grunt.config.get('env.deploy'));
        let ghp = require('gh-pages');
        ghp.publish('www', {
            branch: 'gh-pages'
        }, (err) => {
            if(err) console.log(err);
            else done();
        });
    });
}

