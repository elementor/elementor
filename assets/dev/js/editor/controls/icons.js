const ControlMultipleBaseItemView = require( 'elementor-controls/base-multiple' );
class ControlIconsView extends ControlMultipleBaseItemView {
	enqueueStylesheet( url ) {
		if ( ! jQuery( document ).find( 'link[href="' + url + '"]' ).length ) {
			jQuery( document ).find( 'link:last' ).after( '<link href="' + url + '" rel="stylesheet" type="text/css">' );
		}
		if ( ! elementor.$previewContents.find( 'link[href="' + url + '"]' ).length ) {
			elementor.$previewContents.find( 'link:last' ).after( '<link href="' + url + '" rel="stylesheet" type="text/css">' );
		}
	}

	enqueueIconFonts( iconType ) {
		const iconSetting = elementor.helpers.getIconLibrarySettings( iconType );
		if ( false === iconSetting ) {
			return;
		}

		if ( iconSetting.enqueue ) {
			iconSetting.enqueue.forEach( ( assetURL ) => {
				this.enqueueStylesheet( assetURL );
			} );
		}

		if ( iconSetting.url ) {
			this.enqueueStylesheet( iconSetting.url );
		}
	}

	ui() {
		const ui = super.ui();

		ui.frameOpeners = '.elementor-control-preview-area';
		ui.deleteButton = '.elementor-control-icon-delete';
		ui.previewContainer = '.elementor-control-icons-preview';

		return ui;
	}

	events() {
		return _.extend( ControlMultipleBaseItemView.prototype.events.apply( this, arguments ), {
			'click @ui.frameOpeners': 'openPicker',
			'click @ui.deleteButton': 'deleteIcon',
		} );
	}

	openPicker() {
		elementor.iconManager.show( { view: this } );
	}

	applySavedValue() {
		const iconValue = this.getControlValue( 'value' ),
			iconType = this.getControlValue( 'library' );

		if ( ! iconValue ) {
			this.ui.frameOpeners.toggleClass( 'elementor-preview-has-icon', !! iconValue );
			return;
		}
		const previewHTML = '<i class="' + iconValue + '"></i>';
		this.ui.previewContainer.html( previewHTML );
		this.ui.frameOpeners.toggleClass( 'elementor-preview-has-icon', !! iconValue );
		this.enqueueIconFonts( iconType );
	}

	deleteIcon( event ) {
		event.stopPropagation();

		this.setValue( {
			value: '',
			library: '',
		} );

		this.applySavedValue();
	}

	onBeforeDestroy() {
		this.$el.remove();
	}
}
module.exports = ControlIconsView;
