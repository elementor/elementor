# Core Development Principles

## No Comments Policy

### Rules
- **New code**: Must be self-documenting through descriptive naming
- **No explanatory comments**: Use clear function and variable names instead
- **Exception**: Required docblocks for public APIs only

### Examples
✅ **Good**:
```php
function validate_user_input( $input ) {
    return ! empty( $input ) && strlen( $input ) < 100;
}

function calculate_total_price( $items, $tax_rate ) {
    $subtotal = array_sum( array_column( $items, 'price' ) );
    return $subtotal * ( 1 + $tax_rate );
}
```

❌ **Bad**:
```php
function doStuff( $data ) {
    // Check if data is valid
    if ( empty( $data ) ) {
        return false;
    }
    // Process the data
    return process( $data );
}
```

---

## Magic Numbers → Named Constants

### Rules
- **No hardcoded numbers**: Use named constants for any number except 0, 1, -1
- **Descriptive names**: Constants should explain what the value represents
- **Location**: Keep constants at the top of the class or in a dedicated constants file

### Examples
✅ **Good**:
```php
const MAX_UPLOAD_SIZE = 5242880; // 5MB in bytes
const DEFAULT_TIMEOUT_SECONDS = 30;
const MINIMUM_PASSWORD_LENGTH = 8;

if ( $file_size > self::MAX_UPLOAD_SIZE ) {
    return new WP_Error( 'file_too_large' );
}
```

❌ **Bad**:
```php
if ( $file_size > 5242880 ) {
    return new WP_Error( 'file_too_large' );
}

if ( $timeout > 30 ) {
    // handle timeout
}
```

---

## Self-Documenting Code

### Function Names
- Must clearly describe their purpose and action
- Use verb-noun format when possible
- Be specific about what they do

✅ **Good**:
- `validate_email_format()`
- `fetch_user_preferences()`
- `calculate_shipping_cost()`
- `send_registration_confirmation_email()`

❌ **Bad**:
- `doStuff()`
- `handle()`
- `process()`
- `run()`
- `check()`

### Variable Names
- Reveal the purpose and content
- Use descriptive names that eliminate need for comments
- Avoid abbreviations unless universally understood

✅ **Good**:
```php
$active_user_count = count( $active_users );
$is_premium_subscriber = $user->has_premium_subscription();
$failed_login_attempts = get_user_meta( $user_id, 'failed_logins', true );
```

❌ **Bad**:
```php
$cnt = count( $users );
$flag = $user->has_subscription();
$attempts = get_user_meta( $id, 'failed', true );
```

---

## Single Responsibility Principle

### Rules
- Each function should do exactly one thing
- Functions should be small and focused
- If a function needs a comment to explain what it does, it should be split

### Examples
✅ **Good**:
```php
private function validate_user_data( $data ) {
    return $this->validate_email( $data['email'] ) 
        && $this->validate_password( $data['password'] );
}

private function validate_email( $email ) {
    return is_email( $email );
}

private function validate_password( $password ) {
    return strlen( $password ) >= self::MINIMUM_PASSWORD_LENGTH;
}
```

❌ **Bad**:
```php
private function validate_and_save_user( $data ) {
    // Validate email
    if ( ! is_email( $data['email'] ) ) {
        return false;
    }
    
    // Validate password
    if ( strlen( $data['password'] ) < 8 ) {
        return false;
    }
    
    // Save to database
    return $this->save_to_database( $data );
}
```

---

## DRY (Don't Repeat Yourself)

### Rules
- Extract repeated code into reusable functions
- Share common logic through proper abstraction
- Maintain single sources of truth

### Examples
✅ **Good**:
```php
private function calculate_total_with_tax( $subtotal, $tax_rate ) {
    return $subtotal * ( 1 + $tax_rate );
}

public function get_order_total( $order ) {
    $subtotal = $this->calculate_subtotal( $order->items );
    return $this->calculate_total_with_tax( $subtotal, $order->tax_rate );
}

public function get_estimate_total( $items, $tax_rate ) {
    $subtotal = $this->calculate_subtotal( $items );
    return $this->calculate_total_with_tax( $subtotal, $tax_rate );
}
```

❌ **Bad**:
```php
public function get_order_total( $order ) {
    $subtotal = array_sum( array_column( $order->items, 'price' ) );
    return $subtotal * ( 1 + $order->tax_rate );
}

public function get_estimate_total( $items, $tax_rate ) {
    $subtotal = array_sum( array_column( $items, 'price' ) );
    return $subtotal * ( 1 + $tax_rate );
}
```

---

## Code Organization

### Keep Files Under 300 Lines
- Split large files when it improves clarity
- Extract related functionality into separate classes
- Use meaningful file and class names

### Consistent Structure
- Keep related code together
- Organize code in a logical hierarchy
- Use consistent file and folder naming conventions

---

## Refactoring Best Practices

### Atomic Edits
- Refactor in small, verifiable steps
- Run tests after each change
- Commit after tests pass

### Simplicity First
- Keep base classes minimal
- Expose only what implementations need
- Avoid speculative hooks

### Backward Compatibility
- Consider class aliases when moving/renaming public classes
- Add transitional shims if needed
- Document breaking changes
