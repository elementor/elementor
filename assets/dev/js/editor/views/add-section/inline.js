import BaseAddSectionView from './base';

class AddSectionView extends BaseAddSectionView {
	className() {
		return super.className() + ' elementor-add-section-inline';
	}

	fadeToDeath() {
		var self = this;

		self.$el.slideUp( function() {
			self.destroy();
		} );
	}

	onAfterPaste() {
		super.onAfterPaste();

		this.destroy();
	}

	onCloseButtonClick() {
		this.fadeToDeath();
	}

	onPresetSelected( event ) {
		super.onPresetSelected( event );

		this.destroy();
	}

	onFlexPresetSelected( e ) {
		super.onFlexPresetSelected( e );

		this.destroy();
	}

	onAddTemplateButtonClick() {
		super.onAddTemplateButtonClick();

		this.destroy();
	}

	getDroppableOptions() {
		return {
			onDropping: ( side, event ) => {
				super.getDroppableOptions().onDropping( side, event );
				this.destroy();
			},
		};
	}

	onDropping() {
		const droppableOptions = this.getDroppableOptions();

		super.onDropping();

		if ( droppableOptions.onDropping ) {
			droppableOptions.onDropping();
		}
	}
}

export default AddSectionView;
