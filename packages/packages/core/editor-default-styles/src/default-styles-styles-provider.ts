import { type StyleDefinition, type StyleDefinitionID } from '@elementor/editor-styles';
import { createStylesProvider } from '@elementor/editor-styles-repository';
import {
  __dispatch as dispatch,
  __getState as getState,
  __subscribeWithSelector as subscribeWithSelector,
} from '@elementor/store';
import { __ } from '@wordpress/i18n';

import { getAllowedDefaultStyleTags } from './allowed-tags';
import { selectData, slice } from './store';

export const DEFAULT_STYLES_PROVIDER_KEY = 'default-styles';
export const DEFAULT_STYLES_CSS_NAME_PREFIX = 'e-default-';

const resolveCssName = ( id: StyleDefinitionID ) => `${ DEFAULT_STYLES_CSS_NAME_PREFIX }${ id }`;

const placeholderDefinition = ( id: StyleDefinitionID ): StyleDefinition => ( {
  id,
  label: id,
  type: 'class',
  variants: [],
} );

const asClassDefinition = ( style: StyleDefinition ): StyleDefinition => ( {
  ...style,
  type: 'class',
} );

export const defaultStylesStylesProvider = createStylesProvider( {
  key: DEFAULT_STYLES_PROVIDER_KEY,
  priority: 15,
  labels: {
    singular: __( 'tag', 'elementor' ),
    plural: __( 'tags', 'elementor' ),
  },
  subscribe: ( cb ) => subscribeWithStates( cb ),
  actions: {
    all: () =>
      getAllowedDefaultStyleTags().map( ( tag ) => {
        const style = selectData( getState() )[ tag ];

        return style ? asClassDefinition( style ) : placeholderDefinition( tag );
      } ),
    get: ( id ) => {
      const style = selectData( getState() )[ id ];

      return style ? asClassDefinition( style ) : placeholderDefinition( id );
    },
    resolveCssName,
    update: ( payload ) => {
      dispatch(
        slice.actions.update( {
          style: payload,
        } )
      );
    },
    delete: ( id ) => {
      dispatch( slice.actions.deleteTag( id ) );
    },
    updateProps: ( args ) => {
      dispatch(
        slice.actions.updateProps( {
          id: args.id,
          meta: args.meta,
          props: args.props,
          mode: args.mode,
        } )
      );
    },
    updateCustomCss: ( args ) => {
      dispatch(
        slice.actions.updateProps( {
          id: args.id,
          meta: args.meta,
          custom_css: args.custom_css,
          props: {},
        } )
      );
    },
  },
} );

const subscribeWithStates = (
  cb: (
    previous: Record< string, StyleDefinition >,
    current: Record< string, StyleDefinition >
  ) => void
) => {
  let previousState = selectData( getState() );

  return subscribeWithSelector(
    ( state ) => selectData( state ),
    ( currentState ) => {
      cb( previousState, currentState );
      previousState = currentState;
    }
  );
};
