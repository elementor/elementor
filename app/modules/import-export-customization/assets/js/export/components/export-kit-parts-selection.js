import { useExportContext } from '../context/export-context';
import { KitPartsSelection } from '../../shared/components';
import kitContentData from '../../shared/kit-content-data';
import useCloudKitsEligibility from 'elementor-app/hooks/use-cloud-kits-eligibility';

export default function ExportKitPartsSelection() {
	const { data, dispatch } = useExportContext();
	const { data: cloudKitsData } = useCloudKitsEligibility();
	const isCloudKitsEligible = cloudKitsData?.is_eligible || false;

	const handleCheckboxChange = ( itemType ) => {
		const isChecked = data.includes.includes( itemType );
		const kitItem = kitContentData.find( ( item ) => item.type === itemType );

		if ( isChecked && kitItem?.required ) {
			return;
		}

		const actionType = isChecked ? 'REMOVE_INCLUDE' : 'ADD_INCLUDE';
		dispatch( { type: actionType, payload: itemType } );
	};

	const handleSaveCustomization = ( key, payload, hasEnabledCustomization, excludedValues ) => {
		dispatch( {
			type: 'SET_CUSTOMIZATION',
			payload: {
				key,
				value: payload,
			},
		} );

		dispatch( {
			type: 'SET_DATA_FOR_ANALYTICS',
			payload: {
				key,
				value: excludedValues,
			},
		} );

		if ( hasEnabledCustomization ) {
			dispatch( { type: 'ADD_INCLUDE', payload: key } );
		} else {
			dispatch( { type: 'REMOVE_INCLUDE', payload: key } );
		}

		if ( data.showMediaFormatValidation ) {
			dispatch( { type: 'SET_MEDIA_FORMAT_VALIDATION', payload: false } );
		}
	};

	return (
		<KitPartsSelection
			onCheckboxChange={ handleCheckboxChange }
			handleSaveCustomization={ handleSaveCustomization }
			isCloudKitsEligible={ isCloudKitsEligible }
			showMediaFormatValidation={ data.showMediaFormatValidation }
		/>
	);
}
