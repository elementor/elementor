import * as React from 'react';
import { type ChangeEvent, type SyntheticEvent, useEffect, useState } from 'react';
import type { AgentEvent, AgentRuntime } from '@elementor/editor-v5-agent';
import { Accordion, AccordionDetails, AccordionSummary, Button, Stack, TextField, Typography } from '@elementor/ui';

type AgentPanelProps = {
	agent: AgentRuntime;
};

const DEFAULT_TOOL_INPUT = '{\n  \n}';

export default function AgentPanel( { agent }: AgentPanelProps ) {
	const [ expanded, setExpanded ] = useState( false );
	const [ toolName, setToolName ] = useState( 'getSnapshot' );
	const [ toolInput, setToolInput ] = useState( DEFAULT_TOOL_INPUT );
	const [ lastEvent, setLastEvent ] = useState< AgentEvent | null >( null );
	const [ lastResult, setLastResult ] = useState< string >( '' );
	const [ error, setError ] = useState< string | null >( null );

	useEffect( () => {
		return agent.on( '*', ( event: AgentEvent ) => {
			setLastEvent( event );
		} );
	}, [ agent ] );

	const handleCallTool = async () => {
		setError( null );

		try {
			const input = toolInput.trim() ? JSON.parse( toolInput ) : {};
			const result = await agent.callTool( toolName, input );

			setLastResult( JSON.stringify( result, null, 2 ) );
		} catch ( callError ) {
			setError( callError instanceof Error ? callError.message : 'Tool call failed.' );
		}
	};

	return (
		<Accordion
			expanded={ expanded }
			onChange={ ( _event: SyntheticEvent, isExpanded: boolean ) => setExpanded( isExpanded ) }
		>
			<AccordionSummary>
				<Typography variant="subtitle2">Agent Dev Panel</Typography>
			</AccordionSummary>
			<AccordionDetails>
				<Stack spacing={ 2 }>
					<TextField
						fullWidth
						label="Tool"
						onChange={ ( event: ChangeEvent< HTMLInputElement | HTMLTextAreaElement > ) =>
							setToolName( event.target.value )
						}
						select
						SelectProps={ { native: true } }
						size="small"
						value={ toolName }
					>
						{ agent.listTools().map( ( tool ) => (
							<option key={ tool.name } value={ tool.name }>
								{ tool.name }
							</option>
						) ) }
					</TextField>
					<TextField
						fullWidth
						label="Input JSON"
						minRows={ 4 }
						multiline
						onChange={ ( event: ChangeEvent< HTMLInputElement | HTMLTextAreaElement > ) =>
							setToolInput( event.target.value )
						}
						size="small"
						value={ toolInput }
					/>
					<Button onClick={ handleCallTool } variant="contained" size="small">
						Call Tool
					</Button>
					{ error && (
						<Typography color="error" variant="body2">
							{ error }
						</Typography>
					) }
					<Typography variant="caption">Tools</Typography>
					<Typography
						component="pre"
						sx={ { fontSize: 11, maxHeight: 120, overflow: 'auto' } }
						variant="body2"
					>
						{ JSON.stringify( agent.listTools(), null, 2 ) }
					</Typography>
					<Typography variant="caption">Last Event</Typography>
					<Typography
						component="pre"
						sx={ { fontSize: 11, maxHeight: 120, overflow: 'auto' } }
						variant="body2"
					>
						{ lastEvent ? JSON.stringify( lastEvent, null, 2 ) : 'No events yet.' }
					</Typography>
					<Typography variant="caption">Last Result</Typography>
					<Typography
						component="pre"
						sx={ { fontSize: 11, maxHeight: 160, overflow: 'auto' } }
						variant="body2"
					>
						{ lastResult || 'No results yet.' }
					</Typography>
				</Stack>
			</AccordionDetails>
		</Accordion>
	);
}
