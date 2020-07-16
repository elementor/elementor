import { useContext, useMemo } from 'react';
import { Context as ExportContext } from '../../../../context/export';

import Box from '../../../../ui/box/box';

export default function KitNameInput() {
	const context = useContext( ExportContext );

	return useMemo( () => (
		<Box>
			<input
				type="text"
				onChange={ ( event ) => context.setTitle( event.target.value ) }
				defaultValue={ context.title }
			/>
		</Box>
	), [] );
}
