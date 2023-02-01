/*! elementor - v3.10.1 - 31-01-2023 */
(self["webpackChunkelementor"] = self["webpackChunkelementor"] || []).push([["modules_nested-elements_assets_js_editor_module_js"],{

/***/ "../modules/nested-elements/assets/js/editor/component.js":
/*!****************************************************************!*\
  !*** ../modules/nested-elements/assets/js/editor/component.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../node_modules/@babel/runtime/helpers/interopRequireDefault.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _classCallCheck2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "../node_modules/@babel/runtime/helpers/classCallCheck.js"));
var _createClass2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/createClass */ "../node_modules/@babel/runtime/helpers/createClass.js"));
var _get2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/get */ "../node_modules/@babel/runtime/helpers/get.js"));
var _inherits2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/inherits */ "../node_modules/@babel/runtime/helpers/inherits.js"));
var _possibleConstructorReturn2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/possibleConstructorReturn */ "../node_modules/@babel/runtime/helpers/possibleConstructorReturn.js"));
var _getPrototypeOf2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/getPrototypeOf */ "../node_modules/@babel/runtime/helpers/getPrototypeOf.js"));
var _component = _interopRequireDefault(__webpack_require__(/*! ./nested-repeater/component */ "../modules/nested-elements/assets/js/editor/nested-repeater/component.js"));
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2.default)(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2.default)(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2.default)(this, result); }; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
var Component = /*#__PURE__*/function (_$e$modules$Component) {
  (0, _inherits2.default)(Component, _$e$modules$Component);
  var _super = _createSuper(Component);
  function Component() {
    (0, _classCallCheck2.default)(this, Component);
    return _super.apply(this, arguments);
  }
  (0, _createClass2.default)(Component, [{
    key: "getNamespace",
    value: function getNamespace() {
      return 'nested-elements';
    }
  }, {
    key: "registerAPI",
    value: function registerAPI() {
      $e.components.register(new _component.default());
      (0, _get2.default)((0, _getPrototypeOf2.default)(Component.prototype), "registerAPI", this).call(this);
    }
  }]);
  return Component;
}($e.modules.ComponentBase);
exports["default"] = Component;

/***/ }),

/***/ "../modules/nested-elements/assets/js/editor/module.js":
/*!*************************************************************!*\
  !*** ../modules/nested-elements/assets/js/editor/module.js ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../node_modules/@babel/runtime/helpers/interopRequireDefault.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _createClass2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/createClass */ "../node_modules/@babel/runtime/helpers/createClass.js"));
var _classCallCheck2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "../node_modules/@babel/runtime/helpers/classCallCheck.js"));
var _component = _interopRequireDefault(__webpack_require__(/*! ./component */ "../modules/nested-elements/assets/js/editor/component.js"));
var NestedElementsModule = /*#__PURE__*/(0, _createClass2.default)(function NestedElementsModule() {
  (0, _classCallCheck2.default)(this, NestedElementsModule);
  this.component = $e.components.register(new _component.default());
});
exports["default"] = NestedElementsModule;

/***/ }),

/***/ "../modules/nested-elements/assets/js/editor/nested-repeater/component.js":
/*!********************************************************************************!*\
  !*** ../modules/nested-elements/assets/js/editor/nested-repeater/component.js ***!
  \********************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../node_modules/@babel/runtime/helpers/interopRequireDefault.js");
var _typeof = __webpack_require__(/*! @babel/runtime/helpers/typeof */ "../node_modules/@babel/runtime/helpers/typeof.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _classCallCheck2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "../node_modules/@babel/runtime/helpers/classCallCheck.js"));
var _createClass2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/createClass */ "../node_modules/@babel/runtime/helpers/createClass.js"));
var _assertThisInitialized2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/assertThisInitialized */ "../node_modules/@babel/runtime/helpers/assertThisInitialized.js"));
var _get2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/get */ "../node_modules/@babel/runtime/helpers/get.js"));
var _inherits2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/inherits */ "../node_modules/@babel/runtime/helpers/inherits.js"));
var _possibleConstructorReturn2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/possibleConstructorReturn */ "../node_modules/@babel/runtime/helpers/possibleConstructorReturn.js"));
var _getPrototypeOf2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/getPrototypeOf */ "../node_modules/@babel/runtime/helpers/getPrototypeOf.js"));
var _defineProperty2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "../node_modules/@babel/runtime/helpers/defineProperty.js"));
var _nestedModelBase = _interopRequireDefault(__webpack_require__(/*! ./models/nested-model-base */ "../modules/nested-elements/assets/js/editor/nested-repeater/models/nested-model-base.js"));
var _nestedViewBase = _interopRequireDefault(__webpack_require__(/*! ./views/nested-view-base */ "../modules/nested-elements/assets/js/editor/nested-repeater/views/nested-view-base.js"));
var _repeater = _interopRequireDefault(__webpack_require__(/*! ./controls/repeater */ "../modules/nested-elements/assets/js/editor/nested-repeater/controls/repeater.js"));
var hooks = _interopRequireWildcard(__webpack_require__(/*! ./hooks/ */ "../modules/nested-elements/assets/js/editor/nested-repeater/hooks/index.js"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2.default)(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2.default)(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2.default)(this, result); }; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
var Component = /*#__PURE__*/function (_$e$modules$Component) {
  (0, _inherits2.default)(Component, _$e$modules$Component);
  var _super = _createSuper(Component);
  function Component() {
    var _this;
    (0, _classCallCheck2.default)(this, Component);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _super.call.apply(_super, [this].concat(args));
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "exports", {
      NestedModelBase: _nestedModelBase.default,
      NestedViewBase: _nestedViewBase.default
    });
    return _this;
  }
  (0, _createClass2.default)(Component, [{
    key: "registerAPI",
    value: function registerAPI() {
      (0, _get2.default)((0, _getPrototypeOf2.default)(Component.prototype), "registerAPI", this).call(this);
      elementor.addControlView('nested-elements-repeater', _repeater.default);
    }
  }, {
    key: "getNamespace",
    value: function getNamespace() {
      return 'nested-elements/nested-repeater';
    }
  }, {
    key: "defaultHooks",
    value: function defaultHooks() {
      return this.importHooks(hooks);
    }
  }]);
  return Component;
}($e.modules.ComponentBase);
exports["default"] = Component;

/***/ }),

/***/ "../modules/nested-elements/assets/js/editor/nested-repeater/controls/repeater.js":
/*!****************************************************************************************!*\
  !*** ../modules/nested-elements/assets/js/editor/nested-repeater/controls/repeater.js ***!
  \****************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../node_modules/@babel/runtime/helpers/interopRequireDefault.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _defineProperty2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "../node_modules/@babel/runtime/helpers/defineProperty.js"));
var _classCallCheck2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "../node_modules/@babel/runtime/helpers/classCallCheck.js"));
var _createClass2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/createClass */ "../node_modules/@babel/runtime/helpers/createClass.js"));
var _get2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/get */ "../node_modules/@babel/runtime/helpers/get.js"));
var _inherits2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/inherits */ "../node_modules/@babel/runtime/helpers/inherits.js"));
var _possibleConstructorReturn2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/possibleConstructorReturn */ "../node_modules/@babel/runtime/helpers/possibleConstructorReturn.js"));
var _getPrototypeOf2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/getPrototypeOf */ "../node_modules/@babel/runtime/helpers/getPrototypeOf.js"));
var _utils = __webpack_require__(/*! elementor/modules/nested-elements/assets/js/editor/utils */ "../modules/nested-elements/assets/js/editor/utils.js");
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2.default)(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2.default)(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2.default)(this, result); }; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
var Repeater = /*#__PURE__*/function (_elementor$modules$co) {
  (0, _inherits2.default)(Repeater, _elementor$modules$co);
  var _super = _createSuper(Repeater);
  function Repeater() {
    (0, _classCallCheck2.default)(this, Repeater);
    return _super.apply(this, arguments);
  }
  (0, _createClass2.default)(Repeater, [{
    key: "className",
    value: function className() {
      // Repeater Panel CSS, depends on 'elementor-control-type-repeater` control.
      // `elementor-control-type-nested-elements-repeater` to `elementor-control-type-repeater`
      return (0, _get2.default)((0, _getPrototypeOf2.default)(Repeater.prototype), "className", this).call(this).replace('nested-elements-repeater', 'repeater');
    }

    /**
     * Override to avoid the default behavior to adjust the title of the row.
     *
     * @return {Object}
     */
  }, {
    key: "getDefaults",
    value: function getDefaults() {
      var widgetContainer = this.options.container,
        defaults = widgetContainer.model.config.defaults,
        index = widgetContainer.children.length + 1;
      return (0, _defineProperty2.default)({
        _id: ''
      }, defaults.repeater_title_setting, (0, _utils.extractNestedItemTitle)(widgetContainer, index));
    }
  }, {
    key: "onChildviewClickDuplicate",
    value: function onChildviewClickDuplicate(childView) {
      $e.run('document/repeater/duplicate', {
        container: this.options.container,
        name: this.model.get('name'),
        index: childView._index,
        renderAfterInsert: false
      });
      this.toggleMinRowsClass();
    }
  }, {
    key: "updateActiveRow",
    value: function updateActiveRow() {
      if (!this.currentEditableChild) {
        return;
      }
      $e.run('document/repeater/select', {
        container: this.container,
        index: this.currentEditableChild.itemIndex,
        options: {
          useHistory: false
        }
      });
    }
  }]);
  return Repeater;
}(elementor.modules.controls.Repeater);
exports["default"] = Repeater;

/***/ }),

/***/ "../modules/nested-elements/assets/js/editor/nested-repeater/hooks/data/base.js":
/*!**************************************************************************************!*\
  !*** ../modules/nested-elements/assets/js/editor/nested-repeater/hooks/data/base.js ***!
  \**************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../node_modules/@babel/runtime/helpers/interopRequireDefault.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _classCallCheck2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "../node_modules/@babel/runtime/helpers/classCallCheck.js"));
var _createClass2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/createClass */ "../node_modules/@babel/runtime/helpers/createClass.js"));
var _inherits2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/inherits */ "../node_modules/@babel/runtime/helpers/inherits.js"));
var _possibleConstructorReturn2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/possibleConstructorReturn */ "../node_modules/@babel/runtime/helpers/possibleConstructorReturn.js"));
var _getPrototypeOf2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/getPrototypeOf */ "../node_modules/@babel/runtime/helpers/getPrototypeOf.js"));
var _utils = __webpack_require__(/*! elementor/modules/nested-elements/assets/js/editor/utils */ "../modules/nested-elements/assets/js/editor/utils.js");
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2.default)(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2.default)(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2.default)(this, result); }; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
var Base = /*#__PURE__*/function (_$e$modules$hookData$) {
  (0, _inherits2.default)(Base, _$e$modules$hookData$);
  var _super = _createSuper(Base);
  function Base() {
    (0, _classCallCheck2.default)(this, Base);
    return _super.apply(this, arguments);
  }
  (0, _createClass2.default)(Base, [{
    key: "getContainerType",
    value: function getContainerType() {
      return 'widget';
    }
  }, {
    key: "getConditions",
    value: function getConditions(args) {
      return (0, _utils.isWidgetSupportNesting)(args.container.model.get('widgetType'));
    }
  }]);
  return Base;
}($e.modules.hookData.After);
exports["default"] = Base;

/***/ }),

/***/ "../modules/nested-elements/assets/js/editor/nested-repeater/hooks/data/document/repeater/duplicate/nested-repeater-duplicate-container.js":
/*!*************************************************************************************************************************************************!*\
  !*** ../modules/nested-elements/assets/js/editor/nested-repeater/hooks/data/document/repeater/duplicate/nested-repeater-duplicate-container.js ***!
  \*************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../node_modules/@babel/runtime/helpers/interopRequireDefault.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = exports.NestedRepeaterDuplicateContainer = void 0;
var _classCallCheck2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "../node_modules/@babel/runtime/helpers/classCallCheck.js"));
var _createClass2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/createClass */ "../node_modules/@babel/runtime/helpers/createClass.js"));
var _inherits2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/inherits */ "../node_modules/@babel/runtime/helpers/inherits.js"));
var _possibleConstructorReturn2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/possibleConstructorReturn */ "../node_modules/@babel/runtime/helpers/possibleConstructorReturn.js"));
var _getPrototypeOf2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/getPrototypeOf */ "../node_modules/@babel/runtime/helpers/getPrototypeOf.js"));
var _base = _interopRequireDefault(__webpack_require__(/*! ../../../base */ "../modules/nested-elements/assets/js/editor/nested-repeater/hooks/data/base.js"));
var _utils = __webpack_require__(/*! elementor/modules/nested-elements/assets/js/editor/utils */ "../modules/nested-elements/assets/js/editor/utils.js");
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2.default)(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2.default)(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2.default)(this, result); }; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
var NestedRepeaterDuplicateContainer = /*#__PURE__*/function (_Base) {
  (0, _inherits2.default)(NestedRepeaterDuplicateContainer, _Base);
  var _super = _createSuper(NestedRepeaterDuplicateContainer);
  function NestedRepeaterDuplicateContainer() {
    (0, _classCallCheck2.default)(this, NestedRepeaterDuplicateContainer);
    return _super.apply(this, arguments);
  }
  (0, _createClass2.default)(NestedRepeaterDuplicateContainer, [{
    key: "getId",
    value: function getId() {
      return 'document/repeater/duplicate--nested-repeater-duplicate-container';
    }
  }, {
    key: "getCommand",
    value: function getCommand() {
      return 'document/repeater/duplicate';
    }
  }, {
    key: "apply",
    value: function apply(_ref) {
      var container = _ref.container,
        index = _ref.index;
      $e.run('document/elements/duplicate', {
        container: (0, _utils.findChildContainerOrFail)(container, index),
        options: {
          edit: false // Not losing focus.
        }
      });

      container.render();
    }
  }]);
  return NestedRepeaterDuplicateContainer;
}(_base.default);
exports.NestedRepeaterDuplicateContainer = NestedRepeaterDuplicateContainer;
var _default = NestedRepeaterDuplicateContainer;
exports["default"] = _default;

/***/ }),

/***/ "../modules/nested-elements/assets/js/editor/nested-repeater/hooks/data/document/repeater/insert/nested-repeater-create-container.js":
/*!*******************************************************************************************************************************************!*\
  !*** ../modules/nested-elements/assets/js/editor/nested-repeater/hooks/data/document/repeater/insert/nested-repeater-create-container.js ***!
  \*******************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../node_modules/@babel/runtime/helpers/interopRequireDefault.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = exports.NestedRepeaterCreateContainer = void 0;
var _classCallCheck2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "../node_modules/@babel/runtime/helpers/classCallCheck.js"));
var _createClass2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/createClass */ "../node_modules/@babel/runtime/helpers/createClass.js"));
var _get2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/get */ "../node_modules/@babel/runtime/helpers/get.js"));
var _inherits2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/inherits */ "../node_modules/@babel/runtime/helpers/inherits.js"));
var _possibleConstructorReturn2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/possibleConstructorReturn */ "../node_modules/@babel/runtime/helpers/possibleConstructorReturn.js"));
var _getPrototypeOf2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/getPrototypeOf */ "../node_modules/@babel/runtime/helpers/getPrototypeOf.js"));
var _base = _interopRequireDefault(__webpack_require__(/*! ../../../base */ "../modules/nested-elements/assets/js/editor/nested-repeater/hooks/data/base.js"));
var _utils = __webpack_require__(/*! elementor/modules/nested-elements/assets/js/editor/utils */ "../modules/nested-elements/assets/js/editor/utils.js");
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2.default)(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2.default)(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2.default)(this, result); }; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
/**
 * Hook responsible for:
 * a. Create container element for each created repeater item.
 * b. Set setting `_title` for the new container.
 * c. Since the core mechanism does not support nested by default,
 *    the hook take care of duplicating the children for the new container.
 */
var NestedRepeaterCreateContainer = /*#__PURE__*/function (_Base) {
  (0, _inherits2.default)(NestedRepeaterCreateContainer, _Base);
  var _super = _createSuper(NestedRepeaterCreateContainer);
  function NestedRepeaterCreateContainer() {
    (0, _classCallCheck2.default)(this, NestedRepeaterCreateContainer);
    return _super.apply(this, arguments);
  }
  (0, _createClass2.default)(NestedRepeaterCreateContainer, [{
    key: "getId",
    value: function getId() {
      return 'document/repeater/insert--nested-repeater-create-container';
    }
  }, {
    key: "getCommand",
    value: function getCommand() {
      return 'document/repeater/insert';
    }
  }, {
    key: "getConditions",
    value: function getConditions(args) {
      // Will only handle when command called directly and not through another command like `duplicate` or `move`.
      var isCommandCalledDirectly = $e.commands.isCurrentFirstTrace(this.getCommand());
      return (0, _get2.default)((0, _getPrototypeOf2.default)(NestedRepeaterCreateContainer.prototype), "getConditions", this).call(this, args) && isCommandCalledDirectly;
    }
  }, {
    key: "apply",
    value: function apply(_ref) {
      var container = _ref.container,
        name = _ref.name;
      var index = container.repeaters[name].children.length;
      $e.run('document/elements/create', {
        container: container,
        model: {
          elType: 'container',
          isLocked: true,
          _title: (0, _utils.extractNestedItemTitle)(container, index)
        },
        options: {
          edit: false // Not losing focus.
        }
      });
    }
  }]);
  return NestedRepeaterCreateContainer;
}(_base.default);
exports.NestedRepeaterCreateContainer = NestedRepeaterCreateContainer;
var _default = NestedRepeaterCreateContainer;
exports["default"] = _default;

/***/ }),

/***/ "../modules/nested-elements/assets/js/editor/nested-repeater/hooks/data/document/repeater/move/nested-repeater-move-container.js":
/*!***************************************************************************************************************************************!*\
  !*** ../modules/nested-elements/assets/js/editor/nested-repeater/hooks/data/document/repeater/move/nested-repeater-move-container.js ***!
  \***************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../node_modules/@babel/runtime/helpers/interopRequireDefault.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = exports.NestedRepeaterMoveContainer = void 0;
var _classCallCheck2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "../node_modules/@babel/runtime/helpers/classCallCheck.js"));
var _createClass2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/createClass */ "../node_modules/@babel/runtime/helpers/createClass.js"));
var _inherits2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/inherits */ "../node_modules/@babel/runtime/helpers/inherits.js"));
var _possibleConstructorReturn2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/possibleConstructorReturn */ "../node_modules/@babel/runtime/helpers/possibleConstructorReturn.js"));
var _getPrototypeOf2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/getPrototypeOf */ "../node_modules/@babel/runtime/helpers/getPrototypeOf.js"));
var _base = _interopRequireDefault(__webpack_require__(/*! ../../../base */ "../modules/nested-elements/assets/js/editor/nested-repeater/hooks/data/base.js"));
var _utils = __webpack_require__(/*! elementor/modules/nested-elements/assets/js/editor/utils */ "../modules/nested-elements/assets/js/editor/utils.js");
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2.default)(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2.default)(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2.default)(this, result); }; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
var NestedRepeaterMoveContainer = /*#__PURE__*/function (_Base) {
  (0, _inherits2.default)(NestedRepeaterMoveContainer, _Base);
  var _super = _createSuper(NestedRepeaterMoveContainer);
  function NestedRepeaterMoveContainer() {
    (0, _classCallCheck2.default)(this, NestedRepeaterMoveContainer);
    return _super.apply(this, arguments);
  }
  (0, _createClass2.default)(NestedRepeaterMoveContainer, [{
    key: "getId",
    value: function getId() {
      return 'document/repeater/move--nested-repeater-move-container';
    }
  }, {
    key: "getCommand",
    value: function getCommand() {
      return 'document/repeater/move';
    }
  }, {
    key: "apply",
    value: function apply(_ref) {
      var container = _ref.container,
        sourceIndex = _ref.sourceIndex,
        targetIndex = _ref.targetIndex;
      $e.run('document/elements/move', {
        container: (0, _utils.findChildContainerOrFail)(container, sourceIndex),
        target: container,
        options: {
          at: targetIndex,
          edit: false // Not losing focus.
        }
      });
    }
  }]);
  return NestedRepeaterMoveContainer;
}(_base.default);
exports.NestedRepeaterMoveContainer = NestedRepeaterMoveContainer;
var _default = NestedRepeaterMoveContainer;
exports["default"] = _default;

/***/ }),

/***/ "../modules/nested-elements/assets/js/editor/nested-repeater/hooks/data/document/repeater/remove/nested-repeater-remove-container.js":
/*!*******************************************************************************************************************************************!*\
  !*** ../modules/nested-elements/assets/js/editor/nested-repeater/hooks/data/document/repeater/remove/nested-repeater-remove-container.js ***!
  \*******************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../node_modules/@babel/runtime/helpers/interopRequireDefault.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = exports.NestedRepeaterRemoveContainer = void 0;
var _classCallCheck2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "../node_modules/@babel/runtime/helpers/classCallCheck.js"));
var _createClass2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/createClass */ "../node_modules/@babel/runtime/helpers/createClass.js"));
var _get2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/get */ "../node_modules/@babel/runtime/helpers/get.js"));
var _inherits2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/inherits */ "../node_modules/@babel/runtime/helpers/inherits.js"));
var _possibleConstructorReturn2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/possibleConstructorReturn */ "../node_modules/@babel/runtime/helpers/possibleConstructorReturn.js"));
var _getPrototypeOf2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/getPrototypeOf */ "../node_modules/@babel/runtime/helpers/getPrototypeOf.js"));
var _base = _interopRequireDefault(__webpack_require__(/*! ../../../base */ "../modules/nested-elements/assets/js/editor/nested-repeater/hooks/data/base.js"));
var _utils = __webpack_require__(/*! elementor/modules/nested-elements/assets/js/editor/utils */ "../modules/nested-elements/assets/js/editor/utils.js");
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2.default)(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2.default)(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2.default)(this, result); }; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
/**
 * Hook responsible for removing container element for the removed repeater item.
 */
var NestedRepeaterRemoveContainer = /*#__PURE__*/function (_Base) {
  (0, _inherits2.default)(NestedRepeaterRemoveContainer, _Base);
  var _super = _createSuper(NestedRepeaterRemoveContainer);
  function NestedRepeaterRemoveContainer() {
    (0, _classCallCheck2.default)(this, NestedRepeaterRemoveContainer);
    return _super.apply(this, arguments);
  }
  (0, _createClass2.default)(NestedRepeaterRemoveContainer, [{
    key: "getId",
    value: function getId() {
      return 'document/repeater/remove--nested-elements-remove-container';
    }
  }, {
    key: "getCommand",
    value: function getCommand() {
      return 'document/repeater/remove';
    }
  }, {
    key: "getConditions",
    value: function getConditions(args) {
      // Will only handle when command called directly and not through another command like `duplicate` or `move`.
      var isCommandCalledDirectly = $e.commands.isCurrentFirstTrace(this.getCommand());
      return (0, _get2.default)((0, _getPrototypeOf2.default)(NestedRepeaterRemoveContainer.prototype), "getConditions", this).call(this, args) && isCommandCalledDirectly;
    }
  }, {
    key: "apply",
    value: function apply(_ref) {
      var container = _ref.container,
        index = _ref.index;
      $e.run('document/elements/delete', {
        container: (0, _utils.findChildContainerOrFail)(container, index),
        force: true
      });
    }
  }]);
  return NestedRepeaterRemoveContainer;
}(_base.default);
exports.NestedRepeaterRemoveContainer = NestedRepeaterRemoveContainer;
var _default = NestedRepeaterRemoveContainer;
exports["default"] = _default;

/***/ }),

/***/ "../modules/nested-elements/assets/js/editor/nested-repeater/hooks/index.js":
/*!**********************************************************************************!*\
  !*** ../modules/nested-elements/assets/js/editor/nested-repeater/hooks/index.js ***!
  \**********************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
Object.defineProperty(exports, "NestedRepeaterCreateContainer", ({
  enumerable: true,
  get: function get() {
    return _nestedRepeaterCreateContainer.NestedRepeaterCreateContainer;
  }
}));
Object.defineProperty(exports, "NestedRepeaterDuplicateContainer", ({
  enumerable: true,
  get: function get() {
    return _nestedRepeaterDuplicateContainer.NestedRepeaterDuplicateContainer;
  }
}));
Object.defineProperty(exports, "NestedRepeaterFocusCurrentEditedContainer", ({
  enumerable: true,
  get: function get() {
    return _nestedRepeaterFocusCurrentEditedContainer.NestedRepeaterFocusCurrentEditedContainer;
  }
}));
Object.defineProperty(exports, "NestedRepeaterMoveContainer", ({
  enumerable: true,
  get: function get() {
    return _nestedRepeaterMoveContainer.NestedRepeaterMoveContainer;
  }
}));
Object.defineProperty(exports, "NestedRepeaterRemoveContainer", ({
  enumerable: true,
  get: function get() {
    return _nestedRepeaterRemoveContainer.NestedRepeaterRemoveContainer;
  }
}));
var _nestedRepeaterCreateContainer = __webpack_require__(/*! ./data/document/repeater/insert/nested-repeater-create-container */ "../modules/nested-elements/assets/js/editor/nested-repeater/hooks/data/document/repeater/insert/nested-repeater-create-container.js");
var _nestedRepeaterRemoveContainer = __webpack_require__(/*! ./data/document/repeater/remove/nested-repeater-remove-container */ "../modules/nested-elements/assets/js/editor/nested-repeater/hooks/data/document/repeater/remove/nested-repeater-remove-container.js");
var _nestedRepeaterMoveContainer = __webpack_require__(/*! ./data/document/repeater/move/nested-repeater-move-container */ "../modules/nested-elements/assets/js/editor/nested-repeater/hooks/data/document/repeater/move/nested-repeater-move-container.js");
var _nestedRepeaterDuplicateContainer = __webpack_require__(/*! ./data/document/repeater/duplicate/nested-repeater-duplicate-container */ "../modules/nested-elements/assets/js/editor/nested-repeater/hooks/data/document/repeater/duplicate/nested-repeater-duplicate-container.js");
var _nestedRepeaterFocusCurrentEditedContainer = __webpack_require__(/*! ./ui/panel/editor/open/nested-repeater-focus-current-edited-container */ "../modules/nested-elements/assets/js/editor/nested-repeater/hooks/ui/panel/editor/open/nested-repeater-focus-current-edited-container.js");

/***/ }),

/***/ "../modules/nested-elements/assets/js/editor/nested-repeater/hooks/ui/panel/editor/open/nested-repeater-focus-current-edited-container.js":
/*!************************************************************************************************************************************************!*\
  !*** ../modules/nested-elements/assets/js/editor/nested-repeater/hooks/ui/panel/editor/open/nested-repeater-focus-current-edited-container.js ***!
  \************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../node_modules/@babel/runtime/helpers/interopRequireDefault.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = exports.NestedRepeaterFocusCurrentEditedContainer = void 0;
var _classCallCheck2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "../node_modules/@babel/runtime/helpers/classCallCheck.js"));
var _createClass2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/createClass */ "../node_modules/@babel/runtime/helpers/createClass.js"));
var _inherits2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/inherits */ "../node_modules/@babel/runtime/helpers/inherits.js"));
var _possibleConstructorReturn2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/possibleConstructorReturn */ "../node_modules/@babel/runtime/helpers/possibleConstructorReturn.js"));
var _getPrototypeOf2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/getPrototypeOf */ "../node_modules/@babel/runtime/helpers/getPrototypeOf.js"));
var _utils = __webpack_require__(/*! elementor/modules/nested-elements/assets/js/editor/utils */ "../modules/nested-elements/assets/js/editor/utils.js");
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2.default)(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2.default)(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2.default)(this, result); }; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
/**
 * Since the nested tabs can have different depths, it should focus the current edited container,
 * but the problem is, without timeout it will be so fast, that the USER will not be able to see it.
 * using `NAVIGATION_DEPTH_SENSITIVITY_TIMEOUT` it will be delayed. formula: `NAVIGATION_DEPTH_SENSITIVITY_TIMEOUT * depth`.
 */
var NAVIGATION_DEPTH_SENSITIVITY_TIMEOUT = 250;

/**
 * Used to open current selected container.
 * Will run 'document/repeater/select', over nested elements tree.
 * Will select all repeater nested item(s) till it reach current repeater of selected element.
 */
var NestedRepeaterFocusCurrentEditedContainer = /*#__PURE__*/function (_$e$modules$hookUI$Af) {
  (0, _inherits2.default)(NestedRepeaterFocusCurrentEditedContainer, _$e$modules$hookUI$Af);
  var _super = _createSuper(NestedRepeaterFocusCurrentEditedContainer);
  function NestedRepeaterFocusCurrentEditedContainer() {
    (0, _classCallCheck2.default)(this, NestedRepeaterFocusCurrentEditedContainer);
    return _super.apply(this, arguments);
  }
  (0, _createClass2.default)(NestedRepeaterFocusCurrentEditedContainer, [{
    key: "getCommand",
    value: function getCommand() {
      return 'panel/editor/open';
    }
  }, {
    key: "getId",
    value: function getId() {
      return 'nested-repeater-focus-current-edited-container';
    }
  }, {
    key: "getConditions",
    value: function getConditions(args) {
      var _this$navigationMap;
      // Do not select for element creation.
      if ($e.commands.isCurrentFirstTrace('document/elements/create')) {
        return false;
      }

      // If some of the parents are supporting nested elements, then return true.
      var allParents = args.view.container.getParentAncestry(),
        result = allParents.some(function (parent) {
          return (0, _utils.isWidgetSupportNesting)(parent.model.get('widgetType'));
        });
      if (result) {
        this.navigationMap = this.getNavigationMapForContainers(allParents.filter(function (container) {
          return 'container' === container.type && 'widget' === container.parent.type;
        })).filter(function (map) {
          // Filter out paths that are the same as current.
          return map.index !== map.current;
        });
      }
      return (_this$navigationMap = this.navigationMap) === null || _this$navigationMap === void 0 ? void 0 : _this$navigationMap.length;
    }
  }, {
    key: "apply",
    value: function apply() {
      var depth = 1;
      this.navigationMap.forEach(function (_ref) {
        var container = _ref.container,
          index = _ref.index;
        setTimeout(function () {
          // No history, for focusing on current container.
          $e.run('document/repeater/select', {
            container: container,
            index: index++,
            options: {
              useHistory: false
            }
          });
        }, NAVIGATION_DEPTH_SENSITIVITY_TIMEOUT * depth);
        ++depth;
      });
    }
  }, {
    key: "getNavigationMapForContainers",
    value: function getNavigationMapForContainers(containers) {
      return containers.map(function (container) {
        return {
          current: container.parent.model.get('editSettings').get('activeItemIndex'),
          container: container.parent,
          index: container.parent.children.indexOf(container) + 1
        };
      }).reverse();
    }
  }]);
  return NestedRepeaterFocusCurrentEditedContainer;
}($e.modules.hookUI.After);
exports.NestedRepeaterFocusCurrentEditedContainer = NestedRepeaterFocusCurrentEditedContainer;
var _default = NestedRepeaterFocusCurrentEditedContainer;
exports["default"] = _default;

/***/ }),

/***/ "../modules/nested-elements/assets/js/editor/nested-repeater/models/nested-model-base.js":
/*!***********************************************************************************************!*\
  !*** ../modules/nested-elements/assets/js/editor/nested-repeater/models/nested-model-base.js ***!
  \***********************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../node_modules/@babel/runtime/helpers/interopRequireDefault.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _classCallCheck2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "../node_modules/@babel/runtime/helpers/classCallCheck.js"));
var _createClass2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/createClass */ "../node_modules/@babel/runtime/helpers/createClass.js"));
var _get2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/get */ "../node_modules/@babel/runtime/helpers/get.js"));
var _inherits2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/inherits */ "../node_modules/@babel/runtime/helpers/inherits.js"));
var _possibleConstructorReturn2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/possibleConstructorReturn */ "../node_modules/@babel/runtime/helpers/possibleConstructorReturn.js"));
var _getPrototypeOf2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/getPrototypeOf */ "../node_modules/@babel/runtime/helpers/getPrototypeOf.js"));
var _utils = __webpack_require__(/*! elementor/modules/nested-elements/assets/js/editor/utils */ "../modules/nested-elements/assets/js/editor/utils.js");
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2.default)(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2.default)(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2.default)(this, result); }; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
var NestedModelBase = /*#__PURE__*/function (_elementor$modules$el) {
  (0, _inherits2.default)(NestedModelBase, _elementor$modules$el);
  var _super = _createSuper(NestedModelBase);
  function NestedModelBase() {
    (0, _classCallCheck2.default)(this, NestedModelBase);
    return _super.apply(this, arguments);
  }
  (0, _createClass2.default)(NestedModelBase, [{
    key: "initialize",
    value: function initialize(options) {
      this.config = elementor.widgetsCache[options.widgetType];
      this.set('supportRepeaterChildren', true);
      var isNewElementCreate = 0 === this.get('elements').length && $e.commands.currentTrace.includes('document/elements/create');
      if (isNewElementCreate) {
        this.onElementCreate();
      }
      (0, _get2.default)((0, _getPrototypeOf2.default)(NestedModelBase.prototype), "initialize", this).call(this, options);
    }
  }, {
    key: "isValidChild",
    value: function isValidChild(childModel) {
      var parentElType = this.get('elType'),
        childElType = childModel.get('elType');
      return 'container' === childElType && 'widget' === parentElType && (0, _utils.isWidgetSupportNesting)(this.get('widgetType')) &&
      // When creating a container for the tabs widget specifically from the repeater, the container should be locked,
      // so only containers that are locked (created from the repeater) can be inside the tabs widget.
      childModel.get('isLocked');
    }
  }, {
    key: "getDefaultChildren",
    value: function getDefaultChildren() {
      var defaults = this.config.defaults,
        result = [];
      defaults.elements.forEach(function (element) {
        element.id = elementorCommon.helpers.getUniqueId();
        element.settings = element.settings || {};
        element.elements = element.elements || [];
        element.isLocked = true;
        result.push(element);
      });
      return result;
    }
  }, {
    key: "onElementCreate",
    value: function onElementCreate() {
      this.set('elements', this.getDefaultChildren());
    }
  }]);
  return NestedModelBase;
}(elementor.modules.elements.models.Element);
exports["default"] = NestedModelBase;

/***/ }),

/***/ "../modules/nested-elements/assets/js/editor/nested-repeater/views/nested-view-base.js":
/*!*********************************************************************************************!*\
  !*** ../modules/nested-elements/assets/js/editor/nested-repeater/views/nested-view-base.js ***!
  \*********************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../node_modules/@babel/runtime/helpers/interopRequireDefault.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _classCallCheck2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "../node_modules/@babel/runtime/helpers/classCallCheck.js"));
var _createClass2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/createClass */ "../node_modules/@babel/runtime/helpers/createClass.js"));
var _get2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/get */ "../node_modules/@babel/runtime/helpers/get.js"));
var _inherits2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/inherits */ "../node_modules/@babel/runtime/helpers/inherits.js"));
var _possibleConstructorReturn2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/possibleConstructorReturn */ "../node_modules/@babel/runtime/helpers/possibleConstructorReturn.js"));
var _getPrototypeOf2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/getPrototypeOf */ "../node_modules/@babel/runtime/helpers/getPrototypeOf.js"));
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2.default)(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2.default)(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2.default)(this, result); }; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
var NestedViewBase = /*#__PURE__*/function (_elementor$modules$el) {
  (0, _inherits2.default)(NestedViewBase, _elementor$modules$el);
  var _super = _createSuper(NestedViewBase);
  function NestedViewBase() {
    (0, _classCallCheck2.default)(this, NestedViewBase);
    return _super.apply(this, arguments);
  }
  (0, _createClass2.default)(NestedViewBase, [{
    key: "getChildViewContainer",
    value:
    // Sometimes the children placement is not in the end of the element, but somewhere else, eg: deep inside the element template.
    // If `defaults_placeholder_selector` is set, it will be used to find the correct place to insert the children.
    function getChildViewContainer(containerView, childView) {
      var customSelector = this.model.config.defaults.elements_placeholder_selector;
      if (customSelector) {
        return containerView.$el.find(this.model.config.defaults.elements_placeholder_selector);
      }
      return (0, _get2.default)((0, _getPrototypeOf2.default)(NestedViewBase.prototype), "getChildViewContainer", this).call(this, containerView, childView);
    }
  }, {
    key: "getChildType",
    value: function getChildType() {
      return ['container'];
    }
  }, {
    key: "onRender",
    value: function onRender() {
      (0, _get2.default)((0, _getPrototypeOf2.default)(NestedViewBase.prototype), "onRender", this).call(this);
      this.normalizeAttributes();
    }
  }]);
  return NestedViewBase;
}(elementor.modules.elements.views.BaseWidget);
exports["default"] = NestedViewBase;

/***/ }),

/***/ "../modules/nested-elements/assets/js/editor/utils.js":
/*!************************************************************!*\
  !*** ../modules/nested-elements/assets/js/editor/utils.js ***!
  \************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
/* provided dependency */ var sprintf = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n")["sprintf"];


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.extractNestedItemTitle = extractNestedItemTitle;
exports.findChildContainerOrFail = findChildContainerOrFail;
exports.isWidgetSupportNesting = isWidgetSupportNesting;
function extractNestedItemTitle(container, index) {
  var title = container.view.model.config.defaults.elements_title;

  // Translations comes from server side.
  return sprintf(title, index);
}
function isWidgetSupportNesting(widgetType) {
  var widgetConfig = elementor.widgetsCache[widgetType];
  if (!widgetConfig) {
    return false;
  }
  return widgetConfig.support_nesting;
}
function findChildContainerOrFail(container, index) {
  var childView = container.view.children.findByIndex(index);
  if (!childView) {
    throw new Error('Child container was not found for the current repeater item.');
  }
  return childView.getContainer();
}

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/assertThisInitialized.js":
/*!***********************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/assertThisInitialized.js ***!
  \***********************************************************************/
/***/ ((module) => {

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }
  return self;
}
module.exports = _assertThisInitialized, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/defineProperty.js":
/*!****************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/defineProperty.js ***!
  \****************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var toPropertyKey = __webpack_require__(/*! ./toPropertyKey.js */ "../node_modules/@babel/runtime/helpers/toPropertyKey.js");
function _defineProperty(obj, key, value) {
  key = toPropertyKey(key);
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}
module.exports = _defineProperty, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/get.js":
/*!*****************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/get.js ***!
  \*****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var superPropBase = __webpack_require__(/*! ./superPropBase.js */ "../node_modules/@babel/runtime/helpers/superPropBase.js");
function _get() {
  if (typeof Reflect !== "undefined" && Reflect.get) {
    module.exports = _get = Reflect.get.bind(), module.exports.__esModule = true, module.exports["default"] = module.exports;
  } else {
    module.exports = _get = function _get(target, property, receiver) {
      var base = superPropBase(target, property);
      if (!base) return;
      var desc = Object.getOwnPropertyDescriptor(base, property);
      if (desc.get) {
        return desc.get.call(arguments.length < 3 ? target : receiver);
      }
      return desc.value;
    }, module.exports.__esModule = true, module.exports["default"] = module.exports;
  }
  return _get.apply(this, arguments);
}
module.exports = _get, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/getPrototypeOf.js":
/*!****************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/getPrototypeOf.js ***!
  \****************************************************************/
/***/ ((module) => {

function _getPrototypeOf(o) {
  module.exports = _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  }, module.exports.__esModule = true, module.exports["default"] = module.exports;
  return _getPrototypeOf(o);
}
module.exports = _getPrototypeOf, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/inherits.js":
/*!**********************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/inherits.js ***!
  \**********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var setPrototypeOf = __webpack_require__(/*! ./setPrototypeOf.js */ "../node_modules/@babel/runtime/helpers/setPrototypeOf.js");
function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  Object.defineProperty(subClass, "prototype", {
    writable: false
  });
  if (superClass) setPrototypeOf(subClass, superClass);
}
module.exports = _inherits, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/possibleConstructorReturn.js":
/*!***************************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/possibleConstructorReturn.js ***!
  \***************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var _typeof = (__webpack_require__(/*! ./typeof.js */ "../node_modules/@babel/runtime/helpers/typeof.js")["default"]);
var assertThisInitialized = __webpack_require__(/*! ./assertThisInitialized.js */ "../node_modules/@babel/runtime/helpers/assertThisInitialized.js");
function _possibleConstructorReturn(self, call) {
  if (call && (_typeof(call) === "object" || typeof call === "function")) {
    return call;
  } else if (call !== void 0) {
    throw new TypeError("Derived constructors may only return object or undefined");
  }
  return assertThisInitialized(self);
}
module.exports = _possibleConstructorReturn, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/setPrototypeOf.js":
/*!****************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/setPrototypeOf.js ***!
  \****************************************************************/
/***/ ((module) => {

function _setPrototypeOf(o, p) {
  module.exports = _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  }, module.exports.__esModule = true, module.exports["default"] = module.exports;
  return _setPrototypeOf(o, p);
}
module.exports = _setPrototypeOf, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/superPropBase.js":
/*!***************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/superPropBase.js ***!
  \***************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var getPrototypeOf = __webpack_require__(/*! ./getPrototypeOf.js */ "../node_modules/@babel/runtime/helpers/getPrototypeOf.js");
function _superPropBase(object, property) {
  while (!Object.prototype.hasOwnProperty.call(object, property)) {
    object = getPrototypeOf(object);
    if (object === null) break;
  }
  return object;
}
module.exports = _superPropBase, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ })

}]);
//# sourceMappingURL=54b0e8f121824e541a9f.bundle.js.map