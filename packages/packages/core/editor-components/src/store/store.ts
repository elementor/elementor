import { __createSelector as createSelector, __useSelector as useSelector, type SliceState } from '@elementor/store';

import type { ComponentId, OverridableProps, PublishedComponent, UnpublishedComponent } from '../types';
import { type slice } from './extensible-slice';
import { type SanitizeAttributes, SLICE_NAME } from './store-types';

export type ComponentsSlice = SliceState< typeof slice >;

export { slice, registerComponentsReducer, createComponentsAction, __resetExtraReducers } from './extensible-slice';
export type { ComponentsState, ComponentsPathItem, SanitizeAttributes } from './store-types';
export { initialState, SLICE_NAME } from './store-types';

export const selectData = ( state: ComponentsSlice ) => state[ SLICE_NAME ].data;
export const selectArchivedThisSession = ( state: ComponentsSlice ) => state[ SLICE_NAME ].archivedThisSession;
const selectLoadStatus = ( state: ComponentsSlice ) => state[ SLICE_NAME ].loadStatus;
const selectStylesDefinitions = ( state: ComponentsSlice ) => state[ SLICE_NAME ].styles ?? {};
const selectUnpublishedData = ( state: ComponentsSlice ) => state[ SLICE_NAME ].unpublishedData;
const getCreatedThisSession = ( state: ComponentsSlice ) => state[ SLICE_NAME ].createdThisSession;
const getPath = ( state: ComponentsSlice ) => state[ SLICE_NAME ].path;
const getCurrentComponentId = ( state: ComponentsSlice ) => state[ SLICE_NAME ].currentComponentId;
export const selectComponent = ( state: ComponentsSlice, componentId: ComponentId ) =>
	state[ SLICE_NAME ].data.find( ( component ) => component.id === componentId );
export const useComponent = ( componentId: ComponentId | null ) => {
	return useSelector( ( state: ComponentsSlice ) => ( componentId ? selectComponent( state, componentId ) : null ) );
};

export const selectComponentByUid = ( state: ComponentsSlice, componentUid: string ) =>
	state[ SLICE_NAME ].data.find( ( component ) => component.uid === componentUid ) ??
	state[ SLICE_NAME ].unpublishedData.find( ( component ) => component.uid === componentUid );

export const selectComponents = createSelector(
	selectData,
	selectUnpublishedData,
	( data: PublishedComponent[], unpublishedData: UnpublishedComponent[] ) => [
		...unpublishedData.map( ( item ) => ( {
			uid: item.uid,
			name: item.name,
			overridableProps: item.overridableProps,
		} ) ),
		...data.filter( ( component ) => ! component.isArchived ),
	]
);
export const selectUnpublishedComponents = createSelector(
	selectUnpublishedData,
	( unpublishedData: UnpublishedComponent[] ) => unpublishedData
);
export const selectLoadIsPending = createSelector( selectLoadStatus, ( status ) => status === 'pending' );
export const selectLoadIsError = createSelector( selectLoadStatus, ( status ) => status === 'error' );
export const selectStyles = ( state: ComponentsSlice ) => state[ SLICE_NAME ].styles ?? {};
export const selectFlatStyles = createSelector( selectStylesDefinitions, ( data ) => Object.values( data ).flat() );
export const selectCreatedThisSession = createSelector(
	getCreatedThisSession,
	( createdThisSession ) => createdThisSession
);

const DEFAULT_OVERRIDABLE_PROPS: OverridableProps = {
	props: {},
	groups: {
		items: {},
		order: [],
	},
};

export const selectOverridableProps = createSelector(
	selectComponent,
	( component: PublishedComponent | undefined ) => {
		if ( ! component ) {
			return undefined;
		}

		return component.overridableProps ?? DEFAULT_OVERRIDABLE_PROPS;
	}
);
export const useOverridableProps = ( componentId: ComponentId | null ) => {
	return useSelector( ( state: ComponentsSlice ) =>
		componentId ? selectOverridableProps( state, componentId ) : null
	);
};
export const selectIsOverridablePropsLoaded = createSelector(
	selectComponent,
	( component: PublishedComponent | undefined ) => {
		return !! component?.overridableProps;
	}
);
export const selectPath = createSelector( getPath, ( path ) => path );

export const selectCurrentComponentId = createSelector(
	getCurrentComponentId,
	( currentComponentId ) => currentComponentId
);

export const selectCurrentComponent = createSelector( selectData, getCurrentComponentId, ( data, currentComponentId ) =>
	data.find( ( component ) => component.id === currentComponentId )
);

export const useCurrentComponentId = () => {
	return useSelector( selectCurrentComponentId );
};
export const useCurrentComponent = () => {
	return useSelector( selectCurrentComponent );
};

export const selectUpdatedComponentNames = createSelector(
	( state: ComponentsSlice ) => state[ SLICE_NAME ].updatedComponentNames,
	( updatedComponentNames ) =>
		Object.entries( updatedComponentNames ).map( ( [ componentId, title ] ) => ( {
			componentId: Number( componentId ),
			title,
		} ) )
);

const useSanitizedComponents = () => {
	return useSelector( ( state: ComponentsSlice ) => state[ SLICE_NAME ].sanitized );
};
export const useIsSanitizedComponent = ( componentId: ComponentId | null, key: SanitizeAttributes ) => {
	const sanitizedComponents = useSanitizedComponents();

	if ( ! componentId ) {
		return false;
	}

	return !! sanitizedComponents[ componentId ]?.[ key ];
};
