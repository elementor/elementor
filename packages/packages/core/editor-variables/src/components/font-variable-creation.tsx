import * as React from 'react';
import { useState } from 'react';
import { PopoverContent, useBoundProp } from '@elementor/editor-controls';
import { PopoverBody } from '@elementor/editor-editing-panel';
import { PopoverHeader } from '@elementor/editor-ui';
import { ArrowLeftIcon, TextIcon } from '@elementor/icons';
import { Button, CardActions, Divider, FormHelperText, IconButton } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { createVariable } from '../hooks/use-prop-variables';
import { fontVariablePropTypeUtil } from '../prop-types/font-variable-prop-type';
import { trackVariableEvent } from '../utils/tracking';
import { ERROR_MESSAGES, mapServerError } from '../utils/validations';
import { FontField } from './fields/font-field';
import { LabelField, useLabelError } from './fields/label-field';

const SIZE = 'tiny';

type Props = {
	onGoBack?: () => void;
	onClose: () => void;
};

export const FontVariableCreation = ( { onClose, onGoBack }: Props ) => {
	const { setValue: setVariable, path } = useBoundProp( fontVariablePropTypeUtil );

	const [ fontFamily, setFontFamily ] = useState( '' );
	const [ label, setLabel ] = useState( '' );
	const [ errorMessage, setErrorMessage ] = useState( '' );

	const { error: labelServerError, setError: setLabelServerError } = useLabelError();

	const resetFields = () => {
		setFontFamily( '' );
		setLabel( '' );
		setErrorMessage( '' );
	};

	const closePopover = () => {
		resetFields();
		onClose();
	};

	const handleCreateAndTrack = () => {
		createVariable( {
			value: fontFamily,
			label,
			type: fontVariablePropTypeUtil.key,
		} )
			.then( ( key ) => {
				setVariable( key );
				closePopover();
			} )
			.catch( ( error ) => {
				const mappedError = mapServerError( error );
				if ( mappedError && 'label' === mappedError.field ) {
					setLabel( '' );
					setLabelServerError( {
						value: label,
						message: mappedError.message,
					} );
					return;
				}

				setErrorMessage( ERROR_MESSAGES.UNEXPECTED_ERROR );
			} );

		trackVariableEvent( {
			varType: 'font',
			controlPath: path.join( '.' ),
			action: 'save',
		} );
	};

	const hasEmptyValue = () => {
		return '' === fontFamily.trim() || '' === label.trim();
	};

	const hasErrors = () => {
		return !! errorMessage;
	};

	const isSubmitDisabled = hasEmptyValue() || hasErrors();

	return (
		<PopoverBody height="auto">
			<PopoverHeader
				icon={
					<>
						{ onGoBack && (
							<IconButton size={ SIZE } aria-label={ __( 'Go Back', 'elementor' ) } onClick={ onGoBack }>
								<ArrowLeftIcon fontSize={ SIZE } />
							</IconButton>
						) }
						<TextIcon fontSize={ SIZE } />
					</>
				}
				title={ __( 'Create variable', 'elementor' ) }
				onClose={ closePopover }
			/>

			<Divider />

			<PopoverContent p={ 2 }>
				<LabelField
					value={ label }
					error={ labelServerError }
					onChange={ ( value ) => {
						setLabel( value );
						setErrorMessage( '' );
					} }
				/>
				<FontField
					value={ fontFamily }
					onChange={ ( value ) => {
						setFontFamily( value );
						setErrorMessage( '' );
					} }
				/>

				{ errorMessage && <FormHelperText error>{ errorMessage }</FormHelperText> }
			</PopoverContent>

			<CardActions sx={ { pt: 0.5, pb: 1 } }>
				<Button size="small" variant="contained" disabled={ isSubmitDisabled } onClick={ handleCreateAndTrack }>
					{ __( 'Create', 'elementor' ) }
				</Button>
			</CardActions>
		</PopoverBody>
	);
};
