import { useState } from 'react';
import * as React from 'react';
import { PopoverContent, useBoundProp } from '@elementor/editor-controls';
import { PopoverBody } from '@elementor/editor-editing-panel';
import type { PropTypeUtil } from '@elementor/editor-props';
import { PopoverHeader } from '@elementor/editor-ui';
import { Button, CardActions, Divider, FormHelperText } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { PopoverContentRefContextProvider } from '../context/variable-selection-popover.context';
import { restoreVariable, useVariable } from '../hooks/use-prop-variables';
import { ERROR_MESSAGES } from '../utils/validations';
import { getVariable } from '../variable-registry';
import { LabelField } from './fields/label-field';

const SIZE = 'tiny';

type Props = {
	variableId: string;
	onClose: () => void;
	onSubmit?: () => void;
	propTypeUtil: PropTypeUtil< string, string >;
};

export const VariableRestore = ( { variableId, onClose, onSubmit, propTypeUtil }: Props ) => {
	const { setValue: notifyBoundPropChange } = useBoundProp( propTypeUtil );
	const variable = useVariable( variableId );

	const { icon: VariableIcon, valueField: ValueField } = getVariable( propTypeUtil.key );

	if ( ! variable ) {
		throw new Error( `Global variable not found` );
	}

	const [ errorMessage, setErrorMessage ] = useState( ERROR_MESSAGES.DUPLICATED_LABEL );
	const [ label, setLabel ] = useState( variable.label );
	const [ value, setValue ] = useState( variable.value );

	const hasEmptyValues = () => {
		return ! value.trim() || ! label.trim();
	};

	const noValueChanged = () => {
		return value === variable.value && label === variable.label;
	};

	const hasErrors = () => {
		return !! errorMessage;
	};

	const handleRestore = () => {
		restoreVariable( variableId, label, value )
			.then( () => {
				notifyBoundPropChange( variableId );
				onSubmit?.();
			} )
			.catch( ( error ) => {
				setErrorMessage( error.message );
			} );
	};

	const isSubmitDisabled = noValueChanged() || hasEmptyValues() || hasErrors();

	return (
		<PopoverContentRefContextProvider>
			<PopoverBody height="auto">
				<PopoverHeader
					icon={ <VariableIcon fontSize={ SIZE } /> }
					title={ __( 'Restore variable', 'elementor' ) }
					onClose={ onClose }
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
					<Button size="small" variant="contained" disabled={ isSubmitDisabled } onClick={ handleRestore }>
						{ __( 'Restore', 'elementor' ) }
					</Button>
				</CardActions>
			</PopoverBody>
		</PopoverContentRefContextProvider>
	);
};
