<?php

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Fragments\Heading_Title;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

return V3_Widget_Map::make( 'theme-archive-title' )
	->description( 'Title of the current archive (category, tag, author, date or search results), for archive templates. title holds the Archive Title dynamic tag by default; a static title replaces it on every archive.' )
	->settings( Heading_Title::settings() )
	->default_target( Heading_Title::title_target( 'The title text of the current archive.' ) )
	->targets( Heading_Title::link_target() );
