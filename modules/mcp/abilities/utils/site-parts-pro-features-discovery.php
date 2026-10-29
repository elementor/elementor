<?php

namespace Elementor\Modules\Mcp\Abilities\Utils;

use Elementor\Modules\Mcp\Utils\Pro_Features_Discovery;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Site_Parts_Pro_Features_Discovery implements Widget_Pro_Features_Discovery {

	const UPGRADE_URL = 'https://go.elementor.com/go-pro-mcp-upgrade-site-parts/';

	const WIDGET_TYPE_PREFIX = 'theme-';

	const MESSAGES = [
		'opener' => 'Site parts need Elementor Pro, which isn\'t installed, so nothing was created.',
		'list' => 'Site parts can\'t be listed because Elementor Pro isn\'t installed, so no site parts were checked. Do not tell the user the site has no header, footer, or other site parts; that was not verified. Mention Elementor Pro only if the user\'s request is about a site part.',
		'overview' => [
			'value' => 'With Pro, site parts cover three things Free can\'t do: reusable parts (header, footer) built once and shown on every page; dynamic templates (post, page, archive, search results, loop item, product) where one design fills itself for every post; and site functionality (popups, a custom 404 page).',
			'free_path' => 'Free path: build it on the current page with native widgets and a global class. Tell the user it only appears on this page and must be added and updated on each page separately.',
		],
		'groups' => [
			[
				'types' => [ 'header', 'footer' ],
				'value' => 'What Pro gives the user: this %s is built once and appears on every page it\'s assigned to. Edits happen in one place.',
				'free_path' => 'Free path: build it on the current page with native widgets and a global class. Tell the user it only appears on this page and must be added and updated on each page separately.',
			],
			[
				'types' => [ 'single', 'single-post', 'single-page', 'archive', 'search-results', 'loop-item' ],
				'value' => 'What Pro gives the user: one %s design that fills itself with each post\'s own content, so every new post matches automatically.',
				'free_path' => 'Free path: style posts one by one in the editor. Tell the user each new post needs the same work.',
			],
			[
				'types' => [ 'popup' ],
				'value' => 'What Pro gives the user: a popup that opens on the trigger they want, like a click or exit intent, on the pages they choose.',
				'free_path' => 'Free path: none that matches. Offer a section on the page or a link to a separate page. Say plainly that Free can\'t do this.',
			],
			[
				'types' => [ 'error-404' ],
				'value' => 'What Pro gives the user: a custom 404 page in the site\'s design instead of the theme\'s default.',
				'free_path' => 'Free path: none. The theme\'s default 404 page stays. Say plainly that Free can\'t do this.',
			],
		],
	];

	public static function supports_widget( string $widget_type ): bool {
		return ! Utils::has_pro() && str_starts_with( $widget_type, self::WIDGET_TYPE_PREFIX );
	}

	public static function for_manage( array $operations ): \WP_Error {
		$requested_types = array_filter( array_column( $operations, 'type' ), 'is_string' );
		$matches = [];

		foreach ( self::MESSAGES['groups'] as $group ) {
			$types = array_values( array_intersect( $group['types'], $requested_types ) );

			if ( $types ) {
				$matches[] = [
					'value' => sprintf( $group['value'], wp_sprintf( '%l', $types ) ),
					'free_path' => $group['free_path'],
				];
			}
		}

		$matches = $matches ? $matches : [ self::MESSAGES['overview'] ];

		return Pro_Features_Discovery::error(
			implode( ' ', array_merge( [ self::MESSAGES['opener'] ], array_column( $matches, 'value' ) ) ),
			implode( ' ', array_column( $matches, 'free_path' ) ),
			self::UPGRADE_URL
		);
	}

	public static function for_widget(): \WP_Error {
		return self::for_manage( [] );
	}

	public static function for_list(): array {
		return [ 'llm_instructions' => self::MESSAGES['list'] ];
	}

	public static function get_types(): array {
		return array_merge( ...array_column( self::MESSAGES['groups'], 'types' ) );
	}
}
