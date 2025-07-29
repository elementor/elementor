declare module 'constrained-editor-plugin' {
	import type { editor, MonacoEditor } from 'monaco-types';

	export function constrainedEditor( monaco: MonacoEditor ): {
		initializeIn( editor: editor.IStandaloneCodeEditor ): void;
		addRestrictionsTo( model: editor.ITextModel, restrictions: Array<{
			range: [ number, number, number, number ];
			allowMultiline?: boolean;
			label?: string;
			validate?: ( currentValue: string, newRange: any, info: any ) => boolean;
		}> ): void;
		dispose?(): void;
	};
}
