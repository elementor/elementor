// src/icons-map.ts
import {
  ContainerTemplateIcon,
  PageTemplateIcon,
  PageTypeIcon,
  PostTypeIcon,
  SectionTemplateIcon
} from "@elementor/icons";
var initialIconsMap = {
  page: PageTemplateIcon,
  section: SectionTemplateIcon,
  container: ContainerTemplateIcon,
  "wp-page": PageTypeIcon,
  "wp-post": PostTypeIcon
};
var iconsMap = { ...initialIconsMap };
function extendIconsMap(additionalIcons) {
  Object.assign(iconsMap, additionalIcons);
}
function getIconsMap() {
  return iconsMap;
}

// src/init.ts
import { injectIntoPageIndication, toolsMenu } from "@elementor/editor-app-bar";
import { __registerPanel } from "@elementor/editor-panels";

// src/components/panel/panel.ts
import { __createPanel } from "@elementor/editor-panels";

// src/components/panel/shell.tsx
import * as React20 from "react";
import { useState as useState5 } from "react";
import { Panel, PanelBody, PanelHeader, PanelHeaderTitle } from "@elementor/editor-panels";
import { __ as __13 } from "@wordpress/i18n";

// src/contexts/post-list-context.tsx
import * as React from "react";
import { createContext, useContext, useState } from "react";
var defaultValues = {
  type: "page",
  editMode: { mode: "none", details: {} },
  setEditMode: () => null,
  resetEditMode: () => null,
  setError: () => null
};
var PostListContext = createContext(defaultValues);
var PostListContextProvider = ({
  type,
  setError,
  children
}) => {
  const [editMode, setEditMode] = useState(defaultValues.editMode);
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
  const context = useContext(PostListContext);
  if (!context) {
    throw new Error("The `usePostListContext()` hook must be used within an `<PostListContextProvider />`");
  }
  return context;
}

// src/components/panel/error-snackbar.tsx
import * as React2 from "react";
import { Alert, Snackbar, Typography } from "@elementor/ui";
var ErrorSnackbar = ({ open, onClose }) => {
  return /* @__PURE__ */ React2.createElement(
    Snackbar,
    {
      open,
      onClose,
      anchorOrigin: {
        vertical: "bottom",
        horizontal: "left"
      }
    },
    /* @__PURE__ */ React2.createElement(Alert, { onClose, severity: "error", sx: { width: "100%" } }, /* @__PURE__ */ React2.createElement(
      Typography,
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
import * as React19 from "react";
import { PageTypeIcon as PageTypeIcon2 } from "@elementor/icons";
import { Box as Box4, Button as Button3, CircularProgress as CircularProgress4, List as List2, Skeleton } from "@elementor/ui";

// src/api/post.ts
import apiFetch from "@wordpress/api-fetch";
import { __ } from "@wordpress/i18n";
var postTypesMap = {
  page: {
    labels: {
      singular_name: __("Page", "elementor"),
      plural_name: __("Pages", "elementor")
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
  const result = await apiFetch({ path: uri, parse: false });
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
  return apiFetch({
    path,
    method: "POST",
    data: newPost
  });
};
var updateRequest = (postTypeSlug, updatedPost) => {
  const path = `/wp/v2/${postTypesMap[postTypeSlug].rest_base}`;
  const { id, ...data } = updatedPost;
  return apiFetch({
    path: `${path}/${id}`,
    method: "POST",
    data
  });
};
var deleteRequest = (postTypeSlug, postId) => {
  const path = `/wp/v2/${postTypesMap[postTypeSlug].rest_base}`;
  return apiFetch({
    path: `${path}/${postId}`,
    method: "DELETE"
  });
};
var duplicateRequest = (originalPost) => {
  const path = `/elementor/v1/site-navigation/duplicate-post`;
  return apiFetch({
    path,
    method: "POST",
    data: {
      post_id: originalPost.id,
      title: originalPost.title
    }
  });
};

// src/hooks/use-homepage.ts
import { useQuery } from "@elementor/query";

// src/api/settings.ts
import apiFetch2 from "@wordpress/api-fetch";
var getSettings = () => {
  const baseUri = "/elementor/v1/site-navigation/homepage";
  const uri = baseUri;
  return apiFetch2({ path: uri });
};
var updateSettings = (settings) => {
  return apiFetch2({
    path: "/wp/v2/settings",
    method: "POST",
    data: settings
  });
};

// src/hooks/use-homepage.ts
var settingsQueryKey = () => ["site-navigation", "homepage"];
function useHomepage() {
  return useQuery({
    queryKey: settingsQueryKey(),
    queryFn: () => getSettings()
  });
}

// src/hooks/use-posts.ts
import { useInfiniteQuery } from "@elementor/query";
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
  const query = useInfiniteQuery({
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
import * as React3 from "react";
import { PlusIcon } from "@elementor/icons";
import { Button } from "@elementor/ui";
import { __ as __2 } from "@wordpress/i18n";

// src/hooks/use-user.ts
import { useQuery as useQuery2 } from "@elementor/query";

// src/api/user.ts
import apiFetch3 from "@wordpress/api-fetch";
var getUser = () => {
  const baseUri = "/wp/v2/users/me";
  const keys = ["capabilities"];
  const queryParams = new URLSearchParams({
    _fields: keys.join(","),
    context: "edit"
  });
  const uri = baseUri + "?" + queryParams.toString();
  return apiFetch3({ path: uri });
};

// src/hooks/use-user.ts
var userQueryKey = () => ["site-navigation", "user"];
function useUser() {
  return useQuery2({
    queryKey: userQueryKey(),
    queryFn: () => getUser()
  });
}

// src/components/panel/add-new-button.tsx
function AddNewButton() {
  const { setEditMode } = usePostListContext();
  const { data: user } = useUser();
  return /* @__PURE__ */ React3.createElement(
    Button,
    {
      size: "small",
      startIcon: /* @__PURE__ */ React3.createElement(PlusIcon, null),
      disabled: !user?.capabilities?.edit_pages,
      onClick: () => {
        setEditMode({ mode: "create", details: {} });
      },
      sx: {
        px: 1.5
      }
    },
    __2("Add New", "elementor")
  );
}

// src/components/panel/posts-list/collapsible-list.tsx
import * as React4 from "react";
import { useState as useState2 } from "react";
import { ChevronDownIcon } from "@elementor/icons";
import {
  Collapse,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  styled
} from "@elementor/ui";
var RotateIcon = styled(ChevronDownIcon, {
  shouldForwardProp: (prop) => prop !== "isOpen"
})(({ theme, isOpen }) => ({
  transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.standard
  })
}));
var StyledListItemIcon = styled(ListItemIcon)(({ theme }) => ({
  minWidth: theme.spacing(4)
}));
function CollapsibleList({
  label,
  Icon,
  isOpenByDefault = false,
  children
}) {
  const [isOpen, setIsOpen] = useState2(isOpenByDefault);
  return /* @__PURE__ */ React4.createElement(React4.Fragment, null, /* @__PURE__ */ React4.createElement(ListItem, null, /* @__PURE__ */ React4.createElement(
    StyledListItemIcon,
    {
      sx: {
        color: "text.secondary"
      }
    },
    /* @__PURE__ */ React4.createElement(
      IconButton,
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
    ListItemText,
    {
      primaryTypographyProps: { variant: "subtitle2", component: "span" },
      primary: label
    }
  )), /* @__PURE__ */ React4.createElement(Collapse, { in: isOpen, timeout: "auto", unmountOnExit: true }, /* @__PURE__ */ React4.createElement(List, { dense: true }, children)), /* @__PURE__ */ React4.createElement(Divider, { sx: { mt: 1 } }));
}

// src/components/panel/posts-list/error-state.tsx
import * as React5 from "react";
import { Error404TemplateIcon } from "@elementor/icons";
import { Box, Link, Typography as Typography2 } from "@elementor/ui";
import { __ as __3 } from "@wordpress/i18n";
function ErrorState() {
  return /* @__PURE__ */ React5.createElement(
    Box,
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
    /* @__PURE__ */ React5.createElement(Error404TemplateIcon, null),
    /* @__PURE__ */ React5.createElement(
      Box,
      {
        sx: {
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: "8px"
        }
      },
      /* @__PURE__ */ React5.createElement(Typography2, { variant: "body1", color: "text.primary" }, __3("We couldn\u2019t display your pages.", "elementor")),
      /* @__PURE__ */ React5.createElement(Box, null, /* @__PURE__ */ React5.createElement(Typography2, { variant: "body2", color: "text.primary", sx: { textAlign: "center" } }, __3("It\u2019s probably a temporary issue.", "elementor")), /* @__PURE__ */ React5.createElement(Typography2, { variant: "body2", color: "text.primary", sx: { textAlign: "center" } }, __3("If the problem persists,", "elementor"), " ", /* @__PURE__ */ React5.createElement(Link, { target: "_blank", href: "https://go.elementor.com/wp-editor-support-open-ticket/" }, "Notify support")))
    )
  );
}

// src/components/panel/posts-list/post-list-item.tsx
import * as React18 from "react";

// src/components/panel/posts-list/list-items/list-item-create.tsx
import * as React7 from "react";
import { __useNavigateToDocument as useNavigateToDocument } from "@elementor/editor-documents";
import { __ as __5 } from "@wordpress/i18n";

// src/hooks/use-posts-actions.ts
import { useMutation, useQueryClient } from "@elementor/query";

// src/hooks/use-recent-posts.ts
import { useQuery as useQuery3 } from "@elementor/query";

// src/api/recent-posts.ts
import apiFetch4 from "@wordpress/api-fetch";
var baseUrl = "/elementor/v1/site-navigation/recent-posts";
var NUMBER_OF_RECENT_POSTS = 6;
var getRequest2 = () => {
  const queryParams = new URLSearchParams({
    posts_per_page: `${NUMBER_OF_RECENT_POSTS}`
  });
  const path = `${baseUrl}?${queryParams.toString()}`;
  return apiFetch4({ path });
};

// src/hooks/use-recent-posts.ts
var recentPostsQueryKey = ["site-navigation", "recent-posts"];
function useRecentPosts() {
  return useQuery3({
    queryKey: recentPostsQueryKey,
    queryFn: () => getRequest2()
  });
}

// src/hooks/use-posts-actions.ts
function usePostActions(postTypeSlug) {
  const invalidatePosts = useInvalidatePosts(postTypeSlug);
  const onSuccess = () => invalidatePosts({ exact: true });
  const createPost = useMutation({
    mutationFn: (newPost) => createRequest(postTypeSlug, newPost),
    onSuccess
  });
  const updatePost = useMutation({
    mutationFn: (updatedPost) => updateRequest(postTypeSlug, updatedPost),
    onSuccess
  });
  const deletePost = useMutation({
    mutationFn: (postId) => deleteRequest(postTypeSlug, postId),
    onSuccess
  });
  const duplicatePost = useMutation({
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
  const queryClient = useQueryClient();
  return (options = {}) => {
    const queryKey = postsQueryKey(postTypeSlug);
    queryClient.invalidateQueries({ queryKey: recentPostsQueryKey }, options);
    return queryClient.invalidateQueries({ queryKey }, options);
  };
}

// src/components/panel/posts-list/list-items/edit-mode-template.tsx
import * as React6 from "react";
import { useRef, useState as useState3 } from "react";
import { XIcon } from "@elementor/icons";
import { Box as Box2, CircularProgress, IconButton as IconButton2, ListItem as ListItem2, ListItemText as ListItemText2, TextField } from "@elementor/ui";
import { __ as __4 } from "@wordpress/i18n";
function EditModeTemplate({ postTitle, isLoading, callback }) {
  const [title, setTitle] = useState3(postTitle);
  const [touched, setTouched] = useState3(false);
  const [inputError, setInputError] = useState3(null);
  const closeButton = useRef();
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
      setInputError(__4("Name is required", "elementor"));
    } else {
      setInputError(null);
    }
    setTitle(value);
  };
  return /* @__PURE__ */ React6.createElement(React6.Fragment, null, /* @__PURE__ */ React6.createElement(ListItem2, { secondaryAction: /* @__PURE__ */ React6.createElement(CloseButton, { isLoading, closeButton }) }, /* @__PURE__ */ React6.createElement(Box2, { width: "100%", component: "form", onSubmit: onFormSubmit }, /* @__PURE__ */ React6.createElement(
    TextField,
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
  ))), inputError && /* @__PURE__ */ React6.createElement(ListItem2, null, /* @__PURE__ */ React6.createElement(ListItemText2, { sx: { color: "error.main" } }, inputError)));
}
function CloseButton({ isLoading, closeButton }) {
  const { resetEditMode } = usePostListContext();
  return /* @__PURE__ */ React6.createElement(IconButton2, { size: "small", color: "secondary", onClick: resetEditMode, ref: closeButton, disabled: isLoading }, isLoading ? /* @__PURE__ */ React6.createElement(CircularProgress, null) : /* @__PURE__ */ React6.createElement(XIcon, { fontSize: "small" }));
}

// src/components/panel/posts-list/list-items/list-item-create.tsx
function ListItemCreate() {
  const { type, resetEditMode } = usePostListContext();
  const { createPost } = usePostActions(type);
  const navigateToDocument = useNavigateToDocument();
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
      postTitle: __5("New Page", "elementor"),
      isLoading: createPost.isPending,
      callback: createPostCallback
    }
  );
}

// src/components/panel/posts-list/list-items/list-item-duplicate.tsx
import * as React8 from "react";
import { __useNavigateToDocument as useNavigateToDocument2 } from "@elementor/editor-documents";
import { __ as __6 } from "@wordpress/i18n";
function ListItemDuplicate() {
  const { type, editMode, resetEditMode } = usePostListContext();
  const navigateToDocument = useNavigateToDocument2();
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
      postTitle: `${editMode.details.title} ${__6("copy", "elementor")}`,
      isLoading: duplicatePost.isPending,
      callback: duplicatePostCallback
    }
  );
}

// src/components/panel/posts-list/list-items/list-item-rename.tsx
import * as React9 from "react";
import { __useActiveDocument as useActiveDocument } from "@elementor/editor-documents";

// src/hooks/use-rename-active-document.ts
import { __privateRunCommand as runCommand } from "@elementor/editor-v1-adapters";
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
    await runCommand("document/elements/settings", {
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
  const activeDocument = useActiveDocument();
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
import * as React17 from "react";
import {
  __useActiveDocument as useActiveDocument3,
  __useNavigateToDocument as useNavigateToDocument3
} from "@elementor/editor-documents";
import { DotsVerticalIcon, HomeIcon as HomeIcon2 } from "@elementor/icons";
import {
  bindMenu,
  bindTrigger,
  Divider as Divider3,
  IconButton as IconButton3,
  ListItem as ListItem3,
  ListItemButton,
  ListItemText as ListItemText4,
  Menu,
  Tooltip,
  Typography as Typography4,
  usePopupState
} from "@elementor/ui";
import { __ as __12 } from "@wordpress/i18n";

// src/components/shared/page-title-and-status.tsx
import * as React10 from "react";
import { Box as Box3, Typography as Typography3 } from "@elementor/ui";

// src/hooks/use-reverse-html-entities.ts
import { useMemo } from "react";
function useReverseHtmlEntities(escapedHTML = "") {
  return useMemo(() => {
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
    Typography3,
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
    Typography3,
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
  return /* @__PURE__ */ React10.createElement(Box3, { display: "flex" }, /* @__PURE__ */ React10.createElement(PageTitle, { title }), "\xA0", /* @__PURE__ */ React10.createElement(PageStatus, { status }));
}

// src/components/panel/actions-menu/actions/delete.tsx
import * as React12 from "react";
import { useState as useState4 } from "react";
import { __useActiveDocument as useActiveDocument2 } from "@elementor/editor-documents";
import { TrashIcon } from "@elementor/icons";
import {
  Button as Button2,
  CircularProgress as CircularProgress2,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider as Divider2
} from "@elementor/ui";
import { __ as __7, sprintf } from "@wordpress/i18n";

// src/components/panel/actions-menu/action-menu-item.tsx
import * as React11 from "react";
import { ListItemIcon as ListItemIcon2, ListItemText as ListItemText3, MenuItem } from "@elementor/ui";
function ActionMenuItem({ title, icon: Icon, MenuItemProps }) {
  return /* @__PURE__ */ React11.createElement(MenuItem, { ...MenuItemProps }, /* @__PURE__ */ React11.createElement(
    ListItemIcon2,
    {
      sx: {
        color: "inherit"
      }
    },
    /* @__PURE__ */ React11.createElement(Icon, null)
  ), /* @__PURE__ */ React11.createElement(ListItemText3, { primary: title }));
}

// src/components/panel/actions-menu/actions/delete.tsx
function Delete({ post }) {
  const [isDialogOpen, setIsDialogOpen] = useState4(false);
  const activeDocument = useActiveDocument2();
  const isPostActive = activeDocument?.id === post.id;
  const userCanDelete = post.user_can.delete;
  const isDisabled = !userCanDelete || post.isHome || isPostActive;
  return /* @__PURE__ */ React12.createElement(React12.Fragment, null, /* @__PURE__ */ React12.createElement(
    ActionMenuItem,
    {
      title: __7("Delete", "elementor"),
      icon: TrashIcon,
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
  const dialogTitle = sprintf(__7('Delete "%s"?', "elementor"), post.title.rendered);
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
  return /* @__PURE__ */ React12.createElement(Dialog, { open: true, onClose: handleCancel, "aria-labelledby": "delete-dialog" }, /* @__PURE__ */ React12.createElement(DialogTitle, { noWrap: true }, dialogTitle), /* @__PURE__ */ React12.createElement(Divider2, null), /* @__PURE__ */ React12.createElement(DialogContent, null, /* @__PURE__ */ React12.createElement(DialogContentText, null, __7(
    "The page and its content will be deleted forever and we won\u2019t be able to recover them.",
    "elementor"
  ))), /* @__PURE__ */ React12.createElement(DialogActions, null, /* @__PURE__ */ React12.createElement(
    Button2,
    {
      variant: "contained",
      color: "secondary",
      onClick: handleCancel,
      disabled: deletePost.isPending
    },
    __7("Cancel", "elementor")
  ), /* @__PURE__ */ React12.createElement(Button2, { variant: "contained", color: "error", onClick: deletePage, disabled: deletePost.isPending }, !deletePost.isPending ? __7("Delete", "elementor") : /* @__PURE__ */ React12.createElement(CircularProgress2, null))));
}

// src/components/panel/actions-menu/actions/duplicate.tsx
import * as React13 from "react";
import { CopyIcon } from "@elementor/icons";
import { __ as __8 } from "@wordpress/i18n";
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
      title: __8("Duplicate", "elementor"),
      icon: CopyIcon,
      MenuItemProps: {
        disabled: isDisabled,
        onClick
      }
    }
  );
}

// src/components/panel/actions-menu/actions/rename.tsx
import * as React14 from "react";
import { EraseIcon } from "@elementor/icons";
import { __ as __9 } from "@wordpress/i18n";
function Rename({ post }) {
  const { setEditMode } = usePostListContext();
  return /* @__PURE__ */ React14.createElement(
    ActionMenuItem,
    {
      title: __9("Rename", "elementor"),
      icon: EraseIcon,
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
import * as React15 from "react";
import { HomeIcon } from "@elementor/icons";
import { CircularProgress as CircularProgress3 } from "@elementor/ui";
import { __ as __10 } from "@wordpress/i18n";

// src/hooks/use-homepage-actions.ts
import { useMutation as useMutation2, useQueryClient as useQueryClient2 } from "@elementor/query";
function useHomepageActions() {
  const invalidateSettings = useInvalidateSettings();
  const onSuccess = async () => invalidateSettings({ exact: true });
  const updateSettingsMutation = useMutation2({
    mutationFn: (settings) => updateSettings(settings),
    onSuccess
  });
  return { updateSettingsMutation };
}
function useInvalidateSettings() {
  const queryClient = useQueryClient2();
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
      title: __10("Set as homepage", "elementor"),
      icon: !updateSettingsMutation.isPending ? HomeIcon : CircularProgress3,
      MenuItemProps: {
        disabled: isDisabled,
        onClick: handleClick
      }
    }
  );
}

// src/components/panel/actions-menu/actions/view.tsx
import * as React16 from "react";
import { EyeIcon } from "@elementor/icons";
import { __ as __11 } from "@wordpress/i18n";
function View({ post }) {
  const { type } = usePostListContext();
  const title = __11("View %s", "elementor").replace("%s", postTypesMap[type].labels.singular_name);
  return /* @__PURE__ */ React16.createElement(
    ActionMenuItem,
    {
      title,
      icon: EyeIcon,
      MenuItemProps: {
        onClick: () => window.open(post.link, "_blank")
      }
    }
  );
}

// src/components/panel/posts-list/list-items/list-item-view.tsx
var DisabledPostTooltip = ({ children, isDisabled }) => {
  if (isDisabled) {
    const title = /* @__PURE__ */ React17.createElement(Typography4, { variant: "caption" }, "You cannot edit this page.", /* @__PURE__ */ React17.createElement("br", null), "To edit it directly, contact the site owner");
    return /* @__PURE__ */ React17.createElement(Tooltip, { title, placement: "bottom", arrow: false }, children);
  }
  return /* @__PURE__ */ React17.createElement(React17.Fragment, null, children);
};
function ListItemView({ post }) {
  const activeDocument = useActiveDocument3();
  const navigateToDocument = useNavigateToDocument3();
  const popupState = usePopupState({
    variant: "popover",
    popupId: "post-actions",
    disableAutoFocus: true
  });
  const isActive = activeDocument?.id === post.id;
  const status = isActive ? activeDocument?.status.value : post.status;
  const title = isActive ? activeDocument?.title : post.title.rendered;
  const isDisabled = !post.user_can.edit;
  return /* @__PURE__ */ React17.createElement(React17.Fragment, null, /* @__PURE__ */ React17.createElement(DisabledPostTooltip, { isDisabled }, /* @__PURE__ */ React17.createElement(
    ListItem3,
    {
      disablePadding: true,
      secondaryAction: /* @__PURE__ */ React17.createElement(IconButton3, { value: true, size: "small", ...bindTrigger(popupState) }, /* @__PURE__ */ React17.createElement(DotsVerticalIcon, { fontSize: "small" }))
    },
    /* @__PURE__ */ React17.createElement(
      ListItemButton,
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
      /* @__PURE__ */ React17.createElement(ListItemText4, { disableTypography: true }, /* @__PURE__ */ React17.createElement(PageTitleAndStatus, { title, status })),
      post.isHome && /* @__PURE__ */ React17.createElement(HomeIcon2, { titleAccess: __12("Homepage", "elementor"), color: "disabled" })
    )
  )), /* @__PURE__ */ React17.createElement(
    Menu,
    {
      PaperProps: { sx: { mt: 2, width: 200 } },
      MenuListProps: { dense: true },
      ...bindMenu(popupState)
    },
    /* @__PURE__ */ React17.createElement(Rename, { post }),
    /* @__PURE__ */ React17.createElement(Duplicate, { post, popupState }),
    /* @__PURE__ */ React17.createElement(Delete, { post }),
    /* @__PURE__ */ React17.createElement(View, { post }),
    /* @__PURE__ */ React17.createElement(Divider3, null),
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
    return /* @__PURE__ */ React19.createElement(Box4, { sx: { px: 5 } }, /* @__PURE__ */ React19.createElement(Box4, { display: "flex", justifyContent: "flex-end", alignItems: "center" }, /* @__PURE__ */ React19.createElement(Skeleton, { sx: { my: 4 }, animation: "wave", variant: "rounded", width: "110px", height: "28px" })), /* @__PURE__ */ React19.createElement(Box4, null, /* @__PURE__ */ React19.createElement(Skeleton, { sx: { my: 3 }, animation: "wave", variant: "rounded", width: "100%", height: "24px" }), /* @__PURE__ */ React19.createElement(Skeleton, { sx: { my: 3 }, animation: "wave", variant: "rounded", width: "70%", height: "24px" }), /* @__PURE__ */ React19.createElement(Skeleton, { sx: { my: 3 }, animation: "wave", variant: "rounded", width: "70%", height: "24px" }), /* @__PURE__ */ React19.createElement(Skeleton, { sx: { my: 3 }, animation: "wave", variant: "rounded", width: "70%", height: "24px" })));
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
    Box4,
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
  ), /* @__PURE__ */ React19.createElement(List2, { dense: true }, /* @__PURE__ */ React19.createElement(CollapsibleList, { label, Icon: PageTypeIcon2, isOpenByDefault: isOpenByDefault || false }, sortedPosts.map((post) => {
    return /* @__PURE__ */ React19.createElement(PostListItem, { key: post.id, post });
  }), ["duplicate", "create"].includes(editMode.mode) && /* @__PURE__ */ React19.createElement(PostListItem, null), hasNextPage && /* @__PURE__ */ React19.createElement(
    Box4,
    {
      sx: {
        display: "flex",
        justifyContent: "center"
      }
    },
    /* @__PURE__ */ React19.createElement(Button3, { onClick: fetchNextPage, color: "secondary" }, isFetchingNextPage ? /* @__PURE__ */ React19.createElement(CircularProgress4, null) : "Load More")
  ))));
}

// src/components/panel/shell.tsx
var Shell = () => {
  const [isErrorSnackbarOpen, setIsErrorSnackbarOpen] = useState5(false);
  return /* @__PURE__ */ React20.createElement(Panel, null, /* @__PURE__ */ React20.createElement(PanelHeader, null, /* @__PURE__ */ React20.createElement(PanelHeaderTitle, null, __13("Pages", "elementor"))), /* @__PURE__ */ React20.createElement(PanelBody, null, /* @__PURE__ */ React20.createElement(PostListContextProvider, { type: "page", setError: () => setIsErrorSnackbarOpen(true) }, /* @__PURE__ */ React20.createElement(PostsCollapsibleList, { isOpenByDefault: true })), /* @__PURE__ */ React20.createElement(error_snackbar_default, { open: isErrorSnackbarOpen, onClose: () => setIsErrorSnackbarOpen(false) })));
};
var shell_default = Shell;

// src/components/panel/panel.ts
var { panel, usePanelStatus, usePanelActions } = __createPanel({
  id: "site-navigation-panel",
  component: shell_default
});

// src/components/top-bar/recently-edited.tsx
import * as React25 from "react";
import {
  __useActiveDocument as useActiveDocument4,
  __useHostDocument as useHostDocument
} from "@elementor/editor-documents";
import { ChevronDownIcon as ChevronDownIcon2 } from "@elementor/icons";
import {
  bindMenu as bindMenu2,
  bindTrigger as bindTrigger2,
  Button as Button4,
  Divider as Divider4,
  ListItemText as ListItemText7,
  ListSubheader,
  Menu as Menu2,
  MenuItem as MenuItem4,
  usePopupState as usePopupState2
} from "@elementor/ui";
import { __ as __15 } from "@wordpress/i18n";

// src/components/top-bar/create-post-list-item.tsx
import * as React21 from "react";
import { __useNavigateToDocument as useNavigateToDocument4 } from "@elementor/editor-documents";
import { PlusIcon as PlusIcon2 } from "@elementor/icons";
import { CircularProgress as CircularProgress5, ListItemIcon as ListItemIcon3, ListItemText as ListItemText5, MenuItem as MenuItem2 } from "@elementor/ui";
import { __ as __14 } from "@wordpress/i18n";

// src/hooks/use-create-page.ts
import { useState as useState6 } from "react";
import apiFetch5 from "@wordpress/api-fetch";
var endpointPath = "/elementor/v1/site-navigation/add-new-post";
function useCreatePage() {
  const [isLoading, setIsLoading] = useState6(false);
  return {
    create: () => {
      setIsLoading(true);
      return addNewPage().then((newPost) => newPost).finally(() => setIsLoading(false));
    },
    isLoading
  };
}
async function addNewPage() {
  return await apiFetch5({
    path: endpointPath,
    method: "POST",
    data: { post_type: "page" }
  });
}

// src/components/top-bar/create-post-list-item.tsx
function CreatePostListItem({ closePopup, ...props }) {
  const { create, isLoading } = useCreatePage();
  const navigateToDocument = useNavigateToDocument4();
  const { data: user } = useUser();
  return /* @__PURE__ */ React21.createElement(
    MenuItem2,
    {
      disabled: isLoading || !user?.capabilities?.edit_pages,
      onClick: async () => {
        const { id } = await create();
        closePopup();
        await navigateToDocument(id);
      },
      ...props
    },
    /* @__PURE__ */ React21.createElement(ListItemIcon3, null, isLoading ? /* @__PURE__ */ React21.createElement(CircularProgress5, { size: "1.25rem" }) : /* @__PURE__ */ React21.createElement(PlusIcon2, { fontSize: "small" })),
    /* @__PURE__ */ React21.createElement(
      ListItemText5,
      {
        primaryTypographyProps: { variant: "body2" },
        primary: __14("Add new page", "elementor")
      }
    )
  );
}

// src/components/top-bar/indicator.tsx
import * as React22 from "react";
import { Stack, Tooltip as BaseTooltip, Typography as Typography5 } from "@elementor/ui";
function Indicator({ title, status }) {
  return /* @__PURE__ */ React22.createElement(Tooltip2, { title }, /* @__PURE__ */ React22.createElement(Stack, { component: "span", direction: "row", alignItems: "center", spacing: 0.5 }, /* @__PURE__ */ React22.createElement(Typography5, { component: "span", variant: "body2", sx: { maxWidth: "120px" }, noWrap: true }, title), status.value !== "publish" && /* @__PURE__ */ React22.createElement(Typography5, { component: "span", variant: "body2", sx: { fontStyle: "italic" } }, "(", status.label, ")")));
}
function Tooltip2(props) {
  return /* @__PURE__ */ React22.createElement(
    BaseTooltip,
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
import * as React24 from "react";
import { __useNavigateToDocument as useNavigateToDocument5 } from "@elementor/editor-documents";
import { ListItemText as ListItemText6, MenuItem as MenuItem3 } from "@elementor/ui";

// src/components/top-bar/chip-doc-type.tsx
import * as React23 from "react";
import { PostTypeIcon as PostTypeIcon2 } from "@elementor/icons";
import { Chip } from "@elementor/ui";
var iconsMap2 = getIconsMap();
function DocTypeChip({ postType, docType, label }) {
  const color = "elementor_library" === postType ? "global" : "primary";
  const Icon = iconsMap2[docType] || PostTypeIcon2;
  return /* @__PURE__ */ React23.createElement(
    Chip,
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
  const navigateToDocument = useNavigateToDocument5();
  const postTitle = useReverseHtmlEntities(post.title);
  return /* @__PURE__ */ React24.createElement(
    MenuItem3,
    {
      disabled: !post.user_can.edit,
      onClick: async () => {
        closePopup();
        await navigateToDocument(post.id);
      },
      ...props
    },
    /* @__PURE__ */ React24.createElement(
      ListItemText6,
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
  const activeDocument = useActiveDocument4();
  const hostDocument = useHostDocument();
  const document2 = activeDocument && activeDocument.type.value !== "kit" ? activeDocument : hostDocument;
  const { data } = useRecentPosts();
  const getRecentPosts = () => {
    if (!data) {
      return [];
    }
    return data.filter((post) => post.id !== document2?.id).splice(0, NUMBER_OF_RECENT_POSTS - 1);
  };
  const recentPosts = getRecentPosts();
  const popupState = usePopupState2({
    variant: "popover",
    popupId: "elementor-v2-top-bar-recently-edited"
  });
  const documentTitle = useReverseHtmlEntities(document2?.title);
  if (!document2) {
    return null;
  }
  const buttonProps = bindTrigger2(popupState);
  return /* @__PURE__ */ React25.createElement(React25.Fragment, null, /* @__PURE__ */ React25.createElement(
    Button4,
    {
      color: "inherit",
      size: "small",
      endIcon: /* @__PURE__ */ React25.createElement(ChevronDownIcon2, { fontSize: "small" }),
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
    Menu2,
    {
      MenuListProps: {
        subheader: /* @__PURE__ */ React25.createElement(ListSubheader, { color: "primary", sx: { fontStyle: "italic", fontWeight: "300" } }, __15("Recent", "elementor"))
      },
      PaperProps: { sx: { mt: 2.5, width: 320 } },
      ...bindMenu2(popupState)
    },
    recentPosts.map((post) => /* @__PURE__ */ React25.createElement(PostListItem2, { key: post.id, post, closePopup: popupState.close })),
    recentPosts.length === 0 && /* @__PURE__ */ React25.createElement(MenuItem4, { disabled: true }, /* @__PURE__ */ React25.createElement(
      ListItemText7,
      {
        primaryTypographyProps: {
          variant: "caption",
          fontStyle: "italic"
        },
        primary: __15("There are no other pages or templates on this site yet.", "elementor")
      }
    )),
    /* @__PURE__ */ React25.createElement(Divider4, { disabled: recentPosts.length === 0 }),
    /* @__PURE__ */ React25.createElement(CreatePostListItem, { closePopup: popupState.close })
  ));
}

// src/env.ts
import { parseEnv } from "@elementor/env";
var { env } = parseEnv("@elementor/editor-site-navigation", (envData) => {
  return envData;
});

// src/hooks/use-toggle-button-props.ts
import { PagesIcon } from "@elementor/icons";
import { __ as __16 } from "@wordpress/i18n";
function useToggleButtonProps() {
  const { isOpen: selectedState, isBlocked } = usePanelStatus();
  const { open, close } = usePanelActions();
  return {
    title: __16("Pages", "elementor"),
    icon: PagesIcon,
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
    __registerPanel(panel);
    registerButton();
  }
}
function registerTopBarMenuItems() {
  injectIntoPageIndication({
    id: "document-recently-edited",
    component: RecentlyEdited
  });
}
function registerButton() {
  toolsMenu.registerToggleAction({
    id: "toggle-site-navigation-panel",
    priority: 2,
    useProps: useToggleButtonProps
  });
}
export {
  extendIconsMap,
  init
};
