vendorRegex = /^vendor[\\\/].*\.js/
sourceRegex = /^app[\\\/].*\.js/

module.exports = config:
  files:
    javascripts: joinTo:
      'lib.js': vendorRegex
      'app.js': sourceRegex
    stylesheets: joinTo: 'app.css'
    templates: joinTo: 'md.html'
  plugins:
    off: ['jshint-brunch']
    cleancss:
      keepSpecialComments: 0
      removeEmpty: true
    jshint:
      pattern: sourceRegex
      options:
        curly: true
        strict: true
        #varstmt: true
        nonbsp: true
      globals:
  onCompile: () ->
    shelljs = require 'shelljs'
    shelljs.echo 'run script to move generated files here?'