export type AtomState = Record<string, any>;
export type AtomSubscriber = (state: AtomState) => void;

export interface Atom {
  readonly state: AtomState;
  getState(): AtomState;
  setState(newState: Partial<AtomState>): void;
  attach(element: HTMLElement): void;
  detach(element: HTMLElement): void;
  cleanup(): void;
  subscribe(callback: AtomSubscriber): () => void;
  unsubscribe(callback: AtomSubscriber): void;
}

export function createAtom(initialState: AtomState): Atom {
  let state = { ...initialState };
  const elements: HTMLElement[] = [];
  const subscribers: AtomSubscriber[] = [];
  const subscriberIds = new Map<Function, string>();
  let nextId = 0;

  // Create a read-only proxy for the state
  const createReadOnlyState = (stateObj: AtomState) => {
    return new Proxy(stateObj, {
      get(target, prop) {
        const value = target[prop as keyof typeof target];
        // If the value is an object, make it read-only too
        if (value && typeof value === "object" && !Array.isArray(value)) {
          return createReadOnlyState(value);
        }
        return value;
      },
      set() {
        console.warn(
          "Direct state mutation is not allowed. Use setState() instead."
        );
        return false;
      },
      deleteProperty() {
        console.warn(
          "Direct state mutation is not allowed. Use setState() instead."
        );
        return false;
      },
    });
  };

  const updateElements = () => {
    elements.forEach((element) => {
      // Skip null or undefined elements
      if (!element) {
        console.warn("Skipping null element in updateElements");
        return;
      }

      // Update the element itself if it has x-text
      if (element.hasAttribute("x-text")) {
        const attribute = element.getAttribute("x-text");
        if (attribute && state.hasOwnProperty(attribute)) {
          element.textContent = String(state[attribute]);
        }
      }

      // Find all nested elements with x-text directive
      const xTextElements = element.querySelectorAll("[x-text]");
      xTextElements.forEach((el) => {
        const attribute = el.getAttribute("x-text");
        if (attribute && state.hasOwnProperty(attribute)) {
          el.textContent = String(state[attribute]);
        }
      });

      // Handle x-for directive
      const xForElements = element.querySelectorAll("[x-for]");
      xForElements.forEach((el) => {
        const xForAttr = el.getAttribute("x-for");
        if (xForAttr) {
          updateXForElement(el, xForAttr);
        }
      });
    });
  };

  const updateXForElement = (element: Element, xForAttr: string) => {
    // Parse x-for attribute: "item in items" or "item, index in items"
    const match = xForAttr.match(/^(\w+)(?:\s*,\s*(\w+))?\s+in\s+(\w+)$/);
    if (!match) {
      console.warn(`Invalid x-for syntax: ${xForAttr}`);
      return;
    }

    const [, itemVar, indexVar, arrayKey] = match;
    const array = state[arrayKey as keyof typeof state];

    if (!Array.isArray(array)) {
      console.warn(`x-for: ${arrayKey} is not an array`);
      return;
    }

    // Find the template element
    const template = element.querySelector("template");
    if (!template) {
      console.warn("x-for: No template element found");
      return;
    }

    // Clear existing content (except template)
    const children = Array.from(element.children).filter(
      (child) => child !== template
    );
    children.forEach((child) => child.remove());

    // Remove processing marker to allow re-processing
    element.removeAttribute("data-x-for-processed");

    // Create new elements for each array item
    array.forEach((item, index) => {
      const clone = template.content.cloneNode(true) as DocumentFragment;

      // Process the cloned content for x-text directives
      const processElement = (el: Element) => {
        if (el.hasAttribute("x-text")) {
          const textAttr = el.getAttribute("x-text");
          if (textAttr) {
            // Handle object property access first (like "user.name" or "user.email")
            if (textAttr.startsWith(itemVar + ".")) {
              const property = textAttr.substring(itemVar.length + 1);
              const value = item[property as keyof typeof item];
              el.textContent = String(value || "");
            }
            // If it's a simple variable reference, use the value directly
            else if (textAttr === itemVar) {
              el.textContent = String(item);
            }
            // Handle index variable
            else if (indexVar && textAttr === indexVar) {
              el.textContent = String(index);
            }
            // For other expressions, try to evaluate them
            else {
              try {
                const context = {
                  [itemVar]: item,
                  [indexVar || "index"]: index,
                };
                const result = evaluateExpression(textAttr, context);
                el.textContent = String(result);
              } catch (e) {
                el.textContent = textAttr;
              }
            }
          }
        }

        // Handle data attributes generically
        Array.from(el.attributes).forEach((attr) => {
          if (
            attr.name.startsWith("data-") &&
            attr.value.startsWith(itemVar + ".")
          ) {
            const property = attr.value.substring(itemVar.length + 1);
            const value = item[property as keyof typeof item];
            el.setAttribute(attr.name, String(value || ""));
          }
        });

        // Process child elements recursively
        Array.from(el.children).forEach((child) => processElement(child));
      };

      // Process all elements in the cloned fragment
      Array.from(clone.children).forEach((child) => processElement(child));

      element.appendChild(clone);
    });
  };

  const evaluateExpression = (
    expression: string,
    context: Record<string, any>
  ): any => {
    // Simple expression evaluator for basic cases
    // This is a basic implementation - could be enhanced for more complex expressions
    try {
      // Replace variables with their values
      let evalExpression = expression;
      Object.keys(context).forEach((key) => {
        evalExpression = evalExpression.replace(
          new RegExp(`\\b${key}\\b`, "g"),
          `context.${key}`
        );
      });

      // Use Function constructor for safe evaluation
      return new Function("context", `return ${evalExpression}`)(context);
    } catch (e) {
      return expression;
    }
  };

  return {
    get state() {
      return createReadOnlyState(state);
    },

    getState: () => {
      return { ...state };
    },

    setState: (newState: Partial<AtomState>) => {
      state = { ...state, ...newState };
      updateElements();
      subscribers.forEach((callback) => callback({ ...state }));
      console.log("[setState]", state);
    },

    attach: (element: HTMLElement) => {
      if (!element) {
        console.warn("Cannot attach null or undefined element");
        return;
      }
      elements.push(element);
      updateElements();
      console.log("[attach]", elements);
    },

    detach: (element: HTMLElement) => {
      const index = elements.indexOf(element);
      if (index > -1) {
        elements.splice(index, 1);
      }
      console.log("[detach]", elements);
    },

    cleanup: () => {
      // Remove null/undefined elements from the array
      const validElements = elements.filter((element) => element != null);
      elements.length = 0;
      elements.push(...validElements);
      console.log(
        "[cleanup] Removed null elements, remaining:",
        elements.length
      );
    },

    subscribe: (callback: AtomSubscriber) => {
      const id = `sub_${nextId++}`;
      subscribers.push(callback);
      subscriberIds.set(callback, id);
      console.log("[subscribe]", subscribers);

      // Return an unsubscribe function for convenience
      return () => {
        const index = subscribers.indexOf(callback);
        if (index > -1) {
          subscribers.splice(index, 1);
          subscriberIds.delete(callback);
        }
        console.log("[unsubscribe]", subscribers);
      };
    },

    unsubscribe: (callback: AtomSubscriber) => {
      const index = subscribers.indexOf(callback);
      if (index > -1) {
        subscribers.splice(index, 1);
        subscriberIds.delete(callback);
      }
      console.log("[unsubscribe]", subscribers);
    },
  };
}
