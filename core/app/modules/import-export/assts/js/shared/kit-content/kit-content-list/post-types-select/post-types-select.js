import { memo } from 'react';

import Grid from 'elementor-app/ui/grid/grid';
import Select2 from 'elementor-app/ui/molecules/select2.js';

import './post-types-select.scss';

function PostTypesSelect( props ) {
	const setPostTypes = ( event ) => {
			const selectedOptions = [ ...event.target.selectedOptions ].map( ( option ) => option.value ),
				actionType = selectedOptions.length ? 'ADD_INCLUDE' : 'REMOVE_INCLUDE';

			props.setOptions( selectedOptions );
			props.dispatch( { type: 'SET_POST_TYPES', value: selectedOptions } );
			props.dispatch( { type: actionType, value: props.itemType } );
		},
		getPostTypesOptions = () => {
			const customPostTypes = elementorAppConfig[ 'import-export' ][ 'custom_post_types' ];

			return Object.entries( customPostTypes ).map( ( item ) => (
				{ label: item[ 1 ], value: item[ 0 ] }
			) );
		};

	console.log( 'RE RENDER Post Types Select --- FUNCTION BODY' );

	return (
		<Grid container justify="center" className="kit-content-selection-container">
			<Select2
				multiple
				onChange={ setPostTypes }
				options={ getPostTypesOptions() }
				settings={ {
					width: '100%',
					containerCssClass: 'kit-content-select',
					placeholder: __( 'Select custom post types (maximum of 20 posts will be included)', 'elementor' ),
				} }
			/>
		</Grid>
	);
}

PostTypesSelect.propTypes = {
	options: PropTypes.array,
	checkboxType: PropTypes.string,
	setCheckboxState: PropTypes.func,
	setOptions: PropTypes.func,
	dispatch: PropTypes.func,
	itemType: PropTypes.string,
};

export default memo( PostTypesSelect );
