import { type StyleDefinitionID } from '@elementor/editor-styles';
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
	| 'class_duplicated'
	| 'class_renamed'
	| 'class_created'
	| 'class_manager_searched'
	| 'class_manager_filters_opened'
	| 'class_manager_opened'
	| 'class_manager_reorder'
	| 'class_manager_filter_used'
	| 'class_usage_locate'
	| 'class_usage_hovered'
	| 'class_usage_clicked';

type BaseTrackingEvent< T extends Event > = {
	event: T;
};

type EventMap = {
	class_applied: {
		classId: StyleDefinitionID;
	};
	class_removed: {
		classId: StyleDefinitionID;
	};
	class_manager_filter_cleared: {
		trigger: 'menu' | 'header';
	};
	class_deleted: {
		classId: StyleDefinitionID;
		runAction?: () => void;
	};
	class_duplicated: {
		numOfConflicts: number;
	};
	class_renamed: {
		classId: StyleDefinitionID;
		oldValue: string;
		newValue: string;
		source: 'class-manager' | 'style-tab';
	};
	class_created: {
		source?: 'created' | 'converted';
		classId?: StyleDefinitionID;
		classTitle?: string;
	};
	class_manager_searched: Record< string, never >;
	class_manager_filters_opened: Record< string, never >;
	class_manager_opened: {
		source: 'style-panel';
	};
	class_manager_reorder: {
		classId: StyleDefinitionID;
		classTitle: string;
	};
	class_manager_filter_used: {
		action: 'apply' | 'remove';
		type: FilterKey;
		trigger: 'menu' | 'header';
	};
	class_usage_locate: {
		classId: StyleDefinitionID;
	};
	class_usage_hovered: {
		classId: string;
		usage: number;
	};
	class_usage_clicked: {
		classId: StyleDefinitionID;
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
		track( data, true );
	}
	runAction?.();
};

const getSanitizedData = async < T extends Event >( payload: TrackingEvent< T > ) => {
	switch ( payload.event ) {
		case 'class_applied':
		case 'class_removed':
			if ( 'classId' in payload && payload.classId ) {
				const deleteInfo = await getDeleteInformation( payload.classId );
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
			break;
		default:
			return payload;
	}
};

const getDeleteInformation = async ( classId: StyleDefinitionID ) => {
	const { classTitle, totalStyleProperties, hasCostumeCss } = extractCssClassData( classId );
	const totalInstancesAfterApply = await getTotalInstancesByCssClassID( classId );
	return {
		classTitle,
		totalInstancesAfterApply,
		totalStyleProperties,
		hasCostumeCss: Boolean( hasCostumeCss ),
	};
};

const track = < T extends Event >( data: TrackingEvent< T >, testing = false ) => {
	if ( testing ) {
		// eslint-disable-next-line no-console
		console.log( 'LOG:: event', data );
		return;
	}
	const { dispatchEvent, config } = getMixpanel();
	if ( ! config?.names?.global_classes?.[ data.event ] ) {
		return;
	}

	const name = config.names.global_classes[ data.event ];
	dispatchEvent?.( name, {
		...data,
	} );
};

const extractCssClassData = ( classId: StyleDefinitionID ) => {
	const cssClass = getCssClass( classId );

	const classTitle = cssClass.label;
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
	return cssClassUsage[ classId ]?.total ?? 0;
};
