const ControlMultipleBaseItemView = require( 'elementor-controls/base-multiple' );
class ControlIconsView extends ControlMultipleBaseItemView {
	ui() {
		const ui = super.ui;

		ui.controlMedia = '.elementor-control-media';
		ui.mediaImage = '.elementor-control-media-image';
		ui.mediaVideo = '.elementor-control-media-video';
		ui.frameOpeners = '.elementor-control-preview-area';
		ui.deleteButton = '.elementor-control-media-delete';

		return ui;
	}

	events() {
		return _.extend( ControlMultipleBaseItemView.prototype.events.apply( this, arguments ), {
			'click @ui.frameOpeners': 'openPicker',
			'click @ui.deleteButton': 'deleteIcon',
		} );
	}

	openPicker() {
		if ( ! this.picker ) {
			this.picker = new require( '../../../../../core/common/assets/js/views/modal/layout' );
		}
	}

	applySavedValue() {
		// var url = this.getControlValue( 'url' ),
		// 	mediaType = this.getMediaType();
		//
		// if ( 'image' === mediaType ) {
		// 	this.ui.mediaImage.css( 'background-image', url ? 'url(' + url + ')' : '' );
		// } else if ( 'video' === mediaType ) {
		// 	this.ui.mediaVideo.attr( 'src', url );
		// }
		//
		// this.ui.controlMedia.toggleClass( 'elementor-media-empty', ! url );
	}

	deleteIcon( event ) {
		event.stopPropagation();

		this.setValue( {
			value: '',
			library: '',
		} );

		//this.applySavedValue();
	}

	onBeforeDestroy() {
		this.$el.remove();
	}
}
module.exports = ControlIconsView;
