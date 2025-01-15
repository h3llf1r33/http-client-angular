"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("jest-preset-angular/setup-jest");
require("@angular/compiler");
Object.defineProperty(window, 'CSS', { value: null });
Object.defineProperty(document, 'doctype', {
    value: '<!DOCTYPE html>'
});
Object.defineProperty(document.body.style, 'transform', {
    value: () => {
        return {
            enumerable: true,
            configurable: true
        };
    }
});
