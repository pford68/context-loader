/**
 * Unit test for contextLoader
 */

var contextLoader = require("../../index");

describe("contextLoader", function(){


    beforeEach(function(){
        contextLoader.enable();
    });

    describe("disable()", function(){
        it("should turn off the contextLoader", function(){
            contextLoader.disable();
            try {
                require('test!fixtures/users.json');
                this.fail("We should not reach this point");
            } catch(e){
                console.log("[contextLoaderSpec, disable()  ]The error was thrown successfully". e);
            }
        })
    });

    describe("getInstance()", function(){
        it("should configure the contextLoader", function(){
            contextLoader.getInstance({
                context: {
                    "users": "classpath!test/fixtures/users.json",
                    "mpatt": "../fixtures/mpatt.json"
                }
            });
            try {
                var users = require('context!users');
                var mpatt = require('context!mpatt');
                expect(users.length).toEqual(3);
                expect(users[0].last).toBe("Ford");
                expect(mpatt.occupation).toBe("Software Developer");
            } catch(e){
                this.fail("The file should have been found", e);
            }
        });
    });

    it("should not interfere with normal require() behavior", function(){
        try {
            var users = require('../fixtures/pford.json');
            expect(users.occupation).toBe("CTO");
        } catch(e){
            this.fail("The file should have been found", e);
        }
    })
});
