import * as React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDownIcon } from '@elementor/icons';
import {
	ListItemText,
	Menu,
	MenuItem,
	type StackProps,
	styled,
	ToggleButton,
	ToggleButtonGroup,
	type ToggleButtonProps,
	Typography,
	useTheme,
} from '@elementor/ui';

import ControlActions from '../control-actions/control-actions';
import { ConditionalTooltip } from './conditional-tooltip';

type RenderContentProps = { size: ToggleButtonProps[ 'size' ] };

export type ToggleButtonGroupItem< TValue > = {
	value: TValue;
	label: string;
	renderContent: ( { size }: RenderContentProps ) => React.ReactNode;
	showTooltip?: boolean;
};

const StyledToggleButtonGroup = styled( ToggleButtonGroup )`
	${ ( { justify } ) => `justify-content: ${ justify };` }
	button:not( :last-of-type ) {
		border-start-end-radius: 0;
		border-end-end-radius: 0;
	}
	button:not( :first-of-type ) {
		border-start-start-radius: 0;
		border-end-start-radius: 0;
	}
	button:last-of-type {
		border-start-end-radius: 8px;
		border-end-end-radius: 8px;
	}
`;

type ExclusiveValue< TValue > = TValue;
type NonExclusiveValue< TValue > = TValue[];

type Props< TValue > = {
	disabled?: boolean;
	justify?: StackProps[ 'justifyContent' ];
	size?: ToggleButtonProps[ 'size' ];
	items: ToggleButtonGroupItem< TValue | null >[];
	maxItems?: number;
	fullWidth?: boolean;
} & (
	| {
			exclusive?: false;
			value: NonExclusiveValue< TValue >;
			onChange: ( value: NonExclusiveValue< TValue > ) => void;
	  }
	| {
			exclusive: true;
			value: ExclusiveValue< TValue >;
			onChange: ( value: ExclusiveValue< TValue > ) => void;
	  }
);

export const ControlToggleButtonGroup = < TValue, >( {
	justify = 'end',
	size = 'tiny',
	value,
	onChange,
	items,
	maxItems,
	exclusive = false,
	fullWidth = false,
	disabled,
}: Props< TValue > ) => {
	const shouldSliceItems = exclusive && maxItems !== undefined && items.length > maxItems;
	const menuItems = shouldSliceItems ? items.slice( maxItems - 1 ) : [];
	const fixedItems = shouldSliceItems ? items.slice( 0, maxItems - 1 ) : items;

	const isRtl = 'rtl' === useTheme().direction;
	const handleChange = (
		_: React.MouseEvent< HTMLElement >,
		newValue: typeof exclusive extends true ? ExclusiveValue< TValue > : NonExclusiveValue< TValue >
	) => {
		onChange( newValue as never );
	};

	const getGridTemplateColumns = useMemo( () => {
		const isOffLimits = menuItems?.length;
		const itemsCount = isOffLimits ? fixedItems.length + 1 : fixedItems.length;
		const templateColumnsSuffix = isOffLimits ? 'auto' : '';

		return `repeat(${ itemsCount }, minmax(0, 25%)) ${ templateColumnsSuffix }`;
	}, [ menuItems?.length, fixedItems.length ] );

	return (
		<ControlActions>
			<StyledToggleButtonGroup
				justify={ justify }
				value={ value }
				onChange={ handleChange }
				exclusive={ exclusive }
				disabled={ disabled }
				sx={ {
					direction: isRtl ? 'rtl /* @noflip */' : 'ltr /* @noflip */',
					display: 'grid',
					gridTemplateColumns: getGridTemplateColumns,
					width: `100%`,
				} }
			>
				{ fixedItems.map( ( { label, value: buttonValue, renderContent: Content, showTooltip } ) => (
					<ConditionalTooltip
						key={ buttonValue as string }
						label={ label }
						showTooltip={ showTooltip || false }
					>
						<ToggleButton value={ buttonValue } aria-label={ label } size={ size } fullWidth={ fullWidth }>
							<Content size={ size } />
						</ToggleButton>
					</ConditionalTooltip>
				) ) }

				{ menuItems.length && exclusive && (
					<SplitButtonGroup
						size={ size }
						value={ ( value as ExclusiveValue< TValue > ) || null }
						onChange={ onChange as ( v: ExclusiveValue< TValue > ) => void }
						items={ menuItems }
						fullWidth={ fullWidth }
					/>
				) }
			</StyledToggleButtonGroup>
		</ControlActions>
	);
};

type SplitButtonGroup< TValue > = {
	size: ToggleButtonProps[ 'size' ];
	items: ToggleButtonGroupItem< TValue | null >[];
	fullWidth: boolean;
	value: ExclusiveValue< TValue > | null;
	onChange: ( value: ExclusiveValue< TValue > ) => void;
};

const SplitButtonGroup = < TValue, >( {
	size = 'tiny',
	onChange,
	items,
	fullWidth,
	value,
}: SplitButtonGroup< TValue > ) => {
	const previewButton = usePreviewButton( items, value );
	const [ isMenuOpen, setIsMenuOpen ] = useState( false );
	const menuButtonRef = useRef( null );

	const onMenuToggle = ( ev: React.MouseEvent ) => {
		setIsMenuOpen( ( prev ) => ! prev );
		ev.preventDefault();
	};

	const onMenuItemClick = ( newValue: TValue | null ) => {
		setIsMenuOpen( false );
		onToggleItem( newValue );
	};

	const onToggleItem = ( newValue: TValue | null ) => {
		const shouldRemove = newValue === value;

		onChange( ( shouldRemove ? null : newValue ) as never );
	};

	return (
		<>
			<ToggleButton
				value={ previewButton.value }
				aria-label={ previewButton.label }
				size={ size }
				fullWidth={ fullWidth }
				onClick={ ( ev: React.MouseEvent ) => {
					ev.preventDefault();
					onMenuItemClick( previewButton.value );
				} }
				ref={ menuButtonRef }
			>
				{ previewButton.renderContent( { size } ) }
			</ToggleButton>
			<ToggleButton
				size={ size }
				aria-expanded={ isMenuOpen ? 'true' : undefined }
				aria-haspopup="menu"
				aria-pressed={ undefined }
				onClick={ onMenuToggle }
				ref={ menuButtonRef }
				value={ '__chevron-icon-button__' }
			>
				<ChevronDownIcon fontSize={ size } />
			</ToggleButton>
			<Menu
				open={ isMenuOpen }
				onClose={ () => setIsMenuOpen( false ) }
				anchorEl={ menuButtonRef.current }
				anchorOrigin={ {
					vertical: 'bottom',
					horizontal: 'right',
				} }
				transformOrigin={ {
					vertical: 'top',
					horizontal: 'right',
				} }
				sx={ {
					mt: 0.5,
				} }
			>
				{ items.map( ( { label, value: buttonValue } ) => (
					<MenuItem
						key={ buttonValue }
						selected={ buttonValue === value }
						onClick={ () => onMenuItemClick( buttonValue ) }
					>
						<ListItemText>
							<Typography sx={ { fontSize: '14px' } }>{ label }</Typography>
						</ListItemText>
					</MenuItem>
				) ) }
			</Menu>
		</>
	);
};

const usePreviewButton = < TValue, >( items: ToggleButtonGroupItem< TValue >[], value: TValue ) => {
	const [ previewButton, setPreviewButton ] = useState(
		items.find( ( item ) => item.value === value ) ?? items[ 0 ]
	);

	useEffect( () => {
		const selectedButton = items.find( ( item ) => item.value === value );

		if ( selectedButton ) {
			setPreviewButton( selectedButton );
		}
	}, [ items, value ] );

	return previewButton;
};
