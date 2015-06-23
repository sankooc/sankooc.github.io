'use strict';

module.exports = function (grunt) {
  var path = require('path');
  
  var dep = [
    'src/vendor/js/*.js'
  ];

  var dest = 'dest';
  var csses = [
    'src/css/*.css'
  ];
  var vendors = [];
  vendors.push('src/vendor/js/modernizr-2.0.js');
  var _files = [
    {
      expand: true,
      cwd: 'bower_components/',
      src: '**', 
      dest: 'dest/vendor/'
    },{
      expand: true,
      cwd: 'src/css/',
      src: '**', 
      dest: 'dest/css/'
    }
  ];
  
  var _vendor = {
    src:[],
    dest: 'dependence.js'
  }
  for(var i=0;i<vendors.length;i++){
    var v = vendors[i];
    // var fname = path.basename(v);
    _vendor.src.push(v);
    // _files.push({
//       src:
//     });
  }
  // _files.push(_vendor);
  grunt.initConfig({
      // Metadata.
      pkg: grunt.file.readJSON('package.json')

      ,copy: {
        main: {
          files: _files
        }
        ,img:{
          expand: true,
          cwd: 'src/img/',
          src: '**', 
          dest: 'dest/img/'
        }
      }

      ,less: {
        compile: {
          options: {
            paths: ['src/css/include']
          },
          files: {
            'dest/css/main.css': 'src/css/*.less'
          }
        }
      }

      ,concat_sourcemap: {
        options: {
          banner: '<%= banner %>',
          sourcesContent: true,
          stripBanners: true
        }
        , script: {
          files: {
            'dest/js/vendor.js': dep
          }
        }
      }
      
      ,coffee: {
        compile: {
          options: {
            sourceMap: true
          },
          files: {
            'dest/js/app.js': ['src/js/*.coffee', 'src/js/*/*.coffee']
          }
        }
      }

      , html2js: {
        main: {
          src: ['src/view/*.html'],
          dest: 'dest/html2js.js'
        }
      }

      ,'http-server':{
        dev: {
          // the server root directory
          root: '.',
          port: 8001,
          // port: function() { return 8282; }
          host: "127.0.0.1",
          cache: 1000,
          showDir : true,
          autoIndex: true,
          // server default file extension
          ext: "html",
          // run in parallel with other tasks
          runInBackground: true
        }

      }

      , watch: {
        html : {
          files:'src/main.html',
          task : ['copy:main']
        },
        html2js : {
          files:'src/view/*.html',
          task : ['html2js:main']
        },
        jsfile: {
          files: 'src/js/*.js',
          tasks: ['concat_sourcemap:script']
        }
        , jsfile2: {
          files: 'src/js/*/*.js',
          tasks: ['concat_sourcemap:script']
        }
        ,coffee:{
          files: ['src/js/*.coffee', 'src/js/*/*.coffee'],
          tasks: ['coffee:compile']
        }
        , css: {
          files: 'src/css/*.less',
          tasks: ['less:compile']
        }
      }

    }
  )
  ;

// These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-concat-sourcemap');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-html2js');
  grunt.loadNpmTasks('grunt-http-server');
  grunt.loadNpmTasks('grunt-contrib-watch');

// Default task.
  // grunt.registerTask('build', ['copy','less', 'concat_sourcemap','coffee', 'html2js','http-server','watch']);
  grunt.registerTask('build', ['copy','less', 'concat_sourcemap','coffee','http-server','watch']);
  grunt.registerTask('default', ['build']);
}
;
