import { Editor } from '@tiptap/core';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';

import { StateBindingHighlight } from '../state-binding-highlight';

describe( 'StateBindingHighlight', () => {
  it( 'should decorate state binding tokens in the document', () => {
    const editor = new Editor( {
      extensions: [ Document, Paragraph, Text, StateBindingHighlight ],
      content: '<p>Count: {{state.count}} on {{state.site_name}}</p>',
    } );

    const html = editor.view.dom.innerHTML;

    expect( html ).toContain( 'e-state-binding' );
    expect( html ).toContain( '{{state.count}}' );

    editor.destroy();
  } );
} );
