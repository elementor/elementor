import * as React from 'react';
import { useBoundProp } from '@elementor/editor-controls';
import { getV1CurrentDocument } from '@elementor/editor-documents';
import { StarIcon } from '@elementor/icons';
import {
	bindPopover,
	bindTrigger,
	Button,
	FormLabel,
	Grid,
	IconButton,
	Popover,
	Select,
	Stack,
	TextField,
	Tooltip,
	Typography,
	usePopupState,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { COMPONENT_DOCUMENT_TYPE } from './consts';

const SIZE = 'tiny';

const FORBIDDEN_KEYS = [
    '_cssid',
    'attributes',
]

export function OverridableProp() {
	const control = useBoundProp();
	const currentDocument = getV1CurrentDocument();

	if ( currentDocument.config.type !== COMPONENT_DOCUMENT_TYPE ) {
        return null;
	}

    if ( ! isPropAllowed( control.bind ) ) {
        return null;
    }

    console.log( 'bound prop', control );
    
    return <OverridablePropIndicator />;
}

function OverridablePropIndicator() {
	const popupState = usePopupState( {
		variant: 'popover',
	} );

	const triggerProps = bindTrigger( popupState );
	const popoverProps = bindPopover( popupState );

	return (
		<>
			<Tooltip placement="top" title={ __( 'Override Property', 'elementor' ) }>
				<IconButton aria-label={ __( 'Override Property', 'elementor' ) } size={ SIZE } { ...triggerProps }>
					<StarIcon fontSize={ SIZE } />
				</IconButton>
			</Tooltip>
			<Popover
				disableScrollLock
				anchorOrigin={ {
					vertical: 'bottom',
					horizontal: 'right',
				} }
				transformOrigin={ {
					vertical: 'top',
					horizontal: 'right',
				} }
				PaperProps={ {
					sx: { my: 2.5 },
				} }
				{ ...popoverProps }
			>
				<OverridablePropForm close={ popupState.close } />
			</Popover>
		</>
	);
}

function OverridablePropForm( { close }: { close: () => void } ) {
	return (
		<Stack alignItems="start" width="268px">
			<Stack
				direction="row"
				alignItems="center"
				py={ 1 }
				px={ 1.5 }
				sx={ { columnGap: 0.5, borderBottom: '1px solid', borderColor: 'divider', width: '100%', mb: 1.5 } }
			>
				<Typography variant="caption" sx={ { color: 'text.primary', fontWeight: '500', lineHeight: 1 } }>
					{ __( 'Create new property', 'elementor' ) }
				</Typography>
			</Stack>
			<Grid container gap={ 0.75 } alignItems="start" px={ 1.5 } mb={ 1.5 }>
				<Grid item xs={ 12 }>
					<FormLabel htmlFor="override-value" size="tiny">
						{ __( 'Name', 'elementor' ) }
					</FormLabel>
				</Grid>
				<Grid item xs={ 12 }>
					<TextField
						id="override-label"
						size={ SIZE }
						fullWidth
						placeholder={ __( 'Enter value', 'elementor' ) }
						inputProps={ { style: { color: 'text.primary', fontWeight: '600' } } }
					/>
				</Grid>
			</Grid>
			<Grid container gap={ 0.75 } alignItems="start" px={ 1.5 } mb={ 1.5 }>
				<Grid item xs={ 12 }>
					<FormLabel htmlFor="override-value" size="tiny">
						{ __( 'Name', 'elementor' ) }
					</FormLabel>
				</Grid>
				<Grid item xs={ 12 }>
					<Select
						id="override-label"
						size={ SIZE }
						fullWidth
						placeholder={ __( 'Enter value', 'elementor' ) }
						inputProps={ { style: { color: 'text.primary', fontWeight: '600' } } }
					/>
				</Grid>
			</Grid>
			<Stack direction="row" justifyContent="flex-end" alignSelf="end" mt={ 1.5 } py={ 1 } px={ 1.5 }>
				<Button onClick={ close } variant="contained" color="primary" size="small">
					{ __( 'Create', 'elementor' ) }
				</Button>
			</Stack>
		</Stack>
	);
}

function isPropAllowed( bind: string ) {
    return ! FORBIDDEN_KEYS.includes( bind );
}