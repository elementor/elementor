import { type ItemsActionPayload } from '@elementor/editor-controls';
import {
  type CreateElementParams,
  createElements,
  duplicateElements,
  getContainer,
  moveElements,
  removeElements,
  type V1Element,
} from '@elementor/editor-elements';
import { booleanPropTypeUtil } from '@elementor/editor-props';
import { __ } from '@wordpress/i18n';

export type ListItem = {
  id: string;
  title?: string;
};

export const LIST_ITEM_ELEMENT_TYPE = 'e-list-item';
const LIST_ITEM_MARKER_ELEMENT_TYPE = 'e-list-item-marker';
const LIST_ITEM_CONTENT_ELEMENT_TYPE = 'e-list-item-content';
const SVG_WIDGET_TYPE = 'e-svg';
const PARAGRAPH_WIDGET_TYPE = 'e-paragraph';
type ListItemElementModel = {
  elType: string;
  widgetType?: string;
  settings?: Record< string, unknown >;
  editor_settings?: {
    label?: string;
    initial_position?: number;
  };
  elements?: ListItemElementModel[];
};

const createDefaultMarkerChild = (): ListItemElementModel => ( {
  elType: LIST_ITEM_MARKER_ELEMENT_TYPE,
  elements: [
    {
      elType: 'widget',
      widgetType: SVG_WIDGET_TYPE,
    },
  ],
} );

const createDefaultContentChild = (): ListItemElementModel => ( {
  elType: LIST_ITEM_CONTENT_ELEMENT_TYPE,
  elements: [
    {
      elType: 'widget',
      widgetType: PARAGRAPH_WIDGET_TYPE,
      settings: {
        paragraph: {
          $$type: 'html-v3',
          value: {
            content: {
              $$type: 'string',
              value: __( 'List item', 'elementor' ),
            },
            children: [],
          },
        },
      },
    },
  ],
} );

const shouldCreateMarker = ( listContainer: V1Element ) =>
  booleanPropTypeUtil.extract( listContainer.settings.get( 'show_markers' ) ) !== false;

const createDefaultListItemModel = (
  position: number,
  showMarkers = true
): ListItemElementModel => ( {
  elType: LIST_ITEM_ELEMENT_TYPE,
  editor_settings: {
    label: `Item ${ position }`,
    initial_position: position,
  },
  elements: [
    ...( showMarkers ? [ createDefaultMarkerChild() ] : [] ),
    createDefaultContentChild(),
  ],
} );

export const useActions = () => {
  const duplicateItem = ( { items }: { items: ItemsActionPayload< ListItem > } ) => {
    duplicateElements( {
      elementIds: items.map( ( { item } ) => item.id as string ),
      title: __( 'Duplicate List Item', 'elementor' ),
    } );
  };

  const moveItem = ( {
    listContainer,
    toIndex,
    movedElementId,
  }: {
    listContainer: V1Element;
    toIndex: number;
    movedElementId?: string;
  } ) => {
    if ( ! movedElementId ) {
      throw new Error( 'List item is required' );
    }

    const movedElement = getContainer( movedElementId );

    if ( ! movedElement ) {
      throw new Error( 'List item not found' );
    }

    moveElements( {
      title: __( 'Reorder List Items', 'elementor' ),
      moves: [
        {
          element: movedElement,
          targetContainer: listContainer,
          options: { at: toIndex },
        },
      ],
    } );
  };

  const removeItem = ( { items }: { items: ItemsActionPayload< ListItem > } ) => {
    removeElements( {
      title: __( 'List Items', 'elementor' ),
      elementIds: items.map( ( { item } ) => item.id as string ),
    } );
  };

  const addItem = ( {
    listContainer,
    items,
  }: {
    listContainer: V1Element;
    items: ItemsActionPayload< ListItem >;
  } ) => {
    items.forEach( ( { index } ) => {
      const position = index + 1;
      const showMarkers = shouldCreateMarker( listContainer );

      createElements( {
        title: __( 'List Items', 'elementor' ),
        elements: [
          {
            container: listContainer,
            model: createDefaultListItemModel(
              position,
              showMarkers
            ) as CreateElementParams[ 'model' ],
          },
        ],
      } );
    } );
  };

  return {
    duplicateItem,
    moveItem,
    removeItem,
    addItem,
  };
};
