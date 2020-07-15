import { useContext, useMemo } from 'react';
import { Context as ExportContext } from '../../../../context/export';

export default function KitNameInput() {
	const context = useContext( ExportContext );

	return useMemo( () => (
		<input
			type="text"
			onChange={ ( event ) => context.setTitle( event.target.value ) }
			defaultValue={ context.title }
		/>
	), [] );
}
