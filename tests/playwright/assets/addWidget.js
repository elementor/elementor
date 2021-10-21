exports.addWidget = async (WidgetName) => {
  if (typeof WidgetName !== "string") {
    throw new Error('Step is missing "WidgetName" parameter value');
  }

  var eSection = $e.run(
    "document/elements/create",
    nonDeepCtorFix({
      model: { elType: "section" },
      columns: 1,
      container: elementor.getContainer("document"),
    })
  );

  var eWidget = $e.run(
    "document/elements/create",
    nonDeepCtorFix({
      model: { elType: "widget", widgetType: WidgetName },
      container: eSection.children[0],
    })
  );

  function nonDeepCtorFix(obj) {
    if (Object === window.Object) {
      return obj;
    }
    if (obj.constructor === Object) {
      obj.constructor = window.Object;
    }
    var keys = Object.keys(obj);
    for (var i = 0; i < keys.length; i++) {
      var value = obj[keys[i]];
      if (value.constructor === Object) {
        value.constructor = window.Object;
      }
    }
    return obj;
  }
};
