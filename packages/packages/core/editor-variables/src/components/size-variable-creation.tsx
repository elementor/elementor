import * as React from 'react';
import { useState } from 'react';
import { PopoverContent, useBoundProp } from '@elementor/editor-controls';
import { PopoverBody } from '@elementor/editor-editing-panel';
import { PopoverHeader } from '@elementor/editor-ui';
import { ArrowLeftIcon, BrushIcon } from '@elementor/icons';
import { Button, CardActions, Divider, FormHelperText, IconButton } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { createVariable } from '../hooks/use-prop-variables';
import { sizeVariablePropTypeUtil } from '../prop-types/size-variable-prop-type';
import { LabelField } from './fields/label-field';
import { SizeField } from './fields/size-field';

const SIZE = 'tiny';

type Props = {
	onGoBack?: () => void;
	onClose: () => void;
};

export const SizeVariableCreation = ( { onGoBack, onClose }: Props ) => {
	const { setValue: setVariable } = useBoundProp( sizeVariablePropTypeUtil );

	const [ size, setSize ] = useState( '' );
	const [ label, setLabel ] = useState( '' );
	const [ errorMessage, setErrorMessage ] = useState( '' );

	const resetFields = () => {
		setSize( '' );
		setLabel( '' );
		setErrorMessage( '' );
	};

	const closePopover = () => {
		resetFields();
		onClose();
	};

	const handleCreate = () => {
		createVariable( {
			value: size,
			label,
			type: sizeVariablePropTypeUtil.key,
		} )
			.then( ( key ) => {
				setVariable( key );
				closePopover();
			} )
			.catch( ( error ) => {
				setErrorMessage( error.message );
			} );
	};

	const hasEmptyValue = () => {
		return '' === size.trim() || '' === label.trim();
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
						<BrushIcon fontSize={ SIZE } />
					</>
				}
				title={ __( 'Create variable', 'elementor' ) }
				onClose={ closePopover }
			/>

			<Divider />

			<PopoverContent p={ 2 }>
				<LabelField
					value={ label }
					onChange={ ( value ) => {
						setLabel( value );
						setErrorMessage( '' );
					} }
				/>
				<SizeField
					value={ size }
					onChange={ ( value ) => {
						setSize( value );
						setErrorMessage( '' );
					} }
				/>

				{ errorMessage && <FormHelperText error>{ errorMessage }</FormHelperText> }
			</PopoverContent>

			<CardActions sx={ { pt: 0.5, pb: 1 } }>
				<Button size="small" variant="contained" disabled={ isSubmitDisabled } onClick={ handleCreate }>
					{ __( 'Create', 'elementor' ) }
				</Button>
			</CardActions>
		</PopoverBody>
	);
};
