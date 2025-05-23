/**
 * On delete a design system item - the used variables on the preview frame are
 * invalid and cause the elements to get the user-agent default style instead of
 * inherit higher CSS rules.
 *
 * The hook finds and removes all deleted item variables from the preview inline styles.
 */
export class KitRemovePreviewDeletedVariables extends $e.modules.hookUI.Before {
	controls = [ 'custom_colors', 'custom_typography' ];

	getCommand() {
		return 'document/repeater/remove';
	}

	getId() {
		return 'kit-remove-preview-deleted-variables';
	}

	getContainerType() {
		return 'document';
	}

	getConditions( args ) {
		return this.controls.includes( args.name ) && 'kit' === elementor.documents.getCurrent().config.type;
	}

	apply( args ) {
		// Store on component in order to use it in undo hook.
		this.component = $e.components.get( 'panel/global' );
		this.component.tempStyle = this.component.tempStyle || {};

		const { containers = [ args.container ] } = args,
			kitCSSId = `elementor-style-page-${ elementor.config.kit_id }`;

		containers.forEach( ( container ) => {
			const item = container.repeaters[ args.name ].children[ args.index ],
				stylesheets = Object.values( elementor.$previewContents[ 0 ].styleSheets )
				.filter( ( stylesheet ) => {
					// Don't touch the kit CSS itself.
					return kitCSSId !== stylesheet.ownerNode.id && stylesheet.ownerNode.innerHTML.includes( item.id );
				} );

			stylesheets.forEach( ( stylesheet ) => {
				this.component.tempStyle[ item.id ] = this.extractVariables( stylesheet.cssRules, item.id );
			} );
		} );
	}

	extractVariables( cssRules, id ) {
		const variablesRules = {};

		Object.values( cssRules ).forEach( ( rule ) => {
			if ( ! rule.style ) {
				// TODO Handle CSSMediaRule.
				return;
			}

			variablesRules[ rule.selectorText ] = {};

			// Get the original properties for undo.
			for ( let i = 0; i < rule.style.length; i++ ) {
				const property = rule.style[ i ],
					value = rule.style[ property ];

				if ( value.includes( id ) ) {
					variablesRules[ rule.selectorText ][ property ] = value;
				}
			}

			// Delete in a separated loop, because it changes the `style.length`.
			Object.keys( variablesRules[ rule.selectorText ] ).forEach( ( property ) => {
				rule.style[ property ] = '';
			} );
		} );

		return variablesRules;
	}
}
