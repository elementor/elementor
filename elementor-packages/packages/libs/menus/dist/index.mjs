// src/create-menu.ts
import { createLocation } from "@elementor/locations";

// src/create-register-item.tsx
import * as React from "react";
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
import { useMemo } from "react";
function createUseMenuItems(locations) {
  return () => {
    return useMemo(() => {
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
    acc[group] = createLocation();
    return acc;
  }, {});
}
function createRegisterFns(locations, components) {
  return Object.entries(components).reduce(
    (acc, [key, component]) => {
      const name = `register${capitalize(key)}`;
      return {
        ...acc,
        [name]: createRegisterItem(locations, component)
      };
    },
    {}
  );
}
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
export {
  createMenu
};
//# sourceMappingURL=index.mjs.map