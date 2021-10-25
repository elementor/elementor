exports.addWidget = async ( WidgetName ) => {
  if ( typeof WidgetName !== 'string' ) {
    throw new Error( 'Step is missing "WidgetName" parameter value' );
  }

  const eSection = $e.run(
    'document/elements/create',
    {
      model: { elType: 'section' },
      columns: 1,
      container: elementor.getContainer( 'document' ),
    }
  );

  const eWidget = $e.run(
    'document/elements/create',
    {
      model: { elType: 'widget', widgetType: WidgetName },
      container: eSection.children[ 0 ],
    }
  );
};
