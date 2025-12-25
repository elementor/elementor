import { useEffect, useState, useCallback } from 'react';
import {
	getAdminAppData,
	getUsageWidgets,
	markNoticeViewed,
	saveDisabledWidgets,
} from '../../api';

export const useElementManager = () => {
	const [ isLoading, setIsLoading ] = useState( true );
	const [ widgets, setWidgets ] = useState( [] );
	const [ promotionWidgets, setPromotionWidgets ] = useState( [] );
	const [ plugins, setPlugins ] = useState( [] );
	const [ roles, setRoles ] = useState( [] );
	const [ widgetsDisabled, setWidgetsDisabled ] = useState( [] );
	const [ widgetsRoleRestrictions, setWidgetsRoleRestrictions ] = useState( null );
	const [ promotionData, setPromotionData ] = useState( [] );
	const [ noticeData, setNoticeData ] = useState( null );
	const [ usageWidgets, setUsageWidgets ] = useState( {
		isLoading: false,
		data: null,
	} );
	const [ changeProgress, setChangeProgress ] = useState( {
		isSaving: false,
		isUnsavedChanges: false,
	} );
	const [ isSnackbarOpen, setIsSnackbarOpen ] = useState( false );

	const getWidgetUsage = useCallback( ( widgetName ) => {
		if ( ! usageWidgets.data || ! usageWidgets.data.hasOwnProperty( widgetName ) ) {
			return 0;
		}
		return usageWidgets.data[ widgetName ];
	}, [ usageWidgets.data ] );

	const scanUsageElements = useCallback( async () => {
		setUsageWidgets( ( prev ) => ( { ...prev, isLoading: true } ) );
		const data = await getUsageWidgets();
		setUsageWidgets( { data, isLoading: false } );
		return data;
	}, [] );

	const saveChanges = useCallback( async () => {
		setChangeProgress( ( prev ) => ( { ...prev, isSaving: true } ) );
		await saveDisabledWidgets( widgetsDisabled, widgetsRoleRestrictions );
		setChangeProgress( { isSaving: false, isUnsavedChanges: false } );
		setIsSnackbarOpen( true );
	}, [ widgetsDisabled, widgetsRoleRestrictions ] );

	const deactivateAllUnusedWidgets = useCallback( () => {
		if ( ! usageWidgets.data ) {
			return;
		}
		const widgetsToDeactivate = widgets.filter( ( widget ) => {
			return ! usageWidgets.data.hasOwnProperty( widget.name ) || widgetsDisabled.includes( widget.name );
		} );
		setWidgetsDisabled( widgetsToDeactivate.map( ( widget ) => widget.name ) );
	}, [ widgets, usageWidgets.data, widgetsDisabled ] );

	const enableAllWidgets = useCallback( () => {
		setWidgetsDisabled( [] );
	}, [] );

	const toggleWidget = useCallback( ( widgetName, isEnabled ) => {
		if ( isEnabled ) {
			setWidgetsDisabled( ( prev ) => prev.filter( ( item ) => item !== widgetName ) );
		} else {
			setWidgetsDisabled( ( prev ) => [ ...prev, widgetName ] );
		}
	}, [] );

	const dismissNotice = useCallback( () => {
		if ( noticeData ) {
			markNoticeViewed( noticeData.notice_id, noticeData.nonce );
			setNoticeData( ( prev ) => ( { ...prev, is_viewed: true } ) );
		}
	}, [ noticeData ] );

	useEffect( () => {
		const loadData = async () => {
			const appData = await getAdminAppData();

			setNoticeData( appData.notice_data );
			setWidgetsDisabled( appData.disabled_elements );
			setWidgets( appData.widgets );
			setPromotionWidgets( appData.promotion_widgets );
			setPromotionData( appData.promotion_data );

			if ( appData.additional_data?.roles ) {
				setRoles( appData.additional_data.roles );
			}

			if ( appData.additional_data?.role_restrictions ) {
				setWidgetsRoleRestrictions( appData.additional_data.role_restrictions );
			}

			const pluginsData = appData.plugins.map( ( plugin ) => ( {
				label: plugin,
				value: plugin,
			} ) );

			pluginsData.unshift( {
				label: 'All Plugins',
				value: '',
			} );

			setPlugins( pluginsData );
			setIsLoading( false );
		};

		loadData();
	}, [] );

	useEffect( () => {
		if ( isLoading ) {
			return;
		}
		setChangeProgress( ( prev ) => ( { ...prev, isUnsavedChanges: true } ) );
	}, [ widgetsDisabled, widgetsRoleRestrictions, isLoading ] );

	useEffect( () => {
		const handleBeforeUnload = ( event ) => {
			event.preventDefault();
			event.returnValue = '';
		};

		if ( changeProgress.isUnsavedChanges ) {
			window.addEventListener( 'beforeunload', handleBeforeUnload );
		} else {
			window.removeEventListener( 'beforeunload', handleBeforeUnload );
		}

		return () => {
			window.removeEventListener( 'beforeunload', handleBeforeUnload );
		};
	}, [ changeProgress.isUnsavedChanges ] );

	return {
		isLoading,
		widgets,
		promotionWidgets,
		plugins,
		roles,
		widgetsDisabled,
		widgetsRoleRestrictions,
		setWidgetsRoleRestrictions,
		promotionData,
		noticeData,
		usageWidgets,
		changeProgress,
		isSnackbarOpen,
		setIsSnackbarOpen,
		getWidgetUsage,
		scanUsageElements,
		saveChanges,
		deactivateAllUnusedWidgets,
		enableAllWidgets,
		toggleWidget,
		dismissNotice,
	};
};

