// src/use-mixpanel.ts
var useMixpanel = () => {
  const { dispatchEvent, config } = getMixpanel();
  return {
    dispatchEvent,
    config
  };
};
var trackEvent = (event) => {
  const { dispatchEvent } = getMixpanel();
  dispatchEvent?.(event.eventName, event);
};
var getMixpanel = () => {
  const eventsManager = window.elementorCommon?.eventsManager || {};
  return {
    dispatchEvent: eventsManager.dispatchEvent?.bind(eventsManager),
    config: eventsManager.config
  };
};
export {
  getMixpanel,
  trackEvent,
  useMixpanel
};
//# sourceMappingURL=index.mjs.map