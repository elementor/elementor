import * as React from 'react';
import { stringPropTypeUtil } from '@elementor/editor-props';
import { ChevronDownIcon, TextIcon } from '@elementor/icons';
import { bindPopover, bindTrigger, Popover, UnstableTag, usePopupState } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useBoundProp } from '../../bound-prop-context';
import { ItemSelector } from '../../components/item-selector';
import { type Category } from '../../components/item-selector';
import ControlActions from '../../control-actions/control-actions';
import { createControl } from '../../create-control';
import { enqueueFont } from './enqueue-font';

export type FontCategory = {
	label: string;
	fonts: string[];
};

type FontFamilyControlProps = {
	fontFamilies: FontCategory[];
	sectionWidth: number;
};

export const FontFamilyControl = createControl( ( { fontFamilies, sectionWidth }: FontFamilyControlProps ) => {
	const { value: fontFamily, setValue: setFontFamily, disabled, placeholder } = useBoundProp( stringPropTypeUtil );

	const popoverState = usePopupState( { variant: 'popover' } );
	const isShowingPlaceholder = ! fontFamily && placeholder;

	const mapFontSubs = React.useMemo< Category[] >( () => {
		return fontFamilies.map( ( { label, fonts } ) => ( {
			label,
			items: fonts,
		} ) );
	}, [ fontFamilies ] );

	return (
		<>
			<ControlActions>
				<UnstableTag
					variant="outlined"
					label={ fontFamily || placeholder }
					endIcon={ <ChevronDownIcon fontSize="tiny" /> }
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
				<ItemSelector
					itemsList={ mapFontSubs }
					selectedItem={ fontFamily }
					onItemChange={ setFontFamily }
					onClose={ popoverState.close }
					sectionWidth={ sectionWidth }
					title={ __( 'Font Family', 'elementor' ) }
					itemStyle={ ( item ) => ( { fontFamily: item.value } ) }
					onDebounce={ enqueueFont }
					icon={ TextIcon as React.ElementType< { fontSize: string } > }
				/>
			</Popover>
		</>
	);
} );
