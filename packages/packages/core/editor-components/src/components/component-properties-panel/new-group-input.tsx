import * as React from 'react';
import { useEffect, useRef } from 'react';
import { EditableField, useEditable } from '@elementor/editor-ui';
import { Box } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { type OverridablePropsGroup } from '../../types';
import { validateGroupLabel } from './utils/validate-group-label';

type Props = {
	existingGroups: Record< string, OverridablePropsGroup >;
	onSave: ( label: string ) => void;
	onCancel: () => void;
};

const DEFAULT_LABEL = __( 'New group', 'elementor' );

export function NewGroupInput( { existingGroups, onSave, onCancel }: Props ) {
	const hasSavedRef = useRef( false );
	const prevIsEditingRef = useRef< boolean | null >( null );

	const handleSubmit = ( value: string ) => {
		const trimmedValue = value?.trim() ?? '';

		if ( ! trimmedValue ) {
			return;
		}

		hasSavedRef.current = true;
		onSave( trimmedValue );
	};

	const handleValidation = ( value: string ): string | null => {
		const error = validateGroupLabel( value, existingGroups );
		return error || null;
	};

	const { ref, isEditing, openEditMode, error, getProps } = useEditable( {
		value: DEFAULT_LABEL,
		onSubmit: handleSubmit,
		validation: handleValidation,
	} );

	useEffect( () => {
		openEditMode();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	useEffect( () => {
		const wasEditing = prevIsEditingRef.current === true;
		const stoppedEditing = wasEditing && ! isEditing;

		if ( stoppedEditing && ! hasSavedRef.current ) {
			onCancel();
		}

		prevIsEditingRef.current = isEditing;
	}, [ isEditing, onCancel ] );

	const editableProps = getProps();

	return (
		<Box
			sx={ {
				position: 'relative',
				borderRadius: 2,
				border: '1px solid',
				borderColor: error ? 'error.main' : 'primary.main',
				px: 1,
				py: 0.5,
				minHeight: 28,
			} }
		>
			<EditableField
				ref={ ref }
				error={ error ?? undefined }
				sx={ {
					display: 'block',
					fontSize: 12,
					color: 'text.primary',
					cursor: isEditing ? 'text' : 'pointer',
				} }
				{ ...editableProps }
			/>
		</Box>
	);
}
