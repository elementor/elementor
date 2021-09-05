const ContainerView = require( 'elementor-elements/views/container' );

/**
 * @extends {ContainerView}
 */
export default class TabContainer extends ContainerView {
	className() {
		const baseClassName = super.className();

		return baseClassName + ' elementor-tab-content elementor-clearfix';
	}

	attributes() {
		const baseAttributes = super.attributes();

		baseAttributes.role = 'tabpanel';
		baseAttributes[ 'data-tab' ] = this.model.get( '_index' ) + 1;

		return baseAttributes;
	}

	events() {
		const events = super.events();

		events.click = ( e ) => {
			e.stopPropagation();

			$e.run( 'panel/editor/open', {
				model: this.options.model,
				view: this,
			} );
		};

		return events;
	}

	getEditButtons() {
		const elementData = elementor.getElementData( this.model ),
			editTools = {};

		editTools.edit = {
			/* translators: %s: Element Name. */
			title: sprintf( __( 'Edit %s', 'elementor' ), elementData.title ),
			icon: 'handle',
		};

		return editTools;
	}

	getContextMenuGroups() {
		// Remove delete.
		const contextMenuGroups = super.getContextMenuGroups().filter( ( item ) => item.name !== 'delete' );

		// Remove duplicate.
		delete contextMenuGroups[ 0 ].actions[ 1 ];

		return contextMenuGroups;
	}
}
