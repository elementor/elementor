import { Box, Button, styled } from '@elementor/ui';

export const EditorWrapper = styled( Box )`
	border: 1px solid var( --e-a-border-color );
	border-radius: 8px;
	position: relative;
	height: 200px;

	.monaco-editor .colorpicker-widget {
		z-index: 99999999 !important;
	}
	.monaco-editor .view-line:first-of-type,
	.monaco-editor .view-line:last-of-type {
		visibility: hidden;
	}
	.monaco-editor .view-overlays > div:first-of-type,
	.monaco-editor .view-overlays > div:last-of-type {
		visibility: hidden;
	}
`;

export const ResizeHandle = styled( Button )`
	position: absolute;
	bottom: -6px;
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
