import LandingPagesModule from 'elementor/modules/landing-pages/assets/js/admin/module';
import ExperimentsModule from 'elementor/core/experiments/assets/js/admin/module';
import environment from '../../../../core/common/assets/js/utils/environment';
import Events from 'elementor-utils/events';
import FilesUploadHandler from '../editor/utils/files-upload-handler';
import TemplateControls from './new-template/template-controls.js';

( function( $ ) {
	var ElementorAdmin = elementorModules.ViewModule.extend( {

		maintenanceMode: null,

		config: elementorAdminConfig,

		getDefaultElements() {
			var elements = {
				$switchMode: $( '#elementor-switch-mode' ),
				$goToEditLink: $( '#elementor-go-to-edit-page-link' ),
				$switchModeInput: $( '#elementor-switch-mode-input' ),
				$switchModeButton: $( '#elementor-switch-mode-button' ),
				$elementorLoader: $( '.elementor-loader' ),
				$builderEditor: $( '#elementor-editor' ),
				$importButton: $( '#elementor-import-template-trigger' ),
				$importNowButton: $( '#e-import-template-action' ),
				$importArea: $( '#elementor-import-template-area' ),
				$importForm: $( '#elementor-import-template-form' ),
				$importFormFileInput: $( '#elementor-import-template-form input[type="file"]' ),
				$settingsForm: $( '#elementor-settings-form' ),
				$settingsTabsWrapper: $( '#elementor-settings-tabs-wrapper' ),
				$menuGetHelpLink: $( 'a[href="admin.php?page=go_knowledge_base_site"]' ),
				$menuGoProLink: $( 'a[href="admin.php?page=go_elementor_pro"]' ),
				$reMigrateGlobalsButton: $( '.elementor-re-migrate-globals-button' ),
			};

			elements.$settingsFormPages = elements.$settingsForm.find( '.elementor-settings-form-page' );

			elements.$activeSettingsPage = elements.$settingsFormPages.filter( '.elementor-active' );

			elements.$settingsTabs = elements.$settingsTabsWrapper.children();

			elements.$activeSettingsTab = elements.$settingsTabs.filter( '.nav-tab-active' );

			return elements;
		},

		toggleStatus() {
			var isElementorMode = this.isElementorMode();

			elementorCommon.elements.$body
				.toggleClass( 'elementor-editor-active', isElementorMode )
				.toggleClass( 'elementor-editor-inactive', ! isElementorMode );
		},

		bindEvents() {
			var self = this;

			self.elements.$switchModeButton.on( 'click', function( event ) {
				event.preventDefault();

				if ( self.isElementorMode() ) {
					elementorCommon.dialogsManager.createWidget( 'confirm', {
						message: __( 'Please note that you are switching to WordPress default editor. Your current layout, design and content might break.', 'elementor' ),
						headerMessage: __( 'Back to WordPress Editor', 'elementor' ),
						strings: {
							confirm: __( 'Continue', 'elementor' ),
							cancel: __( 'Cancel', 'elementor' ),
						},
						defaultOption: 'confirm',
						onConfirm() {
							self.elements.$switchModeInput.val( '' );
							self.toggleStatus();
						},
					} ).show();
				} else {
					self.elements.$switchModeInput.val( true );

					var $wpTitle = $( '#title' );

					if ( ! $wpTitle.val() ) {
						$wpTitle.val( 'Elementor #' + $( '#post_ID' ).val() );
					}

					if ( wp.autosave ) {
						wp.autosave.server.triggerSave();
					}

					self.animateLoader();

					$( document ).on( 'heartbeat-tick.autosave', function() {
						elementorCommon.elements.$window.off( 'beforeunload.edit-post' );

						location.href = self.elements.$goToEditLink.attr( 'href' );
					} );
					self.toggleStatus();
				}
			} );

			self.elements.$goToEditLink.on( 'click', function() {
				self.animateLoader();
			} );

			$( '.e-notice--dismissible' ).on( 'click', '.e-notice__dismiss, .e-notice-dismiss', function( event ) {
				event.preventDefault();

				const $wrapperElm = $( this ).closest( '.e-notice--dismissible' );

				$.post( ajaxurl, {
					action: 'elementor_set_admin_notice_viewed',
					notice_id: $wrapperElm.data( 'notice_id' ),
				} );

				$wrapperElm.fadeTo( 100, 0, function() {
					$wrapperElm.slideUp( 100, function() {
						$wrapperElm.remove();
					} );
				} );
			} );

			$( '#elementor-clear-cache-button' ).on( 'click', function( event ) {
				event.preventDefault();
				var $thisButton = $( this );

				$thisButton.removeClass( 'success' ).addClass( 'loading' );

				$.post( ajaxurl, {
					action: 'elementor_clear_cache',
					_nonce: $thisButton.data( 'nonce' ),
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
					_nonce: $thisButton.data( 'nonce' ),
				} )
					.done( function() {
						$thisButton.removeClass( 'loading' ).addClass( 'success' );
					} );
			} );

			$( '#elementor-recreate-kit-button' ).on( 'click', function( event ) {
				event.preventDefault();
				var $thisButton = $( this );

				$thisButton.removeClass( 'success error' ).addClass( 'loading' )
					.next( '.e-recreate-kit-error-message' ).remove();

				$.post( ajaxurl, {
					action: 'elementor_recreate_kit',
					_nonce: $thisButton.data( 'nonce' ),
				} )
					.done( function() {
						$thisButton.removeClass( 'loading' ).addClass( 'success' );
					} )
					.fail( function( { responseJSON } ) {
						$thisButton.removeClass( 'loading' ).addClass( 'error' );

						if ( responseJSON.data?.message ) {
							$thisButton.after( `<div class="e-recreate-kit-error-message">${ responseJSON.data.message }</div>` );
						}
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
					_nonce: $this.data( 'nonce' ),
				} )
					.done( function( response ) {
						$this.removeClass( 'loading' );

						if ( response.success ) {
							$this.addClass( 'success' );
						}

						elementorCommon.dialogsManager.createWidget( 'alert', {
							message: response.data,
						} ).show();
					} );
			} );

			$( '#elementor_upgrade_fa_button' ).on( 'click', function( event ) {
				event.preventDefault();
				const $updateButton = $( this );
				$updateButton.addClass( 'loading' );

				elementorCommon.dialogsManager.createWidget( 'confirm', {
					id: 'confirm_fa_migration_admin_modal',
					message: __( 'I understand that by upgrading to Font Awesome 5,', 'elementor' ) + '<br>' + __( 'I acknowledge that some changes may affect my website and that this action cannot be undone.', 'elementor' ),
					headerMessage: __( 'Font Awesome 5 Migration', 'elementor' ),
					strings: {
						confirm: __( 'Continue', 'elementor' ),
						cancel: __( 'Cancel', 'elementor' ),
					},
					defaultOption: 'confirm',
					onConfirm: () => {
						$updateButton.removeClass( 'error' ).addClass( 'loading' );

						const {
							_nonce,
							action,
							redirectUrl,
						} = $updateButton.data();

						$.post( ajaxurl, { action, _nonce } )
							.done( function( response ) {
								$updateButton.removeClass( 'loading' ).addClass( 'success' );

								const messageElement = document.createElement( 'p' );
								messageElement.appendChild( document.createTextNode( response.data.message ) );

								$( '#elementor_upgrade_fa_button' ).parent().append( messageElement );

								if ( redirectUrl ) {
									location.href = decodeURIComponent( redirectUrl );

									return;
								}

								history.go( -1 );
							} )
							.fail( function() {
								$updateButton.removeClass( 'loading' ).addClass( 'error' );
							} );
					},
					onCancel: () => {
						$updateButton.removeClass( 'loading' ).addClass( 'error' );
					},
				} ).show();
			} );

			self.elements.$settingsTabs.on( {
				click( event ) {
					event.preventDefault();

					event.currentTarget.focus(); // Safari does not focus the tab automatically
				},
				focus() { // Using focus event to enable navigation by tab key
					var hrefWithoutHash = location.href.replace( /#.*/, '' );

					history.pushState( {}, '', hrefWithoutHash + this.hash );

					self.goToSettingsTabFromHash();
				},
			} );

			$( 'select.elementor-rollback-select' ).on( 'change', function() {
				var $this = $( this ),
					$rollbackButton = $this.next( '.elementor-rollback-button' ),
					placeholderText = $rollbackButton.data( 'placeholder-text' ),
					placeholderUrl = $rollbackButton.data( 'placeholder-url' );

				$rollbackButton.html( placeholderText.replace( '{VERSION}', $this.val() ) );
				$rollbackButton.attr( 'href', placeholderUrl.replace( 'VERSION', $this.val() ) );
			} ).trigger( 'change' );

			$( '.elementor-rollback-button' ).on( 'click', function( event ) {
				event.preventDefault();

				var $this = $( this );

				elementorCommon.dialogsManager.createWidget( 'confirm', {
					headerMessage: __( 'Rollback to Previous Version', 'elementor' ),
					message: __( 'Are you sure you want to reinstall previous version?', 'elementor' ),
					strings: {
						confirm: __( 'Continue', 'elementor' ),
						cancel: __( 'Cancel', 'elementor' ),
					},
					onConfirm() {
						$this.addClass( 'loading' );

						location.href = $this.attr( 'href' );
					},
				} ).show();
			} );

			self.elements.$reMigrateGlobalsButton.on( 'click', ( event ) => {
				event.preventDefault();

				const $this = $( event.currentTarget );

				elementorCommon.dialogsManager.createWidget( 'confirm', {
					headerMessage: __( 'Migrate to v3.0', 'elementor' ),
					message: __( 'Please note that this process will revert all changes made to Global Colors and Fonts since upgrading to v3.x.', 'elementor' ),
					strings: {
						confirm: __( 'Continue', 'elementor' ),
						cancel: __( 'Cancel', 'elementor' ),
					},
					onConfirm: () => {
						$this.removeClass( 'success' ).addClass( 'loading' );

						elementorCommon.ajax.addRequest( 're_migrate_globals', {
							success: () => $this.removeClass( 'loading' ).addClass( 'success' ),
						} );
					},
				} ).show();
			} );

			$( '.elementor_css_print_method select' ).on( 'change', function() {
				var $descriptions = $( '.elementor-css-print-method-description' );

				$descriptions.hide();
				$descriptions.filter( '[data-value="' + $( this ).val() + '"]' ).show();
			} ).trigger( 'change' );

			$( '.elementor_google_font select' ).on( 'change', function() {
				$( '.elementor_font_display' ).toggle( '1' === $( this ).val() );
			} ).trigger( 'change' );
		},

		onInit() {
			elementorModules.ViewModule.prototype.onInit.apply( this, arguments );

			this.initTemplatesImport();

			this.initMaintenanceMode();

			this.goToSettingsTabFromHash();

			this.openLinksInNewTab();

			this.addUserAgentClasses();

			this.roleManager.init();

			if ( elementorCommon.config.experimentalFeatures[ 'landing-pages' ] ) {
				new LandingPagesModule();
			}
			this.templateControls = new TemplateControls();

			new ExperimentsModule();
		},

		addUserAgentClasses() {
			const body = document.querySelector( 'body' );
			Object.entries( environment ).forEach( ( [ key, value ] ) => {
				if ( ! value ) {
					return;
				}

				body.classList.add( 'e--ua-' + key );
			} );
		},

		/**
		 * Open Links in New Tab
		 *
		 * Adds a `target="_blank"` attribute to the Admin Dashboard menu items specified in the `elements` array,
		 * if the elements are found in the DOM. The items in the `elements` array should be jQuery instances.
		 *
		 * @since 3.6.0
		 */
		openLinksInNewTab() {
			const elements = [
				this.elements.$menuGetHelpLink,
				this.elements.$menuGoProLink,
			];

			elements.forEach( ( $element ) => {
				// Only add the attribute if the element is found.
				if ( $element.length ) {
					$element.attr( 'target', '_blank' );
				}
			} );
		},

		initTemplatesImport() {
			if ( ! elementorCommon.elements.$body.hasClass( 'post-type-elementor_library' ) ) {
				return;
			}

			const self = this,
				$importForm = self.elements.$importForm,
				$importButton = self.elements.$importButton,
				$importArea = self.elements.$importArea,
				$importNowButton = self.elements.$importNowButton,
				$importFormFileInput = self.elements.$importFormFileInput;

			self.elements.$formAnchor = $( '.wp-header-end' );

			$( '#wpbody-content' ).find( '.page-title-action' ).last().after( $importButton );

			self.elements.$formAnchor.after( $importArea );

			$importButton.on( 'click', function() {
				$( '#elementor-import-template-area' ).toggle();
			} );

			$importForm.on( 'submit', ( event ) => {
				$importNowButton[ 0 ].disabled = true;
				$importNowButton[ 0 ].value = __( 'Importing...', 'elementor' );

				if ( $importFormFileInput[ 0 ].files.length && ! elementorCommon.config.filesUpload.unfilteredFiles ) {
					event.preventDefault();

					const enableUnfilteredFilesModal = FilesUploadHandler.getUnfilteredFilesNotEnabledImportTemplateDialog( () => {
						$importForm.trigger( 'submit' );
					} );

					enableUnfilteredFilesModal.show();
				}
			} );
		},

		initMaintenanceMode() {
			var MaintenanceMode = require( 'elementor-admin/maintenance-mode' );

			this.maintenanceMode = new MaintenanceMode();
		},

		isElementorMode() {
			return ! ! this.elements.$switchModeInput.val();
		},

		animateLoader() {
			this.elements.$goToEditLink.addClass( 'elementor-animate' );
		},

		goToSettingsTabFromHash() {
			var hash = location.hash.slice( 1 );

			if ( hash ) {
				this.goToSettingsTab( hash );
			}
		},

		goToSettingsTab( tabName ) {
			const $pages = this.elements.$settingsFormPages;

			if ( ! $pages.length ) {
				return;
			}

			const $activePage = $pages.filter( '#' + tabName );

			this.elements.$activeSettingsPage.removeClass( 'elementor-active' );

			this.elements.$activeSettingsTab.removeClass( 'nav-tab-active' );

			const $activeTab = this.elements.$settingsTabs.filter( '#elementor-settings-' + tabName );

			$activePage.addClass( 'elementor-active' );

			$activeTab.addClass( 'nav-tab-active' );

			this.elements.$settingsForm.attr( 'action', 'options.php#' + tabName );

			this.elements.$activeSettingsPage = $activePage;

			this.elements.$activeSettingsTab = $activeTab;
		},

		translate( stringKey, templateArgs ) {
			return elementorCommon.translate( stringKey, null, templateArgs, this.config.i18n );
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
				arrowDown: 'dashicons-arrow-down',
			},
			toggle( $trigger ) {
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
			updateLabel( $row ) {
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
			setAdvancedState( $row, state ) {
				var self = this,
					$controls = $row.find( 'input[type="checkbox"]' ).not( self.selectors.excludedField );

				$controls.each( function( index, input ) {
					$( input ).prop( 'disabled', state );
				} );
			},
			bind() {
				var self = this;
				$( document ).on( 'click', self.selectors.label + ',' + self.selectors.toggleHandle, function( event ) {
					event.stopPropagation();
					event.preventDefault();
					self.toggle( $( this ) );
				} ).on( 'change', self.selectors.excludedField, function() {
					self.updateLabel( $( this ).closest( self.selectors.row ) );
				} );
			},
			init() {
				var self = this;
				if ( ! $( 'body[class*="' + self.selectors.body + '"]' ).length ) {
					return;
				}
				self.bind();
				$( self.selectors.row ).each( function( index, row ) {
					self.updateLabel( $( row ) );
				} );
			},
		},
	} );

	$( function() {
		window.elementorAdmin = new ElementorAdmin();

		Events.dispatch( elementorCommon.elements.$window, 'elementor/admin/init' );
	} );
}( jQuery ) );
