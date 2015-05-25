describe("object-utils", function(){
    var utils = require("../../index"),
        extend = utils.extend,
        augment = utils.augment,
        override = utils.override,
        clone = utils.clone,
        isObject = utils.isObject;

    var $ = {};

    if (typeof window === 'undefined'){
        var window = {
            frames: [
                {
                    map: {}
                }
            ]
        }
    }

    afterEach(function(){
        delete $.id;
        delete $.name;
    });

    describe("extend()", function(){
        afterEach(function(){
            delete $.author;
        });

        it("should mix the second argument into the first argument", function(){
            var obj = { id: 3 };
            var obj2 = {author: "Philip Ford"};
            extend(obj, obj2);
            expect(obj.author).toBe("Philip Ford");
            expect(obj2.id).toBeUndefined();
        });

        it("should mix all arguments, after the first argument, into the first argument", function(){
            var obj = { id: 3 };
            var obj2 = {author: "Philip Ford"};
            var obj3 = {copyright: "July 2012"};
            extend(obj, obj2, obj3);
            expect(obj.author).toBe("Philip Ford");
            expect(obj.copyright).toBe("July 2012");
            expect(obj2.copyright).toBeUndefined();
        });

        it("if the arguments length is greater than 1, should return arguments[0]", function(){
            var that = {};
            expect(extend(that, {id: 3, name: "John"})).toBe(that);
        });
    });



    describe("augment()", function(){
        var theObject,
            mixin = {
                id: 'mixin',
                bgColor: 'red',
                rank: '99%',
                active: true,
                getAge: function(){
                    return 23;
                },
                execute: function(){
                    return "Hello!";
                },
                getBgColor: function(){
                    return this.bgColor;
                }
            };

        beforeEach(function(){
            theObject = {
                id: 'test',
                active: false,
                bgColor: null,
                getAge: function(){
                    return 21;
                }
            };
        });

        it("should add new properties to an object", function(){
            augment(theObject, mixin);
            expect(theObject.bgColor).not.toBeNull();
            expect(theObject.bgColor).toEqual('red');
            expect(theObject.rank).toEqual('99%');
            expect(theObject.getBgColor()).toEqual('red');
            expect(theObject.execute()).toEqual('Hello!');
        });

        it("should not override existing properties, even if they are null or false", function(){
            augment(theObject, mixin);
            expect(theObject.id).toEqual('test');
            expect(theObject.getAge()).toEqual(21);
            expect(theObject.active).toBeFalsy();
        });

        it("should not remove any existing properties", function(){
            augment(theObject, mixin);
            expect(theObject.id).not.toBeNull();
            expect(theObject.getAge).not.toBeNull();
            expect(theObject.bgColor).not.toBeNull();
            expect(theObject.active).not.toBeNull();

            expect(theObject.id).toBeDefined();
            expect(theObject.getAge).toBeDefined();
            expect(theObject.bgColor).toBeDefined();
            expect(theObject.active).toBeDefined();
        });

        it("if the arguments length is greater than 1, should return arguments[0]", function(){
            var that = {};
            expect(augment(that, {id: 3, name: "John"})).toBe(that);
        });
    });



    describe("override()", function(){
        var theObject,
            mixin = {
                id: 'mixin',
                bgColor: 'red',
                rank: '99%',
                active: true,
                getAge: function(){
                    return 23;
                },
                execute: function(){
                    return "Hello!";
                },
                getBgColor: function(){
                    return this.bgColor;
                }
            };

        beforeEach(function(){
            theObject = {
                id: 'test',
                active: false,
                bgColor: null,
                getAge: function(){
                    return 21;
                }
            };
        });

        it("should not add new properties an object", function(){
            override(theObject, mixin);
            expect(theObject.rank).not.toBeDefined();
            expect(theObject.getBgColor).not.toBeDefined();
            expect(theObject.execute).not.toBeDefined();
        });

        it("should override any corresponding existing properties, even if they are null or false", function(){
            override(theObject, mixin);
            expect(theObject.bgColor).toEqual('red');
            expect(theObject.id).toEqual('mixin');
            expect(theObject.getAge()).toEqual(23);
            expect(theObject.active).toBeTruthy();
        });

        it("should not remove any existing properties", function(){
            override(theObject, mixin);
            expect(theObject.id).not.toBeNull();
            expect(theObject.getAge).not.toBeNull();
            expect(theObject.bgColor).not.toBeNull();
            expect(theObject.active).not.toBeNull();

            expect(theObject.id).toBeDefined();
            expect(theObject.getAge).toBeDefined();
            expect(theObject.bgColor).toBeDefined();
            expect(theObject.active).toBeDefined();
        });

        it("if the arguments length is greater than 1, should return the first argument", function(){
            var that = {};
            expect(override(that, {id: 3, name: "John"})).toBe(that);
        });
    });



    describe("isObject()", function(){
        function Test(){

        } /*  This will cause isObject(new Test(), true) to return true, when we'd probably expect it to be false.
         Test.prototype = {
         add: function(){ return 2+2; }
         };  */
        //Test.prototype.add = function(){ return 2 + 2; };  // This works fine with isObject(new Test(), true).
        extend(Test.prototype, {
            add: function(){ return 2+2; }
        });


        it("should correctly identify an object created in the current window", function(){
            expect(isObject({})).toBeTruthy();

            var a = new Object();
            expect(isObject(a)).toBeTruthy();
            expect(isObject({ id: 34, test: function(){} }, true)).toBeTruthy();
            expect(isObject([])).toBeTruthy();
            expect(isObject(new Array(100))).toBeTruthy();
        });

        it("should correctly identify an object created in another window/frame", function(){
            var resume = false;

            runs(function(){
                setTimeout(function(){
                    resume = true;
                }, 1500)
            });

            waitsFor(function(){
                return resume;
            }, "", 5000);

            runs(function(){
                expect(isObject(window.frames[0].map, true)).toBeTruthy();
            });
        });

        it("should correctly identify that literals are not objects", function(){
            expect(isObject(true)).toBeFalsy();
            expect(isObject(3)).toBeFalsy();
        });

        it("should correctly identify that nulls are not objects", function(){
            expect(isObject(null)).toBeFalsy();
            expect(isObject(undefined)).toBeFalsy();
            expect(isObject(null, true)).toBeFalsy();
            expect(isObject(undefined, true)).toBeFalsy();
        });

        it("should correctly identify that instances of subclasses are objects, if pure is false", function(){
            expect(isObject(new Date())).toBeTruthy();
            expect(isObject(new String("fjdgkfdg"))).toBeTruthy();    // A String literal will be false
            expect(isObject(new Number(3))).toBeTruthy();
            expect(isObject(new function(){})).toBeTruthy();
            expect(isObject(new Test())).toBeTruthy();
        });

        it("should correctly identify that instances of subclasses are not objects, if pure is true", function(){
            expect(isObject(new Date(), true)).toBeFalsy();
            expect(isObject("fjdgkfdg", true)).toBeFalsy();
            expect(isObject(new String("fjdgkfdg"), true)).toBeFalsy();
            expect(isObject(new Number(3), true)).toBeFalsy();
            expect(isObject(new function(){}, true)).toBeFalsy();
            expect(isObject(new Test(), true)).toBeFalsy();
        });

        it("should correctly identify that instances of Object instance when pure is true", function(){
            expect(isObject({}, true)).toBeTruthy();
            expect(isObject({ id: 34, test: function(){} }, true)).toBeTruthy();
            expect(isObject(new Object(), true)).toBeTruthy();
        });
    });


    describe("clone()", function(){
        var blueprint = {
            id: "0012-000-000-003844",
            initialize: function(){},
            items: [3,4],
            map: {
                teams: [ "Rangers", "Cowboys"],
                cities: ["Austin", "Dallas", "Faifax"]
            }
        };
        it("should make a separate copy of an object", function(){
            var copy = clone(blueprint);
            expect(copy.id).toEqual("0012-000-000-003844");
        });
    });

});
