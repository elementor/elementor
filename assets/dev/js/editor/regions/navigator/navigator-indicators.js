const MAX_VISIBLE_INDICATORS = 3;

function hasNonEmptyObject( value ) {
	return value && 'object' === typeof value && Object.keys( value ).length > 0;
}

function getActiveNavigatorIndicators( model ) {
	const base = { ...elementor.navigator.indicators };

	/**
	 * Filter navigator structure indicators.
	 *
	 * @param {Object} indicators Indicator registry.
	 * @param {Object} model      Element model.
	 */
	const registry = elementor.hooks.applyFilters( 'navigator/indicators', base, model );

	return Object.entries( registry ).map( ( [ name, config ] ) => ( { name, ...config } ) )
		.filter( ( indicator ) => {
			if ( 'function' === typeof indicator.isActive ) {
				return indicator.isActive( model );
			}

			const settings = model.get( 'settings' )?.attributes || {};

			return indicator.settingKeys?.some( ( key ) => !! settings[ key ] );
		} )
		.sort( ( a, b ) => ( b.priority || 0 ) - ( a.priority || 0 ) );
}

export function registerDefaultNavigatorIndicators( navigator ) {
	navigator.indicators = {
		displayConditions: {
			title: __( 'Display conditions', 'elementor' ),
			icon: 'flow',
			priority: 100,
			isActive: () => false,
		},
		globalClass: {
			title: __( 'Global class', 'elementor' ),
			icon: 'global-settings',
			priority: 90,
			section: '',
			isActive( model ) {
				const settings = model.get( 'settings' )?.attributes || {};
				const classes = settings.classes;
				const list = Array.isArray( classes ) ? classes : classes?.value;

				return Array.isArray( list ) && list.length > 0;
			},
		},
		customCss: {
			title: __( 'Custom CSS', 'elementor' ),
			icon: 'custom-css',
			priority: 70,
			section: 'section_custom_css_pro',
			isActive( model ) {
				const settings = model.get( 'settings' )?.attributes || {};
				const customCss = settings.custom_css || settings._element_custom_css;

				if ( 'string' === typeof customCss && customCss.trim() ) {
					return true;
				}

				const styles = model.get( 'styles' );

				return Array.isArray( styles ) && styles.some( ( style ) => style?.custom_css );
			},
		},
		interactions: {
			title: __( 'Interactions', 'elementor' ),
			icon: 'flash',
			priority: 75,
			section: '',
			isActive( model ) {
				return hasNonEmptyObject( model.get( 'interactions' ) );
			},
		},
		customPosition: {
			title: __( 'Custom positioning', 'elementor' ),
			icon: 'cursor-move',
			priority: 50,
			section: '_section_position',
			settingKeys: [ '_position' ],
		},
		hidden: {
			title: __( 'Hidden', 'elementor' ),
			icon: 'preview-medium',
			priority: 60,
			isActive( model ) {
				return model.getVisibility?.() || false;
			},
		},
		sticky: {
			title: __( 'Sticky', 'elementor' ),
			icon: 'map-pin',
			priority: 40,
			isActive( model ) {
				const settings = model.get( 'settings' )?.attributes || {};

				return !! ( settings.sticky || settings.sticky_on_scroll );
			},
		},
	};
}

export function renderNavigatorIndicators( view ) {
	const $indicators = view.ui.indicators;

	if ( ! $indicators?.length ) {
		return;
	}

	$indicators.empty();

	const active = getActiveNavigatorIndicators( view.model );

	if ( ! active.length ) {
		return;
	}

	const visible = active.slice( 0, MAX_VISIBLE_INDICATORS );
	const overflow = active.length - visible.length;
	const tooltipLines = active.map( ( item ) => item.title );

	visible.forEach( ( indicator ) => {
		const $indicator = jQuery( '<div>', {
			class: 'elementor-navigator__element__indicator',
			title: indicator.title,
		} )
			.attr( 'data-section', indicator.section || '' )
			.html( `<i class="eicon-${ indicator.icon }" aria-hidden="true"></i>` );

		$indicators.append( $indicator );

		$indicator.tipsy( { delayIn: 300, gravity: 's', title: () => indicator.title } );
	} );

	if ( overflow > 0 ) {
		const $overflow = jQuery( '<div>', {
			class: 'elementor-navigator__element__indicator elementor-navigator__element__indicator--overflow',
			title: tooltipLines.join( '\n' ),
		} ).text( `+${ overflow }` );

		$indicators.append( $overflow );
		$overflow.tipsy( { delayIn: 300, gravity: 's', title: () => tooltipLines.join( '\n' ) } );
	}
}
