import { useImportContext } from '../context/import-context';
import { KitContent } from '../../shared/components';

export default function ImportKitContent() {
	const { data, dispatch } = useImportContext();

	const handleCheckboxChange = ( itemType ) => {
		const isChecked = data.includes.includes( itemType );
		const actionType = isChecked ? 'REMOVE_INCLUDE' : 'ADD_INCLUDE';
		dispatch( { type: actionType, payload: itemType } );
	};

	return (
		<KitContent
			data={ data }
			onCheckboxChange={ handleCheckboxChange }
		/>
	);
}
