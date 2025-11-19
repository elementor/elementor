import * as React from 'react';
import { useBoundProp } from '@elementor/editor-controls';
import { getV1CurrentDocument } from '@elementor/editor-documents';
import { CheckIcon, PlusIcon } from '@elementor/icons';
import {
	bindPopover,
	bindTrigger,
	Box,
	Button,
	FormLabel,
	Grid,
	Popover,
	Select,
	Stack,
	styled,
	TextField,
	Tooltip,
	Typography,
	usePopupState,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { COMPONENT_DOCUMENT_TYPE } from './consts';
import { isTransformable } from '@elementor/editor-props';

const SIZE = 'tiny';

const FORBIDDEN_KEYS = [
    '_cssid',
    'attributes',
]

const IconContainer = styled(Box)`
	position: absolute;
	display: flex;
	pointer-events: none;
	opacity: 0;
	color: ${ ( { theme } ) => theme.palette.primary.contrastText };
	transition: opacity 0.2s ease-in-out;

	& > svg {
		fill: ${ ( { theme } ) => theme.palette.primary.contrastText };
	}
`;

const IconWrapper = styled(Box)`
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	margin-inline: ${ ( { theme } ) => theme.spacing( 0.5 ) };
	width: 16px;
	height: 16px;

	&:before {
		position: absolute;
		content: '';
		display: block;
		width: 5px;
		height: 5px;
		border-radius: 2px;
		transform: rotate(45deg);
		background-color: ${ ( { theme } ) => theme.palette.primary.main };
		transition: all 0.2s ease-in-out;
	}

	&:hover, &.enlarged {
		&:before {
			width: 16px;
			height: 16px;
		}

		.icon {
			opacity: 1;
		}
	}

`

export function OverridableProp() {
	const { bind, value } = useBoundProp();
	const currentDocument = getV1CurrentDocument();

	if ( currentDocument.config.type !== COMPONENT_DOCUMENT_TYPE ) {
        return null;
	}

    if ( ! isPropAllowed( bind ) ) {
        return null;
    }


    return <OverridablePropIndicator 
		isOverridable={ isTransformable( value ) && value.$$type === 'component-overridable-prop' }
	/>;
}

function OverridablePropIndicator({ isOverridable }: { isOverridable: boolean }) {
	const { value, setValue } = useBoundProp();

	const popupState = usePopupState( {
		variant: 'popover',
	} );

	const triggerProps = bindTrigger( popupState );
	const popoverProps = bindPopover( popupState );

	const handleSubmit = ( data: { label: string, group: string }) => {
		setValue( {
			$$type: 'component-overridable-prop',
			value: {
				label: data.label,
				group: data.group,
			},
		} )
		popupState.close();
	}

	return (
		<>
			<Tooltip placement="top" title={ __( 'Override Property', 'elementor' ) }>
				<IconWrapper {...triggerProps} className={popoverProps.open || isOverridable ? 'enlarged' : ''}>
					<IconContainer className="icon">
						{isOverridable ? <CheckIcon fontSize={ SIZE } /> : <PlusIcon fontSize={ SIZE } />}
					</IconContainer>
				</IconWrapper>
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
				<OverridablePropForm onSubmit={ handleSubmit } />
			</Popover>
		</>
	);
}

function OverridablePropForm( { onSubmit }: { onSubmit: (data: {label: string, group: string}) => void } ) {
	const handleCreate = () => {
		onSubmit({
			label: 'aaaa',
			group: 'abababa'
		});
	}

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
					<FormLabel htmlFor="override-label" size="tiny">
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
					<FormLabel htmlFor="override-props-group" size="tiny">
						{ __( 'Group Name', 'elementor' ) }
					</FormLabel>
				</Grid>
				<Grid item xs={ 12 }>
					<Select
						id="override-props-group"
						size={ SIZE }
						fullWidth
						placeholder={ __( 'Enter value', 'elementor' ) }
						inputProps={ { style: { color: 'text.primary', fontWeight: '600' } } }
					/>
				</Grid>
			</Grid>
			<Stack direction="row" justifyContent="flex-end" alignSelf="end" mt={ 1.5 } py={ 1 } px={ 1.5 }>
				<Button onClick={ handleCreate } variant="contained" color="primary" size="small">
					{ __( 'Create', 'elementor' ) }
				</Button>
			</Stack>
		</Stack>
	);
}

function isPropAllowed( bind: string ) {
    return ! FORBIDDEN_KEYS.includes( bind );
}