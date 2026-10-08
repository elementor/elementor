/* eslint-disable local-rules/no-path-imports -- Fork of @elementor/ui ColorBox to keep format Select menu in the popover tree */
import * as React from 'react';
import { Box, MenuItem, Select, styled } from '@elementor/ui';
import AlphaInput from '@elementor/ui/unstable/components/ColorPicker/components/AlphaInput';
import HexInput from '@elementor/ui/unstable/components/ColorPicker/components/HexInput';
import HslaInput from '@elementor/ui/unstable/components/ColorPicker/components/HslaInput';
import Picker from '@elementor/ui/unstable/components/ColorPicker/components/Picker';
import RgbaInput from '@elementor/ui/unstable/components/ColorPicker/components/RgbaInput';
import useColorConverter from '@elementor/ui/unstable/components/ColorPicker/hooks/useColorConverter';
import useColorData from '@elementor/ui/unstable/components/ColorPicker/hooks/useColorData';

const StyledBox = styled( 'div' )( ( { theme } ) => ( {
	boxSizing: 'border-box',
	display: 'flex',
	flexDirection: 'column',
	gap: theme.spacing( 2 ),
	padding: theme.spacing( 2 ),
	width: 305,
} ) );

const DEFAULT_FORMATS = [ 'hex', 'rgb', 'hsl' ];

const TinyMenuItem = styled( MenuItem )( ( { theme } ) => ( {
	...theme.typography.caption,
} ) );

type VariablesColorBoxProps = {
	value: string;
	onChange: ( value: string ) => void;
	hideInputFields?: boolean;
	disableOpacity?: boolean;
	formats?: string[];
};

const normalizeFormats = ( formats: string[] ) => {
	if ( formats.length === 0 ) {
		return [ 'hex' ];
	}

	return formats.slice( 0, DEFAULT_FORMATS.length );
};

export const VariablesColorBox = React.forwardRef< HTMLDivElement, VariablesColorBoxProps >( ( inProps, ref ) => {
	const {
		value,
		onChange,
		hideInputFields = false,
		disableOpacity = false,
		formats: inFormats = DEFAULT_FORMATS,
		...props
	} = inProps;

	const formats = normalizeFormats( inFormats );
	const { format, getAlpha, toRgb, toHsl } = useColorData( value, formats );
	const convertColor = useColorConverter();
	const showFormatSelect = formats.length > 1;
	const formatsSet = new Set( formats );

	return (
		<StyledBox { ...props } ref={ ref }>
			<Picker value={ value } format={ format } onChange={ onChange } disableOpacity={ disableOpacity } />
			{ ! hideInputFields && (
				<Box display="flex" gap={ 1 }>
					{ showFormatSelect && (
						<Select
							size="tiny"
							value={ format }
							MenuProps={ { disablePortal: true } }
							onChange={ ( event ) => {
								const updatedFormat = event.target.value as string;
								const updatedColor = convertColor( value, updatedFormat );
								onChange( updatedColor );
							} }
						>
							{ formatsSet.has( 'hex' ) && <TinyMenuItem value="hex">HEX</TinyMenuItem> }
							{ formatsSet.has( 'rgb' ) && <TinyMenuItem value="rgb">RGB</TinyMenuItem> }
							{ formatsSet.has( 'hsl' ) && <TinyMenuItem value="hsl">HSL</TinyMenuItem> }
						</Select>
					) }
					{ format === 'hex' && (
						<>
							<HexInput
								size="tiny"
								value={ value }
								onChange={ onChange }
								disableOpacity={ disableOpacity }
								sx={ { flexGrow: 1 } }
							/>
							{ ! disableOpacity && (
								<AlphaInput
									size="tiny"
									value={ getAlpha() }
									onChange={ ( updatedAlpha ) => {
										const updatedColor = convertColor( value, format, updatedAlpha );
										onChange( updatedColor );
									} }
								/>
							) }
						</>
					) }
					{ format === 'rgb' && (
						<RgbaInput
							size="tiny"
							value={ toRgb() }
							disableOpacity={ disableOpacity }
							onChange={ ( colorData ) => {
								const updatedColor = convertColor( colorData, 'rgb' );
								onChange( updatedColor );
							} }
						/>
					) }
					{ format === 'hsl' && (
						<HslaInput
							size="tiny"
							value={ toHsl() }
							disableOpacity={ disableOpacity }
							onChange={ ( colorData ) => {
								const updatedColor = convertColor( colorData, 'hsl' );
								onChange( updatedColor );
							} }
						/>
					) }
				</Box>
			) }
		</StyledBox>
	);
} );

VariablesColorBox.displayName = 'VariablesColorBox';
