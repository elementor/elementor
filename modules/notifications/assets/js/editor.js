import { editorV1 } from './components/editor-v1';
import { editorV2 } from './components/editor-v2';

if ( window?.elementorV2?.editorAppBar ) {
	editorV2();
} else {
	editorV1();
}
