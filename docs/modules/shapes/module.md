# Shapes Module - `module.php`

## Technical Description:

This class is the main shapes module of Elementor, and it's responsible for all of the widgets which uses SVG shapes as their main feature.

As of writing those lines, the current widgets under this module are:
- [Text Path](widgets/text-path.md)

## Functions Reference:

- `get_paths( $add_custom )` - Returns a translated user-friendly list of the available SVG paths.

  Passing `true` as a parameter will also append a 'Custom' option to the list in order to use with a `SELECT` control type.


- `get_path_svg( $path )` - Gets an SVG path name as a parameter and returns its SVG markup from the `svg-paths/` folder

	under the assets directory.
