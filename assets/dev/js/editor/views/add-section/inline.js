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

	onAfterDrop() {
		super.onAfterDrop();

		this.destroy();
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

	onAddTemplateButtonClick() {
		super.onAddTemplateButtonClick();

		this.destroy();
	}

	onDropping() {
		super.onDropping();

		this.destroy();
	}
}

export default AddSectionView;
