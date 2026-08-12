import * as React from 'react';
import {
  ControlFormLabel,
  Repeater,
  type RepeaterItem,
  type SetRepeaterValuesMeta,
} from '@elementor/editor-controls';
import {
  getContainer,
  updateElementEditorSettings,
  useElementEditorSettings,
  type V1Element,
} from '@elementor/editor-elements';
import { type CreateOptions } from '@elementor/editor-props';
import {
  __privateUseListenTo as useListenTo,
  commandEndEvent,
  v1ReadyEvent,
  windowEvent,
} from '@elementor/editor-v1-adapters';
import { Stack, TextField } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useElement } from '../../../contexts/element-context';
import { SettingsField } from '../../settings-field';
import { LIST_ITEM_ELEMENT_TYPE, type ListItem, useActions } from './use-actions';

const getEffectiveListItemLabel = ( label: string | undefined, fallbackLabel: string ) => {
  return label?.trim() ? label : fallbackLabel;
};

const useListItems = ( elementId: string ) => {
  return useListenTo(
    [
      v1ReadyEvent(),
      windowEvent( 'elementor/element/update_editor_settings' ),
      commandEndEvent( 'document/elements/create' ),
      commandEndEvent( 'document/elements/delete' ),
      commandEndEvent( 'document/elements/update' ),
      commandEndEvent( 'document/elements/set-settings' ),
    ],
    () => {
      const container = getContainer( elementId );
      const children = container?.children ?? [];

      return children
        .filter( ( child ) => child.model.get( 'elType' ) === LIST_ITEM_ELEMENT_TYPE )
        .map( ( child: V1Element ) => ( {
          id: child.id,
          editorSettings: child.model.get( 'editor_settings' ) ?? {},
        } ) );
    },
    [ elementId ]
  ) as Array< { id: string; editorSettings: Record< string, string > } >;
};

export const ListItemsControl = ( { label }: { label: string } ) => {
  return (
    <SettingsField bind="tag" propDisplayName={ __( 'List', 'elementor' ) }>
      <ListItemsControlContent label={ label } />
    </SettingsField>
  );
};

const ListItemsControlContent = ( { label }: { label: string } ) => {
  const { element } = useElement();
  const { addItem, duplicateItem, moveItem, removeItem } = useActions();
  const listItems = useListItems( element.id );

  const repeaterValues: RepeaterItem< ListItem >[] = listItems.map( ( item, index ) => ( {
    id: item.id,
    title: getEffectiveListItemLabel( item.editorSettings?.label, `Item ${ index + 1 }` ),
    index,
  } ) );

  const setValue = (
    _newValues: RepeaterItem< ListItem >[],
    _options: CreateOptions,
    meta?: SetRepeaterValuesMeta< RepeaterItem< ListItem > >
  ) => {
    if ( meta?.action?.type === 'add' ) {
      return addItem( { listContainerId: element.id, items: meta.action.payload } );
    }

    if ( meta?.action?.type === 'remove' ) {
      return removeItem( { items: meta.action.payload } );
    }

    if ( meta?.action?.type === 'duplicate' ) {
      return duplicateItem( { items: meta.action.payload } );
    }

    if ( meta?.action?.type === 'reorder' ) {
      const { from, to } = meta.action.payload;

      return moveItem( {
        toIndex: to,
        listContainerId: element.id,
        movedElementId: listItems[ from ].id,
      } );
    }
  };

  return (
    <Repeater
      showToggle={ false }
      values={ repeaterValues }
      setValues={ setValue }
      showRemove={ repeaterValues.length > 1 }
      label={ label }
      itemSettings={ {
        getId: ( { item } ) => item.id,
        initialValues: { id: '', title: 'Item' },
        Label: ItemLabel,
        Content: ItemContent,
        Icon: () => null,
      } }
    />
  );
};

const ItemLabel = ( { value }: { value: ListItem } ) => {
  return (
    <Stack sx={ { minHeight: 20 } } direction="row" alignItems="center" gap={ 1.5 }>
      <span>{ value.title }</span>
    </Stack>
  );
};

const ItemContent = ( { value }: { value: ListItem } ) => {
  if ( ! value.id ) {
    return null;
  }

  return (
    <Stack p={ 2 } gap={ 1.5 }>
      <ListItemLabelControl elementId={ value.id } fallbackLabel={ value.title ?? '' } />
    </Stack>
  );
};

const ListItemLabelControl = ( {
  elementId,
  fallbackLabel,
}: {
  elementId: string;
  fallbackLabel: string;
} ) => {
  const editorSettings = useElementEditorSettings( elementId );
  const label = getEffectiveListItemLabel( editorSettings?.label, fallbackLabel );

  return (
    <Stack gap={ 1 }>
      <ControlFormLabel>{ __( 'Item name', 'elementor' ) }</ControlFormLabel>
      <TextField
        size="tiny"
        value={ label }
        onChange={ ( { target }: React.ChangeEvent< HTMLInputElement > ) => {
          updateElementEditorSettings( {
            elementId,
            settings: { label: target.value },
          } );
        } }
      />
    </Stack>
  );
};
