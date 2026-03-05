'use strict';
const __defProp = Object.defineProperty;
const __getOwnPropDesc = Object.getOwnPropertyDescriptor;
const __getOwnPropNames = Object.getOwnPropertyNames;
const __hasOwnProp = Object.prototype.hasOwnProperty;
const __export = (target, all) => {
	for (const name in all) {
		__defProp(target, name, { get: all[name], enumerable: true });
	}
};
const __copyProps = (to, from, except, desc) => {
	if ((from && typeof from === 'object') || typeof from === 'function') {
		for (const key of __getOwnPropNames(from)) {
			if (!__hasOwnProp.call(to, key) && key !== except) {
				__defProp(to, key, {
					get: () => from[key],
					enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable,
				});
			}
		}
	}
	return to;
};
const __toCommonJS = (mod) => __copyProps(__defProp({}, '__esModule', { value: true }), mod);

// src/index.ts
const index_exports = {};
__export(index_exports, {
	getMediaAttachment: () => getMediaAttachment,
	useWpMediaAttachment: () => useWpMediaAttachment,
	useWpMediaFrame: () => useWpMediaFrame,
});
module.exports = __toCommonJS(index_exports);

// src/hooks/use-wp-media-attachment.ts
const import_query = require('@elementor/query');

// src/errors.ts
const import_utils = require('@elementor/utils');
const WpMediaNotAvailableError = (0, import_utils.createError)({
	code: 'wp_media_not_available',
	message: '`wp.media` is not available, make sure the `media-models` handle is set in the dependencies array',
});
const WpPluploadSettingsNotAvailableError = (0, import_utils.createError)({
	code: 'wp_plupload_settings_not_available',
	message: '`_wpPluploadSettings` is not available, make sure a wp media uploader is open',
});

// src/media.ts
const wpMediaWindow = window;
const media_default = () => {
	if (!wpMediaWindow.wp?.media) {
		throw new WpMediaNotAvailableError();
	}
	return wpMediaWindow.wp.media;
};

// src/normalize.ts
function normalize(attachment) {
	const { filesizeInBytes, filesizeHumanReadable, author, authorName, ...rest } = attachment;
	return {
		...rest,
		filesize: {
			inBytes: filesizeInBytes,
			humanReadable: filesizeHumanReadable,
		},
		author: {
			id: parseInt(author),
			name: authorName,
		},
	};
}

// src/get-media-attachment.ts
async function getMediaAttachment({ id }) {
	if (!id) {
		return null;
	}
	const model = media_default().attachment(id);
	const wpAttachment = model.toJSON();
	const isFetched = 'url' in wpAttachment;
	if (isFetched) {
		return normalize(wpAttachment);
	}
	try {
		return normalize(await model.fetch());
	} catch {
		return null;
	}
}

// src/hooks/use-wp-media-attachment.ts
function useWpMediaAttachment(id) {
	return (0, import_query.useQuery)({
		queryKey: ['wp-attachment', id],
		queryFn: () => getMediaAttachment({ id }),
		enabled: !!id,
	});
}

// src/hooks/use-wp-media-frame.ts
const import_react = require('react');

// src/wp-plupload-settings.ts
const wpPluploadSettingsWindow = window;
const wp_plupload_settings_default = () => {
	if (!wpPluploadSettingsWindow._wpPluploadSettings) {
		throw new WpPluploadSettingsNotAvailableError();
	}
	return wpPluploadSettingsWindow._wpPluploadSettings;
};

// src/hooks/use-wp-media-frame.ts
function useWpMediaFrame(options) {
	const frame = (0, import_react.useRef)();
	const open = (openOptions = {}) => {
		cleanupFrame(frame.current);
		frame.current = createFrame({ ...options, ...openOptions });
		frame.current?.open();
	};
	(0, import_react.useEffect)(() => {
		return () => {
			cleanupFrame(frame.current);
		};
	}, []);
	return {
		open,
	};
}
function createFrame({ onSelect, multiple, mediaTypes, selected, title, mode = 'browse' }) {
	const frame = media_default()({
		title,
		multiple,
		library: {
			type: getMimeTypes(mediaTypes),
		},
	})
		.on('open', () => {
			setTypeCaller(frame);
			applyMode(frame, mode);
			applySelection(frame, selected);
		})
		.on('close', () => cleanupFrame(frame))
		.on('insert select', () => select(frame, multiple, onSelect));
	handleExtensions(frame, mediaTypes);
	return frame;
}
function cleanupFrame(frame) {
	frame?.detach();
	frame?.remove();
}
function applyMode(frame, mode = 'browse') {
	frame.content.mode(mode);
}
function applySelection(frame, selected) {
	const selectedAttachments = (typeof selected === 'number' ? [selected] : selected)
		?.filter((id) => !!id)
		.map((id) => media_default().attachment(id));
	frame
		.state()
		.get('selection')
		.set(selectedAttachments || []);
}
function select(frame, multiple, onSelect) {
	const attachments = frame.state().get('selection').toJSON().map(normalize);
	const onSelectFn = onSelect;
	onSelectFn(multiple ? attachments : attachments[0]);
}
function setTypeCaller(frame) {
	frame.uploader.uploader.param('uploadTypeCaller', 'elementor-wp-media-upload');
}
function handleExtensions(frame, mediaTypes) {
	const defaultExtensions = wp_plupload_settings_default().defaults.filters.mime_types?.[0]?.extensions;
	frame.on('ready', () => {
		wp_plupload_settings_default().defaults.filters.mime_types = [{ extensions: getExtensions(mediaTypes) }];
	});
	frame.on('close', () => {
		wp_plupload_settings_default().defaults.filters.mime_types = defaultExtensions
			? [{ extensions: defaultExtensions }]
			: [];
	});
}
const imageExtensions = ['avif', 'bmp', 'gif', 'ico', 'jpe', 'jpeg', 'jpg', 'png', 'webp'];
const videoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'm4v', 'avi', 'wmv', 'mpg', 'mpeg', '3gp', '3g2'];
function getMimeTypes(mediaTypes) {
	const mimeTypesPerType = {
		image: imageExtensions.map((extension) => `image/${extension}`),
		svg: ['image/svg+xml'],
		video: [
			'video/mp4',
			'video/webm',
			'video/ogg',
			'video/quicktime',
			'video/x-m4v',
			'video/avi',
			'video/x-ms-wmv',
			'video/mpeg',
			'video/3gpp',
			'video/3gpp2',
		],
	};
	return mediaTypes.reduce((prev, currentType) => {
		return prev.concat(mimeTypesPerType[currentType]);
	}, []);
}
function getExtensions(mediaTypes) {
	const extensionsPerType = {
		image: imageExtensions,
		svg: ['svg'],
		video: videoExtensions,
	};
	const extensions = mediaTypes.reduce((prev, currentType) => {
		return prev.concat(extensionsPerType[currentType]);
	}, []);
	return extensions.join(',');
}
// Annotate the CommonJS export names for ESM import in node:
0 &&
	(module.exports = {
		getMediaAttachment,
		useWpMediaAttachment,
		useWpMediaFrame,
	});
//# sourceMappingURL=index.js.map
