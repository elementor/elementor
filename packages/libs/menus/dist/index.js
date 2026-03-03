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
  controlActionsMenu: () => controlActionsMenu,
  createMenu: () => createMenu
});
module.exports = __toCommonJS(index_exports);

// src/create-menu.ts
var import_locations = require("@elementor/locations");
var import_utils = require("@elementor/utils");

// src/create-register-item.tsx
var React = __toESM(require("react"));
function createRegisterItem(locations, component) {
  return ({ id, group = "default", priority = 10, overwrite = false, props: _props, useProps: _useProps }) => {
    if (!(group in locations)) {
      return;
    }
    const Component = component;
    const useProps = _useProps || (() => _props);
    const InjectedComponent = (props) => {
      const componentProps = useProps();
      return /* @__PURE__ */ React.createElement(Component, { ...props, ...componentProps });
    };
    locations[group].inject({
      id,
      component: InjectedComponent,
      options: {
        priority,
        overwrite
      }
    });
  };
}

// src/create-use-menu-items.ts
var import_react = require("react");
function createUseMenuItems(locations) {
  return () => {
    return (0, import_react.useMemo)(() => {
      return Object.entries(locations).reduce((carry, [groupName, location]) => {
        const items = location.getInjections().map((injection) => ({
          id: injection.id,
          MenuItem: injection.component
        }));
        return {
          ...carry,
          [groupName]: items
        };
      }, {});
    }, []);
  };
}

// src/create-menu.ts
function createMenu({
  groups = [],
  components
}) {
  const locations = createLocations([...groups, "default"]);
  const registerFns = createRegisterFns(locations, components);
  const useMenuItems = createUseMenuItems(locations);
  return {
    useMenuItems,
    ...registerFns
  };
}
function createLocations(groups) {
  return groups.reduce((acc, group) => {
    acc[group] = (0, import_locations.createLocation)();
    return acc;
  }, {});
}
function createRegisterFns(locations, components) {
  return Object.entries(components).reduce(
    (acc, [key, component]) => {
      const name = `register${(0, import_utils.capitalize)(key)}`;
      return {
        ...acc,
        [name]: createRegisterItem(locations, component)
      };
    },
    {}
  );
}

// src/controls-actions.ts
var import_editor_ui = require("@elementor/editor-ui");

// src/action.tsx
var React2 = __toESM(require("react"));
var import_ui = require("@elementor/ui");
var SIZE = "tiny";
function Action({ title, visible = true, icon: Icon, onClick }) {
  if (!visible) {
    return null;
  }
  return /* @__PURE__ */ React2.createElement(import_ui.Tooltip, { placement: "top", title, arrow: true }, /* @__PURE__ */ React2.createElement(import_ui.IconButton, { "aria-label": title, size: SIZE, onClick }, /* @__PURE__ */ React2.createElement(Icon, { fontSize: SIZE })));
}

// src/controls-actions.ts
var controlActionsMenu = createMenu({
  components: {
    Action,
    PopoverAction: import_editor_ui.PopoverAction
  }
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  controlActionsMenu,
  createMenu
});
//# sourceMappingURL=index.js.map