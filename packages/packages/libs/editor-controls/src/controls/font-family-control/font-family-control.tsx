import * as React from 'react';
import { stringPropTypeUtil } from '@elementor/editor-props';
import { ChevronDownIcon } from '@elementor/icons';
import { bindPopover, bindTrigger, Popover, UnstableTag, usePopupState } from '@elementor/ui';

import { useBoundProp } from '../../bound-prop-context';
import { FontFamilySelector } from '../../components/font-family-selector';
import { transitionProperties } from '../../components/transitions/properties-data';
import ControlActions from '../../control-actions/control-actions';
import { createControl } from '../../create-control';

export type FontCategory = {
	label: string;
	fonts: string[];
};

type FontFamilyControlProps = {
	fontFamilies: FontCategory[];
	sectionWidth: number;
};

const SIZE = 'tiny';

export const FontFamilyControl = createControl( ( { fontFamilies, sectionWidth }: FontFamilyControlProps ) => {
	const { value: fontFamily, setValue: setFontFamily, disabled, placeholder } = useBoundProp( stringPropTypeUtil );

	const popoverState = usePopupState( { variant: 'popover' } );

	const isShowingPlaceholder = ! fontFamily && placeholder;

	const categoriesWithFontsStyle = transitionProperties.map( ( category ) => ( {
		label: category.label,
		font: category.properties.map( ( prop ) => prop.label ),
	} ) );

	return (
		<>
			<ControlActions>
				<UnstableTag
					variant="outlined"
					label={ fontFamily || placeholder }
					endIcon={ <ChevronDownIcon fontSize={ SIZE } /> }
					{ ...bindTrigger( popoverState ) }
					fullWidth
					disabled={ disabled }
					sx={
						isShowingPlaceholder
							? {
									'& .MuiTag-label': {
										color: ( theme ) => theme.palette.text.tertiary,
									},
									textTransform: 'capitalize',
							  }
							: undefined
					}
				/>
			</ControlActions>
			<Popover
				disablePortal
				disableScrollLock
				anchorOrigin={ { vertical: 'bottom', horizontal: 'right' } }
				transformOrigin={ { vertical: 'top', horizontal: 'right' } }
				sx={ { my: 1.5 } }
				{ ...bindPopover( popoverState ) }
			>
				<FontFamilySelector
					fontFamilies={ categoriesWithFontsStyle }
					fontFamily={ fontFamily }
					onFontFamilyChange={ setFontFamily }
					onClose={ popoverState.close }
					sectionWidth={ sectionWidth }
					title={ 'Font Family' }
				/>
			</Popover>
		</>
	);
} );
