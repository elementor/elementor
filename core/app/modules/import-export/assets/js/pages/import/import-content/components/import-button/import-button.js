import { useState, useEffect, useContext } from 'react';
import { useNavigate } from '@reach/router';

import { Context } from '../../../../../context/context-provider';

import Button from 'elementor-app/ui/molecules/button';

import useAjax from 'elementor-app/hooks/use-ajax';

export default function ImportButton() {
	const { ajaxState, setAjax } = useAjax(),
		context = useContext( Context ),
		navigate = useNavigate(),
		[ isImportAllowed, setIsImportAllowed ] = useState( false ),
		getDownloadUrl = () => {
			// const exportURL = elementorAppConfig[ 'import-export' ].exportURL,
			// 	exportData = {
			// 		elementor_export_kit: {
			// 			include: context.data.includes,
			// 		},
			// 	};
			//
			// return exportURL + '&' + jQuery.param( exportData );
		};

	useEffect( () => {
		setIsImportAllowed( ! ! context.data.includes.length );
	}, [ context.data.includes ] );

	useEffect( () => {
		if ( 'success' === ajaxState.status ) {
			console.log( 'import button success event!' );
			//navigate( '/import/success' );
		}
	}, [ ajaxState.status ] );

	return (
		<Button
			variant="contained"
			text={ __( 'Next', 'elementor' ) }
			color={ isImportAllowed ? 'primary' : 'disabled' }
			onClick={ () => {
				console.log( 'context.data.includes', context.data.includes );
				if ( isImportAllowed ) {
					//context.dispatch( { type: 'SET_DOWNLOAD_URL', payload: getDownloadUrl() } );
					// setAjax( {
					//
					// } );
				}
			} }
		/>
	);
}

ImportButton.propTypes = {
	setIsDownloading: PropTypes.func,
};
