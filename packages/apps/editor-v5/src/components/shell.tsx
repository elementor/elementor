import * as React from 'react';
import type { AgentRuntime } from '@elementor/editor-v5-agent';
import { type ElementNode, isLegacyDocument } from '@elementor/editor-v5-store';
import { __useSelector as useSelector } from '@elementor/store';
import { Box } from '@elementor/ui';

import AgentPanel from './agent-panel';
import AppBar from './app-bar';
import Canvas from './canvas';
import ElementsPanel from './elements-panel';
import LegacyGuard from './legacy-guard';
import Navigator from './navigator';

type ShellProps = {
	agent: AgentRuntime;
};

export default function Shell( { agent }: ShellProps ) {
	const elements = useSelector(
		( state: { editorV5Document: { elements: ElementNode[] } } ) => state.editorV5Document.elements
	);

	if ( isLegacyDocument( elements ) ) {
		return <LegacyGuard elements={ elements } />;
	}

	return (
		<Box sx={ { display: 'flex', flexDirection: 'column', height: '100vh', width: '100%' } }>
			<AppBar />
			<Box sx={ { display: 'flex', flex: 1, minHeight: 0 } }>
				<Box
					component="aside"
					sx={ { borderRight: '1px solid #d5d8dc', flexShrink: 0, overflow: 'auto', width: 280 } }
				>
					<ElementsPanel />
				</Box>
				<Box component="main" sx={ { flex: 1, minWidth: 0, overflow: 'auto', p: 2 } }>
					<Canvas />
				</Box>
				<Box
					component="aside"
					sx={ { borderLeft: '1px solid #d5d8dc', flexShrink: 0, overflow: 'auto', width: 240 } }
				>
					<Navigator />
				</Box>
			</Box>
			<Box sx={ { bottom: 16, maxHeight: '40vh', position: 'fixed', right: 16, width: 360, zIndex: 1000 } }>
				<AgentPanel agent={ agent } />
			</Box>
		</Box>
	);
}
