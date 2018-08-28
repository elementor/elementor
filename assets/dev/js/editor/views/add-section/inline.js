import BaseAddSectionView from './base';

class AddSectionView extends BaseAddSectionView {
	className() {
		return BaseAddSectionView.prototype.className.apply( this, arguments ) + ' elementor-add-section-inline';
	}

	fadeToDeath() {
		var self = this;

		self.$el.slideUp( function() {
			self.destroy();
		} );
	}

	paste() {
		BaseAddSectionView.prototype.paste.apply( this, arguments );

		this.destroy();
	}

	onCloseButtonClick() {
		this.fadeToDeath();
	}

	onPresetSelected() {
		BaseAddSectionView.prototype.onPresetSelected.apply( this, arguments );

		this.destroy();
	}

	onAddTemplateButtonClick() {
		BaseAddSectionView.prototype.onAddTemplateButtonClick.apply( this, arguments );

		this.destroy();
	}

	onDropping() {
		BaseAddSectionView.prototype.onDropping.apply( this, arguments );

		this.destroy();
	}
}

export default AddSectionView;
