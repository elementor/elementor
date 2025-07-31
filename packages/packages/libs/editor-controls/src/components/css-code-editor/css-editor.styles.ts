import { styled } from '@elementor/ui';

export const EditorWrapper = styled( 'div' )`
	border: 1px solid var( --e-a-border-color );
	border-radius: 8px;
	padding: 10px 12px;
	position: relative;
	height: 200px;
	font-family: Roboto, Arial, Helvetica, Verdana, sans-serif;

	.monaco-editor .colorpicker-widget {
		z-index: 99999999 !important;
	}
`;

export const ResizeHandle = styled( 'button' )`
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
