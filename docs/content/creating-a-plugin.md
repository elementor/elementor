# Creating a Plugin

But before we start, let's examine the proper way to write code in Elementor.

### Code standard
The code should be written in accordance with the [WordPress code standards](https://codex.wordpress.org/WordPress_Coding_Standards). (This is [how you can define a check for code standard in PHPStorm](https://kellenmace.com/set-up-php-codesniffer-in-phpstorm-with-wordpress-coding-standards/)).

### File names
The name of the file that runs the plugin should be in-tune with the plugin folder name. For example: `plugin-name/plugin-name.php`

### Domain names
We recommend using autoloader and namespace according to the [PSR-2](http://www.php-fig.org/psr/psr-2/) standard.


### Translation
The texts oriented for the user should be written in English, while using the WordPress translation function:  `__()` / `_e()`.

The translation domain should be consistent with the plugin name. For example: `plugin-name` and not initials: `pn`.

### Readme
The Readme file should be written in a clear manner.

It is recommended to include the 'Elementor' tag so the plugin turns up in search results in the WordPress repository.

You should write the minimal version of Elementor required for the plugin to work, and also what is the latest Elementor version the plugin was tested for:

``` 
/**
* Plugin Name: ...
* ...
* Elementor requires at least: 1.0.0
* Elementor tested up to: 1.3.2
*/
```

### Security aspects
Every PHP file should begin with a check that there is no direct access to the file:

```php
if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly.
```
