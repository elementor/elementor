"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  extendIconsMap: () => extendIconsMap,
  init: () => init
});
module.exports = __toCommonJS(index_exports);

// src/icons-map.ts
var import_icons = require("@elementor/icons");
var initialIconsMap = {
  page: import_icons.PageTemplateIcon,
  section: import_icons.SectionTemplateIcon,
  container: import_icons.ContainerTemplateIcon,
  "wp-page": import_icons.PageTypeIcon,
  "wp-post": import_icons.PostTypeIcon
};
var iconsMap = { ...initialIconsMap };
function extendIconsMap(additionalIcons) {
  Object.assign(iconsMap, additionalIcons);
}
function getIconsMap() {
  return iconsMap;
}

// src/init.ts
var import_editor_app_bar = require("@elementor/editor-app-bar");
var import_editor_panels3 = require("@elementor/editor-panels");

// src/components/panel/panel.ts
var import_editor_panels2 = require("@elementor/editor-panels");

// src/components/panel/shell.tsx
var React20 = __toESM(require("react"));
var import_react6 = require("react");
var import_editor_panels = require("@elementor/editor-panels");
var import_i18n13 = require("@wordpress/i18n");

// src/contexts/post-list-context.tsx
var React = __toESM(require("react"));
var import_react = require("react");
var defaultValues = {
  type: "page",
  editMode: { mode: "none", details: {} },
  setEditMode: () => null,
  resetEditMode: () => null,
  setError: () => null
};
var PostListContext = (0, import_react.createContext)(defaultValues);
var PostListContextProvider = ({
  type,
  setError,
  children
}) => {
  const [editMode, setEditMode] = (0, import_react.useState)(defaultValues.editMode);
  const resetEditMode = () => {
    setEditMode(defaultValues.editMode);
  };
  return /* @__PURE__ */ React.createElement(
    PostListContext.Provider,
    {
      value: {
        type,
        editMode,
        setEditMode,
        resetEditMode,
        setError
      }
    },
    children
  );
};
function usePostListContext() {
  const context = (0, import_react.useContext)(PostListContext);
  if (!context) {
    throw new Error("The `usePostListContext()` hook must be used within an `<PostListContextProvider />`");
  }
  return context;
}

// src/components/panel/error-snackbar.tsx
var React2 = __toESM(require("react"));
var import_ui = require("@elementor/ui");
var ErrorSnackbar = ({ open, onClose }) => {
  return /* @__PURE__ */ React2.createElement(
    import_ui.Snackbar,
    {
      open,
      onClose,
      anchorOrigin: {
        vertical: "bottom",
        horizontal: "left"
      }
    },
    /* @__PURE__ */ React2.createElement(import_ui.Alert, { onClose, severity: "error", sx: { width: "100%" } }, /* @__PURE__ */ React2.createElement(
      import_ui.Typography,
      {
        component: "span",
        sx: {
          fontWeight: "bold"
        }
      },
      "We couldn\u2019t complete the action."
    ), " ", "Please try again")
  );
};
var error_snackbar_default = ErrorSnackbar;

// src/components/panel/posts-list/posts-collapsible-list.tsx
var React19 = __toESM(require("react"));
var import_icons12 = require("@elementor/icons");
var import_ui11 = require("@elementor/ui");

// src/api/post.ts
var import_api_fetch = __toESM(require("@wordpress/api-fetch"));
var import_i18n = require("@wordpress/i18n");
var postTypesMap = {
  page: {
    labels: {
      singular_name: (0, import_i18n.__)("Page", "elementor"),
      plural_name: (0, import_i18n.__)("Pages", "elementor")
    },
    rest_base: "pages"
  }
};
var POST_PER_PAGE = 10;
var getRequest = async (postTypeSlug, page) => {
  const baseUri = `/wp/v2/${postTypesMap[postTypeSlug].rest_base}`;
  const keys = ["id", "type", "title", "link", "status", "user_can"];
  const queryParams = new URLSearchParams({
    status: "any",
    order: "asc",
    page: page.toString(),
    per_page: POST_PER_PAGE.toString(),
    _fields: keys.join(",")
  });
  const uri = baseUri + "?" + queryParams.toString();
  const result = await (0, import_api_fetch.default)({ path: uri, parse: false });
  const data = await result.json();
  const totalPages = Number(result.headers.get("x-wp-totalpages"));
  const totalPosts = Number(result.headers.get("x-wp-total"));
  return {
    data,
    totalPages,
    totalPosts,
    currentPage: page
  };
};
var createRequest = (postTypeSlug, newPost) => {
  const path = `/wp/v2/${postTypesMap[postTypeSlug].rest_base}`;
  return (0, import_api_fetch.default)({
    path,
    method: "POST",
    data: newPost
  });
};
var updateRequest = (postTypeSlug, updatedPost) => {
  const path = `/wp/v2/${postTypesMap[postTypeSlug].rest_base}`;
  const { id, ...data } = updatedPost;
  return (0, import_api_fetch.default)({
    path: `${path}/${id}`,
    method: "POST",
    data
  });
};
var deleteRequest = (postTypeSlug, postId) => {
  const path = `/wp/v2/${postTypesMap[postTypeSlug].rest_base}`;
  return (0, import_api_fetch.default)({
    path: `${path}/${postId}`,
    method: "DELETE"
  });
};
var duplicateRequest = (originalPost) => {
  const path = `/elementor/v1/site-navigation/duplicate-post`;
  return (0, import_api_fetch.default)({
    path,
    method: "POST",
    data: {
      post_id: originalPost.id,
      title: originalPost.title
    }
  });
};

// src/hooks/use-homepage.ts
var import_query = require("@elementor/query");

// src/api/settings.ts
var import_api_fetch2 = __toESM(require("@wordpress/api-fetch"));
var getSettings = () => {
  const baseUri = "/elementor/v1/site-navigation/homepage";
  const uri = baseUri;
  return (0, import_api_fetch2.default)({ path: uri });
};
var updateSettings = (settings) => {
  return (0, import_api_fetch2.default)({
    path: "/wp/v2/settings",
    method: "POST",
    data: settings
  });
};

// src/hooks/use-homepage.ts
var settingsQueryKey = () => ["site-navigation", "homepage"];
function useHomepage() {
  return (0, import_query.useQuery)({
    queryKey: settingsQueryKey(),
    queryFn: () => getSettings()
  });
}

// src/hooks/use-posts.ts
var import_query2 = require("@elementor/query");
var postsQueryKey = (postTypeSlug) => ["site-navigation", "posts", postTypeSlug];
var flattenData = (data) => {
  if (!data) {
    return data;
  }
  const flattened = [];
  data.pages.forEach((page) => {
    flattened.push(...page.data);
  });
  return flattened;
};
function usePosts(postTypeSlug) {
  const query = (0, import_query2.useInfiniteQuery)({
    queryKey: postsQueryKey(postTypeSlug),
    queryFn: ({ pageParam = 1 }) => getRequest(postTypeSlug, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.currentPage < lastPage.totalPages ? lastPage.currentPage + 1 : void 0;
    }
  });
  return { ...query, data: { posts: flattenData(query.data), total: query.data?.pages[0]?.totalPosts ?? 0 } };
}

// src/components/panel/add-new-button.tsx
var React3 = __toESM(require("react"));
var import_icons2 = require("@elementor/icons");
var import_ui2 = require("@elementor/ui");
var import_i18n2 = require("@wordpress/i18n");

// src/hooks/use-user.ts
var import_query3 = require("@elementor/query");

// src/api/user.ts
var import_api_fetch3 = __toESM(require("@wordpress/api-fetch"));
var getUser = () => {
  const baseUri = "/wp/v2/users/me";
  const keys = ["capabilities"];
  const queryParams = new URLSearchParams({
    _fields: keys.join(","),
    context: "edit"
  });
  const uri = baseUri + "?" + queryParams.toString();
  return (0, import_api_fetch3.default)({ path: uri });
};

// src/hooks/use-user.ts
var userQueryKey = () => ["site-navigation", "user"];
function useUser() {
  return (0, import_query3.useQuery)({
    queryKey: userQueryKey(),
    queryFn: () => getUser()
  });
}

// src/components/panel/add-new-button.tsx
function AddNewButton() {
  const { setEditMode } = usePostListContext();
  const { data: user } = useUser();
  return /* @__PURE__ */ React3.createElement(
    import_ui2.Button,
    {
      size: "small",
      startIcon: /* @__PURE__ */ React3.createElement(import_icons2.PlusIcon, null),
      disabled: !user?.capabilities?.edit_pages,
      onClick: () => {
        setEditMode({ mode: "create", details: {} });
      },
      sx: {
        px: 1.5
      }
    },
    (0, import_i18n2.__)("Add New", "elementor")
  );
}

// src/components/panel/posts-list/collapsible-list.tsx
var React4 = __toESM(require("react"));
var import_react2 = require("react");
var import_icons3 = require("@elementor/icons");
var import_ui3 = require("@elementor/ui");
var RotateIcon = (0, import_ui3.styled)(import_icons3.ChevronDownIcon, {
  shouldForwardProp: (prop) => prop !== "isOpen"
})(({ theme, isOpen }) => ({
  transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.standard
  })
}));
var StyledListItemIcon = (0, import_ui3.styled)(import_ui3.ListItemIcon)(({ theme }) => ({
  minWidth: theme.spacing(4)
}));
function CollapsibleList({
  label,
  Icon,
  isOpenByDefault = false,
  children
}) {
  const [isOpen, setIsOpen] = (0, import_react2.useState)(isOpenByDefault);
  return /* @__PURE__ */ React4.createElement(React4.Fragment, null, /* @__PURE__ */ React4.createElement(import_ui3.ListItem, null, /* @__PURE__ */ React4.createElement(
    StyledListItemIcon,
    {
      sx: {
        color: "text.secondary"
      }
    },
    /* @__PURE__ */ React4.createElement(
      import_ui3.IconButton,
      {
        onClick: () => setIsOpen((prev) => !prev),
        size: "small",
        sx: {
          color: "inherit"
        }
      },
      /* @__PURE__ */ React4.createElement(RotateIcon, { fontSize: "small", isOpen })
    )
  ), /* @__PURE__ */ React4.createElement(
    StyledListItemIcon,
    {
      size: "small",
      sx: {
        color: "inherit"
      }
    },
    /* @__PURE__ */ React4.createElement(Icon, { fontSize: "small" })
  ), /* @__PURE__ */ React4.createElement(
    import_ui3.ListItemText,
    {
      primaryTypographyProps: { variant: "subtitle2", component: "span" },
      primary: label
    }
  )), /* @__PURE__ */ React4.createElement(import_ui3.Collapse, { in: isOpen, timeout: "auto", unmountOnExit: true }, /* @__PURE__ */ React4.createElement(import_ui3.List, { dense: true }, children)), /* @__PURE__ */ React4.createElement(import_ui3.Divider, { sx: { mt: 1 } }));
}

// src/components/panel/posts-list/error-state.tsx
var React5 = __toESM(require("react"));
var import_icons4 = require("@elementor/icons");
var import_ui4 = require("@elementor/ui");
var import_i18n3 = require("@wordpress/i18n");
function ErrorState() {
  return /* @__PURE__ */ React5.createElement(
    import_ui4.Box,
    {
      sx: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        pt: "40px",
        gap: "16px"
      }
    },
    /* @__PURE__ */ React5.createElement(import_icons4.Error404TemplateIcon, null),
    /* @__PURE__ */ React5.createElement(
      import_ui4.Box,
      {
        sx: {
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: "8px"
        }
      },
      /* @__PURE__ */ React5.createElement(import_ui4.Typography, { variant: "body1", color: "text.primary" }, (0, import_i18n3.__)("We couldn\u2019t display your pages.", "elementor")),
      /* @__PURE__ */ React5.createElement(import_ui4.Box, null, /* @__PURE__ */ React5.createElement(import_ui4.Typography, { variant: "body2", color: "text.primary", sx: { textAlign: "center" } }, (0, import_i18n3.__)("It\u2019s probably a temporary issue.", "elementor")), /* @__PURE__ */ React5.createElement(import_ui4.Typography, { variant: "body2", color: "text.primary", sx: { textAlign: "center" } }, (0, import_i18n3.__)("If the problem persists,", "elementor"), " ", /* @__PURE__ */ React5.createElement(import_ui4.Link, { target: "_blank", href: "https://go.elementor.com/wp-editor-support-open-ticket/" }, "Notify support")))
    )
  );
}

// src/components/panel/posts-list/post-list-item.tsx
var React18 = __toESM(require("react"));

// src/components/panel/posts-list/list-items/list-item-create.tsx
var React7 = __toESM(require("react"));
var import_editor_documents = require("@elementor/editor-documents");
var import_i18n5 = require("@wordpress/i18n");

// src/hooks/use-posts-actions.ts
var import_query5 = require("@elementor/query");

// src/hooks/use-recent-posts.ts
var import_query4 = require("@elementor/query");

// src/api/recent-posts.ts
var import_api_fetch4 = __toESM(require("@wordpress/api-fetch"));
var baseUrl = "/elementor/v1/site-navigation/recent-posts";
var NUMBER_OF_RECENT_POSTS = 6;
var getRequest2 = () => {
  const queryParams = new URLSearchParams({
    posts_per_page: `${NUMBER_OF_RECENT_POSTS}`
  });
  const path = `${baseUrl}?${queryParams.toString()}`;
  return (0, import_api_fetch4.default)({ path });
};

// src/hooks/use-recent-posts.ts
var recentPostsQueryKey = ["site-navigation", "recent-posts"];
function useRecentPosts() {
  return (0, import_query4.useQuery)({
    queryKey: recentPostsQueryKey,
    queryFn: () => getRequest2()
  });
}

// src/hooks/use-posts-actions.ts
function usePostActions(postTypeSlug) {
  const invalidatePosts = useInvalidatePosts(postTypeSlug);
  const onSuccess = () => invalidatePosts({ exact: true });
  const createPost = (0, import_query5.useMutation)({
    mutationFn: (newPost) => createRequest(postTypeSlug, newPost),
    onSuccess
  });
  const updatePost = (0, import_query5.useMutation)({
    mutationFn: (updatedPost) => updateRequest(postTypeSlug, updatedPost),
    onSuccess
  });
  const deletePost = (0, import_query5.useMutation)({
    mutationFn: (postId) => deleteRequest(postTypeSlug, postId),
    onSuccess
  });
  const duplicatePost = (0, import_query5.useMutation)({
    mutationFn: (originalPost) => duplicateRequest(originalPost),
    onSuccess
  });
  return {
    createPost,
    updatePost,
    deletePost,
    duplicatePost
  };
}
function useInvalidatePosts(postTypeSlug) {
  const queryClient = (0, import_query5.useQueryClient)();
  return (options = {}) => {
    const queryKey = postsQueryKey(postTypeSlug);
    queryClient.invalidateQueries({ queryKey: recentPostsQueryKey }, options);
    return queryClient.invalidateQueries({ queryKey }, options);
  };
}

// src/components/panel/posts-list/list-items/edit-mode-template.tsx
var React6 = __toESM(require("react"));
var import_react3 = require("react");
var import_icons5 = require("@elementor/icons");
var import_ui5 = require("@elementor/ui");
var import_i18n4 = require("@wordpress/i18n");
function EditModeTemplate({ postTitle, isLoading, callback }) {
  const [title, setTitle] = (0, import_react3.useState)(postTitle);
  const [touched, setTouched] = (0, import_react3.useState)(false);
  const [inputError, setInputError] = (0, import_react3.useState)(null);
  const closeButton = (0, import_react3.useRef)();
  const onBlur = (e) => {
    if (closeButton.current === e.relatedTarget) {
      return;
    }
    runCallback();
  };
  const onFormSubmit = (e) => {
    e.preventDefault();
    runCallback();
  };
  const validateInput = (input) => {
    return input.trim() !== "";
  };
  const runCallback = () => {
    if (!validateInput(title)) {
      return;
    }
    callback(title);
  };
  const onChange = (e) => {
    if (!touched) {
      setTouched(true);
    }
    const value = e.target.value;
    if (!validateInput(value)) {
      setInputError((0, import_i18n4.__)("Name is required", "elementor"));
    } else {
      setInputError(null);
    }
    setTitle(value);
  };
  return /* @__PURE__ */ React6.createElement(React6.Fragment, null, /* @__PURE__ */ React6.createElement(import_ui5.ListItem, { secondaryAction: /* @__PURE__ */ React6.createElement(CloseButton, { isLoading, closeButton }) }, /* @__PURE__ */ React6.createElement(import_ui5.Box, { width: "100%", component: "form", onSubmit: onFormSubmit }, /* @__PURE__ */ React6.createElement(
    import_ui5.TextField,
    {
      autoFocus: true,
      fullWidth: true,
      value: title,
      onChange,
      disabled: isLoading,
      error: !!inputError,
      onBlur,
      variant: "outlined",
      color: "secondary",
      size: "small"
    }
  ))), inputError && /* @__PURE__ */ React6.createElement(import_ui5.ListItem, null, /* @__PURE__ */ React6.createElement(import_ui5.ListItemText, { sx: { color: "error.main" } }, inputError)));
}
function CloseButton({ isLoading, closeButton }) {
  const { resetEditMode } = usePostListContext();
  return /* @__PURE__ */ React6.createElement(import_ui5.IconButton, { size: "small", color: "secondary", onClick: resetEditMode, ref: closeButton, disabled: isLoading }, isLoading ? /* @__PURE__ */ React6.createElement(import_ui5.CircularProgress, null) : /* @__PURE__ */ React6.createElement(import_icons5.XIcon, { fontSize: "small" }));
}

// src/components/panel/posts-list/list-items/list-item-create.tsx
function ListItemCreate() {
  const { type, resetEditMode } = usePostListContext();
  const { createPost } = usePostActions(type);
  const navigateToDocument = (0, import_editor_documents.__useNavigateToDocument)();
  const { setError } = usePostListContext();
  const createPostCallback = async (inputValue) => {
    try {
      const { id } = await createPost.mutateAsync({
        title: inputValue,
        status: "draft"
      });
      navigateToDocument(id);
    } catch {
      setError();
    } finally {
      resetEditMode();
    }
  };
  return /* @__PURE__ */ React7.createElement(
    EditModeTemplate,
    {
      postTitle: (0, import_i18n5.__)("New Page", "elementor"),
      isLoading: createPost.isPending,
      callback: createPostCallback
    }
  );
}

// src/components/panel/posts-list/list-items/list-item-duplicate.tsx
var React8 = __toESM(require("react"));
var import_editor_documents2 = require("@elementor/editor-documents");
var import_i18n6 = require("@wordpress/i18n");
function ListItemDuplicate() {
  const { type, editMode, resetEditMode } = usePostListContext();
  const navigateToDocument = (0, import_editor_documents2.__useNavigateToDocument)();
  const { duplicatePost } = usePostActions(type);
  const { setError } = usePostListContext();
  if ("duplicate" !== editMode.mode) {
    return null;
  }
  const duplicatePostCallback = async (inputValue) => {
    try {
      const { post_id: postId } = await duplicatePost.mutateAsync({
        id: editMode.details.postId,
        title: inputValue
      });
      navigateToDocument(postId);
    } catch {
      setError();
    } finally {
      resetEditMode();
    }
  };
  return /* @__PURE__ */ React8.createElement(
    EditModeTemplate,
    {
      postTitle: `${editMode.details.title} ${(0, import_i18n6.__)("copy", "elementor")}`,
      isLoading: duplicatePost.isPending,
      callback: duplicatePostCallback
    }
  );
}

// src/components/panel/posts-list/list-items/list-item-rename.tsx
var React9 = __toESM(require("react"));
var import_editor_documents3 = require("@elementor/editor-documents");

// src/hooks/use-rename-active-document.ts
var import_editor_v1_adapters = require("@elementor/editor-v1-adapters");
function getV1DocumentsManager() {
  const documentsManager = window.elementor?.documents;
  if (!documentsManager) {
    throw new Error("Elementor Editor V1 documents manager not found");
  }
  return documentsManager;
}
function useRenameActiveDocument() {
  return async (title) => {
    const currentDocument = getV1DocumentsManager().getCurrent();
    const container = currentDocument.container;
    await (0, import_editor_v1_adapters.__privateRunCommand)("document/elements/settings", {
      container,
      settings: { post_title: title }
    });
  };
}

// src/components/panel/posts-list/list-items/list-item-rename.tsx
function ListItemRename({ post }) {
  const { type, resetEditMode } = usePostListContext();
  const { updatePost } = usePostActions(type);
  const { setError } = usePostListContext();
  const activeDocument = (0, import_editor_documents3.__useActiveDocument)();
  const rename = useRenameActiveDocument();
  const isActive = activeDocument?.id === post.id;
  const title = isActive ? activeDocument?.title : post.title.rendered;
  const renamePostCallback = async (inputValue) => {
    if (inputValue === title) {
      resetEditMode();
    }
    try {
      if (isActive) {
        await rename(inputValue);
      } else {
        await updatePost.mutateAsync({
          id: post.id,
          title: inputValue
        });
      }
    } catch {
      setError();
    } finally {
      resetEditMode();
    }
  };
  return /* @__PURE__ */ React9.createElement(EditModeTemplate, { postTitle: title, isLoading: updatePost.isPending, callback: renamePostCallback });
}

// src/components/panel/posts-list/list-items/list-item-view.tsx
var React17 = __toESM(require("react"));
var import_editor_documents5 = require("@elementor/editor-documents");
var import_icons11 = require("@elementor/icons");
var import_ui10 = require("@elementor/ui");
var import_i18n12 = require("@wordpress/i18n");

// src/components/shared/page-title-and-status.tsx
var React10 = __toESM(require("react"));
var import_ui6 = require("@elementor/ui");

// src/hooks/use-reverse-html-entities.ts
var import_react4 = require("react");
function useReverseHtmlEntities(escapedHTML = "") {
  return (0, import_react4.useMemo)(() => {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = escapedHTML;
    const { value } = textarea;
    textarea.remove();
    return value;
  }, [escapedHTML]);
}

// src/components/shared/page-title-and-status.tsx
var PageStatus = ({ status }) => {
  if ("publish" === status) {
    return null;
  }
  return /* @__PURE__ */ React10.createElement(
    import_ui6.Typography,
    {
      component: "span",
      variant: "body2",
      color: "text.secondary",
      sx: {
        textTransform: "capitalize",
        fontStyle: "italic",
        whiteSpace: "nowrap",
        flexBasis: "content"
      }
    },
    "(",
    status,
    ")"
  );
};
var PageTitle = ({ title }) => {
  const modifiedTitle = useReverseHtmlEntities(title);
  return /* @__PURE__ */ React10.createElement(
    import_ui6.Typography,
    {
      component: "span",
      variant: "body2",
      color: "text.secondary",
      noWrap: true,
      sx: {
        flexBasis: "auto"
      }
    },
    modifiedTitle
  );
};
function PageTitleAndStatus({ title, status }) {
  return /* @__PURE__ */ React10.createElement(import_ui6.Box, { display: "flex" }, /* @__PURE__ */ React10.createElement(PageTitle, { title }), "\xA0", /* @__PURE__ */ React10.createElement(PageStatus, { status }));
}

// src/components/panel/actions-menu/actions/delete.tsx
var React12 = __toESM(require("react"));
var import_react5 = require("react");
var import_editor_documents4 = require("@elementor/editor-documents");
var import_icons6 = require("@elementor/icons");
var import_ui8 = require("@elementor/ui");
var import_i18n7 = require("@wordpress/i18n");

// src/components/panel/actions-menu/action-menu-item.tsx
var React11 = __toESM(require("react"));
var import_ui7 = require("@elementor/ui");
function ActionMenuItem({ title, icon: Icon, MenuItemProps }) {
  return /* @__PURE__ */ React11.createElement(import_ui7.MenuItem, { ...MenuItemProps }, /* @__PURE__ */ React11.createElement(
    import_ui7.ListItemIcon,
    {
      sx: {
        color: "inherit"
      }
    },
    /* @__PURE__ */ React11.createElement(Icon, null)
  ), /* @__PURE__ */ React11.createElement(import_ui7.ListItemText, { primary: title }));
}

// src/components/panel/actions-menu/actions/delete.tsx
function Delete({ post }) {
  const [isDialogOpen, setIsDialogOpen] = (0, import_react5.useState)(false);
  const activeDocument = (0, import_editor_documents4.__useActiveDocument)();
  const isPostActive = activeDocument?.id === post.id;
  const userCanDelete = post.user_can.delete;
  const isDisabled = !userCanDelete || post.isHome || isPostActive;
  return /* @__PURE__ */ React12.createElement(React12.Fragment, null, /* @__PURE__ */ React12.createElement(
    ActionMenuItem,
    {
      title: (0, import_i18n7.__)("Delete", "elementor"),
      icon: import_icons6.TrashIcon,
      MenuItemProps: {
        disabled: isDisabled,
        onClick: () => setIsDialogOpen(true),
        sx: { "&:hover": { color: "error.main" } }
      }
    }
  ), isDialogOpen && /* @__PURE__ */ React12.createElement(DeleteDialog, { post, setIsDialogOpen }));
}
function DeleteDialog({
  post,
  setIsDialogOpen
}) {
  const { type } = usePostListContext();
  const { deletePost } = usePostActions(type);
  const { setError } = usePostListContext();
  const dialogTitle = (0, import_i18n7.sprintf)((0, import_i18n7.__)('Delete "%s"?', "elementor"), post.title.rendered);
  const deletePage = async () => {
    try {
      await deletePost.mutateAsync(post.id);
    } catch {
      setError();
      setIsDialogOpen(false);
    }
  };
  const handleCancel = () => {
    if (deletePost.isPending) {
      return;
    }
    setIsDialogOpen(false);
  };
  return /* @__PURE__ */ React12.createElement(import_ui8.Dialog, { open: true, onClose: handleCancel, "aria-labelledby": "delete-dialog" }, /* @__PURE__ */ React12.createElement(import_ui8.DialogTitle, { noWrap: true }, dialogTitle), /* @__PURE__ */ React12.createElement(import_ui8.Divider, null), /* @__PURE__ */ React12.createElement(import_ui8.DialogContent, null, /* @__PURE__ */ React12.createElement(import_ui8.DialogContentText, null, (0, import_i18n7.__)(
    "The page and its content will be deleted forever and we won\u2019t be able to recover them.",
    "elementor"
  ))), /* @__PURE__ */ React12.createElement(import_ui8.DialogActions, null, /* @__PURE__ */ React12.createElement(
    import_ui8.Button,
    {
      variant: "contained",
      color: "secondary",
      onClick: handleCancel,
      disabled: deletePost.isPending
    },
    (0, import_i18n7.__)("Cancel", "elementor")
  ), /* @__PURE__ */ React12.createElement(import_ui8.Button, { variant: "contained", color: "error", onClick: deletePage, disabled: deletePost.isPending }, !deletePost.isPending ? (0, import_i18n7.__)("Delete", "elementor") : /* @__PURE__ */ React12.createElement(import_ui8.CircularProgress, null))));
}

// src/components/panel/actions-menu/actions/duplicate.tsx
var React13 = __toESM(require("react"));
var import_icons7 = require("@elementor/icons");
var import_i18n8 = require("@wordpress/i18n");
function Duplicate({ post, popupState }) {
  const { setEditMode } = usePostListContext();
  const { data: user } = useUser();
  const onClick = () => {
    popupState.close();
    setEditMode({
      mode: "duplicate",
      details: {
        postId: post.id,
        title: post.title.rendered
      }
    });
  };
  const isDisabled = !user?.capabilities?.edit_pages;
  return /* @__PURE__ */ React13.createElement(
    ActionMenuItem,
    {
      title: (0, import_i18n8.__)("Duplicate", "elementor"),
      icon: import_icons7.CopyIcon,
      MenuItemProps: {
        disabled: isDisabled,
        onClick
      }
    }
  );
}

// src/components/panel/actions-menu/actions/rename.tsx
var React14 = __toESM(require("react"));
var import_icons8 = require("@elementor/icons");
var import_i18n9 = require("@wordpress/i18n");
function Rename({ post }) {
  const { setEditMode } = usePostListContext();
  return /* @__PURE__ */ React14.createElement(
    ActionMenuItem,
    {
      title: (0, import_i18n9.__)("Rename", "elementor"),
      icon: import_icons8.EraseIcon,
      MenuItemProps: {
        disabled: !post.user_can.edit,
        onClick: () => {
          setEditMode({
            mode: "rename",
            details: {
              postId: post.id
            }
          });
        }
      }
    }
  );
}

// src/components/panel/actions-menu/actions/set-home.tsx
var React15 = __toESM(require("react"));
var import_icons9 = require("@elementor/icons");
var import_ui9 = require("@elementor/ui");
var import_i18n10 = require("@wordpress/i18n");

// src/hooks/use-homepage-actions.ts
var import_query6 = require("@elementor/query");
function useHomepageActions() {
  const invalidateSettings = useInvalidateSettings();
  const onSuccess = async () => invalidateSettings({ exact: true });
  const updateSettingsMutation = (0, import_query6.useMutation)({
    mutationFn: (settings) => updateSettings(settings),
    onSuccess
  });
  return { updateSettingsMutation };
}
function useInvalidateSettings() {
  const queryClient = (0, import_query6.useQueryClient)();
  return (options = {}) => {
    const queryKey = settingsQueryKey();
    return queryClient.invalidateQueries({ queryKey }, options);
  };
}

// src/components/panel/actions-menu/actions/set-home.tsx
function SetHome({ post, closeMenu }) {
  const { updateSettingsMutation } = useHomepageActions();
  const { setError } = usePostListContext();
  const { data: user } = useUser();
  const handleClick = async () => {
    try {
      await updateSettingsMutation.mutateAsync({ show_on_front: "page", page_on_front: post.id });
    } catch {
      setError();
    } finally {
      closeMenu();
    }
  };
  const canManageOptions = !!user?.capabilities?.manage_options;
  const isPostPublished = post.status === "publish";
  const isPostHomepage = !!post.isHome;
  const isDisabled = !canManageOptions || isPostHomepage || !isPostPublished || updateSettingsMutation.isPending;
  return /* @__PURE__ */ React15.createElement(
    ActionMenuItem,
    {
      title: (0, import_i18n10.__)("Set as homepage", "elementor"),
      icon: !updateSettingsMutation.isPending ? import_icons9.HomeIcon : import_ui9.CircularProgress,
      MenuItemProps: {
        disabled: isDisabled,
        onClick: handleClick
      }
    }
  );
}

// src/components/panel/actions-menu/actions/view.tsx
var React16 = __toESM(require("react"));
var import_icons10 = require("@elementor/icons");
var import_i18n11 = require("@wordpress/i18n");
function View({ post }) {
  const { type } = usePostListContext();
  const title = (0, import_i18n11.__)("View %s", "elementor").replace("%s", postTypesMap[type].labels.singular_name);
  return /* @__PURE__ */ React16.createElement(
    ActionMenuItem,
    {
      title,
      icon: import_icons10.EyeIcon,
      MenuItemProps: {
        onClick: () => window.open(post.link, "_blank")
      }
    }
  );
}

// src/components/panel/posts-list/list-items/list-item-view.tsx
var DisabledPostTooltip = ({ children, isDisabled }) => {
  if (isDisabled) {
    const title = /* @__PURE__ */ React17.createElement(import_ui10.Typography, { variant: "caption" }, "You cannot edit this page.", /* @__PURE__ */ React17.createElement("br", null), "To edit it directly, contact the site owner");
    return /* @__PURE__ */ React17.createElement(import_ui10.Tooltip, { title, placement: "bottom", arrow: false }, children);
  }
  return /* @__PURE__ */ React17.createElement(React17.Fragment, null, children);
};
function ListItemView({ post }) {
  const activeDocument = (0, import_editor_documents5.__useActiveDocument)();
  const navigateToDocument = (0, import_editor_documents5.__useNavigateToDocument)();
  const popupState = (0, import_ui10.usePopupState)({
    variant: "popover",
    popupId: "post-actions",
    disableAutoFocus: true
  });
  const isActive = activeDocument?.id === post.id;
  const status = isActive ? activeDocument?.status.value : post.status;
  const title = isActive ? activeDocument?.title : post.title.rendered;
  const isDisabled = !post.user_can.edit;
  return /* @__PURE__ */ React17.createElement(React17.Fragment, null, /* @__PURE__ */ React17.createElement(DisabledPostTooltip, { isDisabled }, /* @__PURE__ */ React17.createElement(
    import_ui10.ListItem,
    {
      disablePadding: true,
      secondaryAction: /* @__PURE__ */ React17.createElement(import_ui10.IconButton, { value: true, size: "small", ...(0, import_ui10.bindTrigger)(popupState) }, /* @__PURE__ */ React17.createElement(import_icons11.DotsVerticalIcon, { fontSize: "small" }))
    },
    /* @__PURE__ */ React17.createElement(
      import_ui10.ListItemButton,
      {
        selected: isActive,
        disabled: isDisabled,
        onClick: () => {
          if (!isActive) {
            navigateToDocument(post.id);
          }
        },
        dense: true
      },
      /* @__PURE__ */ React17.createElement(import_ui10.ListItemText, { disableTypography: true }, /* @__PURE__ */ React17.createElement(PageTitleAndStatus, { title, status })),
      post.isHome && /* @__PURE__ */ React17.createElement(import_icons11.HomeIcon, { titleAccess: (0, import_i18n12.__)("Homepage", "elementor"), color: "disabled" })
    )
  )), /* @__PURE__ */ React17.createElement(
    import_ui10.Menu,
    {
      PaperProps: { sx: { mt: 2, width: 200 } },
      MenuListProps: { dense: true },
      ...(0, import_ui10.bindMenu)(popupState)
    },
    /* @__PURE__ */ React17.createElement(Rename, { post }),
    /* @__PURE__ */ React17.createElement(Duplicate, { post, popupState }),
    /* @__PURE__ */ React17.createElement(Delete, { post }),
    /* @__PURE__ */ React17.createElement(View, { post }),
    /* @__PURE__ */ React17.createElement(import_ui10.Divider, null),
    /* @__PURE__ */ React17.createElement(SetHome, { post, closeMenu: () => popupState.close() })
  ));
}

// src/components/panel/posts-list/post-list-item.tsx
function PostListItem({ post }) {
  const { editMode } = usePostListContext();
  if ("rename" === editMode.mode && post?.id && post?.id === editMode.details.postId) {
    return /* @__PURE__ */ React18.createElement(ListItemRename, { post });
  }
  if ("create" === editMode.mode && !post) {
    return /* @__PURE__ */ React18.createElement(ListItemCreate, null);
  }
  if ("duplicate" === editMode.mode && !post) {
    return /* @__PURE__ */ React18.createElement(ListItemDuplicate, null);
  }
  if (!post) {
    return null;
  }
  return /* @__PURE__ */ React18.createElement(ListItemView, { post });
}

// src/components/panel/posts-list/posts-collapsible-list.tsx
function PostsCollapsibleList({ isOpenByDefault = false }) {
  const { type, editMode } = usePostListContext();
  const {
    data: { posts, total },
    isLoading: postsLoading,
    isError: postsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = usePosts(type);
  const { data: homepageId } = useHomepage();
  if (postsError) {
    return /* @__PURE__ */ React19.createElement(ErrorState, null);
  }
  if (!posts || postsLoading) {
    return /* @__PURE__ */ React19.createElement(import_ui11.Box, { sx: { px: 5 } }, /* @__PURE__ */ React19.createElement(import_ui11.Box, { display: "flex", justifyContent: "flex-end", alignItems: "center" }, /* @__PURE__ */ React19.createElement(import_ui11.Skeleton, { sx: { my: 4 }, animation: "wave", variant: "rounded", width: "110px", height: "28px" })), /* @__PURE__ */ React19.createElement(import_ui11.Box, null, /* @__PURE__ */ React19.createElement(import_ui11.Skeleton, { sx: { my: 3 }, animation: "wave", variant: "rounded", width: "100%", height: "24px" }), /* @__PURE__ */ React19.createElement(import_ui11.Skeleton, { sx: { my: 3 }, animation: "wave", variant: "rounded", width: "70%", height: "24px" }), /* @__PURE__ */ React19.createElement(import_ui11.Skeleton, { sx: { my: 3 }, animation: "wave", variant: "rounded", width: "70%", height: "24px" }), /* @__PURE__ */ React19.createElement(import_ui11.Skeleton, { sx: { my: 3 }, animation: "wave", variant: "rounded", width: "70%", height: "24px" })));
  }
  const label = `${postTypesMap[type].labels.plural_name} (${total.toString()})`;
  const mappedPosts = posts.map((post) => {
    if (post.id === homepageId) {
      return { ...post, isHome: true };
    }
    return post;
  });
  const sortedPosts = mappedPosts.sort((a, b) => {
    if (a.id === homepageId) {
      return -1;
    }
    if (b.id === homepageId) {
      return 1;
    }
    return 0;
  });
  return /* @__PURE__ */ React19.createElement(React19.Fragment, null, /* @__PURE__ */ React19.createElement(
    import_ui11.Box,
    {
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "center",
      sx: {
        py: 1,
        px: 2
      }
    },
    /* @__PURE__ */ React19.createElement(AddNewButton, null)
  ), /* @__PURE__ */ React19.createElement(import_ui11.List, { dense: true }, /* @__PURE__ */ React19.createElement(CollapsibleList, { label, Icon: import_icons12.PageTypeIcon, isOpenByDefault: isOpenByDefault || false }, sortedPosts.map((post) => {
    return /* @__PURE__ */ React19.createElement(PostListItem, { key: post.id, post });
  }), ["duplicate", "create"].includes(editMode.mode) && /* @__PURE__ */ React19.createElement(PostListItem, null), hasNextPage && /* @__PURE__ */ React19.createElement(
    import_ui11.Box,
    {
      sx: {
        display: "flex",
        justifyContent: "center"
      }
    },
    /* @__PURE__ */ React19.createElement(import_ui11.Button, { onClick: fetchNextPage, color: "secondary" }, isFetchingNextPage ? /* @__PURE__ */ React19.createElement(import_ui11.CircularProgress, null) : "Load More")
  ))));
}

// src/components/panel/shell.tsx
var Shell = () => {
  const [isErrorSnackbarOpen, setIsErrorSnackbarOpen] = (0, import_react6.useState)(false);
  return /* @__PURE__ */ React20.createElement(import_editor_panels.Panel, null, /* @__PURE__ */ React20.createElement(import_editor_panels.PanelHeader, null, /* @__PURE__ */ React20.createElement(import_editor_panels.PanelHeaderTitle, null, (0, import_i18n13.__)("Pages", "elementor"))), /* @__PURE__ */ React20.createElement(import_editor_panels.PanelBody, null, /* @__PURE__ */ React20.createElement(PostListContextProvider, { type: "page", setError: () => setIsErrorSnackbarOpen(true) }, /* @__PURE__ */ React20.createElement(PostsCollapsibleList, { isOpenByDefault: true })), /* @__PURE__ */ React20.createElement(error_snackbar_default, { open: isErrorSnackbarOpen, onClose: () => setIsErrorSnackbarOpen(false) })));
};
var shell_default = Shell;

// src/components/panel/panel.ts
var { panel, usePanelStatus, usePanelActions } = (0, import_editor_panels2.__createPanel)({
  id: "site-navigation-panel",
  component: shell_default
});

// src/components/top-bar/recently-edited.tsx
var React25 = __toESM(require("react"));
var import_editor_documents8 = require("@elementor/editor-documents");
var import_icons15 = require("@elementor/icons");
var import_ui16 = require("@elementor/ui");
var import_i18n15 = require("@wordpress/i18n");

// src/components/top-bar/create-post-list-item.tsx
var React21 = __toESM(require("react"));
var import_editor_documents6 = require("@elementor/editor-documents");
var import_icons13 = require("@elementor/icons");
var import_ui12 = require("@elementor/ui");
var import_i18n14 = require("@wordpress/i18n");

// src/hooks/use-create-page.ts
var import_react7 = require("react");
var import_api_fetch5 = __toESM(require("@wordpress/api-fetch"));
var endpointPath = "/elementor/v1/site-navigation/add-new-post";
function useCreatePage() {
  const [isLoading, setIsLoading] = (0, import_react7.useState)(false);
  return {
    create: () => {
      setIsLoading(true);
      return addNewPage().then((newPost) => newPost).finally(() => setIsLoading(false));
    },
    isLoading
  };
}
async function addNewPage() {
  return await (0, import_api_fetch5.default)({
    path: endpointPath,
    method: "POST",
    data: { post_type: "page" }
  });
}

// src/components/top-bar/create-post-list-item.tsx
function CreatePostListItem({ closePopup, ...props }) {
  const { create, isLoading } = useCreatePage();
  const navigateToDocument = (0, import_editor_documents6.__useNavigateToDocument)();
  const { data: user } = useUser();
  return /* @__PURE__ */ React21.createElement(
    import_ui12.MenuItem,
    {
      disabled: isLoading || !user?.capabilities?.edit_pages,
      onClick: async () => {
        const { id } = await create();
        closePopup();
        await navigateToDocument(id);
      },
      ...props
    },
    /* @__PURE__ */ React21.createElement(import_ui12.ListItemIcon, null, isLoading ? /* @__PURE__ */ React21.createElement(import_ui12.CircularProgress, { size: "1.25rem" }) : /* @__PURE__ */ React21.createElement(import_icons13.PlusIcon, { fontSize: "small" })),
    /* @__PURE__ */ React21.createElement(
      import_ui12.ListItemText,
      {
        primaryTypographyProps: { variant: "body2" },
        primary: (0, import_i18n14.__)("Add new page", "elementor")
      }
    )
  );
}

// src/components/top-bar/indicator.tsx
var React22 = __toESM(require("react"));
var import_ui13 = require("@elementor/ui");
function Indicator({ title, status }) {
  return /* @__PURE__ */ React22.createElement(Tooltip2, { title }, /* @__PURE__ */ React22.createElement(import_ui13.Stack, { component: "span", direction: "row", alignItems: "center", spacing: 0.5 }, /* @__PURE__ */ React22.createElement(import_ui13.Typography, { component: "span", variant: "body2", sx: { maxWidth: "120px" }, noWrap: true }, title), status.value !== "publish" && /* @__PURE__ */ React22.createElement(import_ui13.Typography, { component: "span", variant: "body2", sx: { fontStyle: "italic" } }, "(", status.label, ")")));
}
function Tooltip2(props) {
  return /* @__PURE__ */ React22.createElement(
    import_ui13.Tooltip,
    {
      PopperProps: {
        sx: {
          "&.MuiTooltip-popper .MuiTooltip-tooltip.MuiTooltip-tooltipPlacementBottom": {
            mt: 2.7
          }
        }
      },
      ...props
    }
  );
}

// src/components/top-bar/post-list-item.tsx
var React24 = __toESM(require("react"));
var import_editor_documents7 = require("@elementor/editor-documents");
var import_ui15 = require("@elementor/ui");

// src/components/top-bar/chip-doc-type.tsx
var React23 = __toESM(require("react"));
var import_icons14 = require("@elementor/icons");
var import_ui14 = require("@elementor/ui");
var iconsMap2 = getIconsMap();
function DocTypeChip({ postType, docType, label }) {
  const color = "elementor_library" === postType ? "global" : "primary";
  const Icon = iconsMap2[docType] || import_icons14.PostTypeIcon;
  return /* @__PURE__ */ React23.createElement(
    import_ui14.Chip,
    {
      component: "span",
      size: "small",
      variant: "outlined",
      label,
      "data-value": docType,
      color,
      icon: /* @__PURE__ */ React23.createElement(Icon, null),
      sx: { ml: 1, cursor: "inherit" }
    }
  );
}

// src/components/top-bar/post-list-item.tsx
function PostListItem2({ post, closePopup, ...props }) {
  const navigateToDocument = (0, import_editor_documents7.__useNavigateToDocument)();
  const postTitle = useReverseHtmlEntities(post.title);
  return /* @__PURE__ */ React24.createElement(
    import_ui15.MenuItem,
    {
      disabled: !post.user_can.edit,
      onClick: async () => {
        closePopup();
        await navigateToDocument(post.id);
      },
      ...props
    },
    /* @__PURE__ */ React24.createElement(
      import_ui15.ListItemText,
      {
        sx: { flexGrow: 0 },
        primaryTypographyProps: { variant: "body2", noWrap: true },
        primary: postTitle
      }
    ),
    /* @__PURE__ */ React24.createElement(DocTypeChip, { postType: post.type.post_type, docType: post.type.doc_type, label: post.type.label })
  );
}

// src/components/top-bar/recently-edited.tsx
function RecentlyEdited() {
  const activeDocument = (0, import_editor_documents8.__useActiveDocument)();
  const hostDocument = (0, import_editor_documents8.__useHostDocument)();
  const document2 = activeDocument && activeDocument.type.value !== "kit" ? activeDocument : hostDocument;
  const { data } = useRecentPosts();
  const getRecentPosts = () => {
    if (!data) {
      return [];
    }
    return data.filter((post) => post.id !== document2?.id).splice(0, NUMBER_OF_RECENT_POSTS - 1);
  };
  const recentPosts = getRecentPosts();
  const popupState = (0, import_ui16.usePopupState)({
    variant: "popover",
    popupId: "elementor-v2-top-bar-recently-edited"
  });
  const documentTitle = useReverseHtmlEntities(document2?.title);
  if (!document2) {
    return null;
  }
  const buttonProps = (0, import_ui16.bindTrigger)(popupState);
  return /* @__PURE__ */ React25.createElement(React25.Fragment, null, /* @__PURE__ */ React25.createElement(
    import_ui16.Button,
    {
      color: "inherit",
      size: "small",
      endIcon: /* @__PURE__ */ React25.createElement(import_icons15.ChevronDownIcon, { fontSize: "small" }),
      ...buttonProps,
      onClick: (e) => {
        const extendedWindow = window;
        const config = extendedWindow?.elementor?.editorEvents?.config;
        if (config) {
          extendedWindow.elementor.editorEvents.dispatchEvent(config.names.topBar.documentNameDropdown, {
            location: config.locations.topBar,
            secondaryLocation: config.secondaryLocations.documentNameDropdown,
            trigger: config.triggers.dropdownClick,
            element: config.elements.dropdown
          });
        }
        buttonProps.onClick(e);
      }
    },
    /* @__PURE__ */ React25.createElement(Indicator, { title: documentTitle, status: document2.status })
  ), /* @__PURE__ */ React25.createElement(
    import_ui16.Menu,
    {
      MenuListProps: {
        subheader: /* @__PURE__ */ React25.createElement(import_ui16.ListSubheader, { color: "primary", sx: { fontStyle: "italic", fontWeight: "300" } }, (0, import_i18n15.__)("Recent", "elementor"))
      },
      PaperProps: { sx: { mt: 2.5, width: 320 } },
      ...(0, import_ui16.bindMenu)(popupState)
    },
    recentPosts.map((post) => /* @__PURE__ */ React25.createElement(PostListItem2, { key: post.id, post, closePopup: popupState.close })),
    recentPosts.length === 0 && /* @__PURE__ */ React25.createElement(import_ui16.MenuItem, { disabled: true }, /* @__PURE__ */ React25.createElement(
      import_ui16.ListItemText,
      {
        primaryTypographyProps: {
          variant: "caption",
          fontStyle: "italic"
        },
        primary: (0, import_i18n15.__)("There are no other pages or templates on this site yet.", "elementor")
      }
    )),
    /* @__PURE__ */ React25.createElement(import_ui16.Divider, { disabled: recentPosts.length === 0 }),
    /* @__PURE__ */ React25.createElement(CreatePostListItem, { closePopup: popupState.close })
  ));
}

// src/env.ts
var import_env = require("@elementor/env");
var { env } = (0, import_env.parseEnv)("@elementor/editor-site-navigation", (envData) => {
  return envData;
});

// src/hooks/use-toggle-button-props.ts
var import_icons16 = require("@elementor/icons");
var import_i18n16 = require("@wordpress/i18n");
function useToggleButtonProps() {
  const { isOpen: selectedState, isBlocked } = usePanelStatus();
  const { open, close } = usePanelActions();
  return {
    title: (0, import_i18n16.__)("Pages", "elementor"),
    icon: import_icons16.PagesIcon,
    onClick: () => {
      const extendedWindow = window;
      const config = extendedWindow?.elementor?.editorEvents?.config;
      if (config) {
        extendedWindow.elementor.editorEvents.dispatchEvent("top_bar_pages", {
          location: config.locations.topBar,
          secondaryLocation: config.secondaryLocations.elementorLogo,
          trigger: config.triggers.click,
          element: config.elements.buttonIcon
        });
      }
      return selectedState ? close() : open();
    },
    selected: selectedState,
    disabled: isBlocked
  };
}

// src/init.ts
function init() {
  registerTopBarMenuItems();
  if (env.is_pages_panel_active) {
    (0, import_editor_panels3.__registerPanel)(panel);
    registerButton();
  }
}
function registerTopBarMenuItems() {
  (0, import_editor_app_bar.injectIntoPageIndication)({
    id: "document-recently-edited",
    component: RecentlyEdited
  });
}
function registerButton() {
  import_editor_app_bar.toolsMenu.registerToggleAction({
    id: "toggle-site-navigation-panel",
    priority: 2,
    useProps: useToggleButtonProps
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  extendIconsMap,
  init
});
