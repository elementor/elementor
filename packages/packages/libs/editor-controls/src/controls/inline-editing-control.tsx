import * as React from 'react';
import { htmlPropTypeUtil, type HtmlPropValue } from '@elementor/editor-props';
import {
	__privateListenTo as listenTo,
	commandEndEvent,
	type CommandEvent,
	type ListenerEvent,
} from '@elementor/editor-v1-adapters';
import { Box, type SxProps, type Theme } from '@elementor/ui';

import { useBoundProp } from '../bound-prop-context';
import { InlineEditor } from '../components/inline-editor';
import ControlActions from '../control-actions/control-actions';
import { createControl } from '../create-control';

export const InlineEditingControl = createControl(
	( {
		sx,
		attributes,
		props,
	}: {
		sx?: SxProps< Theme >;
		attributes?: Record< string, string >;
		props?: React.ComponentProps< 'div' >;
	} ) => {
		const { value, setValue, bind } = useBoundProp( htmlPropTypeUtil );
		const [ actualValue, setActualValue ] = React.useState< HtmlPropValue[ 'value' ] >( value );
		const handleChange = ( newValue: unknown ) => setValue( newValue as string );

		React.useEffect( () => {
			return listenTo( commandEndEvent( 'document/elements/settings' ), ( e: ListenerEvent ) => {
				const { args, type } = e as CommandEvent< { settings: Record< string, HtmlPropValue > } >;
				const settingValue = args?.settings?.[ bind ]?.value ?? null;

				if ( type !== 'command' || settingValue !== actualValue ) {
					setActualValue( settingValue );
				}
			} );
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [] );

		return (
			<ControlActions>
				<Box
					sx={ {
						p: 0.8,
						border: '1px solid',
						borderColor: 'grey.200',
						borderRadius: '8px',
						transition: 'border-color .2s ease, box-shadow .2s ease',
						'&:hover': {
							borderColor: 'black',
						},
						'&:focus-within': {
							borderColor: 'black',
							boxShadow: '0 0 0 1px black',
						},
						'& .ProseMirror:focus': {
							outline: 'none',
						},
						'& .ProseMirror': {
							minHeight: '70px',
							fontSize: '12px',
							'& a': {
								color: 'inherit',
							},
						},
						'.strip-styles *': {
							all: 'unset',
						},
						...sx,
					} }
					{ ...attributes }
					{ ...props }
				>
					<InlineEditor value={ actualValue || '' } setValue={ handleChange } />
				</Box>
			</ControlActions>
		);
	}
);
