A very small set of utilities for use with JavaScript objects. 
Includes yet another version of extend() because sometimes an extend() is all you want. 

## API Documentation
### extend(that, varargs)
Just JQuery's/underscore's extend().  Mixes the properties of all of the arguments after 
the first parameter into the first parameters.  Takes an arbitrary number of objects as parameters.

### augment(that, props)
Copies properties from the second object to the first object (that) <strong>iff</strong> the property
does not exist in the first or is null.

### override(that, props)
Copies properties from the second object to the first iff the property <strong>exists</strong>
in the first.

### clone(that)
Returns a deep copy of the specified object

### isObject(that, pure)
Returns true/false for whether the specified value is an Object, and works for Objects created in other
frames as well.  If the "pure" flag is "true" then isObject() should return true only if the value belongs
exclusively to the Object type, not to any sub-type.
