import { ContextMenuManager } from 'elementor-assets-js/modules/context-menu/manager';

// Element
export const onContextMenu = () => {
	const manager = new ContextMenuManager();

	// Add groups that will be displayed first.
	manager.createGroup(
	{
		id: 'someGroupId',							// <string> Required, must be unique name, used to find the group.
		title: '', 									// <string> If exists, displayed as a group title without action to trigger.
		disabled: false,							// <function | boolean> Displayed but disabled, if false.
		displayed: true,							// <function | boolean> Not displayed, if false.
		parentItemId: '',							// <string> the name of the parent item, if current group in a child of an item (used for nested menu).
	} );

	// Add groups from 3P
	window.dispatchEvent( new CustomEvent( 'elementor/element/contextMenu', { detail: {
			manager,
			elType: 'widget',
			widgetType: 'awesome-widget3',
		} } ) );

	// Add groups that will be displayed last.
	manager.createGroup(
		{
			id: 'deleteElement',						// <string> Required, must be unique name, used to find the group.
			title: '', 									// <string> If exists, displayed as a group title without action to trigger.
			disabled: false,							// <function | boolean> Displayed but disabled, if false.
			displayed: true,							// <function | boolean> Not displayed, if false.
			parentItemId: '',							// <string> the name of the parent item, if current group in a child of an item (used for nested menu).
		} );

	// ReactDom.createPortal(manager.getConfig)
};

// Third Party
window.addEventListener( 'elementor/element/contextMenu', ( e ) => {
	if ( 'container' !== e.detail.elType ) {
		return;
	}

	e.detail.manager.createGroup(
		{
			id: 'someCustomGroup',						// <string> Required, must be unique name, used to find the group.
			title: '', 									// <string> If exists, displayed as a group title without action to trigger.
			disabled: false,							// <function | boolean> Displayed but disabled, if false.
			displayed: true,							// <function | boolean> Not displayed, if false.
			parentItemId: '',							// <string> ID of parent item, if current group is child of an item (used for nested menu).
	} );
} );
