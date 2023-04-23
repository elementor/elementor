import { responsive } from './utils';

const map = ( { isInner, settings = {} } ) => {
	const widthKey = isInner ? 'width' : 'boxed_width';

	return {
		...( 'boxed' === settings.layout ? responsive( 'content_width', widthKey ) : { content_width: null } ),
		...( 'min-height' === settings.height && responsive( 'custom_height', 'min_height' ) ),
		layout: ( { value } ) => {
			const optionsMap = {
				boxed: 'boxed',
				full_width: 'full',
			};
			return [ 'content_width', optionsMap[ value ] || value ];
		},
		height: ( { value, settings: sectionSettings } ) => {
			switch ( value ) {
				case 'full':
					value = { size: 100, unit: 'vh' };
					break;

				case 'min-height':
					value = sectionSettings.custom_height || { size: 400, unit: 'px' }; // Default section's height.
					break;
				default:
					return false;
			}

			return [ 'min_height', value ];
		},
		gap: ( { value, settings: sectionSettings } ) => {
			const sizesMap = {
				no: 0,
				narrow: 5,
				extended: 15,
				wide: 20,
				wider: 30,
			};

			value = ( 'custom' === value ) ? sectionSettings.gap_columns_custom : { size: sizesMap[ value ], unit: 'px' };

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
