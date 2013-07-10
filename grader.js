#!/usr/bin/env node

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URL_DEFAULT = "index.html";

var assertFileExists = function(infile){
    //console.log(infile);
    var instr = infile.toString();
    if (!fs.existsSync(instr)){
	console.log("%s does not exist. Exiting.", instr);
	process.exit(1);
    }
    return instr;
};

var assertValidUrl = function(url){
    //return "http://google.com";

    rest.get(url).on('complete', function(result){
	if (result instanceof Error){
	    console.log("%s is not a valid URL", url);
	    process.exit(1);
	}else{
	    toTmp(result);
	}
    });
    return ".tmp";
};

var toTmp = function(result){
    fs.writeFile('.tmp', result, function(err){
	if (err) {
	    console.log("Problem writting tmp file");
	}
    });
};

var cheerioHtmlFile = function(htmlfile){
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile){
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile){
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for (var ii in checks){
	var present = $(checks[ii]).length > 0;
	out[checks[ii]] = present;
    }
    return out;
};

var clone = function(fn){
    return fn.bind({});
};

if(require.main == module){
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
        .option('--url <url_address>', 'Page URL', clone(assertValidUrl), URL_DEFAULT) 
        .parse(process.argv);
   
    if (program.url!="")
	var checkFile = program.url;
    else
	var checkFile = program.file;
    //console.log(checkFile);
    var checkJson = checkHtmlFile(checkFile, program.checks);
    var outjson = JSON.stringify(checkJson, null, 4);
    console.log(outjson); 
} else {
    exports.checkHtmlFile = checkHtmlFile;
}

