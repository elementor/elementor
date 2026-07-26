import * as React from 'react';
import { useCallback, useState } from 'react';
import { getV1CurrentDocument, setDocumentModifiedStatus } from '@elementor/editor-documents';
import { __privateUseListenTo as useListenTo, routeOpenEvent } from '@elementor/editor-v1-adapters';
import { Box, Stack, TextField, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

const AGENTS_SETTINGS_KEY = 'agents';
const LLMS_SETTINGS_KEY = 'llms';
const TAB_ID = 'settings-agents';
const TAB_ROUTE = `panel/global/${ TAB_ID }`;

type SettingsBag = {
	get: ( key: string ) => unknown;
	set: ( key: string, value: unknown ) => void;
};

function getKitSettingsBag(): SettingsBag | null {
	const settings = getV1CurrentDocument()?.container?.settings;

	return settings ? ( settings as SettingsBag ) : null;
}

function readLlmsContent(): string {
	const settings = getKitSettingsBag();
	const agents = settings?.get( AGENTS_SETTINGS_KEY );

	if ( ! agents || typeof agents !== 'object' ) {
		return '';
	}

	const llms = ( agents as Record< string, unknown > )[ LLMS_SETTINGS_KEY ];

	return typeof llms === 'string' ? llms : '';
}

function writeLlmsContent( content: string ) {
	const settings = getKitSettingsBag();

	if ( ! settings ) {
		return;
	}

	if ( '' === content ) {
		settings.set( AGENTS_SETTINGS_KEY, undefined );
	} else {
		settings.set( AGENTS_SETTINGS_KEY, {
			[ LLMS_SETTINGS_KEY ]: content,
		} );
	}

	setDocumentModifiedStatus( true );
}

export function AgentsSettingsTab() {
	const [ value, setValue ] = useState( readLlmsContent );

	useListenTo( [ routeOpenEvent( TAB_ROUTE ) ], () => {
		setValue( readLlmsContent() );
	} );

	const handleChange = useCallback( ( event: React.ChangeEvent< HTMLInputElement > ) => {
		const nextValue = event.target.value;
		setValue( nextValue );
		writeLlmsContent( nextValue );
	}, [] );

	return (
		<Box sx={ { p: 2 } }>
			<Stack spacing={ 1.5 }>
				<Typography variant="subtitle2">{ __( 'Agents', 'elementor' ) }</Typography>
				<TextField
					label={ __( 'llms.txt', 'elementor' ) }
					value={ value }
					onChange={ handleChange }
					multiline
					minRows={ 12 }
					fullWidth
					helperText={ __( 'Content served at /llms.txt when saved. Leave empty to disable.', 'elementor' ) }
				/>
			</Stack>
		</Box>
	);
}

export const AGENTS_KIT_TAB_ID = TAB_ID;
