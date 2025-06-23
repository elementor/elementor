import * as React from 'react';
import { useRef, useState } from 'react';
import { PopoverContent, useBoundProp } from '@elementor/editor-controls';
import { PopoverHeader, PopoverScrollableContent } from '@elementor/editor-ui';
import { ArrowLeftIcon, BrushIcon, TrashIcon } from '@elementor/icons';
import {
	Button,
	CardActions,
	Divider,
	FormLabel,
	Grid,
	IconButton,
	TextField,
	UnstableColorField,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { deleteVariable, updateVariable, useVariable } from '../hooks/use-prop-variables';
import { colorVariablePropTypeUtil } from '../prop-types/color-variable-prop-type';
import { usePopoverContentRef } from './variable-selection-popover.context';

const SIZE = 'tiny';

type Props = {
	editId: string;
	onClose: () => void;
	onGoBack?: () => void;
	onSubmit?: () => void;
};

export const ColorVariableEdit = ( { onClose, onGoBack, onSubmit, editId }: Props ) => {
	const { setValue: notifyBoundPropChange, value: assignedValue } = useBoundProp( colorVariablePropTypeUtil );
	const variable = useVariable( editId );
	if ( ! variable ) {
		throw new Error( `Global color variable not found` );
	}

	const defaultRef = useRef< HTMLDivElement >( null );
	const anchorRef = usePopoverContentRef() ?? defaultRef;

	const [ color, setColor ] = useState( variable.value );
	const [ label, setLabel ] = useState( variable.label );

	const handleUpdate = () => {
		updateVariable( editId, {
			value: color,
			label,
		} ).then( () => {
			maybeTriggerBoundPropChange();
			onSubmit?.();
		} );
	};

	const handleDelete = () => {
		deleteVariable( editId ).then( () => {
			maybeTriggerBoundPropChange();
			onSubmit?.();
		} );
	};

	const maybeTriggerBoundPropChange = () => {
		if ( editId === assignedValue ) {
			notifyBoundPropChange( editId );
		}
	};

	const noValueChanged = () => color === variable.value && label === variable.label;
	const hasEmptyValue = () => '' === color.trim() || '' === label.trim();
	const isSaveDisabled = () => noValueChanged() || hasEmptyValue();

	const actions = [];

	actions.push(
		<IconButton key="delete" size={ SIZE } aria-label={ __( 'Delete', 'elementor' ) } onClick={ handleDelete }>
			<TrashIcon fontSize={ SIZE } />
		</IconButton>
	);

	return (
		<PopoverScrollableContent height="auto">
			<PopoverHeader
				title={ __( 'Edit variable', 'elementor' ) }
				onClose={ onClose }
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
				actions={ actions }
			/>

			<Divider />

			<PopoverContent p={ 2 }>
				<Grid container gap={ 0.75 } alignItems="center">
					<Grid item xs={ 12 }>
						<FormLabel size="tiny">{ __( 'Name', 'elementor' ) }</FormLabel>
					</Grid>
					<Grid item xs={ 12 }>
						<TextField
							size="tiny"
							fullWidth
							value={ label }
							onChange={ ( e: React.ChangeEvent< HTMLInputElement > ) => setLabel( e.target.value ) }
						/>
					</Grid>
				</Grid>

				<Grid container gap={ 0.75 } alignItems="center">
					<Grid item xs={ 12 }>
						<FormLabel size="tiny">{ __( 'Value', 'elementor' ) }</FormLabel>
					</Grid>
					<Grid item xs={ 12 }>
						<UnstableColorField
							size="tiny"
							fullWidth
							value={ color }
							onChange={ setColor }
							slotProps={ {
								colorPicker: {
									anchorEl: anchorRef.current,
									anchorOrigin: { vertical: 'top', horizontal: 'right' },
									transformOrigin: { vertical: 'top', horizontal: -10 },
								},
							} }
						/>
					</Grid>
				</Grid>
			</PopoverContent>

			<CardActions sx={ { pt: 0.5, pb: 1 } }>
				<Button size="small" variant="contained" disabled={ isSaveDisabled() } onClick={ handleUpdate }>
					{ __( 'Save', 'elementor' ) }
				</Button>
			</CardActions>
		</PopoverScrollableContent>
	);
};
