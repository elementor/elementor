import React, { useContext, useState, useEffect } from 'react';
import { SharedContext } from '../../context/shared-context/shared-context-provider';
import Select2 from '../../../../../../assets/js/ui/molecules/select2';
import Text from 'elementor-app/ui/atoms/text';
import TextField from 'elementor-app/ui/atoms/text-field';

export default function CptOptionsSelect() {
	const sharedContext = useContext( SharedContext ),
	{ customPostTypes } = sharedContext.data || [],
	[ selected, setSelected ] = useState( [] );

	const selectedCpt = ( e ) => {
		setSelected( Array.from( e.target.selectedOptions ).map( ( { value } ) => value ) );
	};

	useEffect( () => {
		setSelected( customPostTypes.map( ( item ) => item.value ) );
	}, [] );

	useEffect( () => {
		sharedContext.dispatch( { type: 'SET_SELECTED_CPT', payload: selected } );
	}, [ selected ] );
	return (
		<>
			<Text variant="sm" tag="p" className="e-app-export-kit-content__description">
				{__( 'Custom Post Type', 'elementor' )}
			</Text>
			{customPostTypes.length > 0 ?
				<Select2
					multiple
					settings={ { width: '100%' } }
					options={customPostTypes}
					onChange={( e ) => selectedCpt( e )}
					value={ selected }
				/> :
				<TextField
					variant="outlined"
					placeholder={ __( 'No custom post types in your site...', 'elementor' ) }
					className="e-app-export-kit-content__disabled"
				/>
			}
			<Text variant="sm" tag="span" className="e-app-export-kit-content__small-notice">
				{__( 'Select custom posts types to include. Up to 20 of the most recent.', 'elementor' )}
			</Text>
		</>
	);
}

CptOptionsSelect.propTypes = {
	// options: PropTypes.array.isRequired,
};

// import React, { useContext, useEffect, useState } from 'react';
// import { SharedContext } from '../../context/shared-context/shared-context-provider';
// import Select2 from '../../../../../../assets/js/ui/molecules/select2';
// import Text from 'elementor-app/ui/atoms/text';
//
// export default function CptSelections( { options } ) {
// 	const sharedContext = useContext( SharedContext );
// 	const [ selected, setSelected ] = useState( [ 'books', 'movies' ] );
//
// 	useEffect( () => {
// 		sharedContext.dispatch( { type: 'SET_SELECTED_CPT', payload: [ 'books', 'movies' ] } );
// 	}, [] );
//
// 	const selectedCpt = ( e ) => {
// 		// setSelected( Array.from( e.target.selectedOptions ).map( ( { value } ) => value ) );
// 		sharedContext.dispatch( { type: 'SET_SELECTED_CPT', payload: Array.from( e.target.selectedOptions ).map( ( { value } ) => value ) } );
// 	};
//
// 	return (
// 		<>
// 			<Text variant="sm" tag="p" className="e-app-export-kit-content__description">
// 				{__( 'Custom Post Type', 'elementor' )}
// 			</Text>
// 			<Select2
// 				multiple
// 				settings={ { width: '100%' } }
// 				options={options}
// 				onChange={( e ) => selectedCpt( e )}
// 				onLoad={}
// 				initSelection={options}
// 			/>
// 			<Text variant="sm" tag="span" className="e-app-export-kit-content__small-notice">
// 				{__( 'Select custom posts types to include. Up to 20 of the most recent.', 'elementor' )}
// 			</Text>
// 		</>
// 	);
// }
//
// CptSelections.propTypes = {
// 	options: PropTypes.array.isRequired,
// };
