import React from 'react';
import { RequestIdsProvider } from '../editor/context/requests-ids';
import App from '../editor/app';
import PropTypes from 'prop-types';
import { useState } from '@wordpress/element';
import { LOCATIONS } from '../editor/pages/form-media/constants';

const UnifyProductImages = ( { productImageUrls } ) => {
	const [ isOpen, setIsOpen ] = useState( true );

	const handleClose = () => {
		setIsOpen( false );
	};

	return (
		<div>
			<RequestIdsProvider>
				{ isOpen && <App
					type={ 'media' }
					getControlValue={ () => ( {
						url: productImageUrls[ 0 ].image_url,
					} ) }
					onClose={ handleClose }
					isRTL={ elementorCommon.config.isRTL }
					additionalOptions={ {
						location: LOCATIONS.VARIATIONS,
					} }
				/> }
			</RequestIdsProvider>
		</div> );
};

UnifyProductImages.propTypes = {
	productImageUrls: PropTypes.arrayOf( PropTypes.object ),
};

export default UnifyProductImages;

