import { editorV1 } from './components/editor-v1';
import { editorAppBarLink } from './components/editor-app-bar-link';

if ( window?.elementorV2?.editorAppBar ) {
	editorAppBarLink();
} else {
	editorV1();
}
