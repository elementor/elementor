import * as React from 'react';
import { useId, useRef, useState } from 'react';
import { FontFamilySelector, PopoverContent } from '@elementor/editor-controls';
import { useFontFamilies, useSectionRef } from '@elementor/editor-editing-panel';
import { PopoverHeader, PopoverScrollableContent } from '@elementor/editor-ui';
import { ArrowLeftIcon, ChevronDownIcon, TextIcon } from '@elementor/icons';
import {
	bindPopover,
	bindTrigger,
	Button,
	CardActions,
	Divider,
	FormLabel,
	Grid,
	IconButton,
	Popover,
	TextField,
	UnstableTag,
	usePopupState,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { updateVariable, useVariable } from '../hooks/use-prop-variables';

const SIZE = 'tiny';

type Props = {
	editId: string;
	onClose: () => void;
	onGoBack?: () => void;
	onSubmit?: () => void;
};

export const FontVariableEdit = ( { onClose, onGoBack, onSubmit, editId }: Props ) => {
	const variable = useVariable( editId );

	if ( ! variable ) {
		throw new Error( `Global font variable "${ editId }" not found` );
	}

	const [ fontFamily, setFontFamily ] = useState( variable.value );
	const [ label, setLabel ] = useState( variable.label );

	const variableNameId = useId();
	const variableValueId = useId();

	const anchorRef = useRef< HTMLDivElement >( null );
	const fontPopoverState = usePopupState( { variant: 'popover' } );

	const fontFamilies = useFontFamilies();

	const handleUpdate = () => {
		updateVariable( editId, {
			value: fontFamily,
			label,
		} ).then( () => {
			onSubmit?.();
		} );
	};

	const noValueChanged = () => fontFamily === variable.value && label === variable.label;
	const hasEmptyValue = () => '' === fontFamily.trim() || '' === label.trim();
	const isSaveDisabled = () => noValueChanged() || hasEmptyValue();

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
						<TextIcon fontSize={ SIZE } />
					</>
				}
				title={ __( 'Edit variable', 'elementor' ) }
				onClose={ onClose }
			/>

			<Divider />

			<PopoverContent p={ 2 }>
				<Grid container gap={ 0.75 } alignItems="center">
					<Grid item xs={ 12 }>
						<FormLabel htmlFor={ variableNameId } size="tiny">
							{ __( 'Name', 'elementor' ) }
						</FormLabel>
					</Grid>
					<Grid item xs={ 12 }>
						<TextField
							id={ variableNameId }
							size="tiny"
							fullWidth
							value={ label }
							onChange={ ( e: React.ChangeEvent< HTMLInputElement > ) => setLabel( e.target.value ) }
						/>
					</Grid>
				</Grid>

				<Grid container gap={ 0.75 } alignItems="center">
					<Grid item xs={ 12 }>
						<FormLabel htmlFor={ variableValueId } size="tiny">
							{ __( 'Value', 'elementor' ) }
						</FormLabel>
					</Grid>
					<Grid item xs={ 12 }>
						<>
							<UnstableTag
								id={ variableValueId }
								variant="outlined"
								label={ fontFamily }
								endIcon={ <ChevronDownIcon fontSize="tiny" /> }
								{ ...bindTrigger( fontPopoverState ) }
								fullWidth
							/>
							<Popover
								disablePortal
								disableScrollLock
								anchorEl={ anchorRef.current }
								anchorOrigin={ { vertical: 'top', horizontal: 'right' } }
								transformOrigin={ { vertical: 'top', horizontal: -20 } }
								{ ...bindPopover( fontPopoverState ) }
							>
								<FontFamilySelector
									fontFamilies={ fontFamilies }
									fontFamily={ fontFamily }
									onFontFamilyChange={ setFontFamily }
									onClose={ fontPopoverState.close }
									sectionWidth={ sectionWidth }
								/>
							</Popover>
						</>
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
