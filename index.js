/**
 * <p>Loads registered modules in a path relative to the application root.  It is not intended as a
 * solution to the  ../../../../ problem.  For that, I would use a wrapper around require.
 * Instead, it is a way to alias modules:  allowing us to reference the alias in other modules,
 * while assigning the alias a value in only one place.  If the module being aliased needs to be
 * replaced by another module, assign the replacement module's path to the alias.</p>
 *
 * <p>Supported prefixes in config files:
 * <ul>
 *     <li>context</li>
 *     <li>classpath</li>
 *     <li>test</li>
 * </ul>
 * Follow each with an exclamation point, then the path relative to the document root, src, or test depending
 * on the directory in which the file resides.  For files running from the server, the classpath will be
 * the deployment directory.  During tests, the classpath will be either the "src" or the "test" directory.
 * </p>
 *
 * <p>
 * Usage:  Simply require the contextLoader, then require an aliased file by prefacing the alias
 * with the "context" prefix:
 *
 * require("context!myGreatDao")
 *
 * </p>
 */
var fs = require("fs");
var path = require("path");
var m = require("module");
var config = require("config");
var extend = require('object-util').extend;
var load = m._load;
var enabled = true;
var cwd = process.cwd();
var classpath = [
    cwd + "/",
    cwd + "/src/",
    cwd + "/test/"
];



/*
 Originally these prefixes were processed only for paths in config files, after a path with a context! prefix was requested.
 I have decided since to support the prefixes in require() calls.   While using classpath! in require() calls
 has proven useful (again addressing the ../../../ problem), it does circumvent the entire NodeJS module loading system,
 preventing it from working the way it is supposed to work (i.e., with relative paths).  For solving the
 ../../../ problem, I still prefer to use a wrapper around require() or to put the required module in a node_modules
 directory to make it a top-level module.  On the client, using Browserify, however, that is not an option.
 */
function getPrefixes() {
    var prefixes = {
        /*
         Looks up paths configured in config files:

         // default.json
         "context": {
         "userDao": "classpath!services/dao/mongodb/UserDAO",
         "logProperties": "classpath!logProperties.json"
         }

         require("context!userDao") => require("classpath!services/dao/mongodb/UserDAO"), which leads to another lookup.
         */
        context: {
            pattern: /^context!/,
            parse: function (p) {
                p = p.replace(prefixes.context.pattern, "");
                var _path = getConfig().context[p];
                for (var i in prefixes) {
                    if (i !== "context" && prefixes.hasOwnProperty(i)) {
                        _path = prefixes[i].parse(_path);
                    }
                }
                //console.log("_path", _path, p, cwd);
                return _path;
            }
        },
        classpath: {
            pattern: /^classpath!/,
            parse: function (p) {
                if (!this.pattern.test(p)) return p;
                var _p = p.replace(this.pattern, "");

                var srcPath;
                //console.log("[ContextLoader: prefixes/classpath/parse] classpath - " + classpath);
                for (var i = 0, len = classpath.length; i < len; i++) {
                    srcPath = classpath[i] + _p + (!path.extname(_p) ? ".js" : "");
                    if (fs.existsSync(srcPath)) {
                        return srcPath;
                    }
                }
                throw new Error("File " + _p + " not found in " + cwd);
            }
        },
        test: {
            pattern: /^test!/,
            parse: function (p) {
                if (!this.pattern.test(p)) return p;
                var _p = p.replace(this.pattern, "");
                var testPath = path.normalize(process.cwd() + "/test/" + _p);
                if (fs.existsSync(testPath)) {
                    return testPath;
                } else {
                    return p;
                }
            }
        }
    };

    return prefixes;
}


//======================================================== Functions

function isEnabled(){
    return enabled;
}


function augmentClasspath(dirs){
    if (dirs){
        classpath = classpath.concat(dirs);
    }
}

function getConfig(){
    return config || {};
}

// Adding "before advice" to the original Module._load
m._load = function(request, parent, isMain){
    var _requested = request;
    if (isEnabled()) {
        var prefixes = getPrefixes();
        if (typeof request !== 'string') {
            /*
             Don't require slf4js.  This file should not require other aurora files.
             Doing so would invite circular dependencies.   #PF
             */
            throw new Error("[ContextLoader: module._load] the request was not a string:  " + request);
        }

        for (var i in prefixes){
            /*
             This block ensures:
             (1) That only paths with registered prefixes are processed this way.
             (2) That the prefixed path is cached by the NodeJS require system.
             (3) Once the true module is obtained it is returned from cache on subsequent require calls.
             (4) The parsing of the request and the loading of the true module happen only once.  Thereafter,
             the module is returned from cache.
             */
            if (prefixes.hasOwnProperty(i) && prefixes[i].pattern.test(request)) {
                if (!require.cache[_requested]) {
                    request = prefixes[i].parse(request);
                    return (require.cache[_requested] = load(request, parent, isMain));
                } else {
                    return require.cache[_requested];
                }
            }
        }
    }
    return load(request, parent, isMain);
};

augmentClasspath(config.classpath || []);


//========================================================= Public
module.exports = {
    /**
     * Disables the contextLoader. The contextLoader is enabled by default.
     */
    disable: function(){
        enabled = false;
        return this;
    },
    /**
     * Enables the contextLoader. Does not have to be called unless disable() was called previously.
     * The contextLoader is enabled by default.
     */
    enable: function(){
        enabled = true;
        return this;
    },
    /**
     * For configuring the contextLoader programmatically.  Only necessary if you are not using
     * the config NPM module (e.g., you are using nconf) or want to feed a configuration when the
     * context is loaded).
     *
     * @param json
     * @returns {exports}
     */
    getInstance: function(json){
        config = extend(config || {}, json);
        augmentClasspath(json.classpath || []);
        return this;
    }
};



