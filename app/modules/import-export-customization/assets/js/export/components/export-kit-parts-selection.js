import { useState } from 'react';
import { Box, Typography, Stack, Checkbox, FormControlLabel, Button } from '@elementor/ui';

import kitContentData from '../../shared/kit-content-data';
import { useExportContext } from '../context/export-context';
import { KitPartsSelection } from '../../shared/components';

export default function ExportKitPartsSelection() {
	const { data, dispatch } = useExportContext();
	const [ activeDialog, setActiveDialog ] = useState( null );

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
