import { buildModel, createV4Element, runWithHistory } from './v4-preset-utils';

const V4_ELEMENT_TYPE = 'e-grid';

const gridTrackSizeProp = ( size ) => ( {
	$$type: 'grid-track-size',
	value: { size: Number( size ), unit: 'fr' },
} );

function getGridPresetProps( structure ) {
	const parsedStructure = elementor.presetsFactory.getParsedGridStructure( structure );

	return {
		desktop: {
			'grid-template-columns': gridTrackSizeProp( parsedStructure.columns ),
			'grid-template-rows': gridTrackSizeProp( parsedStructure.rows ),
		},
		mobile: {
			'grid-template-columns': gridTrackSizeProp( 1 ),
			'grid-template-rows': gridTrackSizeProp( parsedStructure.rows ),
		},
	};
}

export function createV4GridFromPreset( structure, target = elementor.getPreviewContainer(), options = {} ) {
	return runWithHistory( __( 'Grid', 'elementor' ), () => {
		const { desktop, mobile } = getGridPresetProps( structure );
		const model = buildModel( V4_ELEMENT_TYPE, desktop, mobile );

		return createV4Element( target, model, options );
	} );
}
