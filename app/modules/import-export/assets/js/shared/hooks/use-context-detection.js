import { useContext } from 'react';
import { ImportContext } from '../../import/context/import-context';
import { ExportContext } from '../../export/context/export-context';

export default function useContextDetection() {
	const importContext = useContext( ImportContext );
	const exportContext = useContext( ExportContext );

	if ( importContext ) {
		return { isImport: true, contextData: importContext };
	}

	if ( exportContext ) {
		return { isImport: false, contextData: exportContext };
	}

	throw new Error( 'useContextDetection must be used within either an ImportContextProvider or ExportContextProvider' );
}
