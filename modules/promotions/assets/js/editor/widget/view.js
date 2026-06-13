const WidgetView = elementor.modules.elements.views.Widget;

export default class View extends WidgetView {
	events() {
		return {
			'click .e-promotion-delete': 'onRemoveButtonClick',
			'click .e-promotion-go-pro': 'onGoProButtonClick',
		};
	}

	className() {
		return super.className().replace( /elementor-element-edit-mode/g, '' ) + ' e-widget-pro-promotion';
	}

	getHandlesOverlay() {
		return '';
	}

	hasFrozenRenderedHtml() {
		return Boolean( this.getEditModel().getSetting( '__rendered_html' )?.trim() );
	}

	_renderChildren() {
		if ( this.hasFrozenRenderedHtml() ) {
			return;
		}

		return WidgetView.prototype._renderChildren.apply( this, arguments );
	}

	getContextMenuGroups() {
		return super.getContextMenuGroups().filter(
			( group ) => {
				return (
					'clipboard' !== group.name &&
					'save' !== group.name &&
					'general' !== group.name
				);
			},
		);
	}

	onGoProButtonClick( event ) {
		event.preventDefault();
		event.stopPropagation();

		window.open( event.currentTarget.href, '_blank' );
	}
}
