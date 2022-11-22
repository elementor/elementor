/* global __ */
import {useEffect, useRef} from "react";
import {Loader} from "./components/loader/Loader.jsx";
import useConfig from "./hooks/useConfig";
import {useDocumentConfig} from "./components/loader/hooks/useDocumentConfig";
import './css/variables.css';

function EditorTitle() {
	const config = useDocumentConfig();

	useEffect( () => {
		document.title = __( 'Elementor', 'elementor' ) + ' | ' + config.settings.settings.post_title
	} , [] );
	return null;
}

function App() {
	const ref = useRef();
	const [ platform, isRTL, lang, editingMode ] = useConfig( 'platform', 'is_rtl', 'lang', 'editing_mode' );

	useEffect( () => {
		// Avoid re-rendering on strict mode
		if ( ! ref.current ) {
			ref.current = true;

			document.documentElement.setAttribute( 'lang', lang );

			document.body.classList.add( `${platform.name}-version-${platform.version.replaceAll('.','-')}`);

			if ( isRTL ) {
				document.documentElement.setAttribute( 'dir', 'rtl' )
				document.body.classList.add( 'rtl' );
			}

			if ( 'content' === editingMode ) {
				document.body.classList.add( 'elementor-editor-content-only' );
			}

			window.elementor.start();
		}
	}, [] );

  return (
	  <div className="editor-app">
		  <EditorTitle />
		  <Loader />
	</div>
  );
}

export default App;
