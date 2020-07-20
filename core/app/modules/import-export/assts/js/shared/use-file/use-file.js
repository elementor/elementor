import { useState, useEffect } from 'react';

export default function useFile() {
	const [ file, setFile ] = useState();

	useEffect( () => {
		console.log( '--- file', file );

		if ( file ) {
			const formData = new FormData();

			formData.append( file.name, file );

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
