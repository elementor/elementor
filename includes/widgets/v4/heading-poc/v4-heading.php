<?php

namespace Elementor\V4\Widgets;

class V4Heading {

	public static function define( $context ) {
		$context
			->title( 'V4 Heading' )
			->name( 'v4-heading' )
			->atomic();
	}

	public static function define_properties( $context ) {
		$context
			->property( 'title' )
			->kind( 'text_area' )
			->label( 'Title' )
			->placeholder( 'Enter your title here' )
			->default( 'Enter your title here' );

		$context
			->property( 'tag' )
			->section( 'Content' )
			->kind( 'select' )
			->label( 'Tag' )
			->options(array(
				'H1' => 'h1',
				'H2' => 'h2',
				'H3' => 'h3',
				'H4' => 'h4',
				'H5' => 'h5',
				'H6' => 'h6',
			))
			->default( 'h2' );
	}

	public static function define_renderer( $context ) {
		$context
			->twig( __DIR__ . '/heading.twig' );
	}
}

add_action('elementor/widgets/define', function ( $ctx ) {
	$ctx->register( V4Heading::class );
});
