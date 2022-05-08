import { responsive } from './utils';

const map = ( { isInner } ) => {
	const widthKey = isInner ? 'width' : 'boxed_width';

	return {
		...responsive( 'content_width', widthKey ),
		...responsive( 'custom_height', 'min_height' ),
		height: ( { value, settings } ) => {
			switch ( value ) {
				case 'full':
					value = { size: 100, unit: 'vh' };
					break;

				case 'min-height':
					value = settings.custom_height || { size: 400, unit: 'px' }; // Default section's height.
					break;
			}

			return [ 'min_height', value ];
		},
		gap: ( { value, settings } ) => {
			const sizesMap = {
				no: 0,
				narrow: 5,
				extended: 15,
				wide: 20,
				wider: 30,
			};

			value = ( 'custom' === value ) ? settings.gap_columns_custom : { size: sizesMap[ value ], unit: 'px' };

			return [ 'flex_gap', value ];
		},
		gap_columns_custom: null,
		column_position: ( { value } ) => {
			const optionsMap = {
				top: 'flex-start',
				middle: 'center',
				bottom: 'flex-end',
			};

			return [ 'flex_align_items', optionsMap[ value ] || value ];
		},
	};
};

export default map;
