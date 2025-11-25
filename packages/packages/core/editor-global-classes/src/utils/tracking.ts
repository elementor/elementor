import { type StyleDefinition, type StyleDefinitionID } from '@elementor/editor-styles';
import { getMixpanel } from '@elementor/mixpanel';
import { __getState as getState } from '@elementor/store';

import { fetchCssClassUsage } from '../../service/css-class-usage-service';
import { type FilterKey } from '../hooks/use-filtered-css-class-usage';
import { selectClass } from '../store';

type Event =
	| 'class_applied'
	| 'class_removed'
	| 'class_manager_filter_cleared'
	| 'class_deleted'
	| 'class_publish_conflict'
	| 'class_renamed'
	| 'class_created'
	| 'class_manager_searched'
	| 'class_manager_filters_opened'
	| 'class_manager_opened'
	| 'class_manager_reorder'
	| 'class_manager_filter_used'
	| 'class_usage_locate'
	| 'class_usage_hovered'
	| 'class_styled'
	| 'class_state_clicked'
	| 'class_usage_clicked';

type BaseTrackingEvent< T extends Event > = {
	event: T;
};

type EventMap = {
	class_created: {
		source?: 'created' | 'converted';
		classId: StyleDefinitionID;
		classTitle?: string;
	};
	class_deleted: {
		classId: StyleDefinitionID;
		runAction?: () => void;
	};

	class_renamed: {
		classId: StyleDefinitionID;
		oldValue: string;
		newValue: string;
		source: 'class-manager' | 'style-tab';
	};
	class_applied: {
		classId: StyleDefinitionID;
		classTitle: string;
		totalInstancesAfterApply: number;
		totalStyleProperties: number;
		hasCostumeCss: boolean;
	};
	class_removed: {
		classId: StyleDefinitionID;
		classTitle: string;
	};
	class_styled: {
		classId: StyleDefinitionID;
		classTitle: string;
		classType: 'global' | 'local';
	};
	class_manager_opened: {
		source: 'style-panel';
	};
	class_manager_searched: Record< string, never >;
	class_manager_filters_opened: Record< string, never >;
	class_manager_filter_used: {
		action: 'apply' | 'remove';
		type: FilterKey;
		trigger: 'menu' | 'header';
	};
	class_manager_filter_cleared: {
		trigger: 'menu' | 'header';
	};
	class_manager_reorder: {
		classId: StyleDefinitionID;
		classTitle: string;
	};
	class_publish_conflict: {
		numOfConflicts: number;
	};
	class_usage_hovered: {
		classId: string;
		usage: number;
	};
	class_usage_clicked: {
		classId: StyleDefinitionID;
	};

	class_usage_locate: {
		classId: StyleDefinitionID;
	};
	class_state_clicked: {
		classId: StyleDefinitionID | null;
		type: string;
		source: 'global' | 'local';
	};
};

export type TrackingEvent< T extends Event > = BaseTrackingEvent< T > & EventMap[ T ];

type TrackingEventWithComputed< T extends Event > = TrackingEvent< T > & {
	classTitle?: string;
	totalInstancesAfterApply?: number;
	totalStyleProperties?: number;
	hasCostumeCss?: boolean;
	totalInstances?: number;
};

export const trackGlobalClasses = async < T extends Event >( payload: TrackingEvent< T > ) => {
	const { runAction } = payload as TrackingEventWithComputed< T > & { runAction?: () => void };
	const data = await getSanitizedData( payload );
	if ( data ) {
		track( data );
		if ( data.event === 'class_created' && 'classId' in data ) {
			fireClassApplied( data.classId as StyleDefinitionID );
		}
	}
	runAction?.();
};

const fireClassApplied = async ( classId: StyleDefinitionID ) => {
	const appliedInfo = await getAppliedInfo( classId );
	track( {
		event: 'class_applied',
		classId,
		...appliedInfo,
		totalInstancesAfterApply: 1,
	} as TrackingEvent< 'class_applied' > );
};

const getSanitizedData = async < T extends Event >( payload: TrackingEvent< T > ) => {
	switch ( payload.event ) {
		case 'class_applied':
			if ( 'classId' in payload && payload.classId ) {
				const appliedInfo = await getAppliedInfo( payload.classId );
				return { ...payload, ...appliedInfo };
			}
			break;
		case 'class_removed':
			if ( 'classId' in payload && payload.classId ) {
				const deleteInfo = await getRemovedInfo( payload.classId );
				return { ...payload, ...deleteInfo };
			}
			break;
		case 'class_deleted':
			if ( 'classId' in payload && payload.classId ) {
				const deleteInfo = await trackDeleteClass( payload.classId );
				return { ...payload, ...deleteInfo };
			}
			break;
		case 'class_created':
			if ( 'source' in payload && payload.source !== 'created' ) {
				if ( 'classId' in payload && payload.classId ) {
					return { ...payload, classTitle: getCssClass( payload.classId ).label };
				}
			}
			return payload;
		case 'class_state_clicked':
			if ( 'classId' in payload && payload.classId ) {
				return { ...payload, classTitle: getCssClass( payload.classId ).label };
			}
			break;
		default:
			return payload;
	}
};

const track = < T extends Event >( data: TrackingEvent< T > ) => {
	const { dispatchEvent, config } = getMixpanel();
	if ( ! config?.names?.global_classes?.[ data.event ] ) {
		return;
	}

	const name = config.names.global_classes[ data.event ];
	const { event, ...eventData } = data;

	try {
		dispatchEvent?.( name, {
			event,
			properties: {
				...eventData,
			},
		} );
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.error( 'Error tracking global classes event:', error );
	}
};

const extractCssClassData = ( classId: StyleDefinitionID ) => {
	const cssClass: StyleDefinition = getCssClass( classId );
	const classTitle = cssClass.label;
	if ( ! cssClass.variants.length ) {
		return { classTitle, totalStyleProperties: 0, hasCostumeCss: false };
	}
	const desktopView = cssClass.variants[ 0 ];
	// only desktop
	const totalStyleProperties = Object.keys( desktopView.props ).length;
	const hasCostumeCss = desktopView.custom_css;

	return { classTitle, totalStyleProperties, hasCostumeCss };
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
	const { classTitle, totalStyleProperties, hasCostumeCss } = extractCssClassData( classId );
	const totalInstancesAfterApply = ( await getTotalInstancesByCssClassID( classId ) ) + 1;
	return {
		classTitle,
		totalInstancesAfterApply,
		totalStyleProperties,
		hasCostumeCss: Boolean( hasCostumeCss ),
	};
};

const getRemovedInfo = async ( classId: StyleDefinitionID ) => {
	const { classTitle } = extractCssClassData( classId );
	return {
		classTitle,
	};
};
