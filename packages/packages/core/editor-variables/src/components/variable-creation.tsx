import * as React from 'react';
import { useState } from 'react';
import { PopoverContent, useBoundProp } from '@elementor/editor-controls';
import { PopoverBody } from '@elementor/editor-editing-panel';
import { type PropTypeUtil } from '@elementor/editor-props';
import { PopoverHeader } from '@elementor/editor-ui';
import { ArrowLeftIcon } from '@elementor/icons';
import { Button, CardActions, Divider, FormHelperText, IconButton } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { createVariable } from '../hooks/use-prop-variables';
import { trackVariableEvent } from '../utils/tracking';
import { getVariable } from '../variable-registry';
import { LabelField } from './fields/label-field';

const SIZE = 'tiny';

type Props = {
	onGoBack?: () => void;
	onClose: () => void;
	propTypeUtil: PropTypeUtil< string, string >;
};

export const VariableCreation = ( { onGoBack, onClose, propTypeUtil }: Props ) => {
	const { setValue: setVariable, path } = useBoundProp( propTypeUtil );
	const { icon: VariableIcon, valueField: ValueField, variableType } = getVariable( propTypeUtil.key );

	const [ value, setValue ] = useState( '' );
	const [ label, setLabel ] = useState( '' );
	const [ errorMessage, setErrorMessage ] = useState( '' );

	const resetFields = () => {
		setValue( '' );
		setLabel( '' );
		setErrorMessage( '' );
	};

	const closePopover = () => {
		resetFields();
		onClose();
	};

	const hasEmptyValue = () => {
		return '' === value.trim() || '' === label.trim();
	};

	const hasErrors = () => {
		return !! errorMessage;
	};

	const isSubmitDisabled = hasEmptyValue() || hasErrors();

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
				setErrorMessage( error.message );
			} );

		trackVariableEvent( {
			varType: variableType,
			controlPath: path.join( '.' ),
			action: 'save',
		} );
	};

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
