import { useImportContext } from '../context/import-context';
import { KitPartsSelection } from '../../shared/components';

export default function ImportKitPartsSelection() {
	const { data, dispatch } = useImportContext();

	const handleCheckboxChange = ( itemType ) => {
		const isChecked = data.includes.includes( itemType );
		const actionType = isChecked ? 'REMOVE_INCLUDE' : 'ADD_INCLUDE';
		dispatch( { type: actionType, payload: itemType } );
	};

	return (
		<KitPartsSelection
			data={ data }
			onCheckboxChange={ handleCheckboxChange }
		/>
	);
}
