import { useState, useEffect } from 'react';

export default function useFile() {
	const [ file, setFile ] = useState();

	useEffect( () => {
		if ( file ) {
			const formData = new FormData();

			formData.append( file.name, file );

			console.log( '--- file', file );

			const options = {
				data: formData,
				success: () => {
				},
				error: () => {
				},
				complete: () => {},
			};

			elementorCommon.ajax.addRequest( 'elementor_export_kit', options );
		}
	}, [ file ] );

	return {
		setFile,
	};
}
