module.exports = config:
  files:
    javascripts: joinTo:
      'lib.js': /^vendor[\\\/].*\.js/
      'app.js': /^app[\\\/].*\.js/
    stylesheets: joinTo: 'app.css'
    templates: joinTo: 'md.html'
  plugins:
    off: ['jshint-brunch']
    cleancss:
      keepSpecialComments: 0
      removeEmpty: true
  onCompile: () ->
    shelljs = require 'shelljs'
    shelljs.echo 'run script to move generated files here?'