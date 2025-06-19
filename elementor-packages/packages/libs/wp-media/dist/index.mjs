// src/hooks/use-wp-media-attachment.ts
import { useQuery } from "@elementor/query";

// src/errors.ts
import { createError } from "@elementor/utils";
var WpMediaNotAvailableError = createError({
  code: "wp_media_not_available",
  message: "`wp.media` is not available, make sure the `media-models` handle is set in the dependencies array"
});
var WpPluploadSettingsNotAvailableError = createError({
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
  return useQuery({
    queryKey: ["wp-attachment", id],
    queryFn: () => getMediaAttachment({ id }),
    enabled: !!id
  });
}

// src/hooks/use-wp-media-frame.ts
import { useEffect, useRef } from "react";

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
  const frame = useRef();
  const open = (openOptions = {}) => {
    cleanupFrame(frame.current);
    frame.current = createFrame({ ...options, ...openOptions });
    frame.current?.open();
  };
  useEffect(() => {
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
export {
  getMediaAttachment,
  useWpMediaAttachment,
  useWpMediaFrame
};
//# sourceMappingURL=index.mjs.map