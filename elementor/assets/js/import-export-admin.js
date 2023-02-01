/*! elementor - v3.10.1 - 31-01-2023 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "@wordpress/i18n":
/*!**************************!*\
  !*** external "wp.i18n" ***!
  \**************************/
/***/ ((module) => {

module.exports = wp.i18n;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!*******************************************************!*\
  !*** ../app/modules/import-export/assets/js/admin.js ***!
  \*******************************************************/
/* provided dependency */ var __ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n")["__"];


var revertButton = document.getElementById('elementor-import-export__revert_kit');
if (revertButton) {
  revertButton.addEventListener('click', function (event) {
    event.preventDefault();
    elementorCommon.dialogsManager.createWidget('confirm', {
      headerMessage: __('Sure you want to make these changes?', 'elementor'),
      message: __('Removing assets or changing your site settings can drastically change the look of your website.', 'elementor'),
      strings: {
        confirm: __('Yes', 'elementor'),
        cancel: __('No, go back', 'elementor')
      },
      onConfirm: function onConfirm() {
        location.href = revertButton.href;
      }
    }).show();
  });
}
})();

/******/ })()
;
//# sourceMappingURL=import-export-admin.js.map