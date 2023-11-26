const WidgetView = elementor.modules.elements.views.Widget;

export default class View extends WidgetView {
	events() {
		return {
			'click .e-promotion-delete': 'onRemoveButtonClick',
		};
	}

	className() {
		return super.className().replace( /elementor-element-edit-mode/g, '' ) + ' e-widget-pro-promotion';
	}

	getHandlesOverlay() {
		return '';
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
}
