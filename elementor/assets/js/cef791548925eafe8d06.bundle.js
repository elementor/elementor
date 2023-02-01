/*! elementor - v3.10.1 - 31-01-2023 */
"use strict";
(self["webpackChunkelementor"] = self["webpackChunkelementor"] || []).push([["modules_nested-elements_assets_js_editor_nested-element-types-base_js"],{

/***/ "../modules/nested-elements/assets/js/editor/nested-element-types-base.js":
/*!********************************************************************************!*\
  !*** ../modules/nested-elements/assets/js/editor/nested-element-types-base.js ***!
  \********************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../node_modules/@babel/runtime/helpers/interopRequireDefault.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = exports.NestedElementTypesBase = void 0;
var _classCallCheck2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "../node_modules/@babel/runtime/helpers/classCallCheck.js"));
var _createClass2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/createClass */ "../node_modules/@babel/runtime/helpers/createClass.js"));
var _inherits2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/inherits */ "../node_modules/@babel/runtime/helpers/inherits.js"));
var _possibleConstructorReturn2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/possibleConstructorReturn */ "../node_modules/@babel/runtime/helpers/possibleConstructorReturn.js"));
var _getPrototypeOf2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/getPrototypeOf */ "../node_modules/@babel/runtime/helpers/getPrototypeOf.js"));
var _view = _interopRequireDefault(__webpack_require__(/*! ./views/view */ "../modules/nested-elements/assets/js/editor/views/view.js"));
var _empty = _interopRequireDefault(__webpack_require__(/*! ./views/empty */ "../modules/nested-elements/assets/js/editor/views/empty.js"));
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2.default)(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2.default)(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2.default)(this, result); }; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
var NestedElementTypesBase = /*#__PURE__*/function (_elementor$modules$el) {
  (0, _inherits2.default)(NestedElementTypesBase, _elementor$modules$el);
  var _super = _createSuper(NestedElementTypesBase);
  function NestedElementTypesBase() {
    (0, _classCallCheck2.default)(this, NestedElementTypesBase);
    return _super.apply(this, arguments);
  }
  (0, _createClass2.default)(NestedElementTypesBase, [{
    key: "getType",
    value: function getType() {
      elementorModules.ForceMethodImplementation();
    }
  }, {
    key: "getView",
    value: function getView() {
      return _view.default;
    }
  }, {
    key: "getEmptyView",
    value: function getEmptyView() {
      return _empty.default;
    }
  }, {
    key: "getModel",
    value: function getModel() {
      return $e.components.get('nested-elements/nested-repeater').exports.NestedModelBase;
    }
  }]);
  return NestedElementTypesBase;
}(elementor.modules.elements.types.Base);
exports.NestedElementTypesBase = NestedElementTypesBase;
var _default = NestedElementTypesBase;
exports["default"] = _default;

/***/ }),

/***/ "../modules/nested-elements/assets/js/editor/views/add-section-area.js":
/*!*****************************************************************************!*\
  !*** ../modules/nested-elements/assets/js/editor/views/add-section-area.js ***!
  \*****************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

/* provided dependency */ var __ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n")["__"];
/* provided dependency */ var PropTypes = __webpack_require__(/*! prop-types */ "../node_modules/prop-types/index.js");


var _typeof = __webpack_require__(/*! @babel/runtime/helpers/typeof */ "../node_modules/@babel/runtime/helpers/typeof.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = AddSectionArea;
var _react = _interopRequireWildcard(__webpack_require__(/*! react */ "react"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
/* eslint-disable jsx-a11y/click-events-have-key-events */

function AddSectionArea(props) {
  var addAreaElementRef = (0, _react.useRef)(),
    containerHelper = elementor.helpers.container;

  // Make droppable area.
  (0, _react.useEffect)(function () {
    if (props.container.view.isDisconnected()) {
      return;
    }
    var $addAreaElementRef = jQuery(addAreaElementRef.current),
      defaultDroppableOptions = props.container.view.getDroppableOptions();

    // Make some adjustments to behave like 'AddSectionArea', use default droppable options from container element.
    defaultDroppableOptions.placeholder = false;
    defaultDroppableOptions.items = '> .elementor-add-section-inner';
    defaultDroppableOptions.hasDraggingOnChildClass = 'elementor-dragging-on-child';

    // Make element drop-able.
    $addAreaElementRef.html5Droppable(defaultDroppableOptions);

    // Cleanup.
    return function () {
      $addAreaElementRef.html5Droppable('destroy');
    };
  }, []);
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "elementor-add-section",
    onClick: function onClick() {
      return containerHelper.openEditMode(props.container);
    },
    ref: addAreaElementRef,
    role: "button",
    tabIndex: "0"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "elementor-add-section-inner"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "e-view elementor-add-new-section"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "elementor-add-section-area-button elementor-add-section-button",
    onClick: function onClick() {
      return props.setIsRenderPresets(true);
    },
    title: __('Add new container', 'elementor'),
    role: "button",
    tabIndex: "0"
  }, /*#__PURE__*/_react.default.createElement("i", {
    className: "eicon-plus"
  })), /*#__PURE__*/_react.default.createElement("div", {
    className: "elementor-add-section-drag-title"
  }, __('Drag widgets here.', 'elementor')))));
}
AddSectionArea.propTypes = {
  container: PropTypes.object.isRequired,
  setIsRenderPresets: PropTypes.func.isRequired
};

/***/ }),

/***/ "../modules/nested-elements/assets/js/editor/views/empty.js":
/*!******************************************************************!*\
  !*** ../modules/nested-elements/assets/js/editor/views/empty.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

/* provided dependency */ var PropTypes = __webpack_require__(/*! prop-types */ "../node_modules/prop-types/index.js");


var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../node_modules/@babel/runtime/helpers/interopRequireDefault.js");
var _typeof = __webpack_require__(/*! @babel/runtime/helpers/typeof */ "../node_modules/@babel/runtime/helpers/typeof.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = Empty;
var _react = _interopRequireWildcard(__webpack_require__(/*! react */ "react"));
var _defineProperty2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "../node_modules/@babel/runtime/helpers/defineProperty.js"));
var _slicedToArray2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/slicedToArray */ "../node_modules/@babel/runtime/helpers/slicedToArray.js"));
var _addSectionArea = _interopRequireDefault(__webpack_require__(/*! ./add-section-area */ "../modules/nested-elements/assets/js/editor/views/add-section-area.js"));
var _selectPreset = _interopRequireDefault(__webpack_require__(/*! ./select-preset */ "../modules/nested-elements/assets/js/editor/views/select-preset.js"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function Empty(props) {
  var _useState = (0, _react.useState)(false),
    _useState2 = (0, _slicedToArray2.default)(_useState, 2),
    isRenderPresets = _useState2[0],
    setIsRenderPresets = _useState2[1];
  props = _objectSpread(_objectSpread({}, props), {}, {
    setIsRenderPresets: setIsRenderPresets
  });
  return isRenderPresets ? /*#__PURE__*/_react.default.createElement(_selectPreset.default, props) : /*#__PURE__*/_react.default.createElement(_addSectionArea.default, props);
}
Empty.propTypes = {
  container: PropTypes.object.isRequired
};

/***/ }),

/***/ "../modules/nested-elements/assets/js/editor/views/select-preset.js":
/*!**************************************************************************!*\
  !*** ../modules/nested-elements/assets/js/editor/views/select-preset.js ***!
  \**************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

/* provided dependency */ var __ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n")["__"];
/* provided dependency */ var PropTypes = __webpack_require__(/*! prop-types */ "../node_modules/prop-types/index.js");


var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../node_modules/@babel/runtime/helpers/interopRequireDefault.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = SelectPreset;
var _react = _interopRequireDefault(__webpack_require__(/*! react */ "react"));
/* eslint-disable jsx-a11y/click-events-have-key-events */
function SelectPreset(props) {
  var containerHelper = elementor.helpers.container,
    onPresetSelected = function onPresetSelected(preset, container) {
      var options = {
        createWrapper: false
      };

      // Create new one by selected preset.
      containerHelper.createContainerFromPreset(preset, container, options);
    };
  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("div", {
    className: "elementor-add-section-close"
  }, /*#__PURE__*/_react.default.createElement("i", {
    onClick: function onClick() {
      return props.setIsRenderPresets(false);
    },
    className: "eicon-close",
    "aria-hidden": "true"
  }), /*#__PURE__*/_react.default.createElement("span", {
    className: "elementor-screen-only"
  }, __('Close', 'elementor'))), /*#__PURE__*/_react.default.createElement("div", {
    className: "e-view e-con-select-preset"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "e-con-select-preset__title"
  }, __('Select your Structure', 'elementor')), /*#__PURE__*/_react.default.createElement("div", {
    className: "e-con-select-preset__list"
  }, elementor.presetsFactory.getContainerPresets().map(function (preset) {
    return /*#__PURE__*/_react.default.createElement("div", {
      onClick: function onClick() {
        return onPresetSelected(preset, props.container);
      },
      key: preset,
      className: "e-con-preset",
      "data-preset": preset,
      dangerouslySetInnerHTML: {
        __html: elementor.presetsFactory.generateContainerPreset(preset)
      },
      role: "button",
      tabIndex: "0"
    });
  }))));
}
SelectPreset.propTypes = {
  container: PropTypes.object.isRequired,
  setIsRenderPresets: PropTypes.func.isRequired
};

/***/ }),

/***/ "../modules/nested-elements/assets/js/editor/views/view.js":
/*!*****************************************************************!*\
  !*** ../modules/nested-elements/assets/js/editor/views/view.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../node_modules/@babel/runtime/helpers/interopRequireDefault.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = exports.View = void 0;
var _classCallCheck2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "../node_modules/@babel/runtime/helpers/classCallCheck.js"));
var _createClass2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/createClass */ "../node_modules/@babel/runtime/helpers/createClass.js"));
var _get2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/get */ "../node_modules/@babel/runtime/helpers/get.js"));
var _inherits2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/inherits */ "../node_modules/@babel/runtime/helpers/inherits.js"));
var _possibleConstructorReturn2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/possibleConstructorReturn */ "../node_modules/@babel/runtime/helpers/possibleConstructorReturn.js"));
var _getPrototypeOf2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/getPrototypeOf */ "../node_modules/@babel/runtime/helpers/getPrototypeOf.js"));
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2.default)(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2.default)(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2.default)(this, result); }; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
var View = /*#__PURE__*/function (_$e$components$get$ex) {
  (0, _inherits2.default)(View, _$e$components$get$ex);
  var _super = _createSuper(View);
  function View() {
    (0, _classCallCheck2.default)(this, View);
    return _super.apply(this, arguments);
  }
  (0, _createClass2.default)(View, [{
    key: "events",
    value: function events() {
      var _this = this;
      var events = (0, _get2.default)((0, _getPrototypeOf2.default)(View.prototype), "events", this).call(this);
      events.click = function (e) {
        var closest = e.target.closest('.elementor-element');
        var model = _this.options.model,
          view = _this;

        // For clicks on container/widget.
        if (['container', 'widget'].includes(closest === null || closest === void 0 ? void 0 : closest.dataset.element_type)) {
          // eslint-disable-line camelcase
          // In case the container empty, click should be handled by the EmptyView.
          var container = elementor.getContainer(closest.dataset.id);
          if (container.view.isEmpty()) {
            return true;
          }

          // If not empty, open it.
          model = container.model;
          view = container.view;
        }
        e.stopPropagation();
        $e.run('panel/editor/open', {
          model: model,
          view: view
        });
      };
      return events;
    }
  }]);
  return View;
}($e.components.get('nested-elements/nested-repeater').exports.NestedViewBase);
exports.View = View;
var _default = View;
exports["default"] = _default;

/***/ })

}]);
//# sourceMappingURL=cef791548925eafe8d06.bundle.js.map