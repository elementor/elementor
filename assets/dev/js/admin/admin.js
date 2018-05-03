( function( $ ) {
	'use strict';

	var ElementorAdminApp = {

		maintenanceMode: null,

		config: ElementorAdminConfig,

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
				$settingsTabsWrapper: $( '#elementor-settings-tabs-wrapper' ),
				$addNew: $( '.post-type-elementor_library #wpbody-content .page-title-action:first, #elementor-template-library-add-new' ),
				$addNewDialogHeader:  $( '.elementor-templates-modal__header' ),
				$addNewDialogClose:  $( '.elementor-templates-modal__header__close' ),
				$addNewDialogContent:  $( '#elementor-new-template-dialog-content' )
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

						location.href = self.cache.$goToEditLink.attr( 'href' );
					} );
				}

				self.toggleStatus();
			} );

			self.cache.$addNew.on( 'click', function( event ) {
				event.preventDefault();
				self.getNewTemplateModal().show();
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

						self.getDialogsManager().createWidget( 'alert', {
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

				var $this = $( this );

				self.getDialogsManager().createWidget( 'confirm', {
					headerMessage: self.config.i18n.rollback_to_previous_version,
					message:  self.config.i18n.rollback_confirm,
					strings: {
						confirm:  self.config.i18n.yes,
						cancel:  self.config.i18n.cancel
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

			this.initDialogsManager();

			this.initTemplatesImport();

			this.initNewTemplateDialog();

			this.initMaintenanceMode();

			this.goToSettingsTabFromHash();

			this.roleManager.init();
		},

		initDialogsManager: function() {
			var dialogsManager;

			this.getDialogsManager = function() {
				if ( ! dialogsManager ) {
					dialogsManager = new DialogsManager.Instance();
				}

				return dialogsManager;
			};
		},

		initNewTemplateDialog: function() {
			var self = this,
				modal;

			self.getNewTemplateModal = function() {
				if ( ! modal ) {
					modal = self.getDialogsManager().createWidget( 'lightbox', {
						id: 'elementor-new-template-modal',
						className: 'elementor-templates-modal',
						headerMessage: self.cache.$addNewDialogHeader,
						message: self.cache.$addNewDialogContent.children(),
						hide: {
							onButtonClick: false
						},
						position: {
							my: 'center',
							at: 'center'
						},
						onReady: function() {
							DialogsManager.getWidgetType( 'lightbox' ).prototype.onReady.apply( this, arguments );

							self.cache.$addNewDialogClose.on( 'click', function() {
								modal.hide();
							} );
						}
					} );
				}

				return modal;
			};

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
		},

		roleManager: {
			selectors: {
				body: 'elementor-role-manager',
				row: '.elementor-role-row',
				label: '.elementor-role-label',
				excludedIndicator: '.elementor-role-excluded-indicator',
				excludedField: 'input[name="elementor_exclude_user_roles[]"]',
				controlsContainer: '.elementor-role-controls',
				toggleHandle: '.elementor-role-toggle',
				arrowUp: 'dashicons-arrow-up',
				arrowDown: 'dashicons-arrow-down'
			},
			toggle: function( $trigger ) {
				var self = this,
					$row = $trigger.closest( self.selectors.row ),
					$toggleHandleIcon = $row.find( self.selectors.toggleHandle ).find( '.dashicons' ),
					$controls = $row.find( self.selectors.controlsContainer );

				$controls.toggleClass( 'hidden' );
				if ( $controls.hasClass( 'hidden' ) ) {
					$toggleHandleIcon.removeClass( self.selectors.arrowUp ).addClass( self.selectors.arrowDown );
				} else {
					$toggleHandleIcon.removeClass( self.selectors.arrowDown ).addClass( self.selectors.arrowUp );
				}
				self.updateLabel( $row );
			},
			updateLabel: function( $row ) {
				var self = this,
					$indicator = $row.find( self.selectors.excludedIndicator ),
					excluded = $row.find( self.selectors.excludedField ).is( ':checked' );
				if ( excluded ) {
					$indicator.html( $indicator.data( 'excluded-label' ) );
				} else {
					$indicator.html( '' );
				}
				self.setAdvancedState( $row, excluded );
			},
			setAdvancedState: function( $row, state ) {
				var self = this,
					$controls = $row.find( 'input[type="checkbox"]' ).not( self.selectors.excludedField );

				$controls.each( function( index, input ) {
					$( input ).prop( 'disabled', state );
				});
			},
			bind: function() {
				var self = this;
				$( document ).on( 'click', self.selectors.label + ',' + self.selectors.toggleHandle, function( event ) {
					event.stopPropagation();
					event.preventDefault();
					self.toggle( $( this ) );
				} ).on( 'change', self.selectors.excludedField, function() {
					self.updateLabel( $( this ).closest( self.selectors.row ) );
				});

			},
			init: function() {
				var self = this;
				if ( ! $( 'body[class*="' + self.selectors.body + '"]' ).length ) {
					return;
				}
				self.bind();
				$( self.selectors.row ).each( function( index, row ) {
					self.updateLabel( $( row ) );
				});
			}
		}
	};

	$( function() {
		ElementorAdminApp.init();
	} );

	window.elementorAdmin = ElementorAdminApp;
}( jQuery ) );
