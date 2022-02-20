import React, { useContext, useState, useEffect } from 'react';
import { SharedContext } from '../../context/shared-context/shared-context-provider';
import Select2 from '../../../../../../assets/js/ui/molecules/select2';
import Text from 'elementor-app/ui/atoms/text';
import TextField from 'elementor-app/ui/atoms/text-field';

export default function CptSelectBox() {
	const sharedContext = useContext( SharedContext ),
	{ customPostTypes } = sharedContext.data || [],
	[ selected, setSelected ] = useState( [] );

	const selectedCpt = ( e ) => {
		setSelected( Array.from( e.target.selectedOptions ).map( ( { value } ) => value ) );
	};

	useEffect( () => {
		setSelected( customPostTypes.map( ( item ) => item.value ) );
	}, [ customPostTypes ] );

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
					placeholder={ __( 'Click to select custom post types', 'elementor' )}
				/> :
				<TextField
					variant="outlined"
					placeholder={ __( 'No custom post types in your site...', 'elementor' ) }
					className="e-app-export-kit-content__disabled"
				/>
			}
			<Text variant="sm" tag="span" className="e-app-export-kit-content__small-notice">
				{__( 'Add the custom posts types to export. The latest 20 items from each type will be included.', 'elementor' )}
			</Text>
		</>
	);
}
