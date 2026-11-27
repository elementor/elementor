<?php

namespace Elementor\Modules\Agents\Classes;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Robots_Txt_Parser {

	const WILDCARD_AGENT = '*';

	const FIELD_USER_AGENT = 'user-agent';

	const FIELD_ALLOW = 'allow';

	const FIELD_DISALLOW = 'disallow';

	/**
	 * @return array{ wildcard_rules: string[], user_agents: string[] }
	 */
	public function parse( string $content ): array {
		$wildcard_rules = [];
		$user_agents    = [];
		$group_agents   = [];
		$group_has_rule = false;

		foreach ( preg_split( '/\R/', $content ) as $line ) {
			$field = $this->parse_line( $line );

			if ( null === $field ) {
				continue;
			}

			[ $name, $value ] = $field;

			if ( self::FIELD_USER_AGENT === $name ) {
				if ( $group_has_rule ) {
					$group_agents   = [];
					$group_has_rule = false;
				}

				$group_agents[] = strtolower( $value );

				if ( self::WILDCARD_AGENT !== $value ) {
					$user_agents[] = strtolower( $value );
				}

				continue;
			}

			if ( ! in_array( $name, [ self::FIELD_ALLOW, self::FIELD_DISALLOW ], true ) ) {
				continue;
			}

			$group_has_rule = true;

			if ( '' !== $value && in_array( self::WILDCARD_AGENT, $group_agents, true ) ) {
				$wildcard_rules[] = ucfirst( $name ) . ': ' . $value;
			}
		}

		return [
			'wildcard_rules' => array_values( array_unique( $wildcard_rules ) ),
			'user_agents'    => array_values( array_unique( $user_agents ) ),
		];
	}

	/**
	 * @return array{ 0: string, 1: string }|null
	 */
	private function parse_line( string $line ): ?array {
		$line = trim( explode( '#', $line, 2 )[0] );

		if ( false === strpos( $line, ':' ) ) {
			return null;
		}

		[ $name, $value ] = explode( ':', $line, 2 );

		return [ strtolower( trim( $name ) ), trim( $value ) ];
	}
}
