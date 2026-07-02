# PHPUnit

PHPUnit is the testing framework used for all PHP unit tests in this project. Tests live in `tests/phpunit/` and are organized by module/feature.

## Prerequisites

- [Docker](https://www.docker.com/) — runs the MySQL server in a container (no local MySQL server or client tools required)
- [Composer](https://getcomposer.org/) — see the composer guide next to this one
- [SVN](https://subversion.apache.org/) — required to pull the WordPress test suite

Check whether SVN is already installed: `which svn`. If it prints a path (for example `/usr/bin/svn`), skip the install step below.

Install SVN on Mac: `brew install svn`  
Install SVN on Linux: `sudo apt-get install subversion`

## Running tests locally

### Full suite

```bash
composer run phpunit:local
```

This command handles everything: starts (or reuses) a MySQL Docker container, downloads WordPress core and the WP test suite into `/tmp/`, then runs all tests.

### Single test class or method

```bash
# All tests in a class
composer run phpunit:local -- Test_Module

# Single method
composer run phpunit:local -- Test_Module::test_get_favorites

# Partial match across any class (regex)
composer run phpunit:local -- test_get_favorites
```

The filter is matched against fully qualified test names, so a partial class or method name is enough.

### Run against a specific WordPress version

```bash
WP_VERSION=6.8 composer run phpunit:local
```

Supported versions: `latest`, `6.9`, `6.8` (matching CI).

## How CI runs tests

CI runs on every PR and merge group where PHP-related files changed (`.php`, `.twig`, `composer.json/lock`), and on a daily schedule (weekdays 08:30 UTC).

| Job | WordPress versions | PHP versions |
|---|---|---|
| PR / Merge | `latest`, `6.9`, `6.8` | `7.4` – `8.3` |
| Nightly | `latest`, `6.9`, `6.8`, `nightly` | `7.4` – `8.4` |

Coverage reports are generated only on PHP 8.3 + latest WordPress.
