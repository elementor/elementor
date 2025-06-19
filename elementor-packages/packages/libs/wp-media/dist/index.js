"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  getMediaAttachment: () => getMediaAttachment,
  useWpMediaAttachment: () => useWpMediaAttachment,
  useWpMediaFrame: () => useWpMediaFrame
});
module.exports = __toCommonJS(index_exports);

// src/hooks/use-wp-media-attachment.ts
var import_query = require("@elementor/query");

// src/errors.ts
var import_utils = require("@elementor/utils");
var WpMediaNotAvailableError = (0, import_utils.createError)({
  code: "wp_media_not_available",
  message: "`wp.media` is not available, make sure the `media-models` handle is set in the dependencies array"
});
var WpPluploadSettingsNotAvailableError = (0, import_utils.createError)({
  code: "wp_plupload_settings_not_available",
  message: "`_wpPluploadSettings` is not available, make sure a wp media uploader is open"
});

// src/media.ts
var wpMediaWindow = window;
var media_default = () => {
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
      humanReadable: filesizeHumanReadable
    },
    author: {
      id: parseInt(author),
      name: authorName
    }
  };
}

// src/get-media-attachment.ts
async function getMediaAttachment({ id }) {
  if (!id) {
    return null;
  }
  const model = media_default().attachment(id);
  const wpAttachment = model.toJSON();
  const isFetched = "url" in wpAttachment;
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
    queryKey: ["wp-attachment", id],
    queryFn: () => getMediaAttachment({ id }),
    enabled: !!id
  });
}

// src/hooks/use-wp-media-frame.ts
var import_react = require("react");

// src/wp-plupload-settings.ts
var wpPluploadSettingsWindow = window;
var wp_plupload_settings_default = () => {
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
    open
  };
}
function createFrame({ onSelect, multiple, mediaTypes, selected, title, mode = "browse" }) {
  const frame = media_default()({
    title,
    multiple,
    library: {
      type: getMimeTypes(mediaTypes)
    }
  }).on("open", () => {
    setTypeCaller(frame);
    applyMode(frame, mode);
    applySelection(frame, selected);
  }).on("close", () => cleanupFrame(frame)).on("insert select", () => select(frame, multiple, onSelect));
  handleExtensions(frame, mediaTypes);
  return frame;
}
function cleanupFrame(frame) {
  frame?.detach();
  frame?.remove();
}
function applyMode(frame, mode = "browse") {
  frame.content.mode(mode);
}
function applySelection(frame, selected) {
  const selectedAttachments = (typeof selected === "number" ? [selected] : selected)?.filter((id) => !!id).map((id) => media_default().attachment(id));
  frame.state().get("selection").set(selectedAttachments || []);
}
function select(frame, multiple, onSelect) {
  const attachments = frame.state().get("selection").toJSON().map(normalize);
  const onSelectFn = onSelect;
  onSelectFn(multiple ? attachments : attachments[0]);
}
function setTypeCaller(frame) {
  frame.uploader.uploader.param("uploadTypeCaller", "elementor-wp-media-upload");
}
function handleExtensions(frame, mediaTypes) {
  const defaultExtensions = wp_plupload_settings_default().defaults.filters.mime_types?.[0]?.extensions;
  frame.on("ready", () => {
    wp_plupload_settings_default().defaults.filters.mime_types = [{ extensions: getExtensions(mediaTypes) }];
  });
  frame.on("close", () => {
    wp_plupload_settings_default().defaults.filters.mime_types = defaultExtensions ? [{ extensions: defaultExtensions }] : [];
  });
}
var imageExtensions = ["avif", "bmp", "gif", "ico", "jpe", "jpeg", "jpg", "png", "webp"];
function getMimeTypes(mediaTypes) {
  const mimeTypesPerType = {
    image: imageExtensions.map((extension) => `image/${extension}`),
    svg: ["image/svg+xml"]
  };
  return mediaTypes.reduce((prev, currentType) => {
    return prev.concat(mimeTypesPerType[currentType]);
  }, []);
}
function getExtensions(mediaTypes) {
  const extensionsPerType = {
    image: imageExtensions,
    svg: ["svg"]
  };
  const extensions = mediaTypes.reduce((prev, currentType) => {
    return prev.concat(extensionsPerType[currentType]);
  }, []);
  return extensions.join(",");
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getMediaAttachment,
  useWpMediaAttachment,
  useWpMediaFrame
});
//# sourceMappingURL=index.js.map