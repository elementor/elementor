import { type StyleDefinition, type StyleDefinitionID } from '@elementor/editor-styles';
import { getMixpanel } from '@elementor/mixpanel';
import { __getState as getState } from '@elementor/store';

import { fetchCssClassUsage } from '../../service/css-class-usage-service';
import { GlobalClassTrackingError } from '../errors';
import { type FilterKey } from '../hooks/use-filtered-css-class-usage';
import { selectClass } from '../store';

type Event =
	| 'classApplied'
	| 'classRemoved'
	| 'classManagerFilterCleared'
	| 'classDeleted'
	| 'classPublishConflict'
	| 'classRenamed'
	| 'classCreated'
	| 'classManagerSearched'
	| 'classManagerFiltersOpened'
	| 'classManagerOpened'
	| 'classManagerReorder'
	| 'classManagerFilterUsed'
	| 'classUsageLocate'
	| 'classUsageHovered'
	| 'classStyled'
	| 'classStateClicked'
	| 'classUsageClicked';

type EventMap = {
	classCreated: {
		source?: 'created' | 'converted';
		classId: StyleDefinitionID;
		classTitle?: string;
	};
	classDeleted: {
		classId: StyleDefinitionID;
		runAction?: () => void;
	};
	classRenamed: {
		classId: StyleDefinitionID;
		oldValue: string;
		newValue: string;
		source: 'class-manager' | 'style-tab';
	};
	classApplied: {
		classId: StyleDefinitionID;
		classTitle: string;
		totalInstancesAfterApply: number;
	};
	classRemoved: {
		classId: StyleDefinitionID;
		classTitle: string;
	};
	classStyled: {
		classId: StyleDefinitionID;
		classTitle: string;
		classType: 'global' | 'local';
	};
	classManagerOpened: {
		source: 'style-panel';
	};
	classManagerSearched: Record< string, never >;
	classManagerFiltersOpened: Record< string, never >;
	classManagerFilterUsed: {
		action: 'apply' | 'remove';
		type: FilterKey;
		trigger: 'menu' | 'header';
	};
	classManagerFilterCleared: {
		trigger: 'menu' | 'header';
	};
	classManagerReorder: {
		classId: StyleDefinitionID;
		classTitle: string;
	};
	classPublishConflict: {
		numOfConflicts: number;
	};
	classUsageHovered: {
		classId: string;
		usage: number;
	};
	classUsageClicked: {
		classId: StyleDefinitionID;
	};
	classUsageLocate: {
		classId: StyleDefinitionID;
	};
	classStateClicked: {
		classId: StyleDefinitionID | null;
		type: string;
		source: 'global' | 'local';
	};
};

export type TrackingEvent = {
	[ K in keyof EventMap ]: { event: K } & EventMap[ K ];
}[ keyof EventMap ];

type TrackingEventWithComputed = TrackingEvent & {
	classTitle?: string;
	totalInstancesAfterApply?: number;
	totalInstances?: number;
};

export const trackGlobalClasses = async ( payload: TrackingEvent ) => {
	const { runAction } = payload as TrackingEventWithComputed & { runAction?: () => void };
	const data = await getSanitizedData( payload );
	if ( data ) {
		track( data );
		if ( data.event === 'classCreated' && 'classId' in data ) {
			fireClassApplied( data.classId as StyleDefinitionID );
		}
	}
	runAction?.();
};

const fireClassApplied = async ( classId: StyleDefinitionID ) => {
	const appliedInfo = await getAppliedInfo( classId );
	track( {
		event: 'classApplied',
		classId,
		...appliedInfo,
		totalInstancesAfterApply: 1,
	} );
};

const getSanitizedData = async ( payload: TrackingEvent ): Promise< Record< string, unknown > | undefined > => {
	switch ( payload.event ) {
		case 'classApplied':
			if ( 'classId' in payload && payload.classId ) {
				const appliedInfo = await getAppliedInfo( payload.classId );
				return { ...payload, ...appliedInfo };
			}
			break;
		case 'classRemoved':
			if ( 'classId' in payload && payload.classId ) {
				const deleteInfo = getRemovedInfo( payload.classId );
				return { ...payload, ...deleteInfo };
			}
			break;
		case 'classDeleted':
			if ( 'classId' in payload && payload.classId ) {
				const deleteInfo = await trackDeleteClass( payload.classId );
				return { ...payload, ...deleteInfo };
			}
			break;
		case 'classCreated':
			if ( 'source' in payload && payload.source !== 'created' ) {
				if ( 'classId' in payload && payload.classId ) {
					return { ...payload, classTitle: getCssClass( payload.classId ).label };
				}
			}
			return payload;
		case 'classStateClicked':
			if ( 'classId' in payload && payload.classId ) {
				return { ...payload, classTitle: getCssClass( payload.classId ).label };
			}
			break;
		default:
			return payload;
	}
};

const track = ( data: Record< string, unknown > ) => {
	const { dispatchEvent, config } = getMixpanel();
	if ( ! config?.names?.global_classes?.[ data.event as Event ] ) {
		// eslint-disable-next-line no-console
		console.error( 'Global class tracking event not found', { event: data.event } );
		return;
	}

	const name = config.names.global_classes[ data.event as Event ];
	const { event, ...eventData } = data;

	try {
		dispatchEvent?.( name, {
			event,
			properties: {
				...eventData,
			},
		} );
	} catch ( error ) {
		throw new GlobalClassTrackingError( { cause: error } );
	}
};

const extractCssClassData = ( classId: StyleDefinitionID ) => {
	const cssClass: StyleDefinition = getCssClass( classId );
	const classTitle = cssClass.label;

	return { classTitle };
};

const getCssClass = ( classId: StyleDefinitionID ) => {
	const cssClass = selectClass( getState(), classId );
	if ( ! cssClass ) {
		throw new Error( `CSS class with ID ${ classId } not found` );
	}
	return cssClass;
};

const trackDeleteClass = async ( classId: StyleDefinitionID ) => {
	const totalInstances = await getTotalInstancesByCssClassID( classId );
	const classTitle = getCssClass( classId ).label;
	return { totalInstances, classTitle };
};

const getTotalInstancesByCssClassID = async ( classId: StyleDefinitionID ) => {
	const cssClassUsage = await fetchCssClassUsage();
	return cssClassUsage[ classId ]?.total ?? 1;
};

const getAppliedInfo = async ( classId: StyleDefinitionID ) => {
	const { classTitle } = extractCssClassData( classId );
	const totalInstancesAfterApply = ( await getTotalInstancesByCssClassID( classId ) ) + 1;
	return { classTitle, totalInstancesAfterApply };
};

const getRemovedInfo = ( classId: StyleDefinitionID ) => {
	const { classTitle } = extractCssClassData( classId );
	return {
		classTitle,
	};
};
