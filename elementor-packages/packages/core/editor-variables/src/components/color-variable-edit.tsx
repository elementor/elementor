import * as React from 'react';
import { useRef, useState } from 'react';
import { PopoverContent } from '@elementor/editor-controls';
import { useSectionRef } from '@elementor/editor-editing-panel';
import { PopoverHeader, PopoverScrollableContent } from '@elementor/editor-ui';
import { ArrowLeftIcon, BrushIcon } from '@elementor/icons';
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

import { updateVariable, useVariable } from '../hooks/use-prop-variables';
import { usePopoverContentRef } from './variable-selection-popover.context';

const SIZE = 'tiny';

type Props = {
	editId: string;
	onClose: () => void;
	onGoBack?: () => void;
	onSubmit?: () => void;
};

export const ColorVariableEdit = ( { onClose, onGoBack, onSubmit, editId }: Props ) => {
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
			onSubmit?.();
		} );
	};

	const noValueChanged = () => color === variable.value && label === variable.label;
	const hasEmptyValue = () => '' === color.trim() || '' === label.trim();
	const isSaveDisabled = () => noValueChanged() || hasEmptyValue();

	const sectionRef = useSectionRef();
	const sectionWidth = sectionRef?.current?.offsetWidth ?? 320;

	return (
		<PopoverScrollableContent height="auto" width={ sectionWidth }>
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
