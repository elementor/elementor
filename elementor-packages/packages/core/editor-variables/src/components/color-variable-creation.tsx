import * as React from 'react';
import { useRef, useState } from 'react';
import { PopoverContent, useBoundProp } from '@elementor/editor-controls';
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

import { createVariable } from '../hooks/use-prop-variables';
import { colorVariablePropTypeUtil } from '../prop-types/color-variable-prop-type';
import { usePopoverContentRef } from './variable-selection-popover.context';

const SIZE = 'tiny';

type Props = {
	onGoBack?: () => void;
	onClose: () => void;
};

export const ColorVariableCreation = ( { onGoBack, onClose }: Props ) => {
	const { setValue: setVariable } = useBoundProp( colorVariablePropTypeUtil );

	const [ color, setColor ] = useState( '' );
	const [ label, setLabel ] = useState( '' );

	const defaultRef = useRef< HTMLDivElement >( null );
	const anchorRef = usePopoverContentRef() ?? defaultRef;

	const resetFields = () => {
		setColor( '' );
		setLabel( '' );
	};

	const closePopover = () => {
		resetFields();
		onClose();
	};

	const handleCreate = () => {
		createVariable( {
			value: color,
			label,
			type: colorVariablePropTypeUtil.key,
		} ).then( ( key ) => {
			setVariable( key );
			closePopover();
		} );
	};

	const isFormInvalid = () => {
		return ! color?.trim() || ! label?.trim();
	};

	const sectionRef = useSectionRef();
	const sectionWidth = sectionRef?.current?.offsetWidth ?? 320;

	return (
		<PopoverScrollableContent height="auto" width={ sectionWidth }>
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
				<Button size="small" variant="contained" disabled={ isFormInvalid() } onClick={ handleCreate }>
					{ __( 'Create', 'elementor' ) }
				</Button>
			</CardActions>
		</PopoverScrollableContent>
	);
};
