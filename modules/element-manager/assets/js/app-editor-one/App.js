import { useState, useCallback } from 'react';
import { Stack, Box, CircularProgress, Snackbar, Typography, Link } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useElementManager, useWidgetFilters } from './hooks';
import {
	NoticeAlert,
	ConfirmDialog,
	SearchFilters,
	WidgetsTable,
	PromotionWidgetsTable,
} from './components';

export const App = () => {
	const [ isConfirmDialogOpen, setIsConfirmDialogOpen ] = useState( false );

	const {
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
	} = useElementManager();

	const {
		searchKeyword,
		setSearchKeyword,
		filterByPlugin,
		setFilterByPlugin,
		filterByStatus,
		setFilterByStatus,
		sortedAndFilteredWidgets,
		getSortingIndicatorClasses,
		onSortingClicked,
		setSortByUsage,
	} = useWidgetFilters( widgets, widgetsDisabled, getWidgetUsage );

	const handleScanUsage = useCallback( async () => {
		await scanUsageElements();
		setSortByUsage();
	}, [ scanUsageElements, setSortByUsage ] );

	const handleSaveClick = useCallback( async () => {
		setIsConfirmDialogOpen( false );
		await saveChanges();
	}, [ saveChanges ] );

	if ( isLoading ) {
		return (
			<Stack justifyContent="center" sx={ { margin: 12 } }>
				<CircularProgress size={ 80 } />
			</Stack>
		);
	}

	return (
		<>
			<Typography
				variant="body2"
				color="text.secondary"
				sx={ { marginBlockEnd: 2.5, maxWidth: 800 } }
			>
				{ __( 'Here\'s where you can fine-tune Elementor to your workflow. Disable elements you don\'t use for a cleaner interface, more focused creative experience, and improved performance.', 'elementor' ) }
				{ ' ' }
				<Link
					href="https://go.elementor.com/wp-dash-element-manager/"
					rel="noreferrer"
					target="_blank"
					color="info.light"
				>
					{ __( 'Learn More', 'elementor' ) }
				</Link>
			</Typography>

			{ noticeData && ! noticeData.is_viewed && (
				<NoticeAlert onDismiss={ dismissNotice } />
			) }

			<Box>
				<SearchFilters
					searchKeyword={ searchKeyword }
					onSearchChange={ setSearchKeyword }
					filterByPlugin={ filterByPlugin }
					onPluginFilterChange={ setFilterByPlugin }
					filterByStatus={ filterByStatus }
					onStatusFilterChange={ setFilterByStatus }
					plugins={ plugins }
					usageIsLoading={ usageWidgets.isLoading }
					usageData={ usageWidgets.data }
					widgetsDisabledCount={ widgetsDisabled.length }
					onScanUsage={ handleScanUsage }
					onDeactivateUnused={ deactivateAllUnusedWidgets }
					onEnableAll={ enableAllWidgets }
					onSaveChanges={ () => setIsConfirmDialogOpen( true ) }
					isSaving={ changeProgress.isSaving }
					hasUnsavedChanges={ changeProgress.isUnsavedChanges }
				/>

				<Box>
					<WidgetsTable
						widgets={ sortedAndFilteredWidgets }
						widgetsDisabled={ widgetsDisabled }
						widgetsRoleRestrictions={ widgetsRoleRestrictions }
						setWidgetsRoleRestrictions={ setWidgetsRoleRestrictions }
						roles={ roles }
						promotionWidgets={ promotionWidgets }
						promotionData={ promotionData }
						usageWidgets={ usageWidgets }
						getWidgetUsage={ getWidgetUsage }
						onScanUsage={ handleScanUsage }
						onToggleWidget={ toggleWidget }
						getSortingIndicatorClasses={ getSortingIndicatorClasses }
						onSortingClicked={ onSortingClicked }
					/>
				</Box>

				<PromotionWidgetsTable
					widgets={ promotionWidgets }
					promotionData={ promotionData }
				/>
			</Box>

			<ConfirmDialog
				isOpen={ isConfirmDialogOpen }
				onClose={ () => setIsConfirmDialogOpen( false ) }
				onConfirm={ handleSaveClick }
			/>

			<Snackbar
				open={ isSnackbarOpen }
				autoHideDuration={ 6000 }
				onClose={ () => setIsSnackbarOpen( false ) }
				message={ __( 'We saved your changes.', 'elementor' ) }
				anchorOrigin={ {
					vertical: 'bottom',
					horizontal: 'center',
				} }
			/>
		</>
	);
};

