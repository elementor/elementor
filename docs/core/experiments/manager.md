# Experiments Manager

Since some of Elementor's features are still being worked on, and to avoid any potential issues,
Elementor has given the users an option of switching them on and off and testing how they impact the site.
The users will be able to try out these features in a safe environment and influence future releases.

## Product Knowledge Base:

- [Elementor Experiments - Developers Center](https://developers.elementor.com/elementor-experiments/)


- [Elementor Experiments - Help Center](https://elementor.com/help/features/experiments/)


- [Introducing experiments in Elementor 3.1](https://elementor.com/blog/introducing-elementor-3-1/)


## Technical Description:

This is the Experiments Manager of Elementor. It registers and manages all the experimental features in Elementor.

Each module (`Elementor\Core\Base\Module`) can register its own experiments using the static `get_experimental_data()` method:

```PHP
// modules/admin-top-bar/module.php

public static function get_experimental_data() {
	return [
		'name' => 'admin-top-bar',
		'title' => esc_html__( 'Admin Top Bar', 'elementor' ),
		'description' => esc_html__( 'Adds a top bar to elementor pages in admin area.', 'elementor' ),
		'release_status' => Elementor\Core\Experiments\Manager::RELEASE_STATUS_BETA,
		'new_site' => [
			'default_active' => true,
		],
	];
}
```

In addition, it's possible work directly with the manager in order to register an experiment using `\Elementor\Plugin::instance()->experiments->add_feature()`:

```PHP
// core/experiments/manager.php

\Elementor\Plugin::instance()->experiments->add_feature( [
	'name' => 'a11y_improvements',
	'title' => esc_html__( 'Accessibility Improvements', 'elementor' ),
	'description' => esc_html__( 'Accessibility Improvements Description', 'elementor' ),
	'release_status' => Elementor\Core\Experiments\Manager::RELEASE_STATUS_BETA,
	'new_site' => [
		'default_active' => true,
		'minimum_installation_version' => '3.1.0-beta',
	],
] );
```

Using both of the above methods, properties like the experiment name, description and release status (alpha, beta, dev, etc.) can be set,
default state (active / inactive) and more! Even a callback could be supplied to run when the feature state has changed! 
(using the `on_state_change` key in the experiment settings array).

### Available Options:
| Option                                    | Type																																						| Default					| Description
|:------------------------------------------| :---------------------------------------------------------------------------------------------------------------------------------------------------------| :-------------------------| :-------------  
| `description`                       	    | `{String}`																																				| `''`						| Description that will be shown in the admin panel.
| `release_status`                    	    | `{String}` Constant, one of: `RELEASE_STATUS_DEV`, `RELEASE_STATUS_ALPHA`, `RELEASE_STATUS_BETA`, `RELEASE_STATUS_RC`, `RELEASE_STATUS_STABLE`.			| `RELEASE_STATUS_ALPHA`	| Experiment release status.
| `default`                    		  	    | `{String}` Constant, one of: `STATE_ACTIVE`, `STATE_INACTIVE`.																							| `STATE_INACTIVE`			| Default state (active/inactive). 
| `new_site`                    	  	    | `{Array}`																																					| 							| Experiment settings for new sites.
| `new_site.default_active`                 | `{Boolean}`																																				| `false`					| Whether the experiment is active by default.
| `new_site.always_active`			  	    | `{Boolean}`																																				| `false`					| Whether the experiment is active and the state immutable.
| `new_site.minimum_installation_version`	| `{String}`																																				| `null`					| Minimum version to determine if the current installation is a new one. 
| `on_state_change`							| `{Callable}`																																				| `null`					| A callback that runs on each state change. 
| `hidden`							        | `{Boolean}`																																				| `false`					| Whether the experiment is displayed to the end user.

Then, the experiment state (active or inactive) can be checked directly through the manager:

### PHP:
```php
Plugin::instance()->experiments->is_feature_active( 'feature-name' );

// OR in the Pro version:

Plugin::elementor()->experiments->is_feature_active( 'feature-name' );
```

### JS:
```js
elementorCommon.config.experimentalFeatures[ 'feature-name' ];

// OR in frontend pages:

elementorFrontend.config.experimentalFeatures[ 'feature-name' ];
```


## Attention Needed / Known Issues:

- Make sure to load the assets ONLY WHEN THE EXPERIMENT IS ACTIVE, or it might cause unexpected behaviors and will send
  unnecessary code to the end-user (which in turn will slow down the website and ruin the user experience).
  

- Handle the release status & default state carefully - the production could be broken due to untested alpha-state feature.

  As a rule of thumb - Don't ship alpha features as active by default. 


- There is also an option register a default experiment (usually a core code which doesn't have a dedicated module) using the
  `add_default_features()` method in the `core/experiments/manager.php` file.


___

See also:

- [Webpack Dynamic Imports](https://webpack.js.org/guides/code-splitting/#dynamic-imports)
  

- [Webpack and Dynamic Imports: Doing it Right](https://medium.com/front-end-weekly/webpack-and-dynamic-imports-doing-it-right-72549ff49234)


- [What are Dynamic Imports and how to use them?](https://www.initialyze.com/blog/2020/11/what-are-dynamic-imports-and-how-to-use-them/)
