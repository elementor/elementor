import * as React from 'react';
import { useState } from 'react';
import { PopoverContent, useBoundProp } from '@elementor/editor-controls';
import { PopoverScrollableContent } from '@elementor/editor-editing-panel';
import { PopoverHeader } from '@elementor/editor-ui';
import { ArrowLeftIcon, TextIcon } from '@elementor/icons';
import { Button, CardActions, Divider, IconButton } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { createVariable } from '../hooks/use-prop-variables';
import { fontVariablePropTypeUtil } from '../prop-types/font-variable-prop-type';
import { FontField } from './fields/font-field';
import { LabelField } from './fields/label-field';

const SIZE = 'tiny';

type Props = {
	onGoBack?: () => void;
	onClose: () => void;
};

export const FontVariableCreation = ( { onClose, onGoBack }: Props ) => {
	const { setValue: setVariable } = useBoundProp( fontVariablePropTypeUtil );

	const [ fontFamily, setFontFamily ] = useState( '' );
	const [ label, setLabel ] = useState( '' );

	const resetFields = () => {
		setFontFamily( '' );
		setLabel( '' );
	};

	const closePopover = () => {
		resetFields();
		onClose();
	};

	const handleCreate = () => {
		createVariable( {
			value: fontFamily,
			label,
			type: fontVariablePropTypeUtil.key,
		} ).then( ( key ) => {
			setVariable( key );
			closePopover();
		} );
	};

	const hasEmptyValue = () => {
		return '' === fontFamily.trim() || '' === label.trim();
	};

	const isSubmitDisabled = hasEmptyValue();

	return (
		<PopoverScrollableContent height="auto">
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
				<LabelField value={ label } onChange={ setLabel } />
				<FontField value={ fontFamily } onChange={ setFontFamily } />
			</PopoverContent>

			<CardActions sx={ { pt: 0.5, pb: 1 } }>
				<Button size="small" variant="contained" disabled={ isSubmitDisabled } onClick={ handleCreate }>
					{ __( 'Create', 'elementor' ) }
				</Button>
			</CardActions>
		</PopoverScrollableContent>
	);
};
