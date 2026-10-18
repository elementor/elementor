// Extension is loaded via the same TipTap stack as InlineEditor (see inline-editor.tsx).
// eslint-disable-next-line import/no-extraneous-dependencies -- @tiptap/core is provided by the editor-controls bundle
import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { type EditorState } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

export const STATE_BINDING_PATTERN = /\{\{state\.([a-zA-Z0-9_.]+)\}\}/g;

export const stateBindingHighlightKey = new PluginKey( 'stateBindingHighlight' );

const buildDecorations = ( doc: EditorState[ 'doc' ] ) => {
  const decorations: Decoration[] = [];

  doc.descendants( ( node, pos ) => {
    if ( ! node.isText || ! node.text ) {
      return;
    }

    const text = node.text;
    STATE_BINDING_PATTERN.lastIndex = 0;

    let match = STATE_BINDING_PATTERN.exec( text );

    while ( match ) {
      decorations.push(
        Decoration.inline( pos + match.index, pos + match.index + match[ 0 ].length, {
          class: 'e-state-binding',
        } )
      );

      match = STATE_BINDING_PATTERN.exec( text );
    }
  } );

  return DecorationSet.create( doc, decorations );
};

export const StateBindingHighlight = Extension.create( {
  name: 'stateBindingHighlight',

  addProseMirrorPlugins() {
    return [
      new Plugin( {
        key: stateBindingHighlightKey,
        state: {
          init: ( _, { doc } ) => buildDecorations( doc ),
          apply( transaction, decorationSet ) {
            if ( transaction.docChanged ) {
              return buildDecorations( transaction.doc );
            }

            return decorationSet;
          },
        },
        props: {
          decorations( state ) {
            return stateBindingHighlightKey.getState( state );
          },
        },
      } ),
    ];
  },
} );
