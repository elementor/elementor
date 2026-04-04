export class ClearDynamicTagsCache extends $e.modules.hookUI.Before {
	getCommand() {
		return 'editor/documents/open';
	}

	getId() {
		return 'clear-dynamic-tags-cache-on-document-open';
	}

	apply() {
		elementor.dynamicTags.cleanCache();
	}
}

export default ClearDynamicTagsCache;
