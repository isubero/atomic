# Atomic

[![npm version](https://img.shields.io/npm/v/@your-username/atomic.svg)](https://www.npmjs.com/package/@your-username/atomic)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

A lightweight, reactive state management library with simple directives for DOM manipulation. Atomic provides a simple and intuitive way to create reactive user interfaces without the complexity of larger frameworks.

## ✨ Features

- 🚀 **Lightweight**: Minimal bundle size with zero dependencies
- ⚡ **Reactive**: Automatic DOM updates when state changes
- 🎯 **Alpine and Vue-like Directives**: Familiar `x-text` and `x-for` directives
- 📦 **TypeScript**: Full TypeScript support with comprehensive type definitions
- 🔧 **Simple API**: Easy to learn and use with minimal boilerplate
- 🌐 **Framework Agnostic**: Works with any HTML/JavaScript project
- 🛡️ **Immutable State**: Read-only state access prevents accidental mutations
- 📊 **Subscription System**: Built-in state change notifications
- 🎨 **Template System**: Powerful looping with template-based rendering

## 📦 Installation

### CDN (No Build Step Required)

#### ES Modules (Recommended - Modern Browsers)

```html
<script type="module">
  import { createAtom } from "https://cdn.jsdelivr.net/npm/@your-username/atomic@latest/dist/index.js";

  // Your code here
  const atom = createAtom({ count: 0 });
</script>
```

#### UMD (Broader Browser Compatibility)

```html
<script src="https://cdn.jsdelivr.net/npm/@your-username/atomic@latest/dist/index.umd.js"></script>
<script>
  const { createAtom } = Atomic;

  // Your code here
  const atom = createAtom({ count: 0 });
</script>
```

#### Alternative CDNs

- **unpkg**: `https://unpkg.com/@your-username/atomic@latest/dist/index.js`
- **skypack**: `https://cdn.skypack.dev/@your-username/atomic`

### Package Managers

```bash
npm install @your-username/atomic
```

Or with yarn:

```bash
yarn add @your-username/atomic
```

Or with pnpm:

```bash
pnpm add @your-username/atomic
```

## 🚀 Quick Start

### CDN Example (No Build Step)

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Atomic CDN Example</title>
  </head>
  <body>
    <div id="app">
      <h1 x-text="title"></h1>
      <p>Count: <span x-text="count"></span></p>
      <button id="increment">Increment</button>
      <button id="decrement">Decrement</button>
    </div>

    <script type="module">
      import { createAtom } from "https://cdn.jsdelivr.net/npm/@your-username/atomic@latest/dist/index.js";

      const atom = createAtom({
        title: "Hello Atomic!",
        count: 0,
      });

      // Attach the app element for reactive updates
      atom.attach(document.getElementById("app"));

      // Add event listeners
      document.getElementById("increment").addEventListener("click", () => {
        atom.setState({ count: atom.state.count + 1 });
      });

      document.getElementById("decrement").addEventListener("click", () => {
        atom.setState({ count: atom.state.count - 1 });
      });
    </script>
  </body>
</html>
```

### Basic Counter Example (Package Manager)

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Atomic Example</title>
  </head>
  <body>
    <div id="app">
      <h1 x-text="title"></h1>
      <p>Count: <span x-text="count"></span></p>
      <button id="increment">Increment</button>
      <button id="decrement">Decrement</button>
    </div>

    <script type="module">
      import { createAtomic } from "@your-username/atomic";

      const atom = createAtomic({
        title: "Hello Atomic!",
        count: 0,
      });

      // Attach the app element for reactive updates
      atom.attach(document.getElementById("app"));

      // Add event listeners
      document.getElementById("increment").addEventListener("click", () => {
        atom.setState({ count: atom.state.count + 1 });
      });

      document.getElementById("decrement").addEventListener("click", () => {
        atom.setState({ count: atom.state.count - 1 });
      });
    </script>
  </body>
</html>
```

### List Rendering Example

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Atomic List Example</title>
  </head>
  <body>
    <div id="app">
      <h2>Users</h2>
      <div x-for="user in users">
        <template>
          <div class="user-item">
            <span x-text="user.name"></span>
            <span x-text="user.email"></span>
          </div>
        </template>
      </div>

      <form id="userForm">
        <input type="text" name="name" placeholder="Name" required />
        <input type="email" name="email" placeholder="Email" required />
        <button type="submit">Add User</button>
      </form>
    </div>

    <script type="module">
      import { createAtomic } from "@your-username/atomic";

      const atom = createAtomic({
        users: [
          { name: "John Doe", email: "john@example.com" },
          { name: "Jane Smith", email: "jane@example.com" },
        ],
      });

      atom.attach(document.getElementById("app"));

      document.getElementById("userForm").addEventListener("submit", (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const newUser = {
          name: formData.get("name"),
          email: formData.get("email"),
        };

        atom.setState({
          users: [...atom.state.users, newUser],
        });

        e.target.reset();
      });
    </script>
  </body>
</html>
```

## 📚 API Reference

### `createAtomic(initialState)`

Creates a new atom instance with the given initial state.

**Parameters:**

- `initialState` (Object): The initial state object

**Returns:** An Atomic instance

```javascript
const atom = createAtomic({
  count: 0,
  message: "Hello World",
  items: [],
});
```

### Atomic Instance

The atom instance provides methods and properties for state management and DOM reactivity.

#### Properties

##### `atom.state`

Read-only access to the current state. Returns a proxy that prevents direct mutation and provides deep immutability for nested objects.

```javascript
console.log(atom.state.count); // ✅ Read access
atom.state.count = 5; // ❌ Throws warning, mutation prevented
```

#### Methods

##### `atom.getState()`

Returns a shallow copy of the current state.

```javascript
const currentState = atom.getState();
console.log(currentState); // { count: 0, message: "Hello" }
```

##### `atom.setState(newState)`

Updates the state and triggers DOM updates and subscriber notifications.

**Parameters:**

- `newState` (Object): Partial state object to merge with current state

```javascript
// Update single property
atom.setState({ count: 5 });

// Update multiple properties
atom.setState({
  count: 10,
  message: "Updated!",
});

// Update arrays
atom.setState({
  items: [...atom.state.items, newItem],
});
```

##### `atom.attach(element)`

Attaches an HTML element to the atom for reactive DOM updates.

**Parameters:**

- `element` (HTMLElement): The element to attach

```javascript
const appElement = document.getElementById("app");
atom.attach(appElement);
```

##### `atom.detach(element)`

Detaches an HTML element from the atom, stopping reactive updates for that element.

**Parameters:**

- `element` (HTMLElement): The element to detach

```javascript
const element = document.getElementById("myElement");
atom.detach(element);
```

##### `atom.subscribe(callback)`

Subscribes to state changes and returns an unsubscribe function.

**Parameters:**

- `callback` (Function): Function to call when state changes

**Returns:** Unsubscribe function

```javascript
const unsubscribe = atom.subscribe((state) => {
  console.log("State changed:", state);
});

// Later, unsubscribe
unsubscribe();
```

##### `atom.unsubscribe(callback)`

Unsubscribes a specific callback from state changes.

**Parameters:**

- `callback` (Function): The callback function to remove

```javascript
const myCallback = (state) => console.log(state);
atom.subscribe(myCallback);
atom.unsubscribe(myCallback);
```

##### `atom.cleanup()`

Removes null/undefined elements from the attached elements list. Useful for cleaning up after DOM manipulations.

```javascript
// After removing elements from DOM
atom.cleanup();
```

## 🎯 Directives

Atomic provides Vue-like directives for declarative DOM manipulation.

### `x-text`

Updates the text content of an element when the specified state property changes.

```html
<!-- Simple property binding -->
<span x-text="message"></span>

<!-- Nested property binding -->
<span x-text="user.name"></span>

<!-- Expression evaluation -->
<span x-text="count * 2"></span>
```

### `x-for`

Creates multiple elements based on an array in the state. Uses a template-based approach for optimal performance.

#### Basic Loop

```html
<div x-for="item in items">
  <template>
    <div class="item">
      <span x-text="item.name"></span>
      <span x-text="item.price"></span>
    </div>
  </template>
</div>
```

#### Loop with Index

```html
<div x-for="item, index in items">
  <template>
    <div class="item">
      <span x-text="index"></span>
      <span x-text="item.name"></span>
    </div>
  </template>
</div>
```

#### Complex Object Rendering

```html
<div x-for="user in users">
  <template>
    <div class="user-card">
      <h3 x-text="user.name"></h3>
      <p x-text="user.email"></p>
      <span x-text="user.age"></span>
    </div>
  </template>
</div>
```

## 🔧 TypeScript Support

Atomic includes comprehensive TypeScript definitions for type-safe development.

### Basic Usage

```typescript
import { createAtomic, AtomicState } from "@your-username/atomic";

interface AppState {
  count: number;
  message: string;
  users: Array<{ id: number; name: string; email: string }>;
}

const atom = createAtomic<AppState>({
  count: 0,
  message: "Hello",
  users: [],
});

// Type-safe state access
atom.state.count; // number
atom.state.message; // string
atom.state.users; // Array<{ id: number; name: string; email: string }>

// Type-safe state updates
atom.setState({ count: 5 }); // ✅ Valid
atom.setState({ count: "hello" }); // ❌ TypeScript error
```

### Advanced TypeScript Usage

```typescript
import { createAtomic, AtomicSubscriber } from "@your-username/atomic";

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

interface TodoState {
  todos: Todo[];
  filter: "all" | "active" | "completed";
  newTodo: string;
}

const atom = createAtomic<TodoState>({
  todos: [],
  filter: "all",
  newTodo: "",
});

// Type-safe subscriber
const handleStateChange: AtomicSubscriber<TodoState> = (state) => {
  console.log(`Filter: ${state.filter}, Todos: ${state.todos.length}`);
};

atom.subscribe(handleStateChange);
```

## 📖 Examples

### Todo Application

```javascript
import { createAtomic } from "@your-username/atomic";

const atom = createAtomic({
  todos: [],
  newTodo: "",
  filter: "all", // 'all', 'active', 'completed'
});

atom.attach(document.getElementById("todo-app"));

// Add new todo
document.getElementById("add-todo").addEventListener("click", () => {
  if (atom.state.newTodo.trim()) {
    atom.setState({
      todos: [
        ...atom.state.todos,
        {
          id: Date.now(),
          text: atom.state.newTodo,
          completed: false,
        },
      ],
      newTodo: "",
    });
  }
});

// Toggle todo completion
document.getElementById("todo-list").addEventListener("click", (e) => {
  if (e.target.classList.contains("todo-item")) {
    const todoId = parseInt(e.target.dataset.id);
    atom.setState({
      todos: atom.state.todos.map((todo) =>
        todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
      ),
    });
  }
});
```

### Shopping Cart

```javascript
import { createAtomic } from "@your-username/atomic";

const atom = createAtomic({
  items: [
    { id: 1, name: "Laptop", price: 999, quantity: 1 },
    { id: 2, name: "Mouse", price: 29, quantity: 2 },
  ],
  cartTotal: 0,
});

atom.attach(document.getElementById("cart"));

// Update quantity
function updateQuantity(itemId, newQuantity) {
  atom.setState({
    items: atom.state.items.map((item) =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    ),
  });
}

// Calculate total
atom.subscribe((state) => {
  const total = state.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  atom.setState({ cartTotal: total });
});
```

### Form Validation

```javascript
import { createAtomic } from "@your-username/atomic";

const atom = createAtomic({
  form: {
    name: "",
    email: "",
    password: "",
  },
  errors: {},
  isValid: false,
});

atom.attach(document.getElementById("form-container"));

// Validate form
function validateForm() {
  const errors = {};
  const { name, email, password } = atom.state.form;

  if (!name.trim()) errors.name = "Name is required";
  if (!email.includes("@")) errors.email = "Invalid email";
  if (password.length < 6) errors.password = "Password too short";

  atom.setState({
    errors,
    isValid: Object.keys(errors).length === 0,
  });
}

// Watch form changes
atom.subscribe((state) => {
  validateForm();
});
```

## 🌐 Browser Support

Atomic works in all modern browsers:

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 📊 Performance

Atomic is designed for performance:

- **Minimal Bundle Size**: ~3KB gzipped
- **Efficient DOM Updates**: Only updates changed elements
- **Template-based Rendering**: Optimized for list operations
- **Immutable State**: Prevents unnecessary re-renders
- **Proxy-based Reactivity**: Minimal overhead for state access

## 🤝 Contributing

Contributions are welcome!

### Development Setup

```bash
# Clone the repository
git clone https://github.com/your-username/atomic.git

# Install dependencies
npm install

# Start development server
npm run dev

# Build the library
npm run build
```

### Running Tests

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 📝 Changelog

### [1.0.0] - 2024-01-XX

#### Added

- Initial release
- Basic reactive state management
- `x-text` directive for text binding
- `x-for` directive for list rendering
- TypeScript support with comprehensive type definitions
- Subscription system for state change notifications
- Immutable state access with proxy-based protection
- Element attachment/detachment system
- Template-based rendering for optimal performance

#### Features

- Zero dependencies
- Framework agnostic
- Modern ES modules support
- Comprehensive error handling
- Development-friendly logging

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by Vue.js reactive system
- Built with modern JavaScript and TypeScript
- Thanks to all contributors and users

## 📞 Support

- 📖 [Documentation](https://github.com/your-username/atomic#readme)
- 🐛 [Issue Tracker](https://github.com/your-username/atomic/issues)
- 💬 [Discussions](https://github.com/your-username/atomic/discussions)

---

Made with ❤️ by [Isaías Subero](https://github.com/isubero)
