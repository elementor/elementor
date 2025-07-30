import * as React from 'react';
import { useRef } from 'react';
import { transformPropTypeUtil } from '@elementor/editor-props';
import { Button, Stack, usePopupState } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { PropProvider, useBoundProp } from '../../bound-prop-context';
import { Repeater } from '../../components/repeater';
import { createControl } from '../../create-control';
import { TransformContent } from './transform-content';
import { TransformIcon } from './transform-icon';
import { TransformLabel } from './transform-label';
import { TransformBaseControl } from './transform-base-control';
import { initialTransformValue } from './types';

export const TransformRepeaterControl = createControl( () => {
	const { propType, value: transformValues, setValue, disabled } = useBoundProp( transformPropTypeUtil );
	const buttonRef = useRef< HTMLButtonElement >( null );
	const popupState = usePopupState( { variant: 'popover' } );

	const handleOpenBaseTransform = () => {
		if ( buttonRef.current ) {
			popupState.open( buttonRef.current );
		}
	};

	return (
		<PropProvider propType={ propType } value={ transformValues } setValue={ setValue }>
			<Stack direction="column" spacing={ 1.5 }>
				<Repeater
					openOnAdd
					disabled={ disabled }
					values={ transformValues ?? [] }
					setValues={ setValue }
					label={ __( 'Transform', 'elementor' ) }
					showDuplicate={ false }
					itemSettings={ {
						Icon: TransformIcon,
						Label: TransformLabel,
						Content: TransformContent,
						initialValues: initialTransformValue,
					} }
				/>
				<Button
					ref={ buttonRef }
					variant="outlined"
					size="small"
					onClick={ handleOpenBaseTransform }
					disabled={ disabled }
				>
					{ __( 'Base Transform', 'elementor' ) }
				</Button>
				<TransformBaseControl popupState={ popupState } anchorRef={ buttonRef } />
			</Stack>
		</PropProvider>
	);
} );
