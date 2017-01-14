/*!
 * Dialogs Manager v3.0.2
 * https://github.com/cobicarmel/dialogs-manager/
 *
 * Copyright Kobi Zaltzberg
 * Released under the MIT license
 * https://github.com/cobicarmel/dialogs-manager/blob/master/LICENSE.txt
 */

(function ($, global) {
	'use strict';

	/*
	 * Dialog Manager
	 */
	var DialogsManager = {
		widgetsTypes: {},
		createWidgetType: function (typeName, properties, Parent) {
			if (!Parent) {
				Parent = this.Widget;
			}

			var WidgetType = function () {

				Parent.apply(this, arguments);
			};

			var prototype = WidgetType.prototype = new Parent(typeName);

			$.extend(prototype, properties);

			prototype.constructor = WidgetType;

			WidgetType.extend = function (typeName, properties) {

				return DialogsManager.createWidgetType(typeName, properties, WidgetType);
			};

			return WidgetType;
		},
		addWidgetType: function (typeName, properties, Parent) {

			if (properties && properties.prototype instanceof this.Widget) {
				return this.widgetsTypes[typeName] = properties;
			}

			return this.widgetsTypes[typeName] = this.createWidgetType(typeName, properties, Parent);
		},
		getWidgetType: function (widgetType) {

			return this.widgetsTypes[widgetType];
		}
	};

	/*
	 * Dialog Manager instances constructor
	 */
	DialogsManager.Instance = function () {

		var self = this,
			elements = {},
			settings = {};

		var initElements = function () {

			elements.body = $('body');
		};

		var initSettings = function (options) {

			var defaultSettings = {
				classPrefix: 'dialog',
				effects: {
					show: 'fadeIn',
					hide: 'fadeOut'
				}
			};

			$.extend(settings, defaultSettings, options);
		};

		this.createWidget = function (widgetType, properties) {

			var WidgetTypeConstructor = DialogsManager.getWidgetType(widgetType),
				widget = new WidgetTypeConstructor(widgetType);

			properties = properties || {};

			widget.init(self, properties);

			widget.setMessage(properties.message);

			return widget;
		};

		this.getSettings = function (property) {

			if (property) {
				return settings[property];
			}

			return Object.create(settings);
		};

		this.init = function (settings) {

			initSettings(settings);

			initElements();

			return self;
		};

		self.init();
	};

	/*
	 * Widget types constructor
	 */
	DialogsManager.Widget = function (widgetName) {

		var self = this,
			settings = {},
			events = {},
			elements = {};

		var bindEvents = function () {

			self.getElements('window').on('keyup', onWindowKeyUp);
		};

		var callEffect = function () {

			var intent = Array.prototype.splice.call( arguments, 0, 1 );

			var effect = settings.effects[intent],
				$widget = elements.widget;

			if ($.isFunction(effect)) {
				effect.apply($widget, arguments);
			}
			else {

				if ($widget[effect]) {
					$widget[effect].apply($widget, arguments);
				}
				else {
					throw 'Reference Error: The effect ' + effect + ' not found';
				}
			}
		};

		var initElements = function () {

			self.addElement('widget');

			self.addElement('message');

			self.addElement('window', window);

			var id = self.getSettings('id');

			if (id) {

				self.getElements('widget').attr('id', id);
			}
		};

		var initSettings = function (parent, userSettings) {

			var parentSettings = parent.getSettings();

			settings = self.getDefaultSettings();

			settings.effects = parentSettings.effects;

			var prefix = parentSettings.classPrefix + '-' + widgetName;

			settings.classes = {
				globalPrefix: parentSettings.classPrefix,
				prefix: prefix,
				widget: 'dialog-widget'
			};

			$.extend(true, settings, userSettings);

			initSettingsEvents();
		};

		var initSettingsEvents = function () {

			var settings = self.getSettings();

			$.each(settings, function (settingKey) {

				var eventName = settingKey.match(/^on([A-Z].*)/);

				if (!eventName) {
					return;
				}

				eventName = eventName[1].charAt(0).toLowerCase() + eventName[1].slice(1);

				self.on(eventName, this);
			});
		};

		var normalizeClassName = function (name) {

			return name.replace(/([a-z])([A-Z])/g, function () {
				return arguments[1] + '-' + arguments[2].toLowerCase();
			});
		};

		var onWindowKeyUp = function(event) {
			var ESC_KEY = 27,
				keyCode = event.which;

			if ( ESC_KEY === keyCode ) {
				self.hide();
			}
		};

		var unbindEvents = function() {

			self.getElements('window').off('keyup', onWindowKeyUp);
		};

		this.addElement = function (name, element, type) {

			var $newElement = elements[name] = $(element || '<div>'),
				className = settings.classes.prefix + '-';

			name = normalizeClassName(name);

			className += name;

			if (!type) {
				type = name;
			}

			className += ' ' + settings.classes.globalPrefix + '-' + type;

			$newElement.addClass(className);

			return $newElement;
		};

		this.getSettings = function (setting) {

			var copy = Object.create(settings);

			if (setting) {
				return copy[setting];
			}

			return copy;
		};

		this.init = function (parent, properties) {

			if (!(parent instanceof DialogsManager.Instance)) {
				throw 'The ' + self.widgetName + ' must to be initialized from an instance of DialogsManager.Instance';
			}

			self.trigger('init', properties);

			initSettings(parent, properties);

			initElements();

			self.buildWidget();

			if (self.attachEvents) {
				self.attachEvents();
			}

			self.on('show', bindEvents);

			self.on('hide', unbindEvents);

			self.trigger('ready');

			return self;
		};

		this.getElements = function (item) {

			return item ? elements[item] : elements;
		};

		this.hide = function () {

			callEffect('hide');

			self.trigger('hide');

			return self;
		};

		this.on = function (eventName, callback) {
			if (!events[eventName]) {
				events[eventName] = [];
			}

			events[eventName].push(callback);

			return self;
		};

		this.setMessage = function (message) {

			elements.message.html(message);

			return self;
		};

		this.show = function (e, userSettings) {

			if (e) {
				e.stopPropagation();
			}

			elements.widget.appendTo('body');

			callEffect('show');

			self.trigger('show', userSettings);

			return self;
		};

		this.trigger = function (eventName, params) {

			var methodName = 'on' + eventName[0].toUpperCase() + eventName.slice(1);

			if (self[methodName]) {
				self[methodName](params);
			}

			var callbacks = events[eventName];

			if (!callbacks) {
				return;
			}

			$.each(callbacks, function (index, callback) {
				callback.call(self, params);
			});
		};
	};

	// Inheritable widget methods
	DialogsManager.Widget.prototype.buildWidget = function () {

		var elements = this.getElements();

		elements.widget.html(elements.message);
	};

	DialogsManager.Widget.prototype.getDefaultSettings = function () {

		return {};
	};

	DialogsManager.Widget.prototype.onHide = function () {
	};

	DialogsManager.Widget.prototype.onShow = function () {
	};

	DialogsManager.Widget.prototype.onInit = function () {
	};

	DialogsManager.Widget.prototype.onReady = function () {
	};

	/*
	 * Default basic widget types
	 */
	DialogsManager.addWidgetType('options', {
		activeKeyUp: function (event) {

			var TAB_KEY = 9;

			if (event.which === TAB_KEY) {

				event.preventDefault();
			}

			if (this.hotKeys[event.which]) {
				this.hotKeys[event.which](this);
			}
		},
		activeKeyDown: function (event) {

			var TAB_KEY = 9;

			if (event.which === TAB_KEY) {
				event.preventDefault();

				var currentButtonIndex = this.focusedButton.index(),
					nextButtonIndex;

				if (event.shiftKey) {

					nextButtonIndex = currentButtonIndex - 1;

					if (nextButtonIndex < 0) {
						nextButtonIndex = this.buttons.length - 1;
					}
				} else {

					nextButtonIndex = currentButtonIndex + 1;

					if (nextButtonIndex >= this.buttons.length) {
						nextButtonIndex = 0;
					}
				}

				this.focusedButton = this.buttons[nextButtonIndex].focus();
			}
		},
		addButton: function (options) {

			var self = this,
				$button = self.addElement(options.name, $('<button>').text(options.text));

			self.buttons.push($button);

			var buttonFn = function () {

				if (self.getSettings('hideOnButtonClick')) {
					self.hide();
				}

				if ($.isFunction(options.callback)) {
					options.callback.call(this, self);
				}
			};

			$button.on('click', buttonFn);

			if (options.hotKey) {
				this.hotKeys[options.hotKey] = buttonFn;
			}

			this.getElements('buttonsWrapper').append($button);

			if (options.focus) {
				this.focusedButton = $button;
			}

			return self;
		},
		bindHotKeys: function () {

			this.getElements('window').on({
				keyup: this.activeKeyUp,
				keydown: this.activeKeyDown
			});
		},
		buildWidget: function () {

			var $widgetHeader = this.addElement('widgetHeader'),
				$widgetContent = this.addElement('widgetContent'),
				$buttonsWrapper = this.addElement('buttonsWrapper');

			var elements = this.getElements();

			$widgetContent.append($widgetHeader, elements.message, $buttonsWrapper);

			elements.widget.html($widgetContent);
		},
		ensureClosureMethods: function () {

			var self = this,
				closureMethodsNames = [
					'placeWidget',
					'activeKeyUp',
					'activeKeyDown'
				];

			$.each(closureMethodsNames, function () {

				var methodName = this,
					oldMethod = self[methodName];

				self[methodName] = function () {
					oldMethod.apply(self, arguments);
				};
			});
		},
		getDefaultSettings: function () {

			return {
				position: {
					my: 'center',
					at: 'center center-100'
				},
				headerMessage: '',
				hideOnButtonClick: true,
				refreshPosition: true
			};
		},
		onHide: function () {

			this.unbindHotKeys();

			this.getElements('window').off('resize', this.placeWidget);
		},
		onInit: function () {

			this.ensureClosureMethods();

			this.buttons = [];

			this.hotKeys = {};

			this.focusedButton = null;
		},
		onReady: function(){

			this.setHeaderMessage(this.getSettings('headerMessage'));
		},
		onShow: function (userSettings) {

			var self = this;

			self.placeWidget(userSettings);

			if (self.getSettings('refreshPosition')) {

				self.getElements('window').on('resize',  self.placeWidget);
			}

			self.bindHotKeys();

			if (!self.focusedButton) {
				self.focusedButton = self.buttons[0];
			}

			if (self.focusedButton) {
				self.focusedButton.focus();
			}
		},
		placeWidget: function (userSettings) {

			var elements = this.getElements(),
				position = this.getSettings('position');

			position.of = elements.widget;

			if (userSettings) {
				$.extend(position, userSettings);
			}

			elements.widgetContent.position(position);
		},
		setHeaderMessage: function (message) {

			this.getElements('widgetHeader').html(message);

			return this;
		},
		unbindHotKeys: function () {

			this.getElements('window').off({
				keyup: this.activeKeyUp,
				keydown: this.activeKeyDown
			});
		}
	});

	DialogsManager.addWidgetType('confirm', DialogsManager.getWidgetType('options').extend('confirm', {
		onReady: function () {

			DialogsManager.getWidgetType('options').prototype.onReady.apply(this, arguments);

			var strings = this.getSettings('strings'),
				isDefaultCancel = this.getSettings('defaultOption') === 'cancel';

			this.addButton({
				name: 'cancel',
				text: strings.cancel,
				callback: function (widget) {

					widget.trigger('cancel');
				},
				focus: isDefaultCancel
			});

			this.addButton({
				name: 'ok',
				text: strings.confirm,
				callback: function (widget) {

					widget.trigger('confirm');
				},
				focus: !isDefaultCancel
			});
		},
		getDefaultSettings: function () {

			var settings = DialogsManager.getWidgetType('options').prototype.getDefaultSettings.apply(this, arguments);

			settings.strings = {
				confirm: 'OK',
				cancel: 'Cancel'
			};

			settings.defaultOption = 'cancel';

			return settings;
		}
	}));

	DialogsManager.addWidgetType('alert', DialogsManager.getWidgetType('options').extend('alert', {
		onReady: function () {

			DialogsManager.getWidgetType('options').prototype.onReady.apply(this, arguments);

			var strings = this.getSettings('strings');

			this.addButton({
				name: 'ok',
				text: strings.confirm,
				callback: function (widget) {

					widget.trigger('confirm');
				}
			});
		},
		getDefaultSettings: function () {
			var settings = DialogsManager.getWidgetType('options').prototype.getDefaultSettings.apply(this, arguments);

			settings.strings = {
				confirm: 'OK'
			};

			return settings;
		}
	}));

	DialogsManager.addWidgetType('popup', {
		getDefaultSettings: function () {

			return {
				position: {
					my: 'center',
					at: 'center',
					of: window
				},
				hide: {
					delay: 5000
				}
			};
		},
		onShow: function () {

			this.getElements('message').position(this.getSettings('position'));

			setTimeout(this.hide, this.getSettings('hide').delay);
		}
	});

	// Exporting the DialogsManager variable to global
	global.DialogsManager = DialogsManager;
})(typeof require === 'function' ? require('jquery') : jQuery, typeof module !== 'undefined' ? module.exports : window);