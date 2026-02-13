const TemplateLibraryTemplateView = require( 'elementor-templates/views/template/base' );

import { SAVE_CONTEXTS } from './../../constants';

const TemplateLibraryTemplateLocalView = TemplateLibraryTemplateView.extend( {
	template: '#tmpl-elementor-template-library-template-local',

	ui() {
		return _.extend( TemplateLibraryTemplateView.prototype.ui.apply( this, arguments ), {
			bulkSelectionItemCheckbox: '.bulk-selection-item-checkbox',
			deleteButton: '.elementor-template-library-template-delete',
			renameButton: '.elementor-template-library-template-rename',
			moveButton: '.elementor-template-library-template-move',
			copyButton: '.elementor-template-library-template-copy',
			exportButton: '.elementor-template-library-template-export',
			morePopup: '.elementor-template-library-template-more',
			toggleMore: '.elementor-template-library-template-more-toggle',
			toggleMoreIcon: '.elementor-template-library-template-more-toggle i',
			titleCell: '.elementor-template-library-template-name span',
			resourceIcon: '.elementor-template-library-template-name i',
		} );
	},

	events() {
		return _.extend( TemplateLibraryTemplateView.prototype.events.apply( this, arguments ), {
			click: 'handleItemClicked',
			'change @ui.bulkSelectionItemCheckbox': 'onSelectBulkSelectionItemCheckbox',
			'click @ui.deleteButton': 'onDeleteButtonClick',
			'click @ui.toggleMore': 'onToggleMoreClick',
			'keydown @ui.toggleMore': 'onToggleMoreKeyDown',
			'keydown @ui.morePopup': 'onMenuKeyDown',
			'click @ui.renameButton': 'onRenameClick',
			'click @ui.moveButton': 'onMoveClick',
			'click @ui.copyButton': 'onCopyClick',
			'click @ui.exportButton': 'onExportClick',
		} );
	},

	modelEvents: {
		'change:title': 'onTitleChange',
	},

	onRender() {
		if ( this.ui.toggleMore.length ) {
			this.ui.toggleMore.attr( {
				'aria-haspopup': 'menu',
				'aria-expanded': 'false',
			} );
		}

		if ( this.ui.bulkSelectionItemCheckbox.length ) {
			this.updateRowSelectionAttributes();
		}

		// Set up click-outside handler to close context menu
		if ( this.ui.morePopup && this.ui.morePopup.length ) {
			this._onDocumentClick = ( e ) => {
				if ( 'true' !== this.ui.toggleMore.attr( 'aria-expanded' ) ) {
					return;
				}
				if ( ! this.ui.toggleMore[ 0 ].contains( e.target ) && ! this.ui.morePopup[ 0 ].contains( e.target ) ) {
					this.closeContextMenu();
				}
			};
			jQuery( document ).on( 'click', this._onDocumentClick );

			// Set tabindex on menu items for keyboard focus
			this.ui.morePopup.find( 'button, a' ).attr( 'tabindex', '-1' );
		}
	},

	onBeforeDestroy() {
		if ( this._onDocumentClick ) {
			jQuery( document ).off( 'click', this._onDocumentClick );
		}
	},

	openContextMenu() {
		this.handleLockedTemplate();
		this.ui.toggleMore.attr( 'aria-expanded', 'true' );
		this.ui.morePopup.show();

		elementor.templates.eventManager.sendPageViewEvent( {
			location: elementorCommon.eventsManager.config.secondaryLocations.templateLibrary.morePopup,
		} );
	},

	closeContextMenu() {
		this.ui.toggleMore.attr( 'aria-expanded', 'false' );
		this.ui.morePopup.hide();
	},

	getMenuItems() {
		return this.ui.morePopup.find( 'button:visible, a:visible' );
	},

	onToggleMoreKeyDown( event ) {
		if ( 'Escape' === event.key ) {
			event.preventDefault();
			event.stopPropagation();

			if ( 'true' === this.ui.toggleMore.attr( 'aria-expanded' ) ) {
				this.closeContextMenu();

				// Suppress the upcoming keyup to prevent the modal from closing.
				const suppressKeyUp = ( e ) => {
					if ( 'Escape' === e.key ) {
						e.stopImmediatePropagation();
						window.removeEventListener( 'keyup', suppressKeyUp, true );
					}
				};
				window.addEventListener( 'keyup', suppressKeyUp, true );
			}
			return;
		}

		// Open menu and focus first item on ArrowDown, Enter, or Space.
		// We must preventDefault to stop the browser from also firing a native click
		// on the <button>, which would cause a double-toggle (open then close).
		if ( 'ArrowDown' === event.key || 'Enter' === event.key || ' ' === event.key ) {
			event.preventDefault();
			event.stopPropagation();

			if ( 'true' !== this.ui.toggleMore.attr( 'aria-expanded' ) ) {
				this.openContextMenu();
			}

			const $items = this.getMenuItems();
			if ( $items.length ) {
				$items.first().trigger( 'focus' );
			}
		}
	},

	onMenuKeyDown( event ) {
		const $items = this.getMenuItems();
		const currentIndex = $items.index( event.target );

		switch ( event.key ) {
			case 'Escape':
				event.preventDefault();
				event.stopPropagation();
				this.closeContextMenu();
				this.ui.toggleMore.trigger( 'focus' );

				// The modal's dialog library listens for Escape on keyup (window level).
				// We must suppress the upcoming keyup to prevent the modal from closing.
				const suppressKeyUp = ( e ) => {
					if ( 'Escape' === e.key ) {
						e.stopImmediatePropagation();
						window.removeEventListener( 'keyup', suppressKeyUp, true );
					}
				};
				window.addEventListener( 'keyup', suppressKeyUp, true );
				break;

			case 'ArrowDown':
			case 'Tab':
				if ( 'Tab' === event.key && event.shiftKey ) {
					// Shift+Tab: move backwards; at the first item, close menu and let focus go back
					if ( currentIndex <= 0 ) {
						this.closeContextMenu();
						this.ui.toggleMore.trigger( 'focus' );
						event.preventDefault();
						event.stopPropagation();
					} else {
						event.preventDefault();
						event.stopPropagation();
						$items.eq( currentIndex - 1 ).trigger( 'focus' );
					}
					break;
				}
				event.preventDefault();
				event.stopPropagation();
				if ( currentIndex < $items.length - 1 ) {
					$items.eq( currentIndex + 1 ).trigger( 'focus' );
				} else if ( 'Tab' === event.key ) {
					// Tab past the last item: close menu and move focus to the toggle,
					// then let the next Tab naturally advance to the following element
					this.closeContextMenu();
					this.ui.toggleMore.trigger( 'focus' );
				} else {
					// ArrowDown wraps to first item
					$items.first().trigger( 'focus' );
				}
				break;

			case 'ArrowUp':
				event.preventDefault();
				event.stopPropagation();
				if ( currentIndex > 0 ) {
					$items.eq( currentIndex - 1 ).trigger( 'focus' );
				} else {
					$items.last().trigger( 'focus' );
				}
				break;

			case 'Home':
				event.preventDefault();
				event.stopPropagation();
				$items.first().trigger( 'focus' );
				break;

			case 'End':
				event.preventDefault();
				event.stopPropagation();
				$items.last().trigger( 'focus' );
				break;
		}
	},

	updateRowSelectionAttributes() {
		const isChecked = this.ui.bulkSelectionItemCheckbox.prop( 'checked' );
		const isSelected = this.$el.hasClass( 'bulk-selected-item' );

		this.ui.bulkSelectionItemCheckbox.attr( 'aria-checked', isChecked );

		if ( isSelected ) {
			this.$el.attr( {
				'aria-selected': 'true',
				tabindex: '0',
			} );
		} else {
			this.$el.attr( {
				'aria-selected': 'false',
				tabindex: '-1',
			} );
		}
	},

	handleLockedTemplate() {
		const isLocked = this.model.isLocked();

		this.ui.renameButton.toggleClass( 'disabled', isLocked );
		this.ui.moveButton.toggleClass( 'disabled', isLocked );
		this.ui.copyButton.toggleClass( 'disabled', isLocked );
		this.ui.exportButton.toggleClass( 'disabled', isLocked );
	},

	onTitleChange() {
		const title = _.escape( this.model.get( 'title' ) );

		this.ui.titleCell.text( title );

		if ( this.ui.bulkSelectionItemCheckbox.length ) {
			const ariaLabel = __( 'Select template', 'elementor' ) + ' ' + title;
			this.ui.bulkSelectionItemCheckbox.attr( 'aria-label', ariaLabel );
		}
	},

	handleItemClicked( event ) {
		if ( event.target.closest( '.bulk-selection-item-checkbox' ) ) {
			return; // Ignore clicks from checkbox
		}

		if ( ! this._clickState ) {
			this._clickState = {
				timeoutId: null,
				delay: 250,
			};
		}

		const state = this._clickState;

		if ( state.timeoutId ) {
			clearTimeout( state.timeoutId );
			state.timeoutId = null;

			this.handleItemDoubleClick();
		} else {
			state.timeoutId = setTimeout( () => {
				state.timeoutId = null;

				this.handleItemSingleClick();
			}, state.delay );
		}
	},

	handleItemSingleClick() {
		this.handleListViewItemSingleClick();
	},

	handleItemDoubleClick() {},

	handleListViewItemSingleClick() {
		const checkbox = this.ui.bulkSelectionItemCheckbox;
		const isChecked = checkbox.prop( 'checked' );

		checkbox.prop( 'checked', ! isChecked ).trigger( 'change' );
	},

	onDeleteButtonClick( event ) {
		event.stopPropagation();

		// Close the context menu before opening the delete confirmation dialog
		this.closeContextMenu();

		var toggleMoreIcon = this.ui.toggleMoreIcon;

		elementor.templates.deleteTemplate( this.model, {
			onConfirm() {
				toggleMoreIcon.removeClass( 'eicon-ellipsis-h' ).addClass( 'eicon-loading eicon-animation-spin' );
			},
		} );
	},

	onToggleMoreClick( event ) {
		event.stopPropagation();

		this.handleLockedTemplate();

		const isExpanded = 'true' === this.ui.toggleMore.attr( 'aria-expanded' );
		this.ui.toggleMore.attr( 'aria-expanded', ! isExpanded );

		if ( isExpanded ) {
			this.ui.morePopup.hide();
		} else {
			this.ui.morePopup.show();

			// Focus the first visible menu item when opening via click
			const $items = this.getMenuItems();
			if ( $items.length ) {
				$items.first().trigger( 'focus' );
			}
		}

		elementor.templates.eventManager.sendPageViewEvent( {
			location: elementorCommon.eventsManager.config.secondaryLocations.templateLibrary.morePopup,
		} );
	},

	onPreviewButtonClick( event ) {
		event.stopPropagation();

		open( this.model.get( 'url' ), '_blank' );
	},

	async onRenameClick( event ) {
		event.stopPropagation();

		if ( this.model.isLocked() ) {
			return;
		}

		// Close the context menu before opening rename dialog
		this.closeContextMenu();

		try {
			await elementor.templates.renameTemplate( this.model, {
				onConfirm: () => this.showToggleMoreLoader(),
			} );
		} finally {
			this.hideToggleMoreLoader();

			// Restore focus to the toggle button after rename completes
			if ( this.ui.toggleMore && this.ui.toggleMore.length ) {
				this.ui.toggleMore.trigger( 'focus' );
			}
		}
	},

	onMoveClick() {
		if ( this.model.isLocked() ) {
			return;
		}

		$e.route( 'library/save-template', {
			model: this.model,
			context: SAVE_CONTEXTS.MOVE,
		} );
	},

	onCopyClick() {
		if ( this.model.isLocked() ) {
			return;
		}

		$e.route( 'library/save-template', {
			model: this.model,
			context: SAVE_CONTEXTS.COPY,
		} );
	},

	onExportClick( e ) {
		e.stopPropagation();

		if ( this.model.isLocked() ) {
			e.preventDefault();
		}
	},

	showToggleMoreLoader() {
		this.ui.toggleMoreIcon.removeClass( 'eicon-ellipsis-h' ).addClass( 'eicon-loading eicon-animation-spin' );
	},

	hideToggleMoreLoader() {
		this.ui.toggleMoreIcon.addClass( 'eicon-ellipsis-h' ).removeClass( 'eicon-loading eicon-animation-spin' );
	},

	onSelectBulkSelectionItemCheckbox( event ) {
		event.stopPropagation();

		if ( event?.target?.checked ) {
			elementor.templates.addBulkSelectionItem( event.target.dataset.template_id, event.target.dataset.type );
			this.$el.addClass( 'bulk-selected-item' );
		} else {
			elementor.templates.removeBulkSelectionItem( event.target.dataset.template_id, event.target.dataset.type );
			this.$el.removeClass( 'bulk-selected-item' );
		}

		this.updateRowSelectionAttributes();
		elementor.templates.layout.handleBulkActionBarUi();
	},
} );

module.exports = TemplateLibraryTemplateLocalView;
