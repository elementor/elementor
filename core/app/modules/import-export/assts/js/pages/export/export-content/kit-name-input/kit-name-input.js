import { useContext, useMemo } from 'react';
import { Context as KitContext } from '../../../../context/kit-content';

import Box from '../../../../ui/box/box';

export default function KitNameInput() {
	const context = useContext( KitContext );

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
