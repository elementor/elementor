const ContextMenu = require( 'elementor-editor-utils/context-menu' );

import {
	canMoveStructureDown,
	canMoveStructureIntoAbove,
	canMoveStructureOut,
	canMoveStructureUp,
	getElementContainer,
	runMoveStructureDown,
	runMoveStructureIntoAbove,
	runMoveStructureOut,
	runMoveStructureUp,
} from './navigator-structure-utils';

export default Marionette.Behavior.extend( {
	defaults: {
		context: 'structurePanel',
	},

	initialize() {
		this.contextMenu = null;
	},

	events: {
		contextmenu: 'onContextMenu',
	},

	onContextMenu( event ) {
		if ( $e.shortcuts?.isControlEvent?.( event ) ) {
			return;
		}

		event.preventDefault();
		event.stopPropagation();

		const view = this.view;

		if ( view.isNavigatorContainer?.() || view.isProPromotion?.() ) {
			return;
		}

		view.model.trigger( 'request:edit', { scrollIntoView: false } );

		this.getContextMenu().show( event, {
			location: elementorCommon.eventsManager.config.locations.structurePanel,
		} );
	},

	getContextMenu() {
		if ( ! this.contextMenu ) {
			this.contextMenu = new ContextMenu( {
				context: this.getOption( 'context' ),
				groups: this.getContextMenuGroups(),
			} );
		}

		this.refreshContextMenuState();

		return this.contextMenu;
	},

	refreshContextMenuState() {
		const groups = this.contextMenu.getSettings( 'groups' );

		groups.forEach( ( group ) => {
			group.actions.forEach( ( action ) => {
				if ( 'function' === typeof action.isEnabled ) {
					this.contextMenu.toggleActionUsability( action, action.isEnabled() );
				}
			} );
		} );
	},

	getContextMenuGroups() {
		const view = this.view;
		const container = getElementContainer( view.model );

		return [
			{
				name: 'structure-move',
				actions: [
					{
						name: 'move-up',
						icon: 'eicon-arrow-up',
						title: __( 'Move up', 'elementor' ),
						shortcut: 'Alt+↑',
						isEnabled: () => container && canMoveStructureUp( container ),
						callback: () => runMoveStructureUp( container ),
					},
					{
						name: 'move-down',
						icon: 'eicon-arrow-down',
						title: __( 'Move down', 'elementor' ),
						shortcut: 'Alt+↓',
						isEnabled: () => container && canMoveStructureDown( container ),
						callback: () => runMoveStructureDown( container ),
					},
					{
						name: 'move-out',
						icon: 'eicon-arrow-left',
						title: __( 'Move out of container', 'elementor' ),
						shortcut: 'Alt+←',
						isEnabled: () => container && canMoveStructureOut( container ),
						callback: () => runMoveStructureOut( container ),
					},
					{
						name: 'move-into',
						icon: 'eicon-arrow-right',
						title: __( 'Move into element above', 'elementor' ),
						shortcut: 'Alt+→',
						isEnabled: () => container && canMoveStructureIntoAbove( container ),
						callback: () => runMoveStructureIntoAbove( container ),
					},
				],
			},
			{
				name: 'structure-tree',
				actions: [
					{
						name: 'expand-children',
						icon: 'eicon-expand',
						title: __( 'Expand all children', 'elementor' ),
						isEnabled: () => view.hasChildren(),
						callback: () => view.recursiveChildInvoke( 'toggleList', true ),
					},
					{
						name: 'collapse-children',
						icon: 'eicon-collapse',
						title: __( 'Collapse all children', 'elementor' ),
						isEnabled: () => view.hasChildren(),
						callback: () => view.recursiveChildInvoke( 'toggleList', false ),
					},
					{
						name: 'rename',
						icon: 'eicon-edit',
						title: __( 'Rename', 'elementor' ),
						isEnabled: () => ! container?.isLocked(),
						callback: () => view.enterTitleEditing(),
					},
				],
			},
		];
	},

	onDestroy() {
		this.contextMenu?.destroy();
	},
} );
