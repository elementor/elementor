import { useEffect } from 'react';
import { useImportContext } from '../context/import-context';
import { KitPartsSelection } from '../../shared/components';
import kitContentData from '../../shared/kit-content-data';

export default function ImportKitPartsSelection() {
	const { data, dispatch } = useImportContext();

	const handleCheckboxChange = ( itemType ) => {
		const isChecked = data.includes.includes( itemType );
		const kitItem = kitContentData.find( ( item ) => item.type === itemType );

		if ( isChecked && kitItem?.required ) {
			return;
		}

		const actionType = isChecked ? 'REMOVE_INCLUDE' : 'ADD_INCLUDE';
		dispatch( { type: actionType, payload: itemType } );
	};

	const handleSaveCustomization = ( key, payload, hasEnabledCustomization ) => {
		dispatch( {
			type: 'SET_CUSTOMIZATION',
			payload: {
				key,
				value: payload,
			},
		} );

		if ( hasEnabledCustomization ) {
			dispatch( { type: 'ADD_INCLUDE', payload: key } );
		} else {
			dispatch( { type: 'REMOVE_INCLUDE', payload: key } );
		}
	};

	useEffect( () => {
		if ( data.uploadedData ) {
			const includes = [];

			if ( data.uploadedData?.manifest?.[ 'site-settings' ] ) {
				includes.push( 'settings' );
			}

			if ( 0 < Object.keys( data.uploadedData?.manifest?.templates || {} ).length && elementorAppConfig.hasPro ) {
				includes.push( 'templates' );
			}

			if ( data.uploadedData?.manifest?.content ) {
				includes.push( 'content' );
			}

			dispatch( { type: 'ADD_INCLUDES', payload: includes } );
		}
	}, [ data.uploadedData, dispatch ] );

	return (
		<KitPartsSelection
			onCheckboxChange={ handleCheckboxChange }
			handleSaveCustomization={ handleSaveCustomization }
			testId="import-kit-parts-content"
		/>
	);
}
