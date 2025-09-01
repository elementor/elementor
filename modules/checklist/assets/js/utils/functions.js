import { STEP, STEPS_ROUTE, USER_PROGRESS_ROUTE } from './consts';

const { IS_MARKED_COMPLETED, IS_ABSOLUTE_COMPLETED, IS_IMMUTABLE_COMPLETED, PROMOTION_DATA } = STEP;

export function isStepChecked( step ) {
	return ! step[ PROMOTION_DATA ] && ( step[ IS_MARKED_COMPLETED ] || step[ IS_ABSOLUTE_COMPLETED ] || step[ IS_IMMUTABLE_COMPLETED ] );
}

export function toggleChecklistPopup() {
	$e.run( 'checklist/toggle-popup' );
}

export async function fetchSteps() {
	const response = await $e.data.get( STEPS_ROUTE, {}, { refresh: true } );

	return response?.data?.data || null;
}

export async function fetchUserProgress() {
	const response = await $e.data.get( USER_PROGRESS_ROUTE, {}, { refresh: true } );

	return response?.data?.data || null;
}

export async function updateStep( id, data ) {
	return await $e.data.update( STEPS_ROUTE, { id, ...data }, { id } );
}

export async function updateUserProgress( data ) {
	return await $e.data.update( USER_PROGRESS_ROUTE, data );
}

export function getAndUpdateStep( id, step, key, value ) {
	if ( step.config.id !== id ) {
		return step;
	}

	return { ...step, [ key ]: value };
}

export function addMixpanelTrackingChecklistSteps( name, action, element = 'button' ) {
	const documentMetaData = getDocumentMetaDataMixpanel();

	name = name.replace( /_/g, '' );

	const eventName = `checklist_steps_${ action }_${ name }`;

			return (
			elementorCommon.eventsManager.dispatchEvent(
				eventName,
				{
					location: elementorCommon.eventsManager.config.locations.elementorEditor,
					secondaryLocation: elementorCommon.eventsManager.config.secondaryLocations.checklistSteps,
					trigger: elementorCommon.eventsManager.config.triggers.click,
					...documentMetaData,
				},
			)
		);
}

export function addMixpanelTrackingChecklistHeader( name ) {
	const documentMetaData = getDocumentMetaDataMixpanel();

	return (
		elementorCommon.eventsManager.dispatchEvent(
			elementorCommon.eventsManager.config.names.elementorEditor.checklist[ name ],
			{
				location: elementorCommon.eventsManager.config.locations.elementorEditor,
				secondaryLocation: elementorCommon.eventsManager.config.secondaryLocations.checklistHeader,
				trigger: elementorCommon.eventsManager.config.triggers.click,
				...documentMetaData,
			},
		)
	);
}

export function addMixpanelTrackingChecklistTopBar( togglePopupState ) {
	const documentMetaData = getDocumentMetaDataMixpanel();
	const name = ! togglePopupState ? 'launchpadOn' : 'launchpadOff';

	return (
		elementorCommon.eventsManager.dispatchEvent(
			elementorCommon.eventsManager.config.names.topBar[ name ],
			{
				location: elementorCommon.eventsManager.config.locations.topBar,
				secondaryLocation: elementorCommon.eventsManager.config.secondaryLocations.launchpad,
				trigger: elementorCommon.eventsManager.config.triggers.toggleClick,
				...documentMetaData,
			},
		)
	);
}

export function dispatchChecklistOpenEvent() {
	const documentMetaData = getDocumentMetaDataMixpanel();

	return (
		elementorCommon.eventsManager.dispatchEvent(
			elementorCommon.eventsManager.config.names.elementorEditor.checklist.checklistFirstPopup,
			{
				location: elementorCommon.eventsManager.config.locations.elementorEditor,
				secondaryLocation: elementorCommon.eventsManager.config.secondaryLocations.launchpad,
				trigger: elementorCommon.eventsManager.config.triggers.editorLoaded,
				...documentMetaData,
			},
		)
	);
}

export function getDocumentMetaDataMixpanel() {
	const postId = elementor.getPreviewContainer().document.config.id;
	const postTitle = elementor.getPreviewContainer().model.attributes.settings.attributes.post_title;
	const postTypeTitle = elementor.getPreviewContainer().document.config.post_type_title;
	const documentType = elementor.getPreviewContainer().document.config.type;

	return {
		postId,
		postTitle,
		postTypeTitle,
		documentType,
	};
}
