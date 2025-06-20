import * as React from 'react';
import { stringPropTypeUtil } from '@elementor/editor-props';
import { ChevronDownIcon } from '@elementor/icons';
import { bindPopover, bindTrigger, Popover, UnstableTag, usePopupState } from '@elementor/ui';

import { useBoundProp } from '../../bound-prop-context';
import { FontFamilySelector } from '../../components/font-family-selector';
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
	const { value: fontFamily, setValue: setFontFamily, disabled } = useBoundProp( stringPropTypeUtil );

	const popoverState = usePopupState( { variant: 'popover' } );

	return (
		<>
			<ControlActions>
				<UnstableTag
					variant="outlined"
					label={ fontFamily }
					endIcon={ <ChevronDownIcon fontSize={ SIZE } /> }
					{ ...bindTrigger( popoverState ) }
					fullWidth
					disabled={ disabled }
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
					fontFamilies={ fontFamilies }
					fontFamily={ fontFamily }
					onFontFamilyChange={ setFontFamily }
					onClose={ popoverState.close }
					sectionWidth={ sectionWidth }
				/>
			</Popover>
		</>
	);
} );
