/*!
 * Dialogs Manager v2.1.0
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
			components = {},
			settings = {};

		var initComponents = function () {

			components.$body = $('body');
		};

		var initSettings = function (options) {

			var defaultSettings = {
				classPrefix: 'dialog',
				effects: {
					show: 'fadeIn',
					hide: 'fadeOut'
				}
			};

			settings = $.extend(defaultSettings, options);
		};

		this.createWidget = function (widgetType, properties) {

			var WidgetTypeConstructor = DialogsManager.getWidgetType(widgetType),
				widget = new WidgetTypeConstructor(widgetType);

			properties = properties || {};

			widget.init(self, properties);

			widget.setMessage(properties.message);

			if (properties.linkedElement) {
				widget.linkElement(properties.linkedElement, widget);
			}

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

			initComponents();

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
			components = {
				$element: 0
			};

		var callEffect = function (intent) {

			var effect = settings.effects[intent],
				$widget = components.$widget;

			if ($.isFunction(effect)) {
				effect.call($widget);
			}
			else {

				if ($widget[effect]) {
					$widget[effect]();
				}
				else {
					throw 'Reference Error: The effect ' + effect + ' not found';
				}
			}
		};

		var initComponents = function () {

			self.addComponent('widget');

			self.addComponent('message');

			var id = self.getSettings('id');

			if (id) {

				self.getComponents('widget').attr('id', id);
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
				widget: 'dialog-widget',
				linkedActive: prefix + '-linked-active'
			};

			$.extend(true, settings, userSettings);

			initSettingsEvents();
		};

		var initSettingsEvents = function () {

			var settings = self.getSettings();

			$.each( settings, function (settingKey) {

				var eventName = settingKey.match(/^on([A-Z].*)/);

				if (!eventName) {
					return;
				}

				eventName = eventName[1].charAt(0).toLowerCase() + eventName[1].slice(1);

				self.on(eventName, this);
			} );
		};

		var normalizeClassName = function (name) {

			return name.replace(/([a-z])([A-Z])/g, function () {
				return arguments[1] + '-' + arguments[2].toLowerCase();
			});
		};

		this.addComponent = function (name, component, type) {

			var $newComponent = components['$' + name] = $(component || '<div>'),
				className = settings.classes.prefix + '-';

			name = normalizeClassName(name);

			className += name;

			if (!type) {
				type = name;
			}

			className += ' ' + settings.classes.globalPrefix + '-' + type;

			$newComponent.addClass(className);

			return $newComponent;
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

			initComponents();

			self.buildWidget();

			if (self.attachEvents) {
				self.attachEvents();
			}

			self.trigger('ready');

			return self;
		};

		this.getComponents = function (item) {

			return item ? components['$' + item] : components;
		};

		this.hide = function () {

			callEffect('hide');

			if (components.$element.length) {
				components.$element.removeClass(settings.classes.linkedActive);
			}

			self.trigger('hide');

			return self;
		};

		this.linkElement = function (element) {

			this.addComponent('element', element);

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

			components.$message.html(message);

			return self;
		};

		this.show = function (e, userSettings) {

			if (e) {
				e.stopPropagation();
			}

			components.$widget.appendTo('body');

			callEffect('show');

			if (components.$element.length) {
				components.$element.addClass(settings.classes.linkedActive);
			}

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

		var components = this.getComponents();

		components.$widget.html(components.$message);
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
	DialogsManager.addWidgetType('tool-tip', {
		onShow: function () {

			var components = this.getComponents();

			if (components.$element.length) {

				components.$widget.position({
					at: 'left top-5',
					my: 'left+10 bottom',
					of: components.$element,
					collision: 'none none'
				});

				components.$element.focus();
			}

			setTimeout(this.hide, 5000);
		}
	});

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
				$button = self.addComponent(options.name, $('<button>').text(options.text));

			self.buttons.push($button);

			var buttonFn = function () {

				self.hide();

				if ($.isFunction(options.callback)) {
					options.callback.call(this, self);
				}
			};

			$button.on('click', buttonFn);

			if (options.hotKey) {
				this.hotKeys[options.hotKey] = buttonFn;
			}

			this.getComponents('buttonsWrapper').append($button);

			if (options.focus) {
				this.focusedButton = $button;
			}

			return self;
		},
		bindHotKeys: function () {
			var self = this;

			self.bindKeyUpEvents = function (event) {

				self.activeKeyUp(event);
			};

			self.bindKeyDownEvents = function (event) {

				self.activeKeyDown(event);
			};

			$(window).on({
				keyup: self.bindKeyUpEvents,
				keydown: self.bindKeyDownEvents
			});
		},
		buildWidget: function () {

			var $widgetHeader = this.addComponent('widgetHeader'),
				$widgetContent = this.addComponent('widgetContent'),
				$buttonsWrapper = this.addComponent('buttonsWrapper');

			var components = this.getComponents();

			$widgetContent.append($widgetHeader, components.$message, $buttonsWrapper);

			components.$widget.html($widgetContent);
		},
		getDefaultSettings: function () {

			return {
				position: {
					my: 'center',
					at: 'center center-100'
				},
				headerMessage: ''
			};
		},
		onHide: function () {

			this.unbindHotKeys();
		},
		onInit: function () {

			this.buttons = [];

			this.hotKeys = {};

			this.focusedButton = null;
		},
		onReady: function(){

			this.setHeaderMessage(this.getSettings('headerMessage'));
		},
		onShow: function (userSettings) {

			var components = this.getComponents(),
				position = this.getSettings('position');

			position.of = components.$widget;

			if (userSettings) {
				$.extend(position, userSettings);
			}

			components.$widgetContent.position(position);

			this.bindHotKeys();

			if (!this.focusedButton) {
				this.focusedButton = this.buttons[0];
			}

			if (this.focusedButton) {
				this.focusedButton.focus();
			}
		},
		setHeaderMessage: function (message) {

			this.getComponents('widgetHeader').html(message);

			return this;
		},
		unbindHotKeys: function () {

			$(window).off({
				keyup: this.bindKeyUpEvents,
				keydown: this.bindKeyDownEvents
			});
		}
	});

	DialogsManager.addWidgetType('confirm', DialogsManager.getWidgetType('options').extend('confirm', {
		onReady: function () {

			DialogsManager.getWidgetType('options').prototype.onReady.apply(this, arguments);

			var strings = this.getSettings('strings'),
				ESC_KEY = 27,
				isDefaultCancel = this.getSettings('defaultOption') === 'cancel';

			this.addButton({
				name: 'cancel',
				text: strings.cancel,
				callback: function (widget) {

					widget.trigger('cancel');
				},
				hotKey: ESC_KEY,
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

			var $widgetMessage = this.getComponents('message');

			$widgetMessage.position(this.getSettings('position'));

			setTimeout(this.hide, this.getSettings('hide').delay);
		}
	});

	// Exporting the DialogsManager variable to global
	global.DialogsManager = DialogsManager;
})('function' === typeof require ? require('jquery') : jQuery, 'undefined' !== typeof module && module.exports || window);