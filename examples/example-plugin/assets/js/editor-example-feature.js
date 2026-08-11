( function () {
	window.elementorV2 = window.elementorV2 || {};

	window.elementorV2.editorExampleFeature = {
		init: function () {
			var appBar = window.elementorV2.editorAppBar;
			var React = window.React;

			if ( appBar && appBar.injectIntoPageIndication && React ) {
				var ExampleIndicator = function () {
					return React.createElement(
						'span',
						{
							style: {
								fontSize: '11px',
								fontWeight: 500,
								opacity: 0.85,
							},
						},
						'Example Plugin'
					);
				};

				appBar.injectIntoPageIndication( {
					id: 'example-plugin-indicator',
					component: ExampleIndicator,
				} );
			}

			var editorVariables = window.elementorV2.editorVariables;
			var stringPropTypeUtil = window.elementorV2.editorProps && window.elementorV2.editorProps.stringPropTypeUtil;

			if ( ! editorVariables || ! editorVariables.registerVariableType || ! stringPropTypeUtil ) {
				return;
			}

			var shadowVariablePropTypeUtil = {
				key: 'global-shadow-variable',
				create: function ( value ) {
					return {
						$$type: 'global-shadow-variable',
						value: value,
					};
				},
				validate: function ( propValue ) {
					return propValue && propValue.$$type === 'global-shadow-variable' && 'string' === typeof propValue.value;
				},
				generate: function ( value ) {
					return this.create( value );
				},
			};

			editorVariables.registerVariableType( {
				key: shadowVariablePropTypeUtil.key,
				icon: window.elementorV2.icons && window.elementorV2.icons.BrushIcon,
				propTypeUtil: shadowVariablePropTypeUtil,
				fallbackPropTypeUtil: stringPropTypeUtil,
				variableType: 'shadow',
				defaultValue: '0 2px 4px rgba(0,0,0,0.1)',
				styleTransformer: editorVariables.variableTransformer,
			} );
		},
	};

	window.elementorV2.editorExampleFeature?.init?.();
}() );
