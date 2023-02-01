/*! elementor - v3.10.1 - 31-01-2023 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "../assets/dev/js/editor/container/container.js":
/*!******************************************************!*\
  !*** ../assets/dev/js/editor/container/container.js ***!
  \******************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
/* provided dependency */ var __ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n")["__"];


var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../node_modules/@babel/runtime/helpers/interopRequireDefault.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _typeof2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/typeof */ "../node_modules/@babel/runtime/helpers/typeof.js"));
var _slicedToArray2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/slicedToArray */ "../node_modules/@babel/runtime/helpers/slicedToArray.js"));
var _classCallCheck2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "../node_modules/@babel/runtime/helpers/classCallCheck.js"));
var _createClass2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/createClass */ "../node_modules/@babel/runtime/helpers/createClass.js"));
var _assertThisInitialized2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/assertThisInitialized */ "../node_modules/@babel/runtime/helpers/assertThisInitialized.js"));
var _inherits2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/inherits */ "../node_modules/@babel/runtime/helpers/inherits.js"));
var _possibleConstructorReturn2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/possibleConstructorReturn */ "../node_modules/@babel/runtime/helpers/possibleConstructorReturn.js"));
var _getPrototypeOf2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/getPrototypeOf */ "../node_modules/@babel/runtime/helpers/getPrototypeOf.js"));
var _defineProperty2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "../node_modules/@babel/runtime/helpers/defineProperty.js"));
var _argsObject = _interopRequireDefault(__webpack_require__(/*! ../../modules/imports/args-object */ "../assets/dev/js/modules/imports/args-object.js"));
var _panel = _interopRequireDefault(__webpack_require__(/*! ./panel */ "../assets/dev/js/editor/container/panel.js"));
var _childrenArray = _interopRequireDefault(__webpack_require__(/*! ./model/children-array */ "../assets/dev/js/editor/container/model/children-array.js"));
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2.default)(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2.default)(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2.default)(this, result); }; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
/**
 * @typedef {import('../../../../lib/backbone/backbone.marionette')} Backbone
 * @typedef {import('../../../../lib/backbone/backbone.marionette')} Marionette
 * @typedef {import('../elements/views/base')} BaseElementView
 * @typedef {import('../elements/views/section')} SectionView
 * @typedef {import('../views/base-container')} BaseContainer
 * @typedef {import('../elements/models/base-element-model')} BaseElementModel
 */
/**
 * TODO: ViewsOptions
 *
 * @typedef {(Marionette.View|Marionette.CompositeView|BaseElementView|SectionView|BaseContainer)} ViewsOptions
 */
var Container = /*#__PURE__*/function (_ArgsObject) {
  (0, _inherits2.default)(Container, _ArgsObject);
  var _super = _createSuper(Container);
  // TODO: Swap those backwards compatibility is required.

  /**
   * Container type.
   *
   * @type {string}
   */

  /**
   * Container id.
   *
   * @type {string}
   */

  /**
   * Document Object.
   *
   * @type  {{}}
   */

  /**
   * Container model.
   *
   * @type {(Backbone.Model|BaseElementModel)}
   */

  /**
   * Container settings.
   *
   * @type {Backbone.Model}
   */

  /**
   * Container view.
   *
   * @type {ViewsOptions}
   */

  /**
   * Container parent.
   *
   * @type {Container}
   */

  /**
   * Container children(s).
   *
   * @type {ChildrenArray}
   */

  /**
   * Container dynamic.
   *
   * @type {Backbone.Model}
   */

  /**
   * Container globals.
   *
   * @type {Backbone.Model}
   */

  /**
   * Container label.
   *
   * @type {string}
   */

  /**
   * Container controls.
   *
   * @type {{}}
   */

  /**
   * Repeaters containers
   *
   * @type {{}}
   */

  /**
   * Container renderer (The one who render).
   *
   * @type {Container}
   */

  /**
   * Container panel.
   *
   * @type {Panel}
   */

  /**
   * Controls placeholders.
   *
   * @type {{}}
   */

  /**
   * Function constructor().
   *
   * Create container.
   *
   * @param {{}} args
   *
   * @throws {Error}
   */
  function Container(args) {
    var _this;
    (0, _classCallCheck2.default)(this, Container);
    _this = _super.call(this, args);

    // Validate args.
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "type", void 0);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "id", void 0);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "document", void 0);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "model", void 0);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "settings", void 0);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "view", void 0);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "parent", void 0);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "children", new _childrenArray.default());
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "dynamic", void 0);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "globals", void 0);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "label", void 0);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "controls", {});
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "repeaters", {});
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "renderer", void 0);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "panel", void 0);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "placeholders", {});
    _this.validateArgs(args);
    args = Object.entries(args);

    // If empty.
    if (0 === args.length) {
      throw Error('Container cannot be empty.');
    }

    // Set properties, if not defined - keep the defaults.
    args.forEach(function (_ref) {
      var _ref2 = (0, _slicedToArray2.default)(_ref, 2),
        key = _ref2[0],
        value = _ref2[1];
      _this[key] = 'undefined' === typeof value ? _this[key] : value;
    });
    if ('undefined' === typeof _this.renderer) {
      _this.renderer = (0, _assertThisInitialized2.default)(_this);
    }
    if (!_this.document) {
      _this.document = elementor.documents.getCurrent();
    }
    _this.dynamic = new Backbone.Model(_this.settings.get('__dynamic__'));
    _this.globals = new Backbone.Model(_this.settings.get('__globals__'));
    _this.panel = new _panel.default((0, _assertThisInitialized2.default)(_this));
    _this.initialize();
    return _this;
  }
  (0, _createClass2.default)(Container, [{
    key: "initialize",
    value: function initialize() {
      if (this.isViewElement()) {
        this.addToParent();
        this.handleChildrenRecursive();
        this.view.on('destroy', this.removeFromParent.bind(this));
      }
      this.handleRepeaterChildren();
    }
  }, {
    key: "validateArgs",
    value: function validateArgs(args) {
      this.requireArgumentType('type', 'string', args);
      this.requireArgumentType('id', 'string', args);
      this.requireArgumentInstance('settings', Backbone.Model, args);
      this.requireArgumentInstance('model', Backbone.Model, args);

      // Require it, unless it's forced to be `false`.
      if (false !== args.parent) {
        this.requireArgumentInstance('parent', elementorModules.editor.Container, args);
      }
    }

    /**
     * Function getGroupRelatedControls().
     *
     * Example:
     * Settings = { typography_typography: 'whatever', button_text_color: 'whatever' };
     * Result { control_name: controlValue, ... - and so on };
     * `Object.keys( Result ) = [ 'typography_typography', 'typography_font_family', 'typography_font_size', 'typography_font_size_tablet', 'typography_font_size_mobile', 'typography_font_weight', 'typography_text_transform', 'typography_font_style', 'typography_text_decoration', 'typography_line_height', 'typography_line_height_tablet', 'typography_line_height_mobile', 'typography_letter_spacing', 'typography_letter_spacing_tablet', 'typography_letter_spacing_mobile', 'button_text_color' ]`.
     *
     * @param {{}} settings
     *
     * @return {{}} result
     */
  }, {
    key: "getGroupRelatedControls",
    value: function getGroupRelatedControls(settings) {
      var _this2 = this;
      var result = {};
      Object.keys(settings).forEach(function (settingKey) {
        Object.values(_this2.controls).forEach(function (control) {
          var _this2$controls$setti;
          if (settingKey === control.name) {
            result[control.name] = control;
          } else if ((_this2$controls$setti = _this2.controls[settingKey]) !== null && _this2$controls$setti !== void 0 && _this2$controls$setti.groupPrefix) {
            var groupPrefix = _this2.controls[settingKey].groupPrefix;
            if (control.name.toString().startsWith(groupPrefix)) {
              result[control.name] = control;
            }
          }
        });
      });
      return result;
    }

    /**
     * Function getAffectingControls().
     *
     * @return {{}} All controls that effecting the container.
     */
  }, {
    key: "getAffectingControls",
    value: function getAffectingControls() {
      var _this3 = this;
      var result = {},
        activeControls = this.settings.getActiveControls();
      Object.entries(activeControls).forEach(function (_ref3) {
        var _ref4 = (0, _slicedToArray2.default)(_ref3, 2),
          controlName = _ref4[0],
          control = _ref4[1];
        var controlValue = _this3.settings.get(control.name);
        if (control.global && !(controlValue !== null && controlValue !== void 0 && controlValue.length)) {
          var _this3$globals$get;
          if ((_this3$globals$get = _this3.globals.get(control.name)) !== null && _this3$globals$get !== void 0 && _this3$globals$get.length || _this3.getGlobalDefault(controlName).length) {
            control.global.utilized = true;
            result[controlName] = control;
            return;
          }
        }
        if (control.dynamic) {
          if (_this3.dynamic.get(controlName)) {
            control.dynamic.utilized = true;
            result[controlName] = control;
            return;
          }
        }
        if (controlValue === control.default) {
          return;
        }
        if (!controlValue) {
          return;
        }
        if ('object' === (0, _typeof2.default)(controlValue) && Object.values(controlValue).join() === Object.values(control.default).join()) {
          return;
        }
        result[controlName] = control;
      });
      return result;
    }

    /**
     * Function getParentAncestry().
     *
     * Recursively run over all parents from current container till the top
     *
     * @return {Array.<Container>} All parent as flat array.
     */
  }, {
    key: "getParentAncestry",
    value: function getParentAncestry() {
      var result = [];
      var parent = this;
      while (parent) {
        result.push(parent);
        parent = parent.parent;
      }
      return result;
    }
  }, {
    key: "handleChildrenRecursive",
    value: function handleChildrenRecursive() {
      var _this$view$children;
      if ((_this$view$children = this.view.children) !== null && _this$view$children !== void 0 && _this$view$children.length) {
        Object.values(this.view.children._views).forEach(function (view) {
          if (!view.container) {
            return;
          }
          var container = view.container;

          // Since the way 'global-widget' rendered, it does not have parent sometimes.
          if (container.parent.children) {
            container.parent.children[view._index] = container;
          }
          container.handleChildrenRecursive();
        });
      } else {
        this.children.clear();
      }
    }
  }, {
    key: "addToParent",
    value: function addToParent() {
      if (!this.parent.children || this.isRepeaterItem()) {
        return;
      }

      // On create container tell the parent where it was created.
      this.parent.children.splice(this.view._index, 0, this);
    }
  }, {
    key: "removeFromParent",
    value: function removeFromParent() {
      var _this4 = this;
      if (!this.parent.children || this.isRepeater()) {
        return;
      }

      // When delete container its should notify its parent, that his children is dead.
      this.parent.children = this.parent.children.filter(function (filtered) {
        return filtered.id !== _this4.id;
      });
    }
  }, {
    key: "handleRepeaterChildren",
    value: function handleRepeaterChildren() {
      var _this5 = this;
      Object.values(this.controls).forEach(function (control) {
        if (!control.is_repeater) {
          return;
        }
        var model = new Backbone.Model({
          name: control.name
        });
        _this5.repeaters[control.name] = new elementorModules.editor.Container({
          type: Container.TYPE_REPEATER,
          id: control.name,
          model: model,
          settings: model,
          view: _this5.view,
          parent: _this5,
          label: control.label || control.name,
          controls: {},
          renderer: _this5.renderer
        });
        _this5.settings.get(control.name).forEach(function (rowModel, index) {
          _this5.addRepeaterItem(control.name, rowModel, index);
        });
      });

      // Backwards Compatibility: if there is only one repeater (type=repeater), set it's children as current children.
      // Since 3.0.0.
      if (['widget', 'document'].includes(this.type)) {
        var repeaters = Object.values(this.controls).filter(function (control) {
          return 'repeater' === control.type;
        });
        if (!this.model.get('supportRepeaterChildren') && 1 === repeaters.length) {
          Object.defineProperty(this, 'children', {
            get: function get() {
              elementorDevTools.deprecation.deprecated('children', '3.0.0', 'container.repeaters[ repeaterName ].children');
              return this.repeaters[repeaters[0].name].children;
            }
          });
        }
      }
    }

    /**
     * Function addRepeaterItem().
     *
     * The method add repeater item, find the repeater control by it name, and create new container for the item.
     *
     * @param {string}         repeaterName
     * @param {Backbone.Model} rowSettingsModel
     * @param {number}         index
     *
     * @return {Container} container
     */
  }, {
    key: "addRepeaterItem",
    value: function addRepeaterItem(repeaterName, rowSettingsModel, index) {
      var rowId = rowSettingsModel.get('_id');

      // TODO: Temp backwards compatibility. since 2.8.0.
      if (!rowId) {
        rowId = 'bc-' + elementorCommon.helpers.getUniqueId();
        rowSettingsModel.set('_id', rowId);
      }
      this.repeaters[repeaterName].children.splice(index, 0, new elementorModules.editor.Container({
        type: Container.TYPE_REPEATER_ITEM,
        id: rowSettingsModel.get('_id'),
        model: new Backbone.Model({
          name: repeaterName
        }),
        settings: rowSettingsModel,
        view: this.view,
        parent: this.repeaters[repeaterName],
        label: this.label + ' ' + __('Item', 'elementor'),
        controls: rowSettingsModel.options.controls,
        renderer: this.renderer
      }));
      return this.repeaters[repeaterName];
    }

    /**
     * Function lookup().
     *
     * If the view were destroyed, try to find it again if it exists.
     *
     * TODO: Refactor.
     *
     * @return {Container} container
     */
  }, {
    key: "lookup",
    value: function lookup() {
      var _this$renderer$view;
      var result = this;
      if (!this.renderer) {
        return this;
      }
      if (this !== this.renderer && (_this$renderer$view = this.renderer.view) !== null && _this$renderer$view !== void 0 && _this$renderer$view.isDisconnected && this.renderer.view.isDisconnected()) {
        this.renderer = this.renderer.lookup();
      }
      if (undefined === this.view || !this.view.lookup || !this.view.isDisconnected()) {
        // Hack For repeater item the result is the parent container.
        if (Container.TYPE_REPEATER_ITEM === this.type) {
          this.settings = this.parent.parent.settings.get(this.model.get('name')).findWhere({
            _id: this.id
          });
        }
        return result;
      }
      var lookup = this.view.lookup();
      if (lookup) {
        result = lookup.getContainer();

        // Hack For repeater item the result is the parent container.
        if (Container.REPEATER === this.type) {
          this.settings = result.settings.get(this.model.get('name')).findWhere({
            _id: this.id
          });
          return this;
        }

        // If lookup were done, new container were created and parent does not know about it.
        if (result.parent.children) {
          result.parent.children[result.view._index] = result;
        }
      }
      return result;
    }
  }, {
    key: "findChildrenRecursive",
    value: function findChildrenRecursive(callback) {
      elementorDevTools.deprecation.deprecated('container.findChildrenRecursive( callback )', '3.5.0', 'container.children.findRecursive( callback )');
      return this.children.findRecursive(callback);
    }
  }, {
    key: "forEachChildrenRecursive",
    value: function forEachChildrenRecursive(callback) {
      elementorDevTools.deprecation.deprecated('container.forEachChildrenRecursive( callback )', '3.5.0', 'container.children.forEachRecursive( callback )');
      return this.children.forEachRecursive(callback);
    }

    /**
     * Function render().
     *
     * Call view render.
     *
     * Run's `this.renderer.view.renderOnChange( this.settings ) `.
     * When `this.renderer` exist.
     *
     */
  }, {
    key: "render",
    value: function render() {
      if (!this.renderer) {
        return;
      }
      this.renderer.view.renderOnChange(this.settings);
    }
  }, {
    key: "renderUI",
    value: function renderUI() {
      if (!this.renderer) {
        return;
      }
      this.renderer.view.renderUI();
    }
  }, {
    key: "isEditable",
    value: function isEditable() {
      return 'edit' === elementor.channels.dataEditMode.request('activeMode') && 'open' === this.document.editor.status;
    }
  }, {
    key: "isDesignable",
    value: function isDesignable() {
      return elementor.userCan('design') && this.isEditable();
    }

    /**
     * @return {boolean}
     */
  }, {
    key: "isLocked",
    value: function isLocked() {
      return this.model.get('isLocked');
    }
  }, {
    key: "isRepeater",
    value: function isRepeater() {
      return Container.TYPE_REPEATER === this.type;
    }
  }, {
    key: "isRepeaterItem",
    value: function isRepeaterItem() {
      return Container.TYPE_REPEATER_ITEM === this.type;
    }
  }, {
    key: "isViewElement",
    value: function isViewElement() {
      return this.view && this.model.get('elType');
    }
  }, {
    key: "getSetting",
    value: function getSetting(name) {
      var localOnly = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var localValue = this.settings.get(name);
      if (localOnly) {
        return localValue;
      }

      // Try to get the value in the order: Global, Local, Global default.
      var globalValue;
      if (this.getGlobalKey(name)) {
        globalValue = this.getGlobalValue(name);
      }
      return globalValue || localValue || this.getGlobalDefault(name);
    }
  }, {
    key: "getGlobalKey",
    value: function getGlobalKey(name) {
      return this.globals.get(name);
    }
  }, {
    key: "getGlobalValue",
    value: function getGlobalValue(name) {
      var control = this.controls[name],
        globalKey = this.getGlobalKey(name),
        globalArgs = $e.data.commandExtractArgs(globalKey),
        data = $e.data.getCache($e.components.get('globals'), globalArgs.command, globalArgs.args.query);
      if (!(data !== null && data !== void 0 && data.value)) {
        return;
      }
      var id = data.id;
      var value;

      // It's a global settings with additional controls in group.
      if (control.groupType) {
        // A regex containing all of the active breakpoints' prefixes ('_mobile', '_tablet' etc.).
        var responsivePrefixRegex = elementor.breakpoints.getActiveMatchRegex();
        var propertyName = control.name.replace(control.groupPrefix, '').replace(responsivePrefixRegex, '');
        if (!data.value[elementor.config.kit_config.typography_prefix + propertyName]) {
          return;
        }
        propertyName = propertyName.replace('_', '-');
        value = "var( --e-global-".concat(control.groupType, "-").concat(id, "-").concat(propertyName, " )");
        if (elementor.config.ui.defaultGenericFonts && control.groupPrefix + 'font_family' === control.name) {
          value += ", ".concat(elementor.config.ui.defaultGenericFonts);
        }
      } else {
        value = "var( --e-global-".concat(control.type, "-").concat(id, " )");
      }
      return value;
    }

    /**
     * Determine if a control's global value is applied.
     * It actually checks if the local value is different than the global value.
     *
     * @param {string} controlName - Control name
     * @return {boolean} true if a control's global value is applied
     */
  }, {
    key: "isGlobalApplied",
    value: function isGlobalApplied(controlName) {
      return this.getSetting(controlName) !== this.settings.get(controlName);
    }
  }, {
    key: "getGlobalDefault",
    value: function getGlobalDefault(controlName) {
      var _this$controls$contro;
      var controlGlobalArgs = (_this$controls$contro = this.controls[controlName]) === null || _this$controls$contro === void 0 ? void 0 : _this$controls$contro.global;
      if (controlGlobalArgs !== null && controlGlobalArgs !== void 0 && controlGlobalArgs.default) {
        // Temp fix.
        var controlType = this.controls[controlName].type;
        if ('color' === controlType) {
          controlType = 'colors';
        }
        // End temp fix

        // If the control is a color/typography control and default colors/typography are disabled, don't return the global value.
        if (!elementor.config.globals.defaults_enabled[controlType]) {
          return '';
        }
        var _$e$data$commandExtra = $e.data.commandExtractArgs(controlGlobalArgs.default),
          command = _$e$data$commandExtra.command,
          args = _$e$data$commandExtra.args,
          result = $e.data.getCache($e.components.get('globals'), command, args.query);
        return result === null || result === void 0 ? void 0 : result.value;
      }

      // No global default.
      return '';
    }
  }]);
  return Container;
}(_argsObject.default);
exports["default"] = Container;
(0, _defineProperty2.default)(Container, "TYPE_REPEATER", 'repeater-control');
(0, _defineProperty2.default)(Container, "TYPE_REPEATER_ITEM", 'repeater');

/***/ }),

/***/ "../assets/dev/js/editor/container/model/children-array.js":
/*!*****************************************************************!*\
  !*** ../assets/dev/js/editor/container/model/children-array.js ***!
  \*****************************************************************/
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
var _wrapNativeSuper2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/wrapNativeSuper */ "../node_modules/@babel/runtime/helpers/wrapNativeSuper.js"));
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2.default)(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2.default)(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2.default)(this, result); }; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
/**
 * @typedef {import('../container')} Container
 */
var ChildrenArray = /*#__PURE__*/function (_Array) {
  (0, _inherits2.default)(ChildrenArray, _Array);
  var _super = _createSuper(ChildrenArray);
  function ChildrenArray() {
    (0, _classCallCheck2.default)(this, ChildrenArray);
    return _super.apply(this, arguments);
  }
  (0, _createClass2.default)(ChildrenArray, [{
    key: "clear",
    value: function clear() {
      this.length = 0;
    }

    /**
     * Function findRecursive().
     *
     * Will run over children recursively and pass the children to the callback till the callback returns positive value.
     *
     * @param {function(Container) : *} callback
     *
     * @return {Container|false} child
     */
  }, {
    key: "findRecursive",
    value: function findRecursive(callback) {
      var _iterator = _createForOfIteratorHelper(this),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var container = _step.value;
          if (callback(container)) {
            return container;
          }
          if (container.children.length) {
            var foundChildren = container.children.findRecursive(callback);
            if (foundChildren) {
              return foundChildren;
            }
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      return false;
    }

    /**
     * Function forEachRecursive().
     *
     * Will run over children recursively.
     *
     * @param {function(Container) : *} callback
     *
     * @return {void}
     */
  }, {
    key: "forEachRecursive",
    value: function forEachRecursive(callback) {
      var _iterator2 = _createForOfIteratorHelper(this),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var container = _step2.value;
          callback(container);
          if (container.children.length) {
            container.children.forEachRecursive(callback);
          }
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    }

    /**
     * Function someRecursive().
     *
     * Will run over children recursively, breaks if the callback return true.
     *
     * @param {function(Container) : *} callback
     *
     */
  }, {
    key: "someRecursive",
    value: function someRecursive(callback) {
      var _iterator3 = _createForOfIteratorHelper(this),
        _step3;
      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var _container$children;
          var container = _step3.value;
          if (callback(container)) {
            return true;
          }
          if ((_container$children = container.children) !== null && _container$children !== void 0 && _container$children.length) {
            if (container.children.someRecursive(callback)) {
              return true;
            }
          }
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
      return false;
    }
  }]);
  return ChildrenArray;
}( /*#__PURE__*/(0, _wrapNativeSuper2.default)(Array));
exports["default"] = ChildrenArray;

/***/ }),

/***/ "../assets/dev/js/editor/container/panel.js":
/*!**************************************************!*\
  !*** ../assets/dev/js/editor/container/panel.js ***!
  \**************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../node_modules/@babel/runtime/helpers/interopRequireDefault.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _classCallCheck2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "../node_modules/@babel/runtime/helpers/classCallCheck.js"));
var _createClass2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/createClass */ "../node_modules/@babel/runtime/helpers/createClass.js"));
/**
 * @typedef {import('./container')} Container
 */
var Panel = /*#__PURE__*/function () {
  /**
   * Function constructor().
   *
   * Create constructor panel.
   *
   * @param {Container} container
   */
  function Panel(container) {
    (0, _classCallCheck2.default)(this, Panel);
    this.container = container;
  }

  /**
   * Function refresh().
   *
   * Refresh the panel.
   */
  (0, _createClass2.default)(Panel, [{
    key: "refresh",
    value: function refresh() {
      if ($e.routes.isPartOf('panel/editor')) {
        $e.routes.refreshContainer('panel');
      }
    }

    /**
     * Function closeEditor().
     *
     * Route to `panel/elements/categories`
     */
  }, {
    key: "closeEditor",
    value: function closeEditor() {
      $e.route('panel/elements/categories');
    }
  }, {
    key: "getControlView",
    value: function getControlView(name) {
      var editor = elementor.getPanelView().getCurrentPageView();
      return editor.children.findByModelCid(this.getControlModel(name).cid);
    }
  }, {
    key: "getControlModel",
    value: function getControlModel(name) {
      var editor = elementor.getPanelView().getCurrentPageView();
      return editor.collection.findWhere({
        name: name
      });
    }
  }]);
  return Panel;
}();
exports["default"] = Panel;

/***/ }),

/***/ "../assets/dev/js/editor/elements/models/base-settings.js":
/*!****************************************************************!*\
  !*** ../assets/dev/js/editor/elements/models/base-settings.js ***!
  \****************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../node_modules/@babel/runtime/helpers/interopRequireDefault.js");
var _typeof2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/typeof */ "../node_modules/@babel/runtime/helpers/typeof.js"));
var BaseSettingsModel;

/**
 * @name BaseSettingsModel
 */
BaseSettingsModel = Backbone.Model.extend({
  options: {},
  initialize: function initialize(data, options) {
    var self = this;

    // Keep the options for cloning
    self.options = options;
    self.controls = elementor.mergeControlsSettings(options.controls);
    self.validators = {};
    if (!self.controls) {
      return;
    }
    var attrs = data || {},
      defaults = {};
    _.each(self.controls, function (control) {
      // Check features since they does not exist in tests.
      var isUIControl = control.features && -1 !== control.features.indexOf('ui');
      if (isUIControl) {
        return;
      }
      var controlName = control.name;
      if ('object' === (0, _typeof2.default)(control.default)) {
        defaults[controlName] = elementorCommon.helpers.cloneObject(control.default);
      } else {
        defaults[controlName] = control.default;
      }
      var isDynamicControl = control.dynamic && control.dynamic.active,
        hasDynamicSettings = isDynamicControl && attrs.__dynamic__ && attrs.__dynamic__[controlName];
      if (isDynamicControl && !hasDynamicSettings && control.dynamic.default) {
        if (!attrs.__dynamic__) {
          attrs.__dynamic__ = {};
        }
        attrs.__dynamic__[controlName] = control.dynamic.default;
        hasDynamicSettings = true;
      }

      // Check if the value is a plain object ( and not an array )
      var isMultipleControl = jQuery.isPlainObject(control.default);
      if (undefined !== attrs[controlName] && isMultipleControl && !_.isObject(attrs[controlName]) && !hasDynamicSettings) {
        elementorCommon.debug.addCustomError(new TypeError('An invalid argument supplied as multiple control value'), 'InvalidElementData', 'Element `' + (self.get('widgetType') || self.get('elType')) + '` got <' + attrs[controlName] + '> as `' + controlName + '` value. Expected array or object.');
        delete attrs[controlName];
      }
      if (undefined === attrs[controlName]) {
        attrs[controlName] = defaults[controlName];
      }
    });
    self.defaults = defaults;
    self.handleRepeaterData(attrs);
    self.set(attrs);
  },
  convertRepeaterValueToCollection: function convertRepeaterValueToCollection(attrs, repeaterControl) {
    return new Backbone.Collection(attrs[repeaterControl.name], {
      model: function model(attributes, options) {
        options = options || {};
        options.controls = {};
        Object.values(repeaterControl.fields).forEach(function (item) {
          options.controls[item.name] = item;
        });

        // TODO: Cannot be deleted, since it handle repeater items after repeater widget creation.
        if (!attributes._id) {
          attributes._id = elementorCommon.helpers.getUniqueId();
        }
        return new BaseSettingsModel(attributes, options);
      }
    });
  },
  handleRepeaterData: function handleRepeaterData(attrs) {
    var self = this;
    _.each(this.controls, function (field) {
      if (field.is_repeater) {
        // TODO: Apply defaults on each field in repeater fields
        if (!(attrs[field.name] instanceof Backbone.Collection)) {
          attrs[field.name] = self.convertRepeaterValueToCollection(attrs, field);
        }
      }
    });
  },
  getFontControls: function getFontControls() {
    return this.getControlsByType('font');
  },
  getIconsControls: function getIconsControls() {
    return this.getControlsByType('icons');
  },
  getControlsByType: function getControlsByType(type) {
    return _.filter(this.getActiveControls(), function (control) {
      return type === control.type;
    });
  },
  getStyleControls: function getStyleControls(controls, attributes) {
    var self = this;
    controls = elementorCommon.helpers.cloneObject(self.getActiveControls(controls, attributes));
    var styleControls = [];
    jQuery.each(controls, function () {
      var _control$dynamic;
      var control = this,
        controlDefaultSettings = elementor.config.controls[control.type];
      control = jQuery.extend({}, controlDefaultSettings, control);
      if (control.fields) {
        var styleFields = [];
        if (!(self.attributes[control.name] instanceof Backbone.Collection)) {
          self.attributes[control.name] = self.convertRepeaterValueToCollection(self.attributes, control);
        }
        self.attributes[control.name].each(function (item) {
          styleFields.push(self.getStyleControls(control.fields, item.attributes));
        });
        control.styleFields = styleFields;
      }
      if (control.fields || (_control$dynamic = control.dynamic) !== null && _control$dynamic !== void 0 && _control$dynamic.active || self.isGlobalControl(control, controls) || self.isStyleControl(control.name, controls)) {
        styleControls.push(control);
      }
    });
    return styleControls;
  },
  isGlobalControl: function isGlobalControl(control, controls) {
    var _globalControl$global, _this$attributes$__gl;
    var controlGlobalKey = control.name;
    if (control.groupType) {
      controlGlobalKey = control.groupPrefix + control.groupType;
    }
    var globalControl = controls[controlGlobalKey];
    if (!((_globalControl$global = globalControl.global) !== null && _globalControl$global !== void 0 && _globalControl$global.active)) {
      return false;
    }
    var globalValue = (_this$attributes$__gl = this.attributes.__globals__) === null || _this$attributes$__gl === void 0 ? void 0 : _this$attributes$__gl[controlGlobalKey];
    return !!globalValue;
  },
  isStyleControl: function isStyleControl(attribute, controls) {
    controls = controls || this.controls;
    var currentControl = _.find(controls, function (control) {
      return attribute === control.name;
    });
    return currentControl && !_.isEmpty(currentControl.selectors);
  },
  getClassControls: function getClassControls(controls) {
    controls = controls || this.controls;
    return _.filter(controls, function (control) {
      return !_.isUndefined(control.prefix_class);
    });
  },
  isClassControl: function isClassControl(attribute) {
    var currentControl = _.find(this.controls, function (control) {
      return attribute === control.name;
    });
    return currentControl && !_.isUndefined(currentControl.prefix_class);
  },
  getControl: function getControl(id) {
    return _.find(this.controls, function (control) {
      return id === control.name;
    });
  },
  getActiveControls: function getActiveControls(controls, attributes) {
    var activeControls = {};
    if (!controls) {
      controls = this.controls;
    }
    if (!attributes) {
      attributes = this.attributes;
    }
    attributes = this.parseGlobalSettings(attributes, controls);
    jQuery.each(controls, function (controlKey, control) {
      if (elementor.helpers.isActiveControl(control, attributes, controls)) {
        activeControls[controlKey] = control;
      }
    });
    return activeControls;
  },
  clone: function clone() {
    return new BaseSettingsModel(elementorCommon.helpers.cloneObject(this.attributes), elementorCommon.helpers.cloneObject(this.options));
  },
  setExternalChange: function setExternalChange(key, value) {
    var self = this,
      settingsToChange;
    if ('object' === (0, _typeof2.default)(key)) {
      settingsToChange = key;
    } else {
      settingsToChange = {};
      settingsToChange[key] = value;
    }
    self.set(settingsToChange);
    jQuery.each(settingsToChange, function (changedKey, changedValue) {
      self.trigger('change:external:' + changedKey, changedValue);
    });
  },
  parseDynamicSettings: function parseDynamicSettings(settings, options, controls) {
    var self = this;
    settings = elementorCommon.helpers.cloneObject(settings || self.attributes);
    options = options || {};
    controls = controls || this.controls;
    jQuery.each(controls, function () {
      var control = this,
        valueToParse;
      if (control.is_repeater) {
        valueToParse = settings[control.name];
        valueToParse.forEach(function (value, key) {
          valueToParse[key] = self.parseDynamicSettings(value, options, control.fields);
        });
        return;
      }
      valueToParse = settings.__dynamic__ && settings.__dynamic__[control.name];
      if (!valueToParse) {
        return;
      }
      var dynamicSettings = control.dynamic;
      if (undefined === dynamicSettings) {
        dynamicSettings = elementor.config.controls[control.type].dynamic;
      }
      if (!dynamicSettings || !dynamicSettings.active) {
        return;
      }
      var dynamicValue;
      try {
        dynamicValue = elementor.dynamicTags.parseTagsText(valueToParse, dynamicSettings, elementor.dynamicTags.getTagDataContent);
      } catch (error) {
        if (elementor.dynamicTags.CACHE_KEY_NOT_FOUND_ERROR !== error.message) {
          throw error;
        }
        dynamicValue = '';
        if (options.onServerRequestStart) {
          options.onServerRequestStart();
        }
        elementor.dynamicTags.refreshCacheFromServer(function () {
          if (options.onServerRequestEnd) {
            options.onServerRequestEnd();
          }
        });
      }
      if (dynamicSettings.property) {
        settings[control.name][dynamicSettings.property] = dynamicValue;
      } else {
        settings[control.name] = dynamicValue;
      }
    });
    return settings;
  },
  parseGlobalSettings: function parseGlobalSettings(settings, controls) {
    var _this = this;
    settings = elementorCommon.helpers.cloneObject(settings);
    controls = controls || this.controls;
    jQuery.each(controls, function (index, control) {
      var _settings$__globals__, _globalSettings;
      var valueToParse;
      if (control.is_repeater) {
        valueToParse = settings[control.name];
        valueToParse.forEach(function (value, key) {
          valueToParse[key] = _this.parseGlobalSettings(value, control.fields);
        });
        return;
      }
      valueToParse = (_settings$__globals__ = settings.__globals__) === null || _settings$__globals__ === void 0 ? void 0 : _settings$__globals__[control.name];
      if (!valueToParse) {
        return;
      }
      var globalSettings = control.global;
      if (undefined === globalSettings) {
        globalSettings = elementor.config.controls[control.type].global;
      }
      if (!((_globalSettings = globalSettings) !== null && _globalSettings !== void 0 && _globalSettings.active)) {
        return;
      }
      var _$e$data$commandExtra = $e.data.commandExtractArgs(valueToParse),
        command = _$e$data$commandExtra.command,
        args = _$e$data$commandExtra.args,
        globalValue = $e.data.getCache($e.components.get('globals'), command, args.query);
      if (control.groupType) {
        settings[control.name] = 'custom';
      } else {
        settings[control.name] = globalValue;
      }
    });
    return settings;
  },
  removeDataDefaults: function removeDataDefaults(data, controls) {
    var _this2 = this;
    jQuery.each(data, function (key) {
      var control = controls[key];
      if (!control) {
        return;
      }

      // TODO: use `save_default` in text|textarea controls.
      if (control.save_default || ('text' === control.type || 'textarea' === control.type) && data[key]) {
        return;
      }
      if (control.is_repeater) {
        data[key].forEach(function (repeaterRow) {
          _this2.removeDataDefaults(repeaterRow, control.fields);
        });
        return;
      }
      if (_.isEqual(data[key], control.default)) {
        delete data[key];
      }
    });
  },
  toJSON: function toJSON(options) {
    var data = Backbone.Model.prototype.toJSON.call(this);
    options = options || {};
    delete data.widgetType;
    delete data.elType;
    delete data.isInner;
    _.each(data, function (attribute, key) {
      if (attribute && attribute.toJSON) {
        data[key] = attribute.toJSON();
      }
    });
    if (options.remove && -1 !== options.remove.indexOf('default')) {
      this.removeDataDefaults(data, this.controls);
    }
    return elementorCommon.helpers.cloneObject(data);
  }
});

/**
 * @name BaseSettingsModel
 */
module.exports = BaseSettingsModel;

/***/ }),

/***/ "../assets/dev/js/editor/elements/views/behaviors/inner-tabs.js":
/*!**********************************************************************!*\
  !*** ../assets/dev/js/editor/elements/views/behaviors/inner-tabs.js ***!
  \**********************************************************************/
/***/ ((module) => {

"use strict";


var InnerTabsBehavior;
InnerTabsBehavior = Marionette.Behavior.extend({
  onRenderCollection: function onRenderCollection() {
    this.handleInnerTabs(this.view);
  },
  handleInnerTabs: function handleInnerTabs(parent) {
    var closedClass = 'elementor-tab-close',
      activeClass = 'elementor-tab-active',
      tabsWrappers = parent.children.filter(function (view) {
        return 'tabs' === view.model.get('type');
      });
    _.each(tabsWrappers, function (view) {
      view.$el.find('.elementor-control-content').remove();
      var tabsId = view.model.get('name'),
        tabs = parent.children.filter(function (childView) {
          return 'tab' === childView.model.get('type') && childView.model.get('tabs_wrapper') === tabsId;
        });
      _.each(tabs, function (childView, index) {
        view._addChildView(childView);
        var tabId = childView.model.get('name'),
          controlsUnderTab = parent.children.filter(function (controlView) {
            return tabId === controlView.model.get('inner_tab');
          });
        if (0 === index) {
          childView.$el.addClass(activeClass);
        } else {
          _.each(controlsUnderTab, function (controlView) {
            controlView.$el.addClass(closedClass);
          });
        }
      });
    });
  },
  onChildviewControlTabClicked: function onChildviewControlTabClicked(childView) {
    var closedClass = 'elementor-tab-close',
      activeClass = 'elementor-tab-active',
      tabClicked = childView.model.get('name'),
      childrenUnderTab = this.view.children.filter(function (view) {
        return 'tab' !== view.model.get('type') && childView.model.get('tabs_wrapper') === view.model.get('tabs_wrapper');
      }),
      siblingTabs = this.view.children.filter(function (view) {
        return 'tab' === view.model.get('type') && childView.model.get('tabs_wrapper') === view.model.get('tabs_wrapper');
      });
    _.each(siblingTabs, function (view) {
      view.$el.removeClass(activeClass);
    });
    childView.$el.addClass(activeClass);
    _.each(childrenUnderTab, function (view) {
      if (view.model.get('inner_tab') === tabClicked) {
        view.$el.removeClass(closedClass);
      } else {
        view.$el.addClass(closedClass);
      }
    });
    elementor.getPanelView().updateScrollbar();
  }
});
module.exports = InnerTabsBehavior;

/***/ }),

/***/ "../assets/dev/js/editor/utils/introduction.js":
/*!*****************************************************!*\
  !*** ../assets/dev/js/editor/utils/introduction.js ***!
  \*****************************************************/
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
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2.default)(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2.default)(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2.default)(this, result); }; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
var _default = /*#__PURE__*/function (_elementorModules$Mod) {
  (0, _inherits2.default)(_default, _elementorModules$Mod);
  var _super = _createSuper(_default);
  function _default() {
    var _this;
    (0, _classCallCheck2.default)(this, _default);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _super.call.apply(_super, [this].concat(args));
    _this.initDialog();
    return _this;
  }
  (0, _createClass2.default)(_default, [{
    key: "getDefaultSettings",
    value: function getDefaultSettings() {
      return {
        dialogType: 'buttons',
        dialogOptions: {
          effects: {
            hide: 'hide',
            show: 'show'
          },
          hide: {
            onBackgroundClick: false
          }
        }
      };
    }
  }, {
    key: "initDialog",
    value: function initDialog() {
      var _this2 = this;
      var dialog;
      this.getDialog = function () {
        if (!dialog) {
          var settings = _this2.getSettings();
          dialog = elementorCommon.dialogsManager.createWidget(settings.dialogType, settings.dialogOptions);
          if (settings.onDialogInitCallback) {
            settings.onDialogInitCallback.call(_this2, dialog);
          }
        }
        return dialog;
      };
    }
  }, {
    key: "show",
    value: function show(target) {
      if (this.introductionViewed) {
        return;
      }
      var dialog = this.getDialog();
      if (target) {
        dialog.setSettings('position', {
          of: target
        });
      }
      dialog.show();
    }
  }, {
    key: "setViewed",
    value: function setViewed() {
      this.introductionViewed = true;
      elementorCommon.ajax.addRequest('introduction_viewed', {
        data: {
          introductionKey: this.getSettings('introductionKey')
        }
      });
    }
  }]);
  return _default;
}(elementorModules.Module);
exports["default"] = _default;

/***/ }),

/***/ "../assets/dev/js/editor/utils/is-instanceof.js":
/*!******************************************************!*\
  !*** ../assets/dev/js/editor/utils/is-instanceof.js ***!
  \******************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
/**
 * Some FileAPI objects such as FileList, DataTransferItem and DataTransferItemList has inconsistency with the retrieved
 * object (from events, etc.) and the actual JavaScript object so a regular instanceof doesn't work. This function can
 * check whether it's instanceof by using the objects constructor and prototype names.
 *
 * @param  object
 * @param  constructors
 * @return {boolean}
 */
var _default = function _default(object, constructors) {
  constructors = Array.isArray(constructors) ? constructors : [constructors];
  var _iterator = _createForOfIteratorHelper(constructors),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var _constructor = _step.value;
      if (object.constructor.name === _constructor.prototype[Symbol.toStringTag]) {
        return true;
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  return false;
};
exports["default"] = _default;

/***/ }),

/***/ "../assets/dev/js/editor/utils/module.js":
/*!***********************************************!*\
  !*** ../assets/dev/js/editor/utils/module.js ***!
  \***********************************************/
/***/ ((module) => {

"use strict";


var EditorModule = elementorModules.Module.extend({
  onInit: function onInit() {
    var _this = this;
    var $window = jQuery(window);
    $window.on('elementor:init-components', this.onElementorInitComponents.bind(this));
    $window.on('elementor:loaded', function () {
      _this.onElementorLoaded();
      elementor.on('document:loaded', _this.onDocumentLoaded.bind(_this));
    });
    $window.on('elementor:init', this.onElementorReady);
  },
  // TODO: Delete as soon as possible.
  getEditorControlView: function getEditorControlView(name) {
    var editor = elementor.getPanelView().getCurrentPageView();
    return editor.children.findByModelCid(this.getEditorControlModel(name).cid);
  },
  // TODO: Delete as soon as possible.
  getEditorControlModel: function getEditorControlModel(name) {
    var editor = elementor.getPanelView().getCurrentPageView();
    return editor.collection.findWhere({
      name: name
    });
  },
  onElementorReady: function onElementorReady() {
    this.onElementorInit();
    elementor.on('frontend:init', this.onElementorFrontendInit.bind(this)).on('preview:loaded', this.onElementorPreviewLoaded.bind(this));
  }
});
EditorModule.prototype.onElementorLoaded = function () {};
EditorModule.prototype.onElementorInit = function () {};
EditorModule.prototype.onElementorPreviewLoaded = function () {};
EditorModule.prototype.onDocumentLoaded = function () {};
EditorModule.prototype.onElementorFrontendInit = function () {};
EditorModule.prototype.onElementorInitComponents = function () {};
module.exports = EditorModule;

/***/ }),

/***/ "../assets/dev/js/editor/views/controls-popover.js":
/*!*********************************************************!*\
  !*** ../assets/dev/js/editor/views/controls-popover.js ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
/* provided dependency */ var __ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n")["__"];


var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../node_modules/@babel/runtime/helpers/interopRequireDefault.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _defineProperty2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "../node_modules/@babel/runtime/helpers/defineProperty.js"));
var _classCallCheck2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "../node_modules/@babel/runtime/helpers/classCallCheck.js"));
var _createClass2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/createClass */ "../node_modules/@babel/runtime/helpers/createClass.js"));
var ControlsPopover = /*#__PURE__*/function () {
  function ControlsPopover(child) {
    (0, _classCallCheck2.default)(this, ControlsPopover);
    this.child = child;
    this.$popover = jQuery('<div>', {
      class: 'elementor-controls-popover'
    });
    child.$el.before(this.$popover);
    this.$popover.append(child.$el);
    this.popoverToggleView = child._parent.children.findByIndex(child._index - 1);

    // Add the "Typography" header to the popover
    if ('typography' === this.child.model.attributes.groupType) {
      this.createPopoverHeader();
    }
  }
  (0, _createClass2.default)(ControlsPopover, [{
    key: "addChild",
    value: function addChild(child) {
      this.$popover.append(child.$el);
    }
  }, {
    key: "createPopoverHeader",
    value: function createPopoverHeader() {
      var _this = this;
      var $popoverToggleControl = this.$popover.prev(),
        // Get the existing reset button.
        $resetLabel = $popoverToggleControl.find('.elementor-control-popover-toggle-reset-label');
      this.$popoverHeader = jQuery('<div>', {
        class: 'e-group-control-header'
      }).html('<span>' + __('Typography', 'elementor') + '</span>');
      this.$headerControlsWrapper = jQuery('<div>', {
        class: 'e-control-tools'
      });

      // Give the reset button the control tool styling, and add a click event so clicking on it closes the popover.
      $resetLabel.addClass('e-control-tool').on('click', function () {
        return _this.onResetButtonClick();
      });

      // Move the popover toggle reset button into the popover header.
      this.$headerControlsWrapper.append($resetLabel);
      this.$popoverHeader.append(this.$headerControlsWrapper);
      var globalConfig = this.popoverToggleView.model.get('global');
      if (globalConfig !== null && globalConfig !== void 0 && globalConfig.active) {
        this.createAddButton();
      }
      this.$popover.prepend(this.$popoverHeader).addClass('e-controls-popover--typography');
    }
  }, {
    key: "onResetButtonClick",
    value: function onResetButtonClick() {
      this.$popover.hide();
      var groupControlName = this.child.model.get('groupPrefix') + 'typography',
        args = {
          container: this.child.options.container,
          settings: (0, _defineProperty2.default)({}, groupControlName, '')
        };
      if (this.child.options.container.globals.get(groupControlName)) {
        // The Disable Globals command applies global settings locally,
        // so disabling the global shouldn't actually change the appearance of the widget.
        $e.run('document/globals/disable', args);
      } else {
        $e.run('document/elements/settings', args);
      }
    }
  }, {
    key: "onAddButtonClick",
    value: function onAddButtonClick() {
      this.popoverToggleView.onAddGlobalButtonClick();
    }
  }, {
    key: "createAddButton",
    value: function createAddButton() {
      var _this2 = this;
      this.$addButton = jQuery('<button>', {
        class: 'e-control-tool'
      }).html(jQuery('<i>', {
        class: 'eicon-plus'
      }));
      this.$headerControlsWrapper.append(this.$addButton);
      this.$addButton.on('click', function () {
        return _this2.onAddButtonClick();
      });
      this.$addButton.tipsy({
        title: function title() {
          return __('Create New Global Font', 'elementor');
        },
        gravity: function gravity() {
          return 's';
        }
      });
    }
  }, {
    key: "destroy",
    value: function destroy() {
      this.$popover.remove();
    }
  }]);
  return ControlsPopover;
}();
exports["default"] = ControlsPopover;

/***/ }),

/***/ "../assets/dev/js/editor/views/controls-stack.js":
/*!*******************************************************!*\
  !*** ../assets/dev/js/editor/views/controls-stack.js ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../node_modules/@babel/runtime/helpers/interopRequireDefault.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _controlsPopover = _interopRequireDefault(__webpack_require__(/*! ./controls-popover */ "../assets/dev/js/editor/views/controls-popover.js"));
var ControlsStack;
ControlsStack = Marionette.CompositeView.extend({
  classes: {
    popover: 'elementor-controls-popover'
  },
  activeTab: null,
  activeSection: null,
  className: function className() {
    return 'elementor-controls-stack';
  },
  templateHelpers: function templateHelpers() {
    return {
      elementData: elementor.getElementData(this.model)
    };
  },
  childViewOptions: function childViewOptions() {
    return {
      // TODO: elementSettingsModel is deprecated since 2.8.0.
      elementSettingsModel: this.model
    };
  },
  ui: function ui() {
    return {
      tabs: '.elementor-panel-navigation-tab',
      reloadButton: '.elementor-update-preview-button'
    };
  },
  events: function events() {
    return {
      'click @ui.reloadButton': 'onReloadButtonClick'
    };
  },
  modelEvents: {
    destroy: 'onModelDestroy'
  },
  behaviors: {
    HandleInnerTabs: {
      behaviorClass: __webpack_require__(/*! elementor-behaviors/inner-tabs */ "../assets/dev/js/editor/elements/views/behaviors/inner-tabs.js")
    }
  },
  initialize: function initialize(options) {
    this.initCollection();
    if (options.tab) {
      this.activeTab = options.tab;
      this.activateFirstSection();
    }
    this.listenTo(elementor.channels.deviceMode, 'change', this.onDeviceModeChange);
  },
  initCollection: function initCollection() {
    this.collection = new Backbone.Collection(_.values(elementor.mergeControlsSettings(this.getOption('controls'))));
  },
  filter: function filter(controlModel) {
    if (controlModel.get('tab') !== this.activeTab) {
      return false;
    }
    if ('section' === controlModel.get('type')) {
      return true;
    }
    var section = controlModel.get('section');
    return !section || section === this.activeSection;
  },
  getControlViewByModel: function getControlViewByModel(model) {
    return this.children.findByModelCid(model.cid);
  },
  getControlViewByName: function getControlViewByName(name) {
    return this.getControlViewByModel(this.getControlModel(name));
  },
  getControlModel: function getControlModel(name) {
    return this.collection.findWhere({
      name: name
    });
  },
  isVisibleSectionControl: function isVisibleSectionControl(sectionControlModel) {
    return this.activeTab === sectionControlModel.get('tab');
  },
  activateTab: function activateTab(tab) {
    this.activeTab = tab;
    this.activateFirstSection();
    this._renderChildren();
    return this;
  },
  activateSection: function activateSection(sectionName) {
    this.activeSection = sectionName;
    return this;
  },
  activateFirstSection: function activateFirstSection() {
    var self = this;
    var sectionControls = self.collection.filter(function (controlModel) {
      return 'section' === controlModel.get('type') && self.isVisibleSectionControl(controlModel);
    });
    var sectionToActivate;
    if (!sectionControls[0]) {
      self.activeSection = null;
      sectionToActivate = null;
    } else {
      sectionToActivate = sectionControls[0].get('name');
    }
    var preActivatedSection = sectionControls.filter(function (controlModel) {
      return self.activeSection === controlModel.get('name');
    });
    if (preActivatedSection[0]) {
      return;
    }
    self.activateSection(sectionToActivate);
    return this;
  },
  getChildView: function getChildView(item) {
    var controlType = item.get('type');
    return elementor.getControlView(controlType);
  },
  getNamespaceArray: function getNamespaceArray() {
    return [elementor.getPanelView().getCurrentPageName()];
  },
  openActiveSection: function openActiveSection() {
    var activeSection = this.activeSection,
      activeSectionView = this.children.filter(function (view) {
        return activeSection === view.model.get('name');
      });
    if (activeSectionView[0]) {
      activeSectionView[0].$el.addClass('elementor-open');
      var eventNamespace = this.getNamespaceArray();
      eventNamespace.push(activeSection, 'activated');
      elementor.channels.editor.trigger(eventNamespace.join(':'), this);
    }
  },
  onRenderCollection: function onRenderCollection() {
    this.openActiveSection();
    ControlsStack.handlePopovers(this);
  },
  onModelDestroy: function onModelDestroy() {
    this.destroy();
  },
  onReloadButtonClick: function onReloadButtonClick() {
    elementor.reloadPreview();
  },
  onDeviceModeChange: function onDeviceModeChange() {
    if ('desktop' === elementor.channels.deviceMode.request('currentMode')) {
      this.$el.removeClass('elementor-responsive-switchers-open');
    }
  },
  onChildviewControlSectionClicked: function onChildviewControlSectionClicked(childView) {
    var isSectionOpen = childView.$el.hasClass('elementor-open');
    this.activateSection(isSectionOpen ? null : childView.model.get('name'));
    this._renderChildren();
  },
  onChildviewResponsiveSwitcherClick: function onChildviewResponsiveSwitcherClick(childView, device) {
    if ('desktop' === device) {
      this.$el.toggleClass('elementor-responsive-switchers-open');
    }
  }
}, {
  handlePopovers: function handlePopovers(view) {
    var popover;
    view.popovers = [];
    this.removePopovers(view);
    view.children.each(function (control) {
      if (popover) {
        popover.addChild(control);
      }
      var popoverData = control.model.get('popover');
      if (!popoverData) {
        return;
      }
      if (popoverData.start) {
        popover = new _controlsPopover.default(control);
        view.popovers.push(popover);
      }
      if (popoverData.end) {
        popover = null;
      }
    });
  },
  removePopovers: function removePopovers(view) {
    view.popovers.forEach(function (popover) {
      return popover.destroy();
    });
  }
});
var _default = ControlsStack;
exports["default"] = _default;

/***/ }),

/***/ "../assets/dev/js/modules/imports/args-object.js":
/*!*******************************************************!*\
  !*** ../assets/dev/js/modules/imports/args-object.js ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../node_modules/@babel/runtime/helpers/interopRequireDefault.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _typeof2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/typeof */ "../node_modules/@babel/runtime/helpers/typeof.js"));
var _classCallCheck2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "../node_modules/@babel/runtime/helpers/classCallCheck.js"));
var _createClass2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/createClass */ "../node_modules/@babel/runtime/helpers/createClass.js"));
var _inherits2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/inherits */ "../node_modules/@babel/runtime/helpers/inherits.js"));
var _possibleConstructorReturn2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/possibleConstructorReturn */ "../node_modules/@babel/runtime/helpers/possibleConstructorReturn.js"));
var _getPrototypeOf2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/getPrototypeOf */ "../node_modules/@babel/runtime/helpers/getPrototypeOf.js"));
var _instanceType = _interopRequireDefault(__webpack_require__(/*! ./instance-type */ "../assets/dev/js/modules/imports/instance-type.js"));
var _isInstanceof = _interopRequireDefault(__webpack_require__(/*! ../../editor/utils/is-instanceof */ "../assets/dev/js/editor/utils/is-instanceof.js"));
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2.default)(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2.default)(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2.default)(this, result); }; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
var ArgsObject = /*#__PURE__*/function (_InstanceType) {
  (0, _inherits2.default)(ArgsObject, _InstanceType);
  var _super = _createSuper(ArgsObject);
  /**
   * Function constructor().
   *
   * Create ArgsObject.
   *
   * @param {{}} args
   */
  function ArgsObject(args) {
    var _this;
    (0, _classCallCheck2.default)(this, ArgsObject);
    _this = _super.call(this);
    _this.args = args;
    return _this;
  }

  /**
   * Function requireArgument().
   *
   * Validate property in args.
   *
   * @param {string} property
   * @param {{}}     args
   *
   * @throws {Error}
   *
   */
  (0, _createClass2.default)(ArgsObject, [{
    key: "requireArgument",
    value: function requireArgument(property) {
      var args = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.args;
      if (!Object.prototype.hasOwnProperty.call(args, property)) {
        throw Error("".concat(property, " is required."));
      }
    }

    /**
     * Function requireArgumentType().
     *
     * Validate property in args using `type === typeof(args.whatever)`.
     *
     * @param {string} property
     * @param {string} type
     * @param {{}}     args
     *
     * @throws {Error}
     *
     */
  }, {
    key: "requireArgumentType",
    value: function requireArgumentType(property, type) {
      var args = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.args;
      this.requireArgument(property, args);
      if ((0, _typeof2.default)(args[property]) !== type) {
        throw Error("".concat(property, " invalid type: ").concat(type, "."));
      }
    }

    /**
     * Function requireArgumentInstance().
     *
     * Validate property in args using `args.whatever instanceof instance`.
     *
     * @param {string} property
     * @param {*}      instance
     * @param {{}}     args
     *
     * @throws {Error}
     *
     */
  }, {
    key: "requireArgumentInstance",
    value: function requireArgumentInstance(property, instance) {
      var args = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.args;
      this.requireArgument(property, args);
      if (!(args[property] instanceof instance) && !(0, _isInstanceof.default)(args[property], instance)) {
        throw Error("".concat(property, " invalid instance."));
      }
    }

    /**
     * Function requireArgumentConstructor().
     *
     * Validate property in args using `type === args.whatever.constructor`.
     *
     * @param {string} property
     * @param {*}      type
     * @param {{}}     args
     *
     * @throws {Error}
     *
     */
  }, {
    key: "requireArgumentConstructor",
    value: function requireArgumentConstructor(property, type) {
      var args = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.args;
      this.requireArgument(property, args);

      // Note: Converting the constructor to string in order to avoid equation issues
      // due to different memory addresses between iframes (window.Object !== window.top.Object).
      if (args[property].constructor.toString() !== type.prototype.constructor.toString()) {
        throw Error("".concat(property, " invalid constructor type."));
      }
    }
  }], [{
    key: "getInstanceType",
    value: function getInstanceType() {
      return 'ArgsObject';
    }
  }]);
  return ArgsObject;
}(_instanceType.default);
exports["default"] = ArgsObject;

/***/ }),

/***/ "../assets/dev/js/modules/imports/instance-type.js":
/*!*********************************************************!*\
  !*** ../assets/dev/js/modules/imports/instance-type.js ***!
  \*********************************************************/
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
var _getPrototypeOf2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/getPrototypeOf */ "../node_modules/@babel/runtime/helpers/getPrototypeOf.js"));
var InstanceType = /*#__PURE__*/function (_Symbol$hasInstance) {
  function InstanceType() {
    var _this = this;
    (0, _classCallCheck2.default)(this, InstanceType);
    // Since anonymous classes sometimes do not get validated by babel, do it manually.
    var target = this instanceof InstanceType ? this.constructor : void 0;
    var prototypes = [];
    while (target.__proto__ && target.__proto__.name) {
      prototypes.push(target.__proto__);
      target = target.__proto__;
    }
    prototypes.reverse().forEach(function (proto) {
      return _this instanceof proto;
    });
  }
  (0, _createClass2.default)(InstanceType, null, [{
    key: _Symbol$hasInstance,
    value: function value(target) {
      /**
       * This is function extending being called each time JS uses instanceOf, since babel use it each time it create new class
       * its give's opportunity to mange capabilities of instanceOf operator.
       * saving current class each time will give option later to handle instanceOf manually.
       */
      var result = (0, _get2.default)((0, _getPrototypeOf2.default)(InstanceType), Symbol.hasInstance, this).call(this, target);

      // Act normal when validate a class, which does not have instance type.
      if (target && !target.constructor.getInstanceType) {
        return result;
      }
      if (target) {
        if (!target.instanceTypes) {
          target.instanceTypes = [];
        }
        if (!result) {
          if (this.getInstanceType() === target.constructor.getInstanceType()) {
            result = true;
          }
        }
        if (result) {
          var name = this.getInstanceType === InstanceType.getInstanceType ? 'BaseInstanceType' : this.getInstanceType();
          if (-1 === target.instanceTypes.indexOf(name)) {
            target.instanceTypes.push(name);
          }
        }
      }
      if (!result && target) {
        // Check if the given 'target', is instance of known types.
        result = target.instanceTypes && Array.isArray(target.instanceTypes) && -1 !== target.instanceTypes.indexOf(this.getInstanceType());
      }
      return result;
    }
  }, {
    key: "getInstanceType",
    value: function getInstanceType() {
      elementorModules.ForceMethodImplementation();
    }
  }]);
  return InstanceType;
}(Symbol.hasInstance);
exports["default"] = InstanceType;

/***/ }),

/***/ "@wordpress/i18n":
/*!**************************!*\
  !*** external "wp.i18n" ***!
  \**************************/
/***/ ((module) => {

"use strict";
module.exports = wp.i18n;

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/arrayLikeToArray.js":
/*!******************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/arrayLikeToArray.js ***!
  \******************************************************************/
/***/ ((module) => {

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;
  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
  return arr2;
}
module.exports = _arrayLikeToArray, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/arrayWithHoles.js":
/*!****************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/arrayWithHoles.js ***!
  \****************************************************************/
/***/ ((module) => {

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}
module.exports = _arrayWithHoles, module.exports.__esModule = true, module.exports["default"] = module.exports;

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

/***/ "../node_modules/@babel/runtime/helpers/classCallCheck.js":
/*!****************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/classCallCheck.js ***!
  \****************************************************************/
/***/ ((module) => {

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
module.exports = _classCallCheck, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/construct.js":
/*!***********************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/construct.js ***!
  \***********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var setPrototypeOf = __webpack_require__(/*! ./setPrototypeOf.js */ "../node_modules/@babel/runtime/helpers/setPrototypeOf.js");
var isNativeReflectConstruct = __webpack_require__(/*! ./isNativeReflectConstruct.js */ "../node_modules/@babel/runtime/helpers/isNativeReflectConstruct.js");
function _construct(Parent, args, Class) {
  if (isNativeReflectConstruct()) {
    module.exports = _construct = Reflect.construct.bind(), module.exports.__esModule = true, module.exports["default"] = module.exports;
  } else {
    module.exports = _construct = function _construct(Parent, args, Class) {
      var a = [null];
      a.push.apply(a, args);
      var Constructor = Function.bind.apply(Parent, a);
      var instance = new Constructor();
      if (Class) setPrototypeOf(instance, Class.prototype);
      return instance;
    }, module.exports.__esModule = true, module.exports["default"] = module.exports;
  }
  return _construct.apply(null, arguments);
}
module.exports = _construct, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/createClass.js":
/*!*************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/createClass.js ***!
  \*************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var toPropertyKey = __webpack_require__(/*! ./toPropertyKey.js */ "../node_modules/@babel/runtime/helpers/toPropertyKey.js");
function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, toPropertyKey(descriptor.key), descriptor);
  }
}
function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  Object.defineProperty(Constructor, "prototype", {
    writable: false
  });
  return Constructor;
}
module.exports = _createClass, module.exports.__esModule = true, module.exports["default"] = module.exports;

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

/***/ "../node_modules/@babel/runtime/helpers/interopRequireDefault.js":
/*!***********************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/interopRequireDefault.js ***!
  \***********************************************************************/
/***/ ((module) => {

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    "default": obj
  };
}
module.exports = _interopRequireDefault, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/isNativeFunction.js":
/*!******************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/isNativeFunction.js ***!
  \******************************************************************/
/***/ ((module) => {

function _isNativeFunction(fn) {
  return Function.toString.call(fn).indexOf("[native code]") !== -1;
}
module.exports = _isNativeFunction, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/isNativeReflectConstruct.js":
/*!**************************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/isNativeReflectConstruct.js ***!
  \**************************************************************************/
/***/ ((module) => {

function _isNativeReflectConstruct() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;
  try {
    Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
    return true;
  } catch (e) {
    return false;
  }
}
module.exports = _isNativeReflectConstruct, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/iterableToArrayLimit.js":
/*!**********************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/iterableToArrayLimit.js ***!
  \**********************************************************************/
/***/ ((module) => {

function _iterableToArrayLimit(arr, i) {
  var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"];
  if (null != _i) {
    var _s,
      _e,
      _x,
      _r,
      _arr = [],
      _n = !0,
      _d = !1;
    try {
      if (_x = (_i = _i.call(arr)).next, 0 === i) {
        if (Object(_i) !== _i) return;
        _n = !1;
      } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0);
    } catch (err) {
      _d = !0, _e = err;
    } finally {
      try {
        if (!_n && null != _i["return"] && (_r = _i["return"](), Object(_r) !== _r)) return;
      } finally {
        if (_d) throw _e;
      }
    }
    return _arr;
  }
}
module.exports = _iterableToArrayLimit, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/nonIterableRest.js":
/*!*****************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/nonIterableRest.js ***!
  \*****************************************************************/
/***/ ((module) => {

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
module.exports = _nonIterableRest, module.exports.__esModule = true, module.exports["default"] = module.exports;

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

/***/ "../node_modules/@babel/runtime/helpers/slicedToArray.js":
/*!***************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/slicedToArray.js ***!
  \***************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var arrayWithHoles = __webpack_require__(/*! ./arrayWithHoles.js */ "../node_modules/@babel/runtime/helpers/arrayWithHoles.js");
var iterableToArrayLimit = __webpack_require__(/*! ./iterableToArrayLimit.js */ "../node_modules/@babel/runtime/helpers/iterableToArrayLimit.js");
var unsupportedIterableToArray = __webpack_require__(/*! ./unsupportedIterableToArray.js */ "../node_modules/@babel/runtime/helpers/unsupportedIterableToArray.js");
var nonIterableRest = __webpack_require__(/*! ./nonIterableRest.js */ "../node_modules/@babel/runtime/helpers/nonIterableRest.js");
function _slicedToArray(arr, i) {
  return arrayWithHoles(arr) || iterableToArrayLimit(arr, i) || unsupportedIterableToArray(arr, i) || nonIterableRest();
}
module.exports = _slicedToArray, module.exports.__esModule = true, module.exports["default"] = module.exports;

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

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/toPrimitive.js":
/*!*************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/toPrimitive.js ***!
  \*************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var _typeof = (__webpack_require__(/*! ./typeof.js */ "../node_modules/@babel/runtime/helpers/typeof.js")["default"]);
function _toPrimitive(input, hint) {
  if (_typeof(input) !== "object" || input === null) return input;
  var prim = input[Symbol.toPrimitive];
  if (prim !== undefined) {
    var res = prim.call(input, hint || "default");
    if (_typeof(res) !== "object") return res;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (hint === "string" ? String : Number)(input);
}
module.exports = _toPrimitive, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/toPropertyKey.js":
/*!***************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/toPropertyKey.js ***!
  \***************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var _typeof = (__webpack_require__(/*! ./typeof.js */ "../node_modules/@babel/runtime/helpers/typeof.js")["default"]);
var toPrimitive = __webpack_require__(/*! ./toPrimitive.js */ "../node_modules/@babel/runtime/helpers/toPrimitive.js");
function _toPropertyKey(arg) {
  var key = toPrimitive(arg, "string");
  return _typeof(key) === "symbol" ? key : String(key);
}
module.exports = _toPropertyKey, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/typeof.js":
/*!********************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/typeof.js ***!
  \********************************************************/
/***/ ((module) => {

function _typeof(obj) {
  "@babel/helpers - typeof";

  return (module.exports = _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  }, module.exports.__esModule = true, module.exports["default"] = module.exports), _typeof(obj);
}
module.exports = _typeof, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/unsupportedIterableToArray.js":
/*!****************************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/unsupportedIterableToArray.js ***!
  \****************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var arrayLikeToArray = __webpack_require__(/*! ./arrayLikeToArray.js */ "../node_modules/@babel/runtime/helpers/arrayLikeToArray.js");
function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return arrayLikeToArray(o, minLen);
}
module.exports = _unsupportedIterableToArray, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/wrapNativeSuper.js":
/*!*****************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/wrapNativeSuper.js ***!
  \*****************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var getPrototypeOf = __webpack_require__(/*! ./getPrototypeOf.js */ "../node_modules/@babel/runtime/helpers/getPrototypeOf.js");
var setPrototypeOf = __webpack_require__(/*! ./setPrototypeOf.js */ "../node_modules/@babel/runtime/helpers/setPrototypeOf.js");
var isNativeFunction = __webpack_require__(/*! ./isNativeFunction.js */ "../node_modules/@babel/runtime/helpers/isNativeFunction.js");
var construct = __webpack_require__(/*! ./construct.js */ "../node_modules/@babel/runtime/helpers/construct.js");
function _wrapNativeSuper(Class) {
  var _cache = typeof Map === "function" ? new Map() : undefined;
  module.exports = _wrapNativeSuper = function _wrapNativeSuper(Class) {
    if (Class === null || !isNativeFunction(Class)) return Class;
    if (typeof Class !== "function") {
      throw new TypeError("Super expression must either be null or a function");
    }
    if (typeof _cache !== "undefined") {
      if (_cache.has(Class)) return _cache.get(Class);
      _cache.set(Class, Wrapper);
    }
    function Wrapper() {
      return construct(Class, arguments, getPrototypeOf(this).constructor);
    }
    Wrapper.prototype = Object.create(Class.prototype, {
      constructor: {
        value: Wrapper,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    return setPrototypeOf(Wrapper, Class);
  }, module.exports.__esModule = true, module.exports["default"] = module.exports;
  return _wrapNativeSuper(Class);
}
module.exports = _wrapNativeSuper, module.exports.__esModule = true, module.exports["default"] = module.exports;

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
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!******************************************!*\
  !*** ../assets/dev/js/editor/modules.js ***!
  \******************************************/


var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../node_modules/@babel/runtime/helpers/interopRequireDefault.js");
var _module = _interopRequireDefault(__webpack_require__(/*! ./utils/module */ "../assets/dev/js/editor/utils/module.js"));
var _introduction = _interopRequireDefault(__webpack_require__(/*! ./utils/introduction */ "../assets/dev/js/editor/utils/introduction.js"));
var _controlsStack = _interopRequireDefault(__webpack_require__(/*! ./views/controls-stack */ "../assets/dev/js/editor/views/controls-stack.js"));
var _baseSettings = _interopRequireDefault(__webpack_require__(/*! ./elements/models/base-settings */ "../assets/dev/js/editor/elements/models/base-settings.js"));
var _container = _interopRequireDefault(__webpack_require__(/*! ./container/container */ "../assets/dev/js/editor/container/container.js"));
elementorModules.editor = {
  elements: {
    models: {
      BaseSettings: _baseSettings.default
    }
  },
  utils: {
    Module: _module.default,
    Introduction: _introduction.default
  },
  views: {
    ControlsStack: _controlsStack.default
  },
  Container: _container.default
};
})();

/******/ })()
;
//# sourceMappingURL=editor-modules.js.map