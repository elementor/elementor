import { Box, Button, styled } from '@elementor/ui';

export const EditorWrapper = styled( Box )`
	border: 1px solid var( --e-a-border-color );
	border-radius: 8px;
	padding: 4px;
	position: relative;
	height: 200px;

	.monaco-editor .suggest-widget {
		width: 220px !important;
		max-width: 220px !important;
	}

	.visual-content-dimmed {
		opacity: 0.6;
		color: #aaa !important;
		pointer-events: none;
	}

	.monaco-editor .monaco-scrollable-element > .scrollbar {
		width: 6px !important;
	}

	.monaco-editor .monaco-scrollable-element > .scrollbar > .slider {
		width: 6px !important;
	}
`;

export const ResizeHandle = styled( Button )`
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	height: 6px;
	cursor: ns-resize;
	background: transparent;
	border: none;
	padding: 0;

	&:hover {
		background: rgba( 0, 0, 0, 0.05 );
	}

	&:active {
		background: rgba( 0, 0, 0, 0.1 );
	}

	&::after {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate( -50%, -50% );
		width: 30px;
		height: 2px;
		background: var( --e-a-border-color );
		border-radius: 1px;
	}
`;
