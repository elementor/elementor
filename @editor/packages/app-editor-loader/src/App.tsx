import { useEffect } from 'react';
import { EditorWrapper } from './components/EditorWrapper';
import { useConfig } from './hooks/useConfig';
import { useDocumentConfig } from './hooks/useDocumentConfig';
import './css/variables.css';

declare const __: ( text: string, domain: string ) => string;

export declare const elementor: {
	start:() => void,
	destroy:() => void,
};

let isFirstTime = false;

function App() {
	const [ platform, isRTL, lang, editingMode ] = useConfig( 'platform', 'is_rtl', 'lang', 'editing_mode' );
	const config = useDocumentConfig();

	useEffect( () => {
		// Avoid re-rendering on strict mode
		if ( ! isFirstTime ) {
			isFirstTime = true;
		} else {
			return;
		}

		document.title = __( 'Elementor', 'elementor' ) + ' | ' + config?.settings?.settings?.post_title;

		document.documentElement.setAttribute( 'lang', lang );

		document.body.classList.add( `${ platform.name }-version-${ platform.version.replaceAll( '.', '-' ) }` );

		if ( isRTL ) {
			document.documentElement.setAttribute( 'dir', 'rtl' );
			document.body.classList.add( 'rtl' );
		}

		if ( 'content' === editingMode ) {
			document.body.classList.add( 'elementor-editor-content-only' );
		}

		elementor.start();
	}, [] );

	return <EditorWrapper />;
}

export default App;
