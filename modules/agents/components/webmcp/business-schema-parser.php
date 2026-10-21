<?php

namespace Elementor\Modules\Agents\Components\Webmcp;

use Elementor\Modules\Agents\Prompt_Injection_Sanitizer;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Business_Schema_Parser {

	const JSON_LD_PATTERN = '#<script[^>]+type=["\']application/ld\+json["\'][^>]*>(.*?)</script>#is';

	const BUSINESS_TYPES = [
		'Organization',
		'Corporation',
		'LocalBusiness',
		'OnlineStore',
		'Store',
		'Restaurant',
		'ProfessionalService',
		'Place',
	];

	const BUSINESS_TYPE_SUFFIX = 'Business';

	const STREET_ADDRESS_FIELD = 'streetAddress';

	const ADDRESS_FIELDS = [ self::STREET_ADDRESS_FIELD, 'addressLocality', 'addressRegion', 'postalCode', 'addressCountry' ];

	const MAX_TEXT_LENGTH = 300;

	const MAX_SOCIAL_PROFILES = 10;

	const MAX_OPENING_HOURS = 14;

	private Prompt_Injection_Sanitizer $sanitizer;

	public function __construct( Prompt_Injection_Sanitizer $sanitizer ) {
		$this->sanitizer = $sanitizer;
	}

	public function parse( string $html ): array {
		$nodes = array_values( array_filter( $this->collect_nodes( $html ), [ $this, 'is_business_node' ] ) );

		return array_filter( [
			'name' => $this->first_text( $nodes, 'name' ),
			'telephone' => $this->first_text( $nodes, 'telephone' ),
			'email' => $this->first_email( $nodes ),
			'address' => $this->first_address( $nodes ),
			'opening_hours' => $this->collect_opening_hours( $nodes ),
			'social_profiles' => $this->collect_social_profiles( $nodes ),
		] );
	}

	private function collect_nodes( string $html ): array {
		if ( ! preg_match_all( self::JSON_LD_PATTERN, $html, $matches ) ) {
			return [];
		}

		$nodes = [];

		foreach ( $matches[1] as $json ) {
			$decoded = json_decode( trim( $json ), true );

			if ( is_array( $decoded ) ) {
				$nodes = array_merge( $nodes, $this->flatten( $decoded ) );
			}
		}

		return $nodes;
	}

	private function flatten( array $document ): array {
		if ( isset( $document['@graph'] ) && is_array( $document['@graph'] ) ) {
			return $this->flatten( $document['@graph'] );
		}

		if ( isset( $document['@type'] ) ) {
			return [ $document ];
		}

		$nodes = [];

		foreach ( $document as $item ) {
			if ( is_array( $item ) ) {
				$nodes = array_merge( $nodes, $this->flatten( $item ) );
			}
		}

		return $nodes;
	}

	private function is_business_node( array $node ): bool {
		foreach ( (array) $node['@type'] as $type ) {
			if ( ! is_string( $type ) ) {
				continue;
			}

			if ( in_array( $type, self::BUSINESS_TYPES, true ) || str_ends_with( $type, self::BUSINESS_TYPE_SUFFIX ) ) {
				return true;
			}
		}

		return false;
	}

	private function first_text( array $nodes, string $key ): string {
		foreach ( $nodes as $node ) {
			$text = $this->to_text( $node[ $key ] ?? '' );

			if ( '' !== $text ) {
				return $text;
			}
		}

		return '';
	}

	private function first_email( array $nodes ): string {
		foreach ( $nodes as $node ) {
			$email = sanitize_email( preg_replace( '/^mailto:/i', '', $this->to_text( $node['email'] ?? '' ) ) );

			if ( '' !== $email ) {
				return $email;
			}
		}

		return '';
	}

	/**
	 * Schema.org allows a plain text address, which is kept as the street address
	 * so agents always get the same shape.
	 *
	 * @return array<string, string> Keyed by PostalAddress field.
	 */
	private function first_address( array $nodes ): array {
		foreach ( $nodes as $node ) {
			$address = $node['address'] ?? '';

			if ( ! is_array( $address ) ) {
				$address = [ self::STREET_ADDRESS_FIELD => $address ];
			}

			$address = array_filter( array_map(
				fn( $field ) => $this->to_text( $address[ $field ] ?? '' ),
				array_combine( self::ADDRESS_FIELDS, self::ADDRESS_FIELDS )
			) );

			if ( ! empty( $address ) ) {
				return $address;
			}
		}

		return [];
	}

	/**
	 * @return string[]
	 */
	private function collect_opening_hours( array $nodes ): array {
		$hours = [];

		foreach ( $nodes as $node ) {
			foreach ( $this->to_list( $node['openingHoursSpecification'] ?? [] ) as $specification ) {
				$hours[] = $this->format_specification( (array) $specification );
			}

			foreach ( $this->to_list( $node['openingHours'] ?? [] ) as $line ) {
				$hours[] = $this->to_text( $line );
			}
		}

		return array_slice( array_values( array_unique( array_filter( $hours ) ) ), 0, self::MAX_OPENING_HOURS );
	}

	private function format_specification( array $specification ): string {
		$days = array_map(
			fn( $day ) => basename( $this->to_text( $day ) ),
			$this->to_list( $specification['dayOfWeek'] ?? [] )
		);

		$range = trim( $this->to_text( $specification['opens'] ?? '' ) . '-' . $this->to_text( $specification['closes'] ?? '' ), '-' );

		return trim( implode( ', ', $days ) . ' ' . $range );
	}

	/**
	 * @return string[]
	 */
	private function collect_social_profiles( array $nodes ): array {
		$profiles = [];

		foreach ( $nodes as $node ) {
			foreach ( $this->to_list( $node['sameAs'] ?? [] ) as $url ) {
				$profiles[] = is_string( $url ) ? esc_url_raw( $url, [ 'http', 'https' ] ) : '';
			}
		}

		return array_slice( array_values( array_unique( array_filter( $profiles ) ) ), 0, self::MAX_SOCIAL_PROFILES );
	}

	private function to_list( $value ): array {
		if ( ! is_array( $value ) ) {
			return '' === $value ? [] : [ $value ];
		}

		return array_is_list( $value ) ? $value : [ $value ];
	}

	private function to_text( $value ): string {
		if ( ! is_scalar( $value ) ) {
			return '';
		}

		$text = trim( wp_strip_all_tags( (string) $value ) );

		return $this->sanitizer->sanitize( mb_substr( $text, 0, self::MAX_TEXT_LENGTH ) );
	}
}
