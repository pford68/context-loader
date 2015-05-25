### (2015/05/24) Warning
This is experimental, and it operates directly on a private method in NodeJS, which can be dangerous.


## Description
A simple dependency injection mechanism for NodeJS.  It allows you to require aliases that can be configured in an external JSON file, much
like the J2EE Spring framework does (did) with XML files. This solves two problems: being able to inject different dependencies 
based on the context (say, running on a server vs. running in unit tests) and the "../../../../" problem.  

Of course, both problems could be solved safely and easily by using a wrapper.  However, when I first started programming with NodeJS, I found 
the idea of importing files with non-standard require() calls to be ugly, and perhaps confusing to other developers.  Thus, I preferred
this approach of augmenting require() behind the scenes.

Furthermore,  what if you want to re-use some code in a client that uses Browserify?  Why wouldn't you?  Why re-write the code if it is 
appropriate for the client?  Browserfiy will barf on any require() calls that take variables, and ultimately
any wrapper around require() will use variables.  

Also the syntax that contextLoader allows is just plain nice:  it's nice to be able to write something like
``require("classpath!services/dao/UserDAO")``.  The path seems much more meaningful to be than what you might use in
a wrapper  

Having said that, at this point, ContextLoader is more of an experiment.  I'm not 100% sure that it is useful.  I may be solving
a problem that doesn't really exist.  It wouldn't be the first time.  Any feedback from the NodeJS world would be greatly appreciated.


## Usage

### The classpath! prefix
Simply require the contextLoader, then require an aliased file by prefacing the alias with the "classpath" prefix:

```javascript

require("classpath!services/dao/myGreatDao");

```

### The context! prefix
If you use the config NPM module, then you can add a "context" property to a JSON configuration file:

```json

 "context": {
   "userDao": "classpath!services/dao/mongodb/UserDAO",
   "logProperties": "classpath!logProperties.json"
 }
 
````

In this case, ``require('context!userDao');`` will fetch "services/dao/mongodb/UserDAO.js" from wherever it
is located in the "classpath" (process.cwd(), process.cwd() + "/src/", or process.cwd() + "/test/" by default).


## API
### enable()
Enables the contextLoader, unnecessary unless contextLoader.disable() was called earlier.

### disable()
Disables the contextLoader until it is re-enabled by the enable() method.

### getInstance(config)
Allows you to configure the contextLoader without using the "config" module or a configuration file, just sending it JSON programmatically.
Returns the contextLoader instance.

