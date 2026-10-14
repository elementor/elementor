<?php

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Fragments\Border_Group;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Fragments\Box_Shadow_Group;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Fragments\Typography_Group;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Style_Target;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Control;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Setting;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$image = Style_Target::make( 'image' )
	->label( 'Main product image' )
	->selector( '.flex-viewport' )
	->with( Border_Group::from_prefix( 'image_border' ) )
	->bind( 'border-radius', V3_Control::bind_to( 'image_border_radius' )->responsive() )
	->bind( 'margin', V3_Control::bind_to( 'spacing' )->sides( 'block-end' ) );

$thumbs = Style_Target::make( 'thumbs' )
	->label( 'Gallery thumbnails' )
	->selector( '.flex-control-thumbs img' )
	->with( Border_Group::from_prefix( 'thumbs_border' ) )
	->bind( 'border-radius', V3_Control::bind_to( 'thumbs_border_radius' )->responsive() );

return V3_Widget_Map::make( 'woocommerce-product-images' )
	->description( 'Image gallery of the current WooCommerce product, with thumbnails and an optional sale badge.' )
	->settings( [
		'sale_flash' => V3_Setting::bind_to( 'sale_flash' )->switcher(),
	] )
	->default_target( $image )
	->targets( $thumbs );
