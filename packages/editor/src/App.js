/* global __ */
import {useEffect, useRef} from "react";
import Wrapper from "./components/wrapper";
import useConfig from "./hooks/useConfig";


function EditorTitle() {
	const [ initialDocument ] = useConfig( 'initial_document' );

	useEffect( () => {
		document.title = __( 'Elementor', 'elementor' ) + ' | ' + initialDocument.settings.settings.post_title
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

//	<script>
// 		var ajaxurl = '<?php Utils::print_unescaped_internal_string( admin_url( 'admin-ajax.php', 'relative' ) ); ?>';
// 	</script>
	}, [] );

  return (
	  <div className="editor-app">
		  <EditorTitle />
		  <Wrapper />
	</div>
  );
}

export default App;
