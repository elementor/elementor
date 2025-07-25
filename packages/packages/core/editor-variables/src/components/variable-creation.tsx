import * as React from 'react';
import { useState } from 'react';
import { PopoverContent, useBoundProp } from '@elementor/editor-controls';
import { PopoverBody } from '@elementor/editor-editing-panel';
import type { PropTypeKey } from '@elementor/editor-props';
import { PopoverHeader } from '@elementor/editor-ui';
import { ArrowLeftIcon } from '@elementor/icons';
import { Button, CardActions, Divider, FormHelperText, IconButton } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { createVariable } from '../hooks/use-prop-variables';
import { trackVariableEvent } from '../utils/tracking';
import { ERROR_MESSAGES, mapServerError } from '../utils/validations';
import { getVariableType } from '../variables-registry/variable-type-registry';
import { LabelField, useLabelError } from './fields/label-field';

const SIZE = 'tiny';

type Props = {
	onGoBack?: () => void;
	onClose: () => void;
	propTypeKey: PropTypeKey;
};

export const VariableCreation = ( { onGoBack, onClose, propTypeKey }: Props ) => {
	const { icon: VariableIcon, valueField: ValueField, variableType, propTypeUtil } = getVariableType( propTypeKey );

	const { setValue: setVariable, path } = useBoundProp( propTypeUtil );

	const [ value, setValue ] = useState( '' );
	const [ label, setLabel ] = useState( '' );
	const [ errorMessage, setErrorMessage ] = useState( '' );

	const { labelFieldError, setLabelFieldError } = useLabelError();

	const resetFields = () => {
		setValue( '' );
		setLabel( '' );
		setErrorMessage( '' );
	};

	const closePopover = () => {
		resetFields();
		onClose();
	};

	const handleCreateAndTrack = () => {
		createVariable( {
			value,
			label,
			type: propTypeUtil.key,
		} )
			.then( ( key ) => {
				setVariable( key );
				closePopover();
			} )
			.catch( ( error ) => {
				const mappedError = mapServerError( error );
				if ( mappedError && 'label' === mappedError.field ) {
					setLabel( '' );
					setLabelFieldError( {
						value: label,
						message: mappedError.message,
					} );
					return;
				}

				setErrorMessage( ERROR_MESSAGES.UNEXPECTED_ERROR );
			} );

		trackVariableEvent( {
			varType: variableType,
			controlPath: path.join( '.' ),
			action: 'save',
		} );
	};

	const hasEmptyValue = () => {
		return '' === value.trim() || '' === label.trim();
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
						<VariableIcon fontSize={ SIZE } />
					</>
				}
				title={ __( 'Create variable', 'elementor' ) }
				onClose={ closePopover }
			/>

			<Divider />

			<PopoverContent p={ 2 }>
				<LabelField
					value={ label }
					error={ labelFieldError }
					onChange={ ( newValue ) => {
						setLabel( newValue );
						setErrorMessage( '' );
					} }
				/>
				<ValueField
					value={ value }
					onChange={ ( newValue ) => {
						setValue( newValue );
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
