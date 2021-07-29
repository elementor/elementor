# Experiments Manager

Since some of our features are still being worked on, and to avoid any potential issues,
we’ve given you the option of switching them on and off and testing how they impact your site.
You’ll be able to try out these features in a safe environment and influence future releases.

## Product Knowledge Base:

- [Elementor Experiments - Developers Center](https://developers.elementor.com/elementor-experiments/)


- [Elementor Experiments - Help Center](https://elementor.com/help/features/experiments/)


- [Introducing experiments in Elementor 3.1](https://elementor.com/blog/introducing-elementor-3-1/)


## Technical Description:

This is the Experiment Manager of Elementor. It registers and manages all the experimental features in Elementor.

Each module (`Elementor\Core\Base\Module`) can register its own experiments using the static `get_experimental_data()` method.

In addition, you can "talk" directly to the manager in order to register an experiment using `Plugin::instance()->experiments->add_feature()`.

Using both of the above methods, you can set the experiment name, description, release status (alpha, beta, dev, etc.),
default state (active / inactive) and more! You can even pass a callback to run when the feature state has changed!

Then, in order to check whether the experiment is active or not, you can ask the manager:

### PHP:
```php
Plugin::instance()->experiments->is_feature_active( 'your-feature-name' );

// OR in the Pro version:

Plugin::elementor()->experiments->is_feature_active( 'your-feature-name' );
```

### JS:
```js
elementorCommon.config.experimentalFeatures[ 'your-feature-name' ];

// OR in frontend pages:

elementorFrontend.config.experimentalFeatures[ 'your-feature-name' ];
```


## Attention Needed / Known Issues:

- Make sure to load your assets ONLY WHEN THE EXPERIMENT IS ACTIVE, or it might cause unexpected behaviors and will send
  unnecessary code to the end-user (which in turn will slow down the website and ruin the user experience).
  

- Handle the release status & default state carefully - you don't want to break production with an untested alpha-state feature.

  As a rule of thumb - Don't ship alpha features as active by default. 


- You can also register a default experiment (usually a core code which doesn't have a dedicated module) using the `add_default_features()` method.
