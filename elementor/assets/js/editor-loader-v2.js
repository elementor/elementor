/*! elementor - v3.10.1 - 31-01-2023 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};
/*!****************************************************!*\
  !*** ../core/editor/assets/js/editor-loader-v2.js ***!
  \****************************************************/


var _window$__UNSTABLE__e;
window.__elementorEditorV1LoadingPromise = new Promise(function (resolve) {
  window.addEventListener('elementor/init', function () {
    resolve();
  }, {
    once: true
  });
});
window.elementor.start();
if (!((_window$__UNSTABLE__e = window.__UNSTABLE__elementorPackages) !== null && _window$__UNSTABLE__e !== void 0 && _window$__UNSTABLE__e.editor)) {
  throw new Error('The "@elementor/editor" package was not loaded.');
}
window.__UNSTABLE__elementorPackages.editor.init(document.getElementById('elementor-editor-wrapper-v2'));
/******/ })()
;
//# sourceMappingURL=editor-loader-v2.js.map