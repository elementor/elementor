import React, { useState } from 'react';
import { RequestIdsProvider } from '../editor/context/requests-ids';
import styled from 'styled-components';
import { __ } from '@wordpress/i18n';
import { AIMediaGenerateApp } from './componenets';

const Icon = styled.i`
	padding-right: 0.5em;
	cursor: pointer;
`;

const StyledButton = styled.a`
	color: var(--e-a-color-primary-bold);
	cursor: pointer;
	font: inherit;
	display: inline-block;
	position: relative;
	top: -3px;
	margin-left: 4px;
	border: 1px solid var(--e-a-color-primary-bold);
	border-radius: 3px;
	line-height: 2.15384615;
	padding: 0 10px;
	background: #f6f7f7;

	&:hover {
		color: var(--e-a-color-primary-bold);
		background: #eeefef;
	}
`;

const AIMediaGenerateAppWrapper = () => {
	const [ isOpen, setIsOpen ] = useState( false );

	const handleClick = () => {
		setIsOpen( true );
	};

	const handleClose = () => {
		wp.media.frame?.content?.get()?.collection?._requery( true ); // Refresh the media library.
		setIsOpen( false );
	};

	return (
		<div style={ { padding: '0.5em' } }>
			<RequestIdsProvider>
				<StyledButton onClick={ handleClick }>
					<Icon className={ 'eicon-ai' } />
					{ __( 'Generate with Elementor AI', 'elementor' ) }
				</StyledButton>
				{ isOpen && <AIMediaGenerateApp onClose={ handleClose } setControlValue={ () => {} } /> }
			</RequestIdsProvider>
		</div>
	);
};

export default AIMediaGenerateAppWrapper;
