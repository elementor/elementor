import * as React from 'react';
import { useState } from 'react';
import { PopoverContent, useBoundProp } from '@elementor/editor-controls';
import { PopoverBody } from '@elementor/editor-editing-panel';
import { PopoverHeader } from '@elementor/editor-ui';
import { ArrowLeftIcon, BrushIcon } from '@elementor/icons';
import { Button, CardActions, Divider, FormHelperText, IconButton } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { createVariable } from '../hooks/use-prop-variables';
import { colorVariablePropTypeUtil } from '../prop-types/color-variable-prop-type';
import { trackVariableEvent } from '../utils/tracking';
import { ColorField } from './fields/color-field';
import { LabelField } from './fields/label-field';

const SIZE = 'tiny';

type Props = {
	onGoBack?: () => void;
	onClose: () => void;
};

export const ColorVariableCreation = ( { onGoBack, onClose }: Props ) => {
	const { setValue: setVariable, path } = useBoundProp( colorVariablePropTypeUtil );

	const [ color, setColor ] = useState( '' );
	const [ label, setLabel ] = useState( '' );
	const [ errorMessage, setErrorMessage ] = useState( '' );

	const resetFields = () => {
		setColor( '' );
		setLabel( '' );
		setErrorMessage( '' );
	};

	const closePopover = () => {
		resetFields();
		onClose();
	};

	const handleCreateAndTrack = () => {
		createVariable( {
			value: color,
			label,
			type: colorVariablePropTypeUtil.key,
		} )
			.then( ( key ) => {
				setVariable( key );
				closePopover();
			} )
			.catch( ( error ) => {
				setErrorMessage( error.message );
			} );
		trackVariableEvent( {
			varType: 'color',
			controlPath: path.join( '.' ),
			action: 'save',
		} );
	};

	const hasEmptyValue = () => {
		return '' === color.trim() || '' === label.trim();
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
				<ColorField
					value={ color }
					onChange={ ( value ) => {
						setColor( value );
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
