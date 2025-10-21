# TypeScript & React Best Practices

## TypeScript Type System

### Type Usage
- **Prefer interfaces over types** for object definitions
- **Use type** for unions, intersections, and mapped types
- **Avoid using `any`**, prefer `unknown` for unknown types
- **Use strict TypeScript configuration**
- **Leverage TypeScript's built-in utility types**
- **Use generics** for reusable type patterns

### Examples
✅ **Good**:
```typescript
interface UserData {
    id: number;
    email: string;
    name: string;
}

type Status = 'pending' | 'active' | 'inactive';

function processData( data: unknown ): UserData {
    if ( ! isValidUserData( data ) ) {
        throw new Error( 'Invalid data' );
    }
    return data;
}
```

❌ **Bad**:
```typescript
type UserData = {
    id: number;
    email: string;
    name: string;
};

function processData( data: any ): any {
    return data;
}
```

---

## TypeScript Naming Conventions

### Type Names
- **PascalCase** for type names and interfaces
- **camelCase** for variables and functions
- **UPPER_CASE** for constants
- **Descriptive names** with auxiliary verbs (e.g., `isLoading`, `hasError`)
- **Prefix interfaces for React props** with 'Props' (e.g., `ButtonProps`)

### Examples
```typescript
interface ButtonProps {
    label: string;
    onClick: () => void;
    isDisabled?: boolean;
}

const MAX_RETRY_ATTEMPTS = 3;
const isLoading = true;
```

---

## TypeScript Code Organization

### Type Definitions
- Keep type definitions close to where they're used
- Export types and interfaces from dedicated type files when shared
- Use barrel exports (`index.ts`) for organizing exports
- Place shared types in a `types` directory
- Co-locate component props with their components

### Functions
- **Use explicit return types** for public functions
- **Use arrow functions** for callbacks and methods
- **Implement proper error handling** with custom error types
- **Use function overloads** for complex type scenarios
- **Prefer async/await** over Promises

---

## TypeScript Best Practices

### Strict Mode
- Enable strict mode in `tsconfig.json`
- Use `readonly` for immutable properties
- Leverage discriminated unions for type safety
- Use type guards for runtime type checking
- Implement proper null checking
- Avoid type assertions unless necessary

### Example
```typescript
interface User {
    readonly id: number;
    readonly email: string;
    name: string;
}

type Result<T> = 
    | { success: true; data: T }
    | { success: false; error: string };

function isUser( value: unknown ): value is User {
    return (
        typeof value === 'object' &&
        value !== null &&
        'id' in value &&
        'email' in value
    );
}
```

---

## React Component Structure

### Component Organization
- **Use functional components** over class components
- **Keep components small and focused**
- **Extract reusable logic** into custom hooks
- **Use composition over inheritance**
- **Implement proper prop types** with TypeScript
- **Split large components** into smaller, focused ones

### Example
✅ **Good**:
```typescript
interface UserCardProps {
    user: User;
    onEdit: ( userId: number ) => void;
}

export const UserCard = ( { user, onEdit }: UserCardProps ) => {
    const handleEditClick = () => onEdit( user.id );
    
    return (
        <div className="user-card">
            <UserAvatar user={ user } />
            <UserInfo user={ user } />
            <EditButton onClick={ handleEditClick } />
        </div>
    );
};
```

---

## React Hooks

### Hook Rules
- **Follow the Rules of Hooks**
- **Use custom hooks** for reusable logic
- **Keep hooks focused and simple**
- **Use appropriate dependency arrays** in `useEffect`
- **Implement cleanup** in `useEffect` when needed
- **Avoid nested hooks**

### Example
```typescript
function useUserData( userId: number ) {
    const [ user, setUser ] = useState<User | null>( null );
    const [ isLoading, setIsLoading ] = useState( true );
    const [ error, setError ] = useState<Error | null>( null );
    
    useEffect( () => {
        let isMounted = true;
        
        const fetchUser = async () => {
            try {
                const data = await api.getUser( userId );
                if ( isMounted ) {
                    setUser( data );
                }
            } catch ( err ) {
                if ( isMounted ) {
                    setError( err as Error );
                }
            } finally {
                if ( isMounted ) {
                    setIsLoading( false );
                }
            }
        };
        
        fetchUser();
        
        return () => {
            isMounted = false;
        };
    }, [ userId ] );
    
    return { user, isLoading, error };
}
```

---

## React State Management

### State Guidelines
- **Use `useState`** for local component state
- **Implement `useReducer`** for complex state logic
- **Use Context API** for shared state
- **Keep state as close to where it's used** as possible
- **Avoid prop drilling** through proper state management
- **Use state management libraries** only when necessary

---

## React Performance

### Optimization Techniques
- **Implement proper memoization** (`useMemo`, `useCallback`)
- **Use `React.memo`** for expensive components
- **Avoid unnecessary re-renders**
- **Implement proper lazy loading**
- **Use proper key props** in lists
- **Profile and optimize** render performance

### Example
```typescript
const ExpensiveComponent = React.memo( ( { data }: { data: Data[] } ) => {
    const processedData = useMemo( 
        () => processData( data ), 
        [ data ] 
    );
    
    const handleClick = useCallback( 
        ( id: number ) => {
            console.log( 'Clicked:', id );
        }, 
        [] 
    );
    
    return (
        <div>
            { processedData.map( item => (
                <Item 
                    key={ item.id } 
                    data={ item } 
                    onClick={ handleClick } 
                />
            ) ) }
        </div>
    );
} );
```

---

## React Error Handling

### Error Boundaries
- Implement Error Boundaries for component trees
- Handle async errors properly
- Show user-friendly error messages
- Implement proper fallback UI
- Log errors appropriately
- Handle edge cases gracefully

---

## React Accessibility

### Accessibility Guidelines
- Use semantic HTML elements
- Implement proper ARIA attributes
- Ensure keyboard navigation
- Test with screen readers
- Handle focus management
- Provide proper alt text for images

---

## React Forms

### Form Handling
- Use controlled components for form inputs
- Implement proper form validation
- Handle form submission states properly
- Show appropriate loading and error states
- Use form libraries for complex forms
- Implement proper accessibility for forms

---

## Auto-Formatting

Always run automatic formatter after finishing changes:
```bash
npm run format
```
