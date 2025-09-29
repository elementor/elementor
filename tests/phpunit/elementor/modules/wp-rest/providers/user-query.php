<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\WpRest\Providers;

use Elementor\Modules\WpRest\Classes\User_Query as User_Query_Class;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

trait User_Query {
	private $admin_id = 1;
	private $count = -1;

	protected array $users;

	protected function clean() {
		foreach ( $this->users as $user ) {
			wp_delete_user( $user->ID );
		}

		foreach ( get_users( [
			'exclude' => [ $this->admin_id ],
			'number' => $this->count,
		] ) as $user ) {
			wp_delete_user( $user->ID );
		}

		$this->count = -1;
		$this->users = [];
	}

	protected function init() {
		foreach ( get_users() as $user ) {
			wp_delete_user( $user->ID );
		}

		$this->create_users();
	}

	private function create_users() {
		$this->count = 0;

		$this->users = [
			$this->insert_user( 'john_doeski', 'administrator' ),
			$this->insert_user( 'mike_editor', 'editor' ),
			$this->insert_user( 'emma_bloggerski', 'author' ),
			$this->insert_user( 'alice_visitor', 'subscriber' ),
		];
	}

	private function insert_user( $name, $role ) {
		$this->count++;

		return $this->factory()->user->create_and_get( [
			'user_login' => $name,
			'display_name' => implode( ' ', explode( '_', $name ) ),
			'user_email' => $name . '@test.com',
			'user_pass' => 'password',
			'role' => $role,
		] );
	}

	public function data_provider_user_query() {
		return [
			[
				'params' => array_merge( User_Query_Class::build_query_params( [
					User_Query_Class::KEYS_CONVERSION_MAP_KEY => [
						'ID' => 'id',
						'display_name' => 'label',
						'role' => 'groupLabel',
					],
				] ), [ User_Query_Class::SEARCH_TERM_KEY => 'ski' ] ),
				'expected' => [
					[
						'id' => $this->users[0]->ID,
						'label' => $this->users[0]->display_name,
						'groupLabel' => ucfirst( $this->users[0]->roles[0] ),
					],
					[
						'id' => $this->users[2]->ID,
						'label' => $this->users[2]->display_name,
						'groupLabel' => ucfirst( $this->users[2]->roles[0] ),
					],
				],
			],
			[
				'params' => array_merge( User_Query_Class::build_query_params( [
					User_Query_Class::KEYS_CONVERSION_MAP_KEY => [
						'ID' => 'my_id',
						'display_name' => 'my_name',
					],
				] ), [ User_Query_Class::SEARCH_TERM_KEY => $this->users[1]->ID ] ),
				'expected' => [
					[
						'my_id' => $this->users[1]->ID,
						'my_name' => $this->users[1]->display_name,
					],
				],
			],
			[
				'params' => array_merge( User_Query_Class::build_query_params( [
					User_Query_Class::KEYS_CONVERSION_MAP_KEY => [
						'ID' => 'my_id',
						'display_name' => 'my_name',
					],
				] ), [ User_Query_Class::SEARCH_TERM_KEY => 'tom' ] ),
				'expected' => [],
			],
		];
	}
}
