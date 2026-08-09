import AtomicElementBaseModel from './atomic-element-base-model';

const LIST_ITEM_ELEMENT_TYPE = 'e-list-item';
const LIST_ITEM_MARKER_ELEMENT_TYPE = 'e-list-item-marker';
const LIST_ITEM_CONTENT_ELEMENT_TYPE = 'e-list-item-content';
const LIST_MARKER_STASH_PREFIX = 'elementor/editor-state';
const LIST_MARKER_STASH_SEGMENT = 'children-deps';

export default class AtomicListModel extends AtomicElementBaseModel {
	initialize( attributes, options ) {
		this.reconcileListMarkersAgainstSchema( attributes );

		super.initialize( attributes, options );

		this.bindListMarkersReconcile();

		if ( ! this.isShowMarkersEnabledFromModel( this.get( 'settings' ) ) ) {
			this.reconcileListMarkersWithModel( false );
		}

		this.once( 'destroy', () => this.unbindListMarkersReconcile?.() );
	}

	reconcileListMarkersAgainstSchema( attributes ) {
		const elements = [ ...( attributes.elements ?? [] ) ];
		const showMarkers = this.isShowMarkersEnabled( attributes.settings );

		attributes.elements = elements.map( ( child ) => {
			if ( LIST_ITEM_ELEMENT_TYPE !== child.elType ) {
				return child;
			}

			return {
				...child,
				elements: this.reconcileListItemMarkerData( child, showMarkers ),
			};
		} );
	}

	bindListMarkersReconcile() {
		const adapter = AtomicElementBaseModel.childrenDependenciesAdapter;
		const settingsModel = this.get( 'settings' );

		if (
			! adapter?.getContainer ||
			! adapter?.addModelToParent ||
			! adapter?.removeModelFromParent ||
			! settingsModel?.on ||
			! settingsModel?.off
		) {
			return;
		}

		this.unbindListMarkersReconcile?.();

		let previousShowMarkers = this.isShowMarkersEnabledFromModel( settingsModel );

		const onChange = () => {
			const currentShowMarkers = this.isShowMarkersEnabledFromModel( settingsModel );

			if ( previousShowMarkers === currentShowMarkers ) {
				return;
			}

			previousShowMarkers = currentShowMarkers;
			this.reconcileListMarkersWithModel( currentShowMarkers );
		};

		settingsModel.on( 'change', onChange );

		this.unbindListMarkersReconcile = () => {
			settingsModel.off?.( 'change', onChange );
			this.clearListMarkerStash();
		};
	}

	isShowMarkersEnabled( settings = {} ) {
		return this.unwrapPropValue( settings.show_markers ) !== false;
	}

	isShowMarkersEnabledFromModel( settingsModel ) {
		return this.unwrapPropValue( settingsModel?.get?.( 'show_markers' ) ) !== false;
	}

	unwrapPropValue( propValue ) {
		if ( propValue && 'object' === typeof propValue && 'value' in propValue ) {
			return propValue.value;
		}

		return propValue;
	}

	reconcileListMarkersWithModel( showMarkers ) {
		const adapter = AtomicElementBaseModel.childrenDependenciesAdapter;
		const listContainer = adapter?.getContainer?.( this.get( 'id' ) );

		if ( ! listContainer ) {
			return;
		}

		const listItemIds = ( listContainer.children ?? [] )
			.filter( ( child ) => child.model.get( 'elType' ) === LIST_ITEM_ELEMENT_TYPE )
			.map( ( child ) => child.id );

		listItemIds.forEach( ( itemId ) => {
			if ( showMarkers ) {
				this.attachMarkerToItem( itemId );
				return;
			}

			this.detachMarkerFromItem( itemId );
		} );
	}

	reconcileListItemMarkerData( listItem, showMarkers ) {
		const nextChildren = [ ...( listItem.elements ?? [] ) ];
		const markerIndex = nextChildren.findIndex( ( child ) => child.elType === LIST_ITEM_MARKER_ELEMENT_TYPE );
		const listItemId = listItem.id;

		if ( showMarkers ) {
			if ( markerIndex >= 0 ) {
				return nextChildren;
			}

			const nextMarker = this.takeStashedMarker( listItemId ) ?? this.createDefaultMarkerModel();
			nextChildren.splice( this.getMarkerInsertIndex( nextChildren ), 0, this.ensureModelId( nextMarker ) );

			return nextChildren;
		}

		if ( markerIndex < 0 ) {
			return nextChildren;
		}

		const [ removedMarker ] = nextChildren.splice( markerIndex, 1 );
		this.saveMarkerToStash( listItemId, removedMarker );

		return nextChildren;
	}

	attachMarkerToItem( listItemId ) {
		const adapter = AtomicElementBaseModel.childrenDependenciesAdapter;
		const listItem = adapter?.getContainer?.( listItemId );

		if ( ! listItem ) {
			return;
		}

		const currentChildren = listItem.children ?? [];
		const hasMarker = currentChildren.some(
			( child ) => child.model.get( 'elType' ) === LIST_ITEM_MARKER_ELEMENT_TYPE,
		);

		if ( hasMarker ) {
			return;
		}

		const markerModel = this.ensureModelId(
			this.takeStashedMarker( listItemId ) ?? this.createDefaultMarkerModel(),
		);

		const attached = adapter.addModelToParent( listItemId, markerModel, {
			at: this.getMarkerInsertIndex(
				currentChildren.map( ( child ) => child.model.toJSON() ),
			),
		} );

		if ( ! attached ) {
			this.saveMarkerToStash( listItemId, markerModel );
			return;
		}

		this.requestNavigatorRefresh( listItemId );
	}

	detachMarkerFromItem( listItemId ) {
		const adapter = AtomicElementBaseModel.childrenDependenciesAdapter;
		const listItem = adapter?.getContainer?.( listItemId );
		const markerChild = listItem?.children?.find(
			( child ) => child.model.get( 'elType' ) === LIST_ITEM_MARKER_ELEMENT_TYPE,
		);

		if ( ! markerChild ) {
			return;
		}

		const removed = adapter.removeModelFromParent( listItemId, markerChild.id );

		if ( ! removed ) {
			return;
		}

		const markerSnapshot = markerChild.model.toJSON();
		this.saveMarkerToStash( listItemId, markerSnapshot );
		this.requestNavigatorRefresh( listItemId );
	}

	getMarkerInsertIndex( children = [] ) {
		const contentIndex = children.findIndex( ( child ) => child.elType === LIST_ITEM_CONTENT_ELEMENT_TYPE );

		return contentIndex >= 0 ? contentIndex : 0;
	}

	createDefaultMarkerModel() {
		return {
			elType: LIST_ITEM_MARKER_ELEMENT_TYPE,
			elements: [
				{
					elType: 'widget',
					widgetType: 'e-svg',
				},
			],
		};
	}

	ensureModelId( modelData ) {
		if ( modelData?.id ) {
			return modelData;
		}

		return {
			...modelData,
			id: elementorCommon.helpers.getUniqueId(),
		};
	}

	saveMarkerToStash( listItemId, data ) {
		if ( ! listItemId || ! data ) {
			return;
		}

		sessionStorage.setItem(
			this.buildListMarkerStashKey( listItemId ),
			JSON.stringify( data ),
		);
	}

	takeStashedMarker( listItemId ) {
		if ( ! listItemId ) {
			return undefined;
		}

		const key = this.buildListMarkerStashKey( listItemId );
		const stashed = sessionStorage.getItem( key );

		if ( ! stashed ) {
			return undefined;
		}

		sessionStorage.removeItem( key );

		try {
			return JSON.parse( stashed );
		} catch {
			return undefined;
		}
	}

	clearListMarkerStash() {
		const listItems = this.get( 'elements' ) ?? [];

		listItems.forEach( ( child ) => {
			if ( child?.elType === LIST_ITEM_ELEMENT_TYPE && child.id ) {
				sessionStorage.removeItem( this.buildListMarkerStashKey( child.id ) );
			}
		} );
	}

	buildListMarkerStashKey( listItemId ) {
		return `${ LIST_MARKER_STASH_PREFIX }/${ listItemId }/${ LIST_MARKER_STASH_SEGMENT }/${ LIST_ITEM_MARKER_ELEMENT_TYPE }`;
	}

	requestNavigatorRefresh( parentId ) {
		if ( 'undefined' === typeof window || typeof window.dispatchEvent !== 'function' ) {
			return;
		}

		window.dispatchEvent(
			new CustomEvent( 'elementor/navigator/refresh-children', {
				detail: { elementId: parentId },
			} ),
		);
	}
}
