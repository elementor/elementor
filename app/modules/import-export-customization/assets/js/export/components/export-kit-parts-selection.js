import { useExportContext } from '../context/export-context';
import { KitPartsSelection } from '../../shared/components';

export default function ExportKitPartsSelection() {
	const { data, dispatch } = useExportContext();

	const handleCheckboxChange = ( itemType ) => {
		const isChecked = data.includes.includes( itemType );
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
