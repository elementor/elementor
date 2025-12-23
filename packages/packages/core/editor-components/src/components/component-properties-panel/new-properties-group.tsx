import * as React from 'react';
import { useEffect, useRef } from 'react';
import { EditableField, useEditable } from '@elementor/editor-ui';
import { Box, Stack, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { type OverridablePropsGroup } from '../../types';
import { validateGroupLabel } from './utils/validate-group-label';

type Props = {
	existingGroups: Record< string, OverridablePropsGroup >;
	onSave: ( label: string ) => void;
	onCancel: () => void;
};

const DEFAULT_LABEL = __( 'New group', 'elementor' );

export function NewPropertiesGroup( { existingGroups, onSave, onCancel }: Props ) {
	const hasSavedRef = useRef( false );

	const handleSubmit = ( value: string ) => {
		const trimmedValue = value?.trim() ?? '';

		if ( ! trimmedValue ) {
			return;
		}

		hasSavedRef.current = true;
		onSave( trimmedValue );
	};

	const handleValidation = ( value: string ): string | null => {
		return validateGroupLabel( value, existingGroups ) || null;
	};

	const { ref, openEditMode, error, getProps } = useEditable( {
		value: DEFAULT_LABEL,
		onSubmit: handleSubmit,
		validation: handleValidation,
	} );

	const createPropsWithCancelHandlers = () => {
		const props = getProps();

		return {
			...props,
			onKeyDown: ( event: React.KeyboardEvent ) => {
				const isEscapeKey = event.key === 'Escape';

				if ( isEscapeKey && ! hasSavedRef.current ) {
					onCancel();
				}

				props.onKeyDown( event );
			},
			onBlur: () => {
				props.onBlur();

				if ( ! hasSavedRef.current ) {
					onCancel();
				}
			},
		};
	};

	// Start in edit mode immediately when the component mounts,
	// so the user can type the new group name right away.
	useEffect( () => {
		openEditMode();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	return (
		<Box sx={ { position: 'relative' } }>
			<Stack direction="row" alignItems="center" justifyContent="space-between" gap={ 2 }>
				<Box
					sx={ {
						flex: 1,
						height: 28,
						display: 'flex',
						alignItems: 'center',
						border: 2,
						borderColor: 'text.secondary',
						borderRadius: 2,
						pl: 0.5,
					} }
				>
					<EditableField
						ref={ ref }
						as={ Typography }
						variant="caption"
						error={ error ?? undefined }
						sx={ { color: 'text.primary', fontWeight: 400, lineHeight: 1.66 } }
						{ ...createPropsWithCancelHandlers() }
					/>
				</Box>
			</Stack>
		</Box>
	);
}
