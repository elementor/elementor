<?php

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Fragments\Heading_Title;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

return V3_Widget_Map::make( 'theme-post-title' )
	->description( 'Title of the current post, for single post templates. title holds the Post Title dynamic tag by default; a static title replaces it on every post. Prefer `e-heading` with a `post-title` dynamic tag; use this V3 widget only when the V4 equivalent is not viable.' )
	->settings( Heading_Title::settings() )
	->default_target( Heading_Title::title_target( 'The title text of the current post. Not rendered on a page whose Hide Title setting is on.' ) )
	->targets( Heading_Title::link_target() );
