import { useExportContext } from '../context/export-context';
import { KitPartsSelection } from '../../shared/components';
import kitContentData from '../../shared/kit-content-data';

export default function ExportKitPartsSelection() {
	const { data, dispatch } = useExportContext();

	const handleCheckboxChange = ( itemType ) => {
		const isChecked = data.includes.includes( itemType );
		const kitItem = kitContentData.find( ( item ) => item.type === itemType );

		if ( isChecked && kitItem?.required ) {
			return;
		}

		const actionType = isChecked ? 'REMOVE_INCLUDE' : 'ADD_INCLUDE';
		dispatch( { type: actionType, payload: itemType } );
	};

	const handleSaveCustomization = ( key, payload ) => {
		const hasEnabledPart = Object.values( payload ).some( ( value ) => value );

		dispatch( {
			type: 'SET_CUSTOMIZATION',
			payload: {
				key,
				value: payload,
			},
		} );

		if ( hasEnabledPart ) {
			dispatch( { type: 'ADD_INCLUDE', payload: key } );
		} else {
			dispatch( { type: 'REMOVE_INCLUDE', payload: key } );
		}
	};

	return (
		<KitPartsSelection
			data={ data }
			onCheckboxChange={ handleCheckboxChange }
			handleSaveCustomization={ handleSaveCustomization }
		/>
	);
}
