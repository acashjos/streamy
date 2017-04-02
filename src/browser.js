"use strict";

(function( factory) {
    if (typeof define === "function" && define.amd) {
        define([], factory);
    } else {
        var root;
        if (typeof window !== "undefined") {
			root = window
		} else if (typeof global !== "undefined") {
			root = global
		} else if (typeof self !== "undefined") {
			root = self
		} else if (typeof module === "object" && module.exports) {
			module.exports = factory();
		} else {
			root = this
		}
        root.streamy = factory();
    }
}( function() {
    return require("./streamy")
}));
