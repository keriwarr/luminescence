'use strict';

var editor1, editor2;

var userCode = {
    player1: [
        'return function(unit, state, valid_actions) {\n' +
        '    var attack_target = unit.acquire_target();\n' +
        '    var unit_to_attack = state.get_unit_in_tile(attack_target.x, attack_target.y);\n' +
        '    if (unit_to_attack !== null) { return "ranged_attack"; }\n' +
        '    return valid_actions[Math.floor(Math.random() * valid_actions.length)];\n' +
        '}',
        'console.log("player1 - unit 1");',
        'console.log("player1 - unit 2");',
        'console.log("player1 - unit 3");',
    ],
    player2: [
        'return function(unit, state, valid_actions) {\n' +
        '    var attack_target = unit.acquire_target();\n' +
        '    var unit_to_attack = state.get_unit_in_tile(attack_target.x, attack_target.y);\n' +
        '    if (unit_to_attack !== null) { return "ranged_attack"; }\n' +
        '    return valid_actions[Math.floor(Math.random() * valid_actions.length)];\n' +
        '}',
        'console.log("player2 - unit 1");',
        'console.log("player2 - unit 2");',
        'console.log("player2 - unit 3");',
    ],
};

(function() {

    $('#instructions .container').load('/luminescence/markup/instructions.html');
    $('#about .container').load('/luminescence/markup/about.html');

    ace.require("ace/ext/language_tools");

    editor1 = ace.edit("editor1");
    editor1.getSession().setMode("ace/mode/javascript");
    editor1.setTheme("ace/theme/monokai");
    editor1.setOptions({
        enableBasicAutocompletion: true,
        enableSnippets: true
    });
    editor1.commands.on("afterExec", function(e){ 
        // activate autocomplete when paren or .(dot) is typed
         if (e.command.name == "insertstring"&&/^[\\.\(.]$/.test(e.args)) { 
            editor1.execCommand("startAutocomplete") 
        } 
    });
    editor1.setShowPrintMargin(false);
    editor1.setDisplayIndentGuides(false);
    editor1.setHighlightActiveLine(false);
    editor1.$blockScrolling = Infinity;

    editor1.currentFile = 0;
    editor1.setValue(userCode.player1[editor1.currentFile]);

    editor1.getSession().on('change', function(e) {
        if (e.data.action === "insertText" && e.data.text.length === 1) {
            userCode.player1[editor1.currentFile] = editor1.getValue();
        }
    }); 


    editor2 = ace.edit("editor2");
    editor2.getSession().setMode("ace/mode/javascript");
    editor2.setTheme("ace/theme/monokai");
    editor2.setOptions({
        enableBasicAutocompletion: true,
        enableSnippets: true
    });
    editor2.commands.on("afterExec", function(e){ 
        // activate autocomplete when paren or .(dot) is typed
         if (e.command.name == "insertstring"&&/^[\\.\(.]$/.test(e.args)) { 
            editor2.execCommand("startAutocomplete") 
        } 
    });
    editor2.setShowPrintMargin(false);
    editor2.setDisplayIndentGuides(false);
    editor2.setHighlightActiveLine(false);
    editor2.$blockScrolling = Infinity;

    editor2.currentFile = 0;
    editor2.setValue(userCode.player2[editor2.currentFile]);

    editor2.getSession().on('change', function(e) {
        if (e.data.action === "insertText" && e.data.text.length === 1) {
            userCode.player2[editor2.currentFile] = editor2.getValue();
        }
    }); 

    var viewportHeight = $(window).height() - 50;
    var viewportWidth = $(window).width();

    $('#game-view').outerHeight(viewportHeight);
    $('#game-view').outerWidth(viewportHeight+5);
    $('#game-code').outerHeight(viewportHeight);
    $('#game-code').outerWidth(viewportWidth - viewportHeight);

    $(window).bind("resize", function(event){

        //if (which) return;

        var viewportHeight = $(window).height() - 50;
        var viewportWidth = $(window).width();
        var gameViewWidth = $('#game-view').outerWidth();
        var gameCodeWidth = $('#game-code').outerWidth();

        var newGameViewWidth = Math.round(viewportWidth*(gameViewWidth/(gameViewWidth+gameCodeWidth)));

        var canvasDimension = Math.min(newGameViewWidth,viewportHeight);

        $('#game-view').outerHeight(viewportHeight);
        $('#game-view').outerWidth(newGameViewWidth);
        $('#game-code').outerHeight(viewportHeight);
        $('#game-code').outerWidth(Math.round(viewportWidth*(gameCodeWidth/(gameViewWidth+gameCodeWidth))));

        $('.canvas-wrapper').outerWidth(canvasDimension);
        $('.canvas-wrapper').outerWidth(canvasDimension);

        editor1.resize();
        editor2.resize();

        $(".resize").resizable("option","maxWidth",viewportHeight);
        $(".resize-vertical").resizable("option","maxWidth",viewportHeight - 80);

    });
      
    $('.resize').resizable({
        handles: 'e',  
        minWidth: 100,
        maxWidth: viewportHeight,
        resize:function(event,ui){
            var x=ui.element.outerWidth();
            var par=$(this).parent().outerWidth();
            var factor = par-x;
          
            $('#game-code').outerWidth(factor-1);
          
            editor1.resize();
            editor2.resize();
        }
    });

    $('.resize-vertical').resizable({
        handles: 's',
        minHeight: 80,
        maxHeight: viewportHeight - 80,
        resize:function(event,ui){
            var x=ui.element.outerHeight();
            var par=$(this).parent().outerHeight();
            var factor = par-x;
          
            $('#code-player-2').outerHeight(factor-1);
          
            editor1.resize();
            editor2.resize();
        }
    });

    $('.file-switch').click(function(e) {

        var IDToCodeMap = {
            "p1-all": userCode.player1[0],
            "p1-unit1": userCode.player1[1],
            "p1-unit2": userCode.player1[2],
            "p1-unit3": userCode.player1[3],
            "p2-all": userCode.player2[0],
            "p2-unit1": userCode.player2[1],
            "p2-unit2": userCode.player2[2],
            "p2-unit3": userCode.player2[3]
        };

        e.preventDefault();

        var currentEditor = (e.target.id[1] === "1") ? editor1 : editor2;
        var currentPlayer = (e.target.id[1] === "1") ? "player1" : "player2";
        if (!(IDToCodeMap[e.target.id] === userCode[currentPlayer][currentEditor.currentFile])) {
            currentEditor.currentFile = e.target.id.slice(-3) === "all" ? 0 : parseInt(e.target.id.slice(-1));
            currentEditor.setValue(IDToCodeMap[e.target.id]);

            $('#' + e.target.id).parent().siblings().filter(".active").removeClass("active");
            $('#' + e.target.id).parent().addClass("active");
        }


    });
    
    $("#run-button").click(function() {
        reset(editor1.getValue(), editor2.getValue());
        RUNNING = true;
    });

}());

