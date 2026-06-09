<?php

namespace Elementor\Modules\AtomicWidgets\CssConverter;

use Elementor\Core\Utils\Api\Error_Builder;
use Elementor\Core\Utils\Api\Response_Builder;
use Elementor\Modules\AtomicWidgets\CssConverter\Metrics\Null_Failure_Reporter;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Css_Converter_REST_API {
	const API_NAMESPACE = 'elementor/v1';
	const API_BASE = 'css-to-atomic';

	public function register_hooks() {
		add_action( 'rest_api_init', fn() => $this->register_routes() );
	}

	private function register_routes() {
		register_rest_route( self::API_NAMESPACE, '/' . self::API_BASE, [
			[
				'methods' => 'POST',
				'callback' => fn( $request ) => $this->route_wrapper( fn() => $this->convert( $request ) ),
				'permission_callback' => fn() => current_user_can( 'edit_posts' ),
				'args' => [
					'blocks' => [
						'type' => 'object',
						'required' => true,
					],
				],
			],
		] );
	}

	private function convert( \WP_REST_Request $request ) {
		$blocks = $request->get_param( 'blocks' );

		if ( ! is_array( $blocks ) ) {
			return Error_Builder::make( 'invalid_blocks' )
				->set_status( 400 )
				->set_message( __( 'The "blocks" parameter must be an object of named CSS blocks.', 'elementor' ) )
				->build();
		}

		$converter = new Css_Converter(
			Converter_Registry_Factory::create(),
			new Null_Failure_Reporter(),
			Expander_Registry_Factory::create()
		);

		$results = [];

		foreach ( $blocks as $name => $block ) {
			if ( is_string( $block ) ) {
				$results[ $name ] = $this->convert_css_text( $converter, $block );
				continue;
			}

			if ( ! is_array( $block ) ) {
				return Error_Builder::make( 'invalid_block' )
					->set_status( 400 )
					->set_message( __( 'Each block must be a CSS text string or a property declaration map.', 'elementor' ) )
					->build();
			}

			$results[ $name ] = $this->convert_block( $converter, $block );
		}

		return Response_Builder::make( $results )->build();
	}

	/**
	 * @return array{props: object, customCss: string, rejected: string[]}
	 */
	private function convert_css_text( Css_Converter $converter, string $css ): array {
		$result = $converter->convert( $css );

		return [
			'props'     => (object) $result['props'],
			'customCss' => $result['customCss'],
			'rejected'  => $result['rejected'],
		];
	}

	/**
	 * A block is a property->value map. A null value is an explicit reset: it bypasses CSS conversion
	 * and is emitted as a null prop so the editor restores the property to its default. Every non-null
	 * value is serialized back into a CSS declaration for the converter.
	 *
	 * @param Css_Converter              $converter    The shared CSS converter.
	 * @param array<string, string|null> $declarations The block's property->value map.
	 * @return array{props: object, customCss: string, rejected: string[]}
	 */
	private function convert_block( Css_Converter $converter, array $declarations ): array {
		$resets = [];
		$css_declarations = [];

		foreach ( $declarations as $property => $value ) {
			if ( null === $value ) {
				$resets[ $property ] = null;
				continue;
			}

			$css_declarations[] = $property . ': ' . $value . ';';
		}

		$result = $converter->convert( implode( ' ', $css_declarations ) );

		return [
			'props'     => (object) array_merge( $result['props'], $resets ),
			'customCss' => $result['customCss'],
			'rejected'  => $result['rejected'],
		];
	}

	private function route_wrapper( callable $cb ) {
		try {
			$response = $cb();
		} catch ( \Exception $e ) {
			return Error_Builder::make( 'unexpected_error' )
				->set_message( __( 'Something went wrong', 'elementor' ) )
				->build();
		}

		return $response;
	}
}
