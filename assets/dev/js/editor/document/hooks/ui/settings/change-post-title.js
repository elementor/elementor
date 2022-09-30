import After from 'elementor-api/modules/hooks/ui/after';

export class ChangePostTitle extends After {
	getCommand() {
		return 'document/elements/settings';
	}

	getId() {
		return 'change-post-title';
	}

	getContainerType() {
		return 'document';
	}

	getConditions( args ) {
		return undefined !== args.settings.post_title;
	}

	apply( args ) {
		const $title = elementorFrontend.elements.$document.find( elementor.config.page_title_selector );

		$title.text( args.settings.post_title );
	}
}

export default ChangePostTitle;
