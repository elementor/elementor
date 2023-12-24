import React from 'react';
import { Panel } from './Panel';
import { Preview } from './Preview';
import { Navigator } from './Navigator';
import { useConfig } from '../hooks/useConfig';
import { useDocumentConfig } from '../hooks/useDocumentConfig';

declare let elementor: {
	onPreviewLoaded: VoidFunction
};

declare const __: ( text: string, domain: string ) => string;

export const EditorWrapper: React.FC = () => {
	const [ notice ] = useConfig( 'notice' );
	const config = useDocumentConfig();

	return (
		<div className="editor-app">
			<div id="elementor-editor-wrapper">
				<Panel />
				<Preview
					iframePreviewURL={ config?.urls?.preview }
					onPreviewLoaded={ () => {
						elementor.onPreviewLoaded();
					} }
					notice={ notice || null }
					loadingText={ __( 'Loading', 'elementor' ) }
				/>
				<Navigator />
			</div>
		</div>
	);
};
