## ContextLoader (a.k.a, ctx-loader)

### (2015/05/24) Warning
This is experimental, and it wraps a private method in NodeJS, which can be dangerous.


## Description
Enhances Node's native module-loading mechanism so that it can find modules by alias or using a "classpath."
It uses prefixes similar to those in existing libraries, but this isn't a library.  I don't want to force
people to write their modules a certain way.  All I want to do is enhance the way ``require()`` works to solve
two problems: (1) being able to inject different dependencies based on the context (say, running production vs. running in unit tests),
without changing my modules, and (2) the "../../../../" problem.  

Of course, both problems could be solved safely and easily by using a wrapper.  However, when I first started programming with NodeJS, I found 
the idea of importing files with non-standard require() calls to be ugly, and perhaps confusing to other developers.  Thus, I preferred
this approach of augmenting require() behind the scenes. (I realize that I may be wrong on both counts.)  Furthermore, if you use Browserify,
a wrapper won't solve your problem.

Also the syntax that contextLoader allows is nice to use:  it's nice to be able to write something like
``require("classpath!services/dao/UserDAO")`` and have it load the proper module.  The path seems much more meaningful and intuitive
to me than what you might use in
a wrapper.  

Having said that, at this point, This "ContextLoader" is more of an experiment.  I'm not 100% sure that it is useful.  I may be solving
a problem that doesn't really exist.  It wouldn't be the first time.  Any feedback from the NodeJS world would be greatly appreciated.


### Compatibility with Browserify
The ContextLoader works with Browserify...sort of.  It works in the sense that you can map the prefixed paths to values
in the "browser" field  (or "aliasify" field if you use aliasify) of package.json:

```json

"browser" {
   "context!logProperties": "./src/logProperties.json",
   ...
}

```
Of course, you can do the same thing with "require()" anyway.  In either case, if you don't do such mapping, browserify will barf for the same reason
that it barfs on require wrappers:  Browserify doesn't take variable paths.


## Usage
Require ``ctx-loader`` in your files.  Then you can use prefixes in require paths to change the way require()
finds specific modules.

### The context! prefix
The ``context!`` prefix provides a simple dependency injection mechanism for NodeJS, allowing you to require aliases 
that can be configured in an external JSON file, much like the J2EE Spring framework does (did) with XML files.  For example,
say that you have the following configuration:

```json

 "context": {
   "userDao": "classpath!services/dao/mongodb/UserDAO",
   "logProperties": "classpath!logProperties.json"
 }
 
````

You would require ``context!userDao`` in your modules.  To inject a different dependency (e.g., using a mock UserDAO
for tests or replacing it entirely throughout your application) assign a different path the alias "userDao" in the "context" property.

### The classpath! prefix
Simply require the contextLoader, then require a file by prefacing its path from application root with the "classpath" prefix:

```javascript

require("classpath!services/dao/myGreatDao");

```

This will lookup "services/dao/myGreatDao" starting from the "${app_root}/", "${app_root}/src/", or "${app_root}/test/" directory, in that order.


### The test! prefix
Simply require the contextLoader, then require a file by prefacing its path from the application with the "test" prefix:

```javascript

require("test!services/dao/myGreatDao");

```

This will lookup "services/dao/myGreatDao" starting from the "${app_root}/test" directory.


## API
### enable()
Enables the contextLoader, unnecessary unless contextLoader.disable() was called earlier.

### disable()
Disables the contextLoader until it is re-enabled by the enable() method.

### getInstance(config)
Allows you to configure the contextLoader without using the "config" module or a configuration file, just sending it JSON programmatically.
Returns the contextLoader instance.


