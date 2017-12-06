(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
( function( $ ) {
	'use strict';

	var ElementorAdminApp = {

		maintenanceMode: null,

		cacheElements: function() {
			this.cache = {
				$window: $( window ),
				$body: $( 'body' ),
				$switchMode: $( '#elementor-switch-mode' ),
				$goToEditLink: $( '#elementor-go-to-edit-page-link' ),
				$switchModeInput: $( '#elementor-switch-mode-input' ),
				$switchModeButton: $( '#elementor-switch-mode-button' ),
				$elementorLoader: $( '.elementor-loader' ),
				$builderEditor: $( '#elementor-editor' ),
				$importButton: $( '#elementor-import-template-trigger' ),
				$importArea: $( '#elementor-import-template-area' ),
				$settingsForm: $( '#elementor-settings-form' ),
				$settingsTabsWrapper: $( '#elementor-settings-tabs-wrapper' )
			};

			this.cache.$settingsFormPages = this.cache.$settingsForm.find( '.elementor-settings-form-page' );

			this.cache.$activeSettingsPage = this.cache.$settingsFormPages.filter( '.elementor-active' );

			this.cache.$settingsTabs = this.cache.$settingsTabsWrapper.children();

			this.cache.$activeSettingsTab = this.cache.$settingsTabs.filter( '.nav-tab-active' );
		},

		toggleStatus: function() {
			var isElementorMode = this.isElementorMode();

			this.cache.$body
			    .toggleClass( 'elementor-editor-active', isElementorMode )
			    .toggleClass( 'elementor-editor-inactive', ! isElementorMode );
		},

		bindEvents: function() {
			var self = this;

			self.cache.$switchModeButton.on( 'click', function( event ) {
				event.preventDefault();

				if ( self.isElementorMode() ) {
					self.cache.$switchModeInput.val( '' );
				} else {
					self.cache.$switchModeInput.val( true );

					var $wpTitle = $( '#title' );

					if ( ! $wpTitle.val() ) {
						$wpTitle.val( 'Elementor #' + $( '#post_ID' ).val() );
					}

					if ( wp.autosave ) {
						wp.autosave.server.triggerSave();
					}

					self.animateLoader();

					$( document ).on( 'heartbeat-tick.autosave', function() {
						self.cache.$window.off( 'beforeunload.edit-post' );

						window.location = self.cache.$goToEditLink.attr( 'href' );
					} );
				}

				self.toggleStatus();
			} );

			self.cache.$goToEditLink.on( 'click', function() {
				self.animateLoader();
			} );

			$( 'div.notice.elementor-message-dismissed' ).on( 'click', 'button.notice-dismiss', function( event ) {
				event.preventDefault();

				$.post( ajaxurl, {
					action: 'elementor_set_admin_notice_viewed',
					notice_id: $( this ).closest( '.elementor-message-dismissed' ).data( 'notice_id' )
				} );
			} );

			$( '#elementor-clear-cache-button' ).on( 'click', function( event ) {
				event.preventDefault();
				var $thisButton = $( this );

				$thisButton.removeClass( 'success' ).addClass( 'loading' );

				$.post( ajaxurl, {
					action: 'elementor_clear_cache',
					_nonce: $thisButton.data( 'nonce' )
				} )
					.done( function() {
						$thisButton.removeClass( 'loading' ).addClass( 'success' );
					} );
			} );

			$( '#elementor-library-sync-button' ).on( 'click', function( event ) {
				event.preventDefault();
				var $thisButton = $( this );

				$thisButton.removeClass( 'success' ).addClass( 'loading' );

				$.post( ajaxurl, {
					action: 'elementor_reset_library',
					_nonce: $thisButton.data( 'nonce' )
				} )
					.done( function() {
						$thisButton.removeClass( 'loading' ).addClass( 'success' );
					} );
			} );

			$( '#elementor-replace-url-button' ).on( 'click', function( event ) {
				event.preventDefault();
				var $this = $( this ),
					$tr = $this.parents( 'tr' ),
					$from = $tr.find( '[name="from"]' ),
					$to = $tr.find( '[name="to"]' );

				$this.removeClass( 'success' ).addClass( 'loading' );

				$.post( ajaxurl, {
					action: 'elementor_replace_url',
					from: $from.val(),
					to: $to.val(),
					_nonce: $this.data( 'nonce' )
				} )
					.done( function( response ) {
						$this.removeClass( 'loading' );

						if ( response.success ) {
							$this.addClass( 'success' );
						}

						var dialogsManager = new DialogsManager.Instance();
							dialogsManager.createWidget( 'alert', {
								message: response.data
							} ).show();
					} );
			} );

			self.cache.$settingsTabs.on( {
				click: function( event ) {
					event.preventDefault();

					event.currentTarget.focus(); // Safari does not focus the tab automatically
				},
				focus: function() { // Using focus event to enable navigation by tab key
					var hrefWithoutHash = location.href.replace( /#.*/, '' );

					history.pushState( {}, '', hrefWithoutHash + this.hash );

					self.goToSettingsTabFromHash();
				}
			} );

			$( '.elementor-rollback-button' ).on( 'click', function( event ) {
				event.preventDefault();

				var $this = $( this ),
					dialogsManager = new DialogsManager.Instance();

				dialogsManager.createWidget( 'confirm', {
					headerMessage: ElementorAdminConfig.i18n.rollback_to_previous_version,
					message: ElementorAdminConfig.i18n.rollback_confirm,
					strings: {
						confirm: ElementorAdminConfig.i18n.yes,
						cancel: ElementorAdminConfig.i18n.cancel
					},
					onConfirm: function() {
						$this.addClass( 'loading' );

						location.href = $this.attr( 'href' );
					}
				} ).show();
			} );

			$( '.elementor_css_print_method select' ).on( 'change', function() {
				var $descriptions = $( '.elementor-css-print-method-description' );

				$descriptions.hide();
				$descriptions.filter( '[data-value="' + $( this ).val() + '"]' ).show();
			} ).trigger( 'change' );
		},

		init: function() {
			this.cacheElements();

			this.bindEvents();

			this.initTemplatesImport();

			this.initMaintenanceMode();

			this.goToSettingsTabFromHash();
		},

		initTemplatesImport: function() {
			if ( ! this.cache.$body.hasClass( 'post-type-elementor_library' ) ) {
				return;
			}

			var self = this,
				$importButton = self.cache.$importButton,
				$importArea = self.cache.$importArea;

			self.cache.$formAnchor = $( 'h1' );

			$( '#wpbody-content' ).find( '.page-title-action:last' ).after( $importButton );

			self.cache.$formAnchor.after( $importArea );

			$importButton.on( 'click', function() {
				$( '#elementor-import-template-area' ).toggle();
			} );
		},

		initMaintenanceMode: function() {
			var MaintenanceMode = require( 'elementor-admin/maintenance-mode' );

			this.maintenanceMode = new MaintenanceMode();
		},

		isElementorMode: function() {
			return !! this.cache.$switchModeInput.val();
		},

		animateLoader: function() {
			this.cache.$goToEditLink.addClass( 'elementor-animate' );
		},

		goToSettingsTabFromHash: function() {
			var hash = location.hash.slice( 1 );

			if ( hash ) {
				this.goToSettingsTab( hash );
			}
		},

		goToSettingsTab: function( tabName ) {
			var $activePage = this.cache.$settingsFormPages.filter( '#' + tabName );

			if ( ! $activePage.length ) {
				return;
			}

			this.cache.$activeSettingsPage.removeClass( 'elementor-active' );

			this.cache.$activeSettingsTab.removeClass( 'nav-tab-active' );

			var $activeTab = this.cache.$settingsTabs.filter( '#elementor-settings-' + tabName );

			$activePage.addClass( 'elementor-active' );

			$activeTab.addClass( 'nav-tab-active' );

			this.cache.$settingsForm.attr( 'action', 'options.php#' + tabName  );

			this.cache.$activeSettingsPage = $activePage;

			this.cache.$activeSettingsTab = $activeTab;
		}
	};

	$( function() {
		ElementorAdminApp.init();
	} );

	window.elementorAdmin = ElementorAdminApp;
}( jQuery ) );

},{"elementor-admin/maintenance-mode":2}],2:[function(require,module,exports){
var ViewModule = require( 'elementor-utils/view-module' ),
	MaintenanceModeModule;

MaintenanceModeModule = ViewModule.extend( {
	getDefaultSettings: function() {
		return {
			selectors: {
				modeSelect: '.elementor_maintenance_mode_mode select',
				maintenanceModeTable: '#tab-maintenance_mode table',
				maintenanceModeDescriptions: '.elementor-maintenance-mode-description',
				excludeModeSelect: '.elementor_maintenance_mode_exclude_mode select',
				excludeRolesArea: '.elementor_maintenance_mode_exclude_roles',
				templateSelect: '.elementor_maintenance_mode_template_id select',
				editTemplateButton: '.elementor-edit-template',
				maintenanceModeError: '.elementor-maintenance-mode-error'
			},
			classes: {
				isEnabled: 'elementor-maintenance-mode-is-enabled'
			}
		};
	},

	getDefaultElements: function() {
		var elements = {},
			selectors = this.getSettings( 'selectors' );

		elements.$modeSelect = jQuery( selectors.modeSelect );
		elements.$maintenanceModeTable = elements.$modeSelect.parents( selectors.maintenanceModeTable );
		elements.$excludeModeSelect = elements.$maintenanceModeTable.find( selectors.excludeModeSelect );
		elements.$excludeRolesArea = elements.$maintenanceModeTable.find( selectors.excludeRolesArea );
		elements.$templateSelect = elements.$maintenanceModeTable.find( selectors.templateSelect );
		elements.$editTemplateButton = elements.$maintenanceModeTable.find( selectors.editTemplateButton );
		elements.$maintenanceModeDescriptions = elements.$maintenanceModeTable.find( selectors.maintenanceModeDescriptions );
		elements.$maintenanceModeError = elements.$maintenanceModeTable.find( selectors.maintenanceModeError );

		return elements;
	},

	bindEvents: function() {
		var settings = this.getSettings(),
			elements = this.elements;

		elements.$modeSelect.on( 'change', function() {
			elements.$maintenanceModeTable.toggleClass( settings.classes.isEnabled, !! elements.$modeSelect.val() );
			elements.$maintenanceModeDescriptions.hide();
			elements.$maintenanceModeDescriptions.filter( '[data-value="' + elements.$modeSelect.val() + '"]' ).show();
		} ).trigger( 'change' );

		elements.$excludeModeSelect.on( 'change', function() {
			elements.$excludeRolesArea.toggle( 'custom' === elements.$excludeModeSelect.val() );
		} ).trigger( 'change' );

		elements.$templateSelect.on( 'change', function() {
			var templateID = elements.$templateSelect.val();

			if ( ! templateID ) {
				elements.$editTemplateButton.hide();
				elements.$maintenanceModeError.show();
				return;
			}

			var editUrl = ElementorAdminConfig.home_url + '?p=' + templateID + '&elementor';

			elements.$editTemplateButton
				.prop( 'href', editUrl )
				.show();
			elements.$maintenanceModeError.hide();
		} ).trigger( 'change' );
	}
} );

module.exports = MaintenanceModeModule;

},{"elementor-utils/view-module":4}],3:[function(require,module,exports){
var Module = function() {
	var $ = jQuery,
		instanceParams = arguments,
		self = this,
		settings,
		events = {};

	var ensureClosureMethods = function() {
		$.each( self, function( methodName ) {
			var oldMethod = self[ methodName ];

			if ( 'function' !== typeof oldMethod ) {
				return;
			}

			self[ methodName ] = function() {
				return oldMethod.apply( self, arguments );
			};
		});
	};

	var initSettings = function() {
		settings = self.getDefaultSettings();

		var instanceSettings = instanceParams[0];

		if ( instanceSettings ) {
			$.extend( settings, instanceSettings );
		}
	};

	var init = function() {
		self.__construct.apply( self, instanceParams );

		ensureClosureMethods();

		initSettings();

		self.trigger( 'init' );
	};

	this.getItems = function( items, itemKey ) {
		if ( itemKey ) {
			var keyStack = itemKey.split( '.' ),
				currentKey = keyStack.splice( 0, 1 );

			if ( ! keyStack.length ) {
				return items[ currentKey ];
			}

			if ( ! items[ currentKey ] ) {
				return;
			}

			return this.getItems(  items[ currentKey ], keyStack.join( '.' ) );
		}

		return items;
	};

	this.getSettings = function( setting ) {
		return this.getItems( settings, setting );
	};

	this.setSettings = function( settingKey, value, settingsContainer ) {
		if ( ! settingsContainer ) {
			settingsContainer = settings;
		}

		if ( 'object' === typeof settingKey ) {
			$.extend( settingsContainer, settingKey );

			return self;
		}

		var keyStack = settingKey.split( '.' ),
			currentKey = keyStack.splice( 0, 1 );

		if ( ! keyStack.length ) {
			settingsContainer[ currentKey ] = value;

			return self;
		}

		if ( ! settingsContainer[ currentKey ] ) {
			settingsContainer[ currentKey ] = {};
		}

		return self.setSettings( keyStack.join( '.' ), value, settingsContainer[ currentKey ] );
	};

	this.forceMethodImplementation = function( methodArguments ) {
		var functionName = methodArguments.callee.name;

		throw new ReferenceError( 'The method ' + functionName + ' must to be implemented in the inheritor child.' );
	};

	this.on = function( eventName, callback ) {
		if ( 'object' === typeof eventName ) {
			$.each( eventName, function( singleEventName ) {
				self.on( singleEventName, this );
			} );

			return self;
		}

		var eventNames = eventName.split( ' ' );

		eventNames.forEach( function( singleEventName ) {
			if ( ! events[ singleEventName ] ) {
				events[ singleEventName ] = [];
			}

			events[ singleEventName ].push( callback );
		} );

		return self;
	};

	this.off = function( eventName, callback ) {
		if ( ! events[ eventName ] ) {
			return self;
		}

		if ( ! callback ) {
			delete events[ eventName ];

			return self;
		}

		var callbackIndex = events[ eventName ].indexOf( callback );

		if ( -1 !== callbackIndex ) {
			delete events[ eventName ][ callbackIndex ];
		}

		return self;
	};

	this.trigger = function( eventName ) {
		var methodName = 'on' + eventName[ 0 ].toUpperCase() + eventName.slice( 1 ),
			params = Array.prototype.slice.call( arguments, 1 );

		if ( self[ methodName ] ) {
			self[ methodName ].apply( self, params );
		}

		var callbacks = events[ eventName ];

		if ( ! callbacks ) {
			return self;
		}

		$.each( callbacks, function( index, callback ) {
			callback.apply( self, params );
		} );

		return self;
	};

	init();
};

Module.prototype.__construct = function() {};

Module.prototype.getDefaultSettings = function() {
	return {};
};

Module.extendsCount = 0;

Module.extend = function( properties ) {
	var $ = jQuery,
		parent = this;

	var child = function() {
		return parent.apply( this, arguments );
	};

	$.extend( child, parent );

	child.prototype = Object.create( $.extend( {}, parent.prototype, properties ) );

	child.prototype.constructor = child;

	/*
	 * Constructor ID is used to set an unique ID
     * to every extend of the Module.
     *
	 * It's useful in some cases such as unique
	 * listener for frontend handlers.
	 */
	var constructorID = ++Module.extendsCount;

	child.prototype.getConstructorID = function() {
		return constructorID;
	};

	child.__super__ = parent.prototype;

	return child;
};

module.exports = Module;

},{}],4:[function(require,module,exports){
var Module = require( './module' ),
	ViewModule;

ViewModule = Module.extend( {
	elements: null,

	getDefaultElements: function() {
		return {};
	},

	bindEvents: function() {},

	onInit: function() {
		this.initElements();

		this.bindEvents();
	},

	initElements: function() {
		this.elements = this.getDefaultElements();
	}
} );

module.exports = ViewModule;

},{"./module":3}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhc3NldHMvZGV2L2pzL2FkbWluL2FkbWluLmpzIiwiYXNzZXRzL2Rldi9qcy9hZG1pbi9tYWludGVuYW5jZS1tb2RlLmpzIiwiYXNzZXRzL2Rldi9qcy91dGlscy9tb2R1bGUuanMiLCJhc3NldHMvZGV2L2pzL3V0aWxzL3ZpZXctbW9kdWxlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIoIGZ1bmN0aW9uKCAkICkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0dmFyIEVsZW1lbnRvckFkbWluQXBwID0ge1xuXG5cdFx0bWFpbnRlbmFuY2VNb2RlOiBudWxsLFxuXG5cdFx0Y2FjaGVFbGVtZW50czogZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGlzLmNhY2hlID0ge1xuXHRcdFx0XHQkd2luZG93OiAkKCB3aW5kb3cgKSxcblx0XHRcdFx0JGJvZHk6ICQoICdib2R5JyApLFxuXHRcdFx0XHQkc3dpdGNoTW9kZTogJCggJyNlbGVtZW50b3Itc3dpdGNoLW1vZGUnICksXG5cdFx0XHRcdCRnb1RvRWRpdExpbms6ICQoICcjZWxlbWVudG9yLWdvLXRvLWVkaXQtcGFnZS1saW5rJyApLFxuXHRcdFx0XHQkc3dpdGNoTW9kZUlucHV0OiAkKCAnI2VsZW1lbnRvci1zd2l0Y2gtbW9kZS1pbnB1dCcgKSxcblx0XHRcdFx0JHN3aXRjaE1vZGVCdXR0b246ICQoICcjZWxlbWVudG9yLXN3aXRjaC1tb2RlLWJ1dHRvbicgKSxcblx0XHRcdFx0JGVsZW1lbnRvckxvYWRlcjogJCggJy5lbGVtZW50b3ItbG9hZGVyJyApLFxuXHRcdFx0XHQkYnVpbGRlckVkaXRvcjogJCggJyNlbGVtZW50b3ItZWRpdG9yJyApLFxuXHRcdFx0XHQkaW1wb3J0QnV0dG9uOiAkKCAnI2VsZW1lbnRvci1pbXBvcnQtdGVtcGxhdGUtdHJpZ2dlcicgKSxcblx0XHRcdFx0JGltcG9ydEFyZWE6ICQoICcjZWxlbWVudG9yLWltcG9ydC10ZW1wbGF0ZS1hcmVhJyApLFxuXHRcdFx0XHQkc2V0dGluZ3NGb3JtOiAkKCAnI2VsZW1lbnRvci1zZXR0aW5ncy1mb3JtJyApLFxuXHRcdFx0XHQkc2V0dGluZ3NUYWJzV3JhcHBlcjogJCggJyNlbGVtZW50b3Itc2V0dGluZ3MtdGFicy13cmFwcGVyJyApXG5cdFx0XHR9O1xuXG5cdFx0XHR0aGlzLmNhY2hlLiRzZXR0aW5nc0Zvcm1QYWdlcyA9IHRoaXMuY2FjaGUuJHNldHRpbmdzRm9ybS5maW5kKCAnLmVsZW1lbnRvci1zZXR0aW5ncy1mb3JtLXBhZ2UnICk7XG5cblx0XHRcdHRoaXMuY2FjaGUuJGFjdGl2ZVNldHRpbmdzUGFnZSA9IHRoaXMuY2FjaGUuJHNldHRpbmdzRm9ybVBhZ2VzLmZpbHRlciggJy5lbGVtZW50b3ItYWN0aXZlJyApO1xuXG5cdFx0XHR0aGlzLmNhY2hlLiRzZXR0aW5nc1RhYnMgPSB0aGlzLmNhY2hlLiRzZXR0aW5nc1RhYnNXcmFwcGVyLmNoaWxkcmVuKCk7XG5cblx0XHRcdHRoaXMuY2FjaGUuJGFjdGl2ZVNldHRpbmdzVGFiID0gdGhpcy5jYWNoZS4kc2V0dGluZ3NUYWJzLmZpbHRlciggJy5uYXYtdGFiLWFjdGl2ZScgKTtcblx0XHR9LFxuXG5cdFx0dG9nZ2xlU3RhdHVzOiBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBpc0VsZW1lbnRvck1vZGUgPSB0aGlzLmlzRWxlbWVudG9yTW9kZSgpO1xuXG5cdFx0XHR0aGlzLmNhY2hlLiRib2R5XG5cdFx0XHQgICAgLnRvZ2dsZUNsYXNzKCAnZWxlbWVudG9yLWVkaXRvci1hY3RpdmUnLCBpc0VsZW1lbnRvck1vZGUgKVxuXHRcdFx0ICAgIC50b2dnbGVDbGFzcyggJ2VsZW1lbnRvci1lZGl0b3ItaW5hY3RpdmUnLCAhIGlzRWxlbWVudG9yTW9kZSApO1xuXHRcdH0sXG5cblx0XHRiaW5kRXZlbnRzOiBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBzZWxmID0gdGhpcztcblxuXHRcdFx0c2VsZi5jYWNoZS4kc3dpdGNoTW9kZUJ1dHRvbi5vbiggJ2NsaWNrJywgZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0XHRcdGlmICggc2VsZi5pc0VsZW1lbnRvck1vZGUoKSApIHtcblx0XHRcdFx0XHRzZWxmLmNhY2hlLiRzd2l0Y2hNb2RlSW5wdXQudmFsKCAnJyApO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHNlbGYuY2FjaGUuJHN3aXRjaE1vZGVJbnB1dC52YWwoIHRydWUgKTtcblxuXHRcdFx0XHRcdHZhciAkd3BUaXRsZSA9ICQoICcjdGl0bGUnICk7XG5cblx0XHRcdFx0XHRpZiAoICEgJHdwVGl0bGUudmFsKCkgKSB7XG5cdFx0XHRcdFx0XHQkd3BUaXRsZS52YWwoICdFbGVtZW50b3IgIycgKyAkKCAnI3Bvc3RfSUQnICkudmFsKCkgKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAoIHdwLmF1dG9zYXZlICkge1xuXHRcdFx0XHRcdFx0d3AuYXV0b3NhdmUuc2VydmVyLnRyaWdnZXJTYXZlKCk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0c2VsZi5hbmltYXRlTG9hZGVyKCk7XG5cblx0XHRcdFx0XHQkKCBkb2N1bWVudCApLm9uKCAnaGVhcnRiZWF0LXRpY2suYXV0b3NhdmUnLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHNlbGYuY2FjaGUuJHdpbmRvdy5vZmYoICdiZWZvcmV1bmxvYWQuZWRpdC1wb3N0JyApO1xuXG5cdFx0XHRcdFx0XHR3aW5kb3cubG9jYXRpb24gPSBzZWxmLmNhY2hlLiRnb1RvRWRpdExpbmsuYXR0ciggJ2hyZWYnICk7XG5cdFx0XHRcdFx0fSApO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0c2VsZi50b2dnbGVTdGF0dXMoKTtcblx0XHRcdH0gKTtcblxuXHRcdFx0c2VsZi5jYWNoZS4kZ29Ub0VkaXRMaW5rLm9uKCAnY2xpY2snLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0c2VsZi5hbmltYXRlTG9hZGVyKCk7XG5cdFx0XHR9ICk7XG5cblx0XHRcdCQoICdkaXYubm90aWNlLmVsZW1lbnRvci1tZXNzYWdlLWRpc21pc3NlZCcgKS5vbiggJ2NsaWNrJywgJ2J1dHRvbi5ub3RpY2UtZGlzbWlzcycsIGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuXHRcdFx0XHQkLnBvc3QoIGFqYXh1cmwsIHtcblx0XHRcdFx0XHRhY3Rpb246ICdlbGVtZW50b3Jfc2V0X2FkbWluX25vdGljZV92aWV3ZWQnLFxuXHRcdFx0XHRcdG5vdGljZV9pZDogJCggdGhpcyApLmNsb3Nlc3QoICcuZWxlbWVudG9yLW1lc3NhZ2UtZGlzbWlzc2VkJyApLmRhdGEoICdub3RpY2VfaWQnIClcblx0XHRcdFx0fSApO1xuXHRcdFx0fSApO1xuXG5cdFx0XHQkKCAnI2VsZW1lbnRvci1jbGVhci1jYWNoZS1idXR0b24nICkub24oICdjbGljaycsIGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0dmFyICR0aGlzQnV0dG9uID0gJCggdGhpcyApO1xuXG5cdFx0XHRcdCR0aGlzQnV0dG9uLnJlbW92ZUNsYXNzKCAnc3VjY2VzcycgKS5hZGRDbGFzcyggJ2xvYWRpbmcnICk7XG5cblx0XHRcdFx0JC5wb3N0KCBhamF4dXJsLCB7XG5cdFx0XHRcdFx0YWN0aW9uOiAnZWxlbWVudG9yX2NsZWFyX2NhY2hlJyxcblx0XHRcdFx0XHRfbm9uY2U6ICR0aGlzQnV0dG9uLmRhdGEoICdub25jZScgKVxuXHRcdFx0XHR9IClcblx0XHRcdFx0XHQuZG9uZSggZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHQkdGhpc0J1dHRvbi5yZW1vdmVDbGFzcyggJ2xvYWRpbmcnICkuYWRkQ2xhc3MoICdzdWNjZXNzJyApO1xuXHRcdFx0XHRcdH0gKTtcblx0XHRcdH0gKTtcblxuXHRcdFx0JCggJyNlbGVtZW50b3ItbGlicmFyeS1zeW5jLWJ1dHRvbicgKS5vbiggJ2NsaWNrJywgZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0XHR2YXIgJHRoaXNCdXR0b24gPSAkKCB0aGlzICk7XG5cblx0XHRcdFx0JHRoaXNCdXR0b24ucmVtb3ZlQ2xhc3MoICdzdWNjZXNzJyApLmFkZENsYXNzKCAnbG9hZGluZycgKTtcblxuXHRcdFx0XHQkLnBvc3QoIGFqYXh1cmwsIHtcblx0XHRcdFx0XHRhY3Rpb246ICdlbGVtZW50b3JfcmVzZXRfbGlicmFyeScsXG5cdFx0XHRcdFx0X25vbmNlOiAkdGhpc0J1dHRvbi5kYXRhKCAnbm9uY2UnIClcblx0XHRcdFx0fSApXG5cdFx0XHRcdFx0LmRvbmUoIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0JHRoaXNCdXR0b24ucmVtb3ZlQ2xhc3MoICdsb2FkaW5nJyApLmFkZENsYXNzKCAnc3VjY2VzcycgKTtcblx0XHRcdFx0XHR9ICk7XG5cdFx0XHR9ICk7XG5cblx0XHRcdCQoICcjZWxlbWVudG9yLXJlcGxhY2UtdXJsLWJ1dHRvbicgKS5vbiggJ2NsaWNrJywgZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0XHR2YXIgJHRoaXMgPSAkKCB0aGlzICksXG5cdFx0XHRcdFx0JHRyID0gJHRoaXMucGFyZW50cyggJ3RyJyApLFxuXHRcdFx0XHRcdCRmcm9tID0gJHRyLmZpbmQoICdbbmFtZT1cImZyb21cIl0nICksXG5cdFx0XHRcdFx0JHRvID0gJHRyLmZpbmQoICdbbmFtZT1cInRvXCJdJyApO1xuXG5cdFx0XHRcdCR0aGlzLnJlbW92ZUNsYXNzKCAnc3VjY2VzcycgKS5hZGRDbGFzcyggJ2xvYWRpbmcnICk7XG5cblx0XHRcdFx0JC5wb3N0KCBhamF4dXJsLCB7XG5cdFx0XHRcdFx0YWN0aW9uOiAnZWxlbWVudG9yX3JlcGxhY2VfdXJsJyxcblx0XHRcdFx0XHRmcm9tOiAkZnJvbS52YWwoKSxcblx0XHRcdFx0XHR0bzogJHRvLnZhbCgpLFxuXHRcdFx0XHRcdF9ub25jZTogJHRoaXMuZGF0YSggJ25vbmNlJyApXG5cdFx0XHRcdH0gKVxuXHRcdFx0XHRcdC5kb25lKCBmdW5jdGlvbiggcmVzcG9uc2UgKSB7XG5cdFx0XHRcdFx0XHQkdGhpcy5yZW1vdmVDbGFzcyggJ2xvYWRpbmcnICk7XG5cblx0XHRcdFx0XHRcdGlmICggcmVzcG9uc2Uuc3VjY2VzcyApIHtcblx0XHRcdFx0XHRcdFx0JHRoaXMuYWRkQ2xhc3MoICdzdWNjZXNzJyApO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHR2YXIgZGlhbG9nc01hbmFnZXIgPSBuZXcgRGlhbG9nc01hbmFnZXIuSW5zdGFuY2UoKTtcblx0XHRcdFx0XHRcdFx0ZGlhbG9nc01hbmFnZXIuY3JlYXRlV2lkZ2V0KCAnYWxlcnQnLCB7XG5cdFx0XHRcdFx0XHRcdFx0bWVzc2FnZTogcmVzcG9uc2UuZGF0YVxuXHRcdFx0XHRcdFx0XHR9ICkuc2hvdygpO1xuXHRcdFx0XHRcdH0gKTtcblx0XHRcdH0gKTtcblxuXHRcdFx0c2VsZi5jYWNoZS4kc2V0dGluZ3NUYWJzLm9uKCB7XG5cdFx0XHRcdGNsaWNrOiBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuXHRcdFx0XHRcdGV2ZW50LmN1cnJlbnRUYXJnZXQuZm9jdXMoKTsgLy8gU2FmYXJpIGRvZXMgbm90IGZvY3VzIHRoZSB0YWIgYXV0b21hdGljYWxseVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRmb2N1czogZnVuY3Rpb24oKSB7IC8vIFVzaW5nIGZvY3VzIGV2ZW50IHRvIGVuYWJsZSBuYXZpZ2F0aW9uIGJ5IHRhYiBrZXlcblx0XHRcdFx0XHR2YXIgaHJlZldpdGhvdXRIYXNoID0gbG9jYXRpb24uaHJlZi5yZXBsYWNlKCAvIy4qLywgJycgKTtcblxuXHRcdFx0XHRcdGhpc3RvcnkucHVzaFN0YXRlKCB7fSwgJycsIGhyZWZXaXRob3V0SGFzaCArIHRoaXMuaGFzaCApO1xuXG5cdFx0XHRcdFx0c2VsZi5nb1RvU2V0dGluZ3NUYWJGcm9tSGFzaCgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9ICk7XG5cblx0XHRcdCQoICcuZWxlbWVudG9yLXJvbGxiYWNrLWJ1dHRvbicgKS5vbiggJ2NsaWNrJywgZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0XHRcdHZhciAkdGhpcyA9ICQoIHRoaXMgKSxcblx0XHRcdFx0XHRkaWFsb2dzTWFuYWdlciA9IG5ldyBEaWFsb2dzTWFuYWdlci5JbnN0YW5jZSgpO1xuXG5cdFx0XHRcdGRpYWxvZ3NNYW5hZ2VyLmNyZWF0ZVdpZGdldCggJ2NvbmZpcm0nLCB7XG5cdFx0XHRcdFx0aGVhZGVyTWVzc2FnZTogRWxlbWVudG9yQWRtaW5Db25maWcuaTE4bi5yb2xsYmFja190b19wcmV2aW91c192ZXJzaW9uLFxuXHRcdFx0XHRcdG1lc3NhZ2U6IEVsZW1lbnRvckFkbWluQ29uZmlnLmkxOG4ucm9sbGJhY2tfY29uZmlybSxcblx0XHRcdFx0XHRzdHJpbmdzOiB7XG5cdFx0XHRcdFx0XHRjb25maXJtOiBFbGVtZW50b3JBZG1pbkNvbmZpZy5pMThuLnllcyxcblx0XHRcdFx0XHRcdGNhbmNlbDogRWxlbWVudG9yQWRtaW5Db25maWcuaTE4bi5jYW5jZWxcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdG9uQ29uZmlybTogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHQkdGhpcy5hZGRDbGFzcyggJ2xvYWRpbmcnICk7XG5cblx0XHRcdFx0XHRcdGxvY2F0aW9uLmhyZWYgPSAkdGhpcy5hdHRyKCAnaHJlZicgKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gKS5zaG93KCk7XG5cdFx0XHR9ICk7XG5cblx0XHRcdCQoICcuZWxlbWVudG9yX2Nzc19wcmludF9tZXRob2Qgc2VsZWN0JyApLm9uKCAnY2hhbmdlJywgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciAkZGVzY3JpcHRpb25zID0gJCggJy5lbGVtZW50b3ItY3NzLXByaW50LW1ldGhvZC1kZXNjcmlwdGlvbicgKTtcblxuXHRcdFx0XHQkZGVzY3JpcHRpb25zLmhpZGUoKTtcblx0XHRcdFx0JGRlc2NyaXB0aW9ucy5maWx0ZXIoICdbZGF0YS12YWx1ZT1cIicgKyAkKCB0aGlzICkudmFsKCkgKyAnXCJdJyApLnNob3coKTtcblx0XHRcdH0gKS50cmlnZ2VyKCAnY2hhbmdlJyApO1xuXHRcdH0sXG5cblx0XHRpbml0OiBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMuY2FjaGVFbGVtZW50cygpO1xuXG5cdFx0XHR0aGlzLmJpbmRFdmVudHMoKTtcblxuXHRcdFx0dGhpcy5pbml0VGVtcGxhdGVzSW1wb3J0KCk7XG5cblx0XHRcdHRoaXMuaW5pdE1haW50ZW5hbmNlTW9kZSgpO1xuXG5cdFx0XHR0aGlzLmdvVG9TZXR0aW5nc1RhYkZyb21IYXNoKCk7XG5cdFx0fSxcblxuXHRcdGluaXRUZW1wbGF0ZXNJbXBvcnQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0aWYgKCAhIHRoaXMuY2FjaGUuJGJvZHkuaGFzQ2xhc3MoICdwb3N0LXR5cGUtZWxlbWVudG9yX2xpYnJhcnknICkgKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0dmFyIHNlbGYgPSB0aGlzLFxuXHRcdFx0XHQkaW1wb3J0QnV0dG9uID0gc2VsZi5jYWNoZS4kaW1wb3J0QnV0dG9uLFxuXHRcdFx0XHQkaW1wb3J0QXJlYSA9IHNlbGYuY2FjaGUuJGltcG9ydEFyZWE7XG5cblx0XHRcdHNlbGYuY2FjaGUuJGZvcm1BbmNob3IgPSAkKCAnaDEnICk7XG5cblx0XHRcdCQoICcjd3Bib2R5LWNvbnRlbnQnICkuZmluZCggJy5wYWdlLXRpdGxlLWFjdGlvbjpsYXN0JyApLmFmdGVyKCAkaW1wb3J0QnV0dG9uICk7XG5cblx0XHRcdHNlbGYuY2FjaGUuJGZvcm1BbmNob3IuYWZ0ZXIoICRpbXBvcnRBcmVhICk7XG5cblx0XHRcdCRpbXBvcnRCdXR0b24ub24oICdjbGljaycsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHQkKCAnI2VsZW1lbnRvci1pbXBvcnQtdGVtcGxhdGUtYXJlYScgKS50b2dnbGUoKTtcblx0XHRcdH0gKTtcblx0XHR9LFxuXG5cdFx0aW5pdE1haW50ZW5hbmNlTW9kZTogZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgTWFpbnRlbmFuY2VNb2RlID0gcmVxdWlyZSggJ2VsZW1lbnRvci1hZG1pbi9tYWludGVuYW5jZS1tb2RlJyApO1xuXG5cdFx0XHR0aGlzLm1haW50ZW5hbmNlTW9kZSA9IG5ldyBNYWludGVuYW5jZU1vZGUoKTtcblx0XHR9LFxuXG5cdFx0aXNFbGVtZW50b3JNb2RlOiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiAhISB0aGlzLmNhY2hlLiRzd2l0Y2hNb2RlSW5wdXQudmFsKCk7XG5cdFx0fSxcblxuXHRcdGFuaW1hdGVMb2FkZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy5jYWNoZS4kZ29Ub0VkaXRMaW5rLmFkZENsYXNzKCAnZWxlbWVudG9yLWFuaW1hdGUnICk7XG5cdFx0fSxcblxuXHRcdGdvVG9TZXR0aW5nc1RhYkZyb21IYXNoOiBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBoYXNoID0gbG9jYXRpb24uaGFzaC5zbGljZSggMSApO1xuXG5cdFx0XHRpZiAoIGhhc2ggKSB7XG5cdFx0XHRcdHRoaXMuZ29Ub1NldHRpbmdzVGFiKCBoYXNoICk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdGdvVG9TZXR0aW5nc1RhYjogZnVuY3Rpb24oIHRhYk5hbWUgKSB7XG5cdFx0XHR2YXIgJGFjdGl2ZVBhZ2UgPSB0aGlzLmNhY2hlLiRzZXR0aW5nc0Zvcm1QYWdlcy5maWx0ZXIoICcjJyArIHRhYk5hbWUgKTtcblxuXHRcdFx0aWYgKCAhICRhY3RpdmVQYWdlLmxlbmd0aCApIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLmNhY2hlLiRhY3RpdmVTZXR0aW5nc1BhZ2UucmVtb3ZlQ2xhc3MoICdlbGVtZW50b3ItYWN0aXZlJyApO1xuXG5cdFx0XHR0aGlzLmNhY2hlLiRhY3RpdmVTZXR0aW5nc1RhYi5yZW1vdmVDbGFzcyggJ25hdi10YWItYWN0aXZlJyApO1xuXG5cdFx0XHR2YXIgJGFjdGl2ZVRhYiA9IHRoaXMuY2FjaGUuJHNldHRpbmdzVGFicy5maWx0ZXIoICcjZWxlbWVudG9yLXNldHRpbmdzLScgKyB0YWJOYW1lICk7XG5cblx0XHRcdCRhY3RpdmVQYWdlLmFkZENsYXNzKCAnZWxlbWVudG9yLWFjdGl2ZScgKTtcblxuXHRcdFx0JGFjdGl2ZVRhYi5hZGRDbGFzcyggJ25hdi10YWItYWN0aXZlJyApO1xuXG5cdFx0XHR0aGlzLmNhY2hlLiRzZXR0aW5nc0Zvcm0uYXR0ciggJ2FjdGlvbicsICdvcHRpb25zLnBocCMnICsgdGFiTmFtZSAgKTtcblxuXHRcdFx0dGhpcy5jYWNoZS4kYWN0aXZlU2V0dGluZ3NQYWdlID0gJGFjdGl2ZVBhZ2U7XG5cblx0XHRcdHRoaXMuY2FjaGUuJGFjdGl2ZVNldHRpbmdzVGFiID0gJGFjdGl2ZVRhYjtcblx0XHR9XG5cdH07XG5cblx0JCggZnVuY3Rpb24oKSB7XG5cdFx0RWxlbWVudG9yQWRtaW5BcHAuaW5pdCgpO1xuXHR9ICk7XG5cblx0d2luZG93LmVsZW1lbnRvckFkbWluID0gRWxlbWVudG9yQWRtaW5BcHA7XG59KCBqUXVlcnkgKSApO1xuIiwidmFyIFZpZXdNb2R1bGUgPSByZXF1aXJlKCAnZWxlbWVudG9yLXV0aWxzL3ZpZXctbW9kdWxlJyApLFxuXHRNYWludGVuYW5jZU1vZGVNb2R1bGU7XG5cbk1haW50ZW5hbmNlTW9kZU1vZHVsZSA9IFZpZXdNb2R1bGUuZXh0ZW5kKCB7XG5cdGdldERlZmF1bHRTZXR0aW5nczogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdHNlbGVjdG9yczoge1xuXHRcdFx0XHRtb2RlU2VsZWN0OiAnLmVsZW1lbnRvcl9tYWludGVuYW5jZV9tb2RlX21vZGUgc2VsZWN0Jyxcblx0XHRcdFx0bWFpbnRlbmFuY2VNb2RlVGFibGU6ICcjdGFiLW1haW50ZW5hbmNlX21vZGUgdGFibGUnLFxuXHRcdFx0XHRtYWludGVuYW5jZU1vZGVEZXNjcmlwdGlvbnM6ICcuZWxlbWVudG9yLW1haW50ZW5hbmNlLW1vZGUtZGVzY3JpcHRpb24nLFxuXHRcdFx0XHRleGNsdWRlTW9kZVNlbGVjdDogJy5lbGVtZW50b3JfbWFpbnRlbmFuY2VfbW9kZV9leGNsdWRlX21vZGUgc2VsZWN0Jyxcblx0XHRcdFx0ZXhjbHVkZVJvbGVzQXJlYTogJy5lbGVtZW50b3JfbWFpbnRlbmFuY2VfbW9kZV9leGNsdWRlX3JvbGVzJyxcblx0XHRcdFx0dGVtcGxhdGVTZWxlY3Q6ICcuZWxlbWVudG9yX21haW50ZW5hbmNlX21vZGVfdGVtcGxhdGVfaWQgc2VsZWN0Jyxcblx0XHRcdFx0ZWRpdFRlbXBsYXRlQnV0dG9uOiAnLmVsZW1lbnRvci1lZGl0LXRlbXBsYXRlJyxcblx0XHRcdFx0bWFpbnRlbmFuY2VNb2RlRXJyb3I6ICcuZWxlbWVudG9yLW1haW50ZW5hbmNlLW1vZGUtZXJyb3InXG5cdFx0XHR9LFxuXHRcdFx0Y2xhc3Nlczoge1xuXHRcdFx0XHRpc0VuYWJsZWQ6ICdlbGVtZW50b3ItbWFpbnRlbmFuY2UtbW9kZS1pcy1lbmFibGVkJ1xuXHRcdFx0fVxuXHRcdH07XG5cdH0sXG5cblx0Z2V0RGVmYXVsdEVsZW1lbnRzOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgZWxlbWVudHMgPSB7fSxcblx0XHRcdHNlbGVjdG9ycyA9IHRoaXMuZ2V0U2V0dGluZ3MoICdzZWxlY3RvcnMnICk7XG5cblx0XHRlbGVtZW50cy4kbW9kZVNlbGVjdCA9IGpRdWVyeSggc2VsZWN0b3JzLm1vZGVTZWxlY3QgKTtcblx0XHRlbGVtZW50cy4kbWFpbnRlbmFuY2VNb2RlVGFibGUgPSBlbGVtZW50cy4kbW9kZVNlbGVjdC5wYXJlbnRzKCBzZWxlY3RvcnMubWFpbnRlbmFuY2VNb2RlVGFibGUgKTtcblx0XHRlbGVtZW50cy4kZXhjbHVkZU1vZGVTZWxlY3QgPSBlbGVtZW50cy4kbWFpbnRlbmFuY2VNb2RlVGFibGUuZmluZCggc2VsZWN0b3JzLmV4Y2x1ZGVNb2RlU2VsZWN0ICk7XG5cdFx0ZWxlbWVudHMuJGV4Y2x1ZGVSb2xlc0FyZWEgPSBlbGVtZW50cy4kbWFpbnRlbmFuY2VNb2RlVGFibGUuZmluZCggc2VsZWN0b3JzLmV4Y2x1ZGVSb2xlc0FyZWEgKTtcblx0XHRlbGVtZW50cy4kdGVtcGxhdGVTZWxlY3QgPSBlbGVtZW50cy4kbWFpbnRlbmFuY2VNb2RlVGFibGUuZmluZCggc2VsZWN0b3JzLnRlbXBsYXRlU2VsZWN0ICk7XG5cdFx0ZWxlbWVudHMuJGVkaXRUZW1wbGF0ZUJ1dHRvbiA9IGVsZW1lbnRzLiRtYWludGVuYW5jZU1vZGVUYWJsZS5maW5kKCBzZWxlY3RvcnMuZWRpdFRlbXBsYXRlQnV0dG9uICk7XG5cdFx0ZWxlbWVudHMuJG1haW50ZW5hbmNlTW9kZURlc2NyaXB0aW9ucyA9IGVsZW1lbnRzLiRtYWludGVuYW5jZU1vZGVUYWJsZS5maW5kKCBzZWxlY3RvcnMubWFpbnRlbmFuY2VNb2RlRGVzY3JpcHRpb25zICk7XG5cdFx0ZWxlbWVudHMuJG1haW50ZW5hbmNlTW9kZUVycm9yID0gZWxlbWVudHMuJG1haW50ZW5hbmNlTW9kZVRhYmxlLmZpbmQoIHNlbGVjdG9ycy5tYWludGVuYW5jZU1vZGVFcnJvciApO1xuXG5cdFx0cmV0dXJuIGVsZW1lbnRzO1xuXHR9LFxuXG5cdGJpbmRFdmVudHM6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBzZXR0aW5ncyA9IHRoaXMuZ2V0U2V0dGluZ3MoKSxcblx0XHRcdGVsZW1lbnRzID0gdGhpcy5lbGVtZW50cztcblxuXHRcdGVsZW1lbnRzLiRtb2RlU2VsZWN0Lm9uKCAnY2hhbmdlJywgZnVuY3Rpb24oKSB7XG5cdFx0XHRlbGVtZW50cy4kbWFpbnRlbmFuY2VNb2RlVGFibGUudG9nZ2xlQ2xhc3MoIHNldHRpbmdzLmNsYXNzZXMuaXNFbmFibGVkLCAhISBlbGVtZW50cy4kbW9kZVNlbGVjdC52YWwoKSApO1xuXHRcdFx0ZWxlbWVudHMuJG1haW50ZW5hbmNlTW9kZURlc2NyaXB0aW9ucy5oaWRlKCk7XG5cdFx0XHRlbGVtZW50cy4kbWFpbnRlbmFuY2VNb2RlRGVzY3JpcHRpb25zLmZpbHRlciggJ1tkYXRhLXZhbHVlPVwiJyArIGVsZW1lbnRzLiRtb2RlU2VsZWN0LnZhbCgpICsgJ1wiXScgKS5zaG93KCk7XG5cdFx0fSApLnRyaWdnZXIoICdjaGFuZ2UnICk7XG5cblx0XHRlbGVtZW50cy4kZXhjbHVkZU1vZGVTZWxlY3Qub24oICdjaGFuZ2UnLCBmdW5jdGlvbigpIHtcblx0XHRcdGVsZW1lbnRzLiRleGNsdWRlUm9sZXNBcmVhLnRvZ2dsZSggJ2N1c3RvbScgPT09IGVsZW1lbnRzLiRleGNsdWRlTW9kZVNlbGVjdC52YWwoKSApO1xuXHRcdH0gKS50cmlnZ2VyKCAnY2hhbmdlJyApO1xuXG5cdFx0ZWxlbWVudHMuJHRlbXBsYXRlU2VsZWN0Lm9uKCAnY2hhbmdlJywgZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgdGVtcGxhdGVJRCA9IGVsZW1lbnRzLiR0ZW1wbGF0ZVNlbGVjdC52YWwoKTtcblxuXHRcdFx0aWYgKCAhIHRlbXBsYXRlSUQgKSB7XG5cdFx0XHRcdGVsZW1lbnRzLiRlZGl0VGVtcGxhdGVCdXR0b24uaGlkZSgpO1xuXHRcdFx0XHRlbGVtZW50cy4kbWFpbnRlbmFuY2VNb2RlRXJyb3Iuc2hvdygpO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdHZhciBlZGl0VXJsID0gRWxlbWVudG9yQWRtaW5Db25maWcuaG9tZV91cmwgKyAnP3A9JyArIHRlbXBsYXRlSUQgKyAnJmVsZW1lbnRvcic7XG5cblx0XHRcdGVsZW1lbnRzLiRlZGl0VGVtcGxhdGVCdXR0b25cblx0XHRcdFx0LnByb3AoICdocmVmJywgZWRpdFVybCApXG5cdFx0XHRcdC5zaG93KCk7XG5cdFx0XHRlbGVtZW50cy4kbWFpbnRlbmFuY2VNb2RlRXJyb3IuaGlkZSgpO1xuXHRcdH0gKS50cmlnZ2VyKCAnY2hhbmdlJyApO1xuXHR9XG59ICk7XG5cbm1vZHVsZS5leHBvcnRzID0gTWFpbnRlbmFuY2VNb2RlTW9kdWxlO1xuIiwidmFyIE1vZHVsZSA9IGZ1bmN0aW9uKCkge1xuXHR2YXIgJCA9IGpRdWVyeSxcblx0XHRpbnN0YW5jZVBhcmFtcyA9IGFyZ3VtZW50cyxcblx0XHRzZWxmID0gdGhpcyxcblx0XHRzZXR0aW5ncyxcblx0XHRldmVudHMgPSB7fTtcblxuXHR2YXIgZW5zdXJlQ2xvc3VyZU1ldGhvZHMgPSBmdW5jdGlvbigpIHtcblx0XHQkLmVhY2goIHNlbGYsIGZ1bmN0aW9uKCBtZXRob2ROYW1lICkge1xuXHRcdFx0dmFyIG9sZE1ldGhvZCA9IHNlbGZbIG1ldGhvZE5hbWUgXTtcblxuXHRcdFx0aWYgKCAnZnVuY3Rpb24nICE9PSB0eXBlb2Ygb2xkTWV0aG9kICkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdHNlbGZbIG1ldGhvZE5hbWUgXSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRyZXR1cm4gb2xkTWV0aG9kLmFwcGx5KCBzZWxmLCBhcmd1bWVudHMgKTtcblx0XHRcdH07XG5cdFx0fSk7XG5cdH07XG5cblx0dmFyIGluaXRTZXR0aW5ncyA9IGZ1bmN0aW9uKCkge1xuXHRcdHNldHRpbmdzID0gc2VsZi5nZXREZWZhdWx0U2V0dGluZ3MoKTtcblxuXHRcdHZhciBpbnN0YW5jZVNldHRpbmdzID0gaW5zdGFuY2VQYXJhbXNbMF07XG5cblx0XHRpZiAoIGluc3RhbmNlU2V0dGluZ3MgKSB7XG5cdFx0XHQkLmV4dGVuZCggc2V0dGluZ3MsIGluc3RhbmNlU2V0dGluZ3MgKTtcblx0XHR9XG5cdH07XG5cblx0dmFyIGluaXQgPSBmdW5jdGlvbigpIHtcblx0XHRzZWxmLl9fY29uc3RydWN0LmFwcGx5KCBzZWxmLCBpbnN0YW5jZVBhcmFtcyApO1xuXG5cdFx0ZW5zdXJlQ2xvc3VyZU1ldGhvZHMoKTtcblxuXHRcdGluaXRTZXR0aW5ncygpO1xuXG5cdFx0c2VsZi50cmlnZ2VyKCAnaW5pdCcgKTtcblx0fTtcblxuXHR0aGlzLmdldEl0ZW1zID0gZnVuY3Rpb24oIGl0ZW1zLCBpdGVtS2V5ICkge1xuXHRcdGlmICggaXRlbUtleSApIHtcblx0XHRcdHZhciBrZXlTdGFjayA9IGl0ZW1LZXkuc3BsaXQoICcuJyApLFxuXHRcdFx0XHRjdXJyZW50S2V5ID0ga2V5U3RhY2suc3BsaWNlKCAwLCAxICk7XG5cblx0XHRcdGlmICggISBrZXlTdGFjay5sZW5ndGggKSB7XG5cdFx0XHRcdHJldHVybiBpdGVtc1sgY3VycmVudEtleSBdO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoICEgaXRlbXNbIGN1cnJlbnRLZXkgXSApIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gdGhpcy5nZXRJdGVtcyggIGl0ZW1zWyBjdXJyZW50S2V5IF0sIGtleVN0YWNrLmpvaW4oICcuJyApICk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGl0ZW1zO1xuXHR9O1xuXG5cdHRoaXMuZ2V0U2V0dGluZ3MgPSBmdW5jdGlvbiggc2V0dGluZyApIHtcblx0XHRyZXR1cm4gdGhpcy5nZXRJdGVtcyggc2V0dGluZ3MsIHNldHRpbmcgKTtcblx0fTtcblxuXHR0aGlzLnNldFNldHRpbmdzID0gZnVuY3Rpb24oIHNldHRpbmdLZXksIHZhbHVlLCBzZXR0aW5nc0NvbnRhaW5lciApIHtcblx0XHRpZiAoICEgc2V0dGluZ3NDb250YWluZXIgKSB7XG5cdFx0XHRzZXR0aW5nc0NvbnRhaW5lciA9IHNldHRpbmdzO1xuXHRcdH1cblxuXHRcdGlmICggJ29iamVjdCcgPT09IHR5cGVvZiBzZXR0aW5nS2V5ICkge1xuXHRcdFx0JC5leHRlbmQoIHNldHRpbmdzQ29udGFpbmVyLCBzZXR0aW5nS2V5ICk7XG5cblx0XHRcdHJldHVybiBzZWxmO1xuXHRcdH1cblxuXHRcdHZhciBrZXlTdGFjayA9IHNldHRpbmdLZXkuc3BsaXQoICcuJyApLFxuXHRcdFx0Y3VycmVudEtleSA9IGtleVN0YWNrLnNwbGljZSggMCwgMSApO1xuXG5cdFx0aWYgKCAhIGtleVN0YWNrLmxlbmd0aCApIHtcblx0XHRcdHNldHRpbmdzQ29udGFpbmVyWyBjdXJyZW50S2V5IF0gPSB2YWx1ZTtcblxuXHRcdFx0cmV0dXJuIHNlbGY7XG5cdFx0fVxuXG5cdFx0aWYgKCAhIHNldHRpbmdzQ29udGFpbmVyWyBjdXJyZW50S2V5IF0gKSB7XG5cdFx0XHRzZXR0aW5nc0NvbnRhaW5lclsgY3VycmVudEtleSBdID0ge307XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHNlbGYuc2V0U2V0dGluZ3MoIGtleVN0YWNrLmpvaW4oICcuJyApLCB2YWx1ZSwgc2V0dGluZ3NDb250YWluZXJbIGN1cnJlbnRLZXkgXSApO1xuXHR9O1xuXG5cdHRoaXMuZm9yY2VNZXRob2RJbXBsZW1lbnRhdGlvbiA9IGZ1bmN0aW9uKCBtZXRob2RBcmd1bWVudHMgKSB7XG5cdFx0dmFyIGZ1bmN0aW9uTmFtZSA9IG1ldGhvZEFyZ3VtZW50cy5jYWxsZWUubmFtZTtcblxuXHRcdHRocm93IG5ldyBSZWZlcmVuY2VFcnJvciggJ1RoZSBtZXRob2QgJyArIGZ1bmN0aW9uTmFtZSArICcgbXVzdCB0byBiZSBpbXBsZW1lbnRlZCBpbiB0aGUgaW5oZXJpdG9yIGNoaWxkLicgKTtcblx0fTtcblxuXHR0aGlzLm9uID0gZnVuY3Rpb24oIGV2ZW50TmFtZSwgY2FsbGJhY2sgKSB7XG5cdFx0aWYgKCAnb2JqZWN0JyA9PT0gdHlwZW9mIGV2ZW50TmFtZSApIHtcblx0XHRcdCQuZWFjaCggZXZlbnROYW1lLCBmdW5jdGlvbiggc2luZ2xlRXZlbnROYW1lICkge1xuXHRcdFx0XHRzZWxmLm9uKCBzaW5nbGVFdmVudE5hbWUsIHRoaXMgKTtcblx0XHRcdH0gKTtcblxuXHRcdFx0cmV0dXJuIHNlbGY7XG5cdFx0fVxuXG5cdFx0dmFyIGV2ZW50TmFtZXMgPSBldmVudE5hbWUuc3BsaXQoICcgJyApO1xuXG5cdFx0ZXZlbnROYW1lcy5mb3JFYWNoKCBmdW5jdGlvbiggc2luZ2xlRXZlbnROYW1lICkge1xuXHRcdFx0aWYgKCAhIGV2ZW50c1sgc2luZ2xlRXZlbnROYW1lIF0gKSB7XG5cdFx0XHRcdGV2ZW50c1sgc2luZ2xlRXZlbnROYW1lIF0gPSBbXTtcblx0XHRcdH1cblxuXHRcdFx0ZXZlbnRzWyBzaW5nbGVFdmVudE5hbWUgXS5wdXNoKCBjYWxsYmFjayApO1xuXHRcdH0gKTtcblxuXHRcdHJldHVybiBzZWxmO1xuXHR9O1xuXG5cdHRoaXMub2ZmID0gZnVuY3Rpb24oIGV2ZW50TmFtZSwgY2FsbGJhY2sgKSB7XG5cdFx0aWYgKCAhIGV2ZW50c1sgZXZlbnROYW1lIF0gKSB7XG5cdFx0XHRyZXR1cm4gc2VsZjtcblx0XHR9XG5cblx0XHRpZiAoICEgY2FsbGJhY2sgKSB7XG5cdFx0XHRkZWxldGUgZXZlbnRzWyBldmVudE5hbWUgXTtcblxuXHRcdFx0cmV0dXJuIHNlbGY7XG5cdFx0fVxuXG5cdFx0dmFyIGNhbGxiYWNrSW5kZXggPSBldmVudHNbIGV2ZW50TmFtZSBdLmluZGV4T2YoIGNhbGxiYWNrICk7XG5cblx0XHRpZiAoIC0xICE9PSBjYWxsYmFja0luZGV4ICkge1xuXHRcdFx0ZGVsZXRlIGV2ZW50c1sgZXZlbnROYW1lIF1bIGNhbGxiYWNrSW5kZXggXTtcblx0XHR9XG5cblx0XHRyZXR1cm4gc2VsZjtcblx0fTtcblxuXHR0aGlzLnRyaWdnZXIgPSBmdW5jdGlvbiggZXZlbnROYW1lICkge1xuXHRcdHZhciBtZXRob2ROYW1lID0gJ29uJyArIGV2ZW50TmFtZVsgMCBdLnRvVXBwZXJDYXNlKCkgKyBldmVudE5hbWUuc2xpY2UoIDEgKSxcblx0XHRcdHBhcmFtcyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKCBhcmd1bWVudHMsIDEgKTtcblxuXHRcdGlmICggc2VsZlsgbWV0aG9kTmFtZSBdICkge1xuXHRcdFx0c2VsZlsgbWV0aG9kTmFtZSBdLmFwcGx5KCBzZWxmLCBwYXJhbXMgKTtcblx0XHR9XG5cblx0XHR2YXIgY2FsbGJhY2tzID0gZXZlbnRzWyBldmVudE5hbWUgXTtcblxuXHRcdGlmICggISBjYWxsYmFja3MgKSB7XG5cdFx0XHRyZXR1cm4gc2VsZjtcblx0XHR9XG5cblx0XHQkLmVhY2goIGNhbGxiYWNrcywgZnVuY3Rpb24oIGluZGV4LCBjYWxsYmFjayApIHtcblx0XHRcdGNhbGxiYWNrLmFwcGx5KCBzZWxmLCBwYXJhbXMgKTtcblx0XHR9ICk7XG5cblx0XHRyZXR1cm4gc2VsZjtcblx0fTtcblxuXHRpbml0KCk7XG59O1xuXG5Nb2R1bGUucHJvdG90eXBlLl9fY29uc3RydWN0ID0gZnVuY3Rpb24oKSB7fTtcblxuTW9kdWxlLnByb3RvdHlwZS5nZXREZWZhdWx0U2V0dGluZ3MgPSBmdW5jdGlvbigpIHtcblx0cmV0dXJuIHt9O1xufTtcblxuTW9kdWxlLmV4dGVuZHNDb3VudCA9IDA7XG5cbk1vZHVsZS5leHRlbmQgPSBmdW5jdGlvbiggcHJvcGVydGllcyApIHtcblx0dmFyICQgPSBqUXVlcnksXG5cdFx0cGFyZW50ID0gdGhpcztcblxuXHR2YXIgY2hpbGQgPSBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gcGFyZW50LmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblx0fTtcblxuXHQkLmV4dGVuZCggY2hpbGQsIHBhcmVudCApO1xuXG5cdGNoaWxkLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoICQuZXh0ZW5kKCB7fSwgcGFyZW50LnByb3RvdHlwZSwgcHJvcGVydGllcyApICk7XG5cblx0Y2hpbGQucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gY2hpbGQ7XG5cblx0Lypcblx0ICogQ29uc3RydWN0b3IgSUQgaXMgdXNlZCB0byBzZXQgYW4gdW5pcXVlIElEXG4gICAgICogdG8gZXZlcnkgZXh0ZW5kIG9mIHRoZSBNb2R1bGUuXG4gICAgICpcblx0ICogSXQncyB1c2VmdWwgaW4gc29tZSBjYXNlcyBzdWNoIGFzIHVuaXF1ZVxuXHQgKiBsaXN0ZW5lciBmb3IgZnJvbnRlbmQgaGFuZGxlcnMuXG5cdCAqL1xuXHR2YXIgY29uc3RydWN0b3JJRCA9ICsrTW9kdWxlLmV4dGVuZHNDb3VudDtcblxuXHRjaGlsZC5wcm90b3R5cGUuZ2V0Q29uc3RydWN0b3JJRCA9IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiBjb25zdHJ1Y3RvcklEO1xuXHR9O1xuXG5cdGNoaWxkLl9fc3VwZXJfXyA9IHBhcmVudC5wcm90b3R5cGU7XG5cblx0cmV0dXJuIGNoaWxkO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBNb2R1bGU7XG4iLCJ2YXIgTW9kdWxlID0gcmVxdWlyZSggJy4vbW9kdWxlJyApLFxuXHRWaWV3TW9kdWxlO1xuXG5WaWV3TW9kdWxlID0gTW9kdWxlLmV4dGVuZCgge1xuXHRlbGVtZW50czogbnVsbCxcblxuXHRnZXREZWZhdWx0RWxlbWVudHM6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB7fTtcblx0fSxcblxuXHRiaW5kRXZlbnRzOiBmdW5jdGlvbigpIHt9LFxuXG5cdG9uSW5pdDogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5pbml0RWxlbWVudHMoKTtcblxuXHRcdHRoaXMuYmluZEV2ZW50cygpO1xuXHR9LFxuXG5cdGluaXRFbGVtZW50czogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5lbGVtZW50cyA9IHRoaXMuZ2V0RGVmYXVsdEVsZW1lbnRzKCk7XG5cdH1cbn0gKTtcblxubW9kdWxlLmV4cG9ydHMgPSBWaWV3TW9kdWxlO1xuIl19
