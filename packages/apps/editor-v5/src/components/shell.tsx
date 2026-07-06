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
import PanelChrome from './panel-chrome';
import PropertiesPanel from './properties-panel';

const ELEMENTS_PANEL_WIDTH = 300;
const SIDE_PANEL_WIDTH = 280;

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
		<Box
			sx={ {
				backgroundColor: 'grey.100',
				display: 'flex',
				flexDirection: 'column',
				height: '100vh',
				overflow: 'hidden',
				width: '100%',
			} }
		>
			<AppBar />
			<Box sx={ { display: 'flex', flex: 1, minHeight: 0 } }>
				<Box
					component="aside"
					sx={ {
						borderRight: '1px solid',
						borderColor: 'divider',
						flexShrink: 0,
						width: ELEMENTS_PANEL_WIDTH,
					} }
				>
					<ElementsPanel />
				</Box>
				<Box component="main" sx={ { display: 'flex', flex: 1, minWidth: 0 } }>
					<Canvas />
				</Box>
				<Box
					component="aside"
					sx={ {
						borderLeft: '1px solid',
						borderColor: 'divider',
						display: 'flex',
						flexDirection: 'column',
						flexShrink: 0,
						width: SIDE_PANEL_WIDTH,
					} }
				>
					<Box sx={ { borderBottom: '1px solid', borderColor: 'divider', flex: 1, minHeight: 0 } }>
						<Navigator />
					</Box>
					<Box sx={ { flex: 1, minHeight: 0 } }>
						<PanelChrome subtitle="Quick edit" title="Properties">
							<PropertiesPanel />
						</PanelChrome>
					</Box>
				</Box>
			</Box>
			<Box sx={ { bottom: 16, maxHeight: '40vh', position: 'fixed', right: 16, width: 360, zIndex: 1000 } }>
				<AgentPanel agent={ agent } />
			</Box>
		</Box>
	);
}
