<?php

namespace Elementor\Modules\Mcp\Abilities\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Warnings_Bag {

	/**
	 * @var array<array{code: string, config_id: ?string, message: string}>
	 */
	private array $warnings = [];

	public static function make(): self {
		return new self();
	}

	public static function get_details_schema(): array {
		return [
			'type' => 'array',
			'description' => 'One entry per warning. Every warning means one field was skipped or adjusted and the rest was saved; fix that field on config_id with a follow-up call.',
			'items' => [
				'type' => 'object',
				'properties' => [
					'code' => [ 'type' => 'string' ],
					'config_id' => [ 'type' => [ 'string', 'null' ] ],
					'message' => [ 'type' => 'string' ],
				],
			],
		];
	}

	public function add( string $code, string $message, ?string $config_id = null ): self {
		$this->warnings[] = [
			'code' => $code,
			'config_id' => $config_id,
			'message' => null === $config_id ? $message : sprintf( '[%s] %s', $config_id, $message ),
		];

		return $this;
	}

	public function merge( Warnings_Bag $other ): self {
		foreach ( $other->all() as $warning ) {
			$this->warnings[] = $warning;
		}

		return $this;
	}

	public function add_to_response( array $response ): array {
		if ( $this->is_empty() ) {
			return $response;
		}

		$response['warnings'] = $this->messages();
		$response['warning_details'] = $this->all();

		return $response;
	}

	public function is_empty(): bool {
		return empty( $this->warnings );
	}

	/**
	 * @return array<array{code: string, config_id: ?string, message: string}>
	 */
	public function all(): array {
		return $this->warnings;
	}

	/**
	 * @return string[]
	 */
	public function messages(): array {
		return array_column( $this->warnings, 'message' );
	}

	/**
	 * @return string[]
	 */
	public function codes(): array {
		return array_values( array_unique( array_column( $this->warnings, 'code' ) ) );
	}
}
