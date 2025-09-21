import { createAtom } from "./atom";

type StateShape = {
  count: number;
  users: { id: number; name: string; email: string }[];
};

const atom = createAtom<StateShape>({
  count: 0,
  users: [
    { id: 1, name: "John", email: "john@example.com" },
    { id: 2, name: "Jane", email: "jane@example.com" },
    { id: 3, name: "Bob", email: "bob@example.com" },
  ],
});

const button = document.getElementById("counterButton") as HTMLElement;

atom.connect(button);

button.addEventListener("click", () => {
  atom.setState({ count: atom.state.count + 1 });
});

const resetButton = document.getElementById("resetButton") as HTMLElement;

resetButton.addEventListener("click", () => {
  atom.setState({ count: 0 });
});

const totalDifferentElement = document.getElementById(
  "totalDifferentElement"
) as HTMLElement;

atom.connect(totalDifferentElement);

// The detach functionality is now demonstrated with the detachButton
const detachButton = document.getElementById("detachButton") as HTMLElement;

detachButton.addEventListener("click", () => {
  atom.disconnect(totalDifferentElement);
});

const attachButton = document.getElementById("attachButton") as HTMLElement;

attachButton.addEventListener("click", () => {
  atom.connect(totalDifferentElement);
});

atom.subscribe((state) => {
  console.log("[subscriber]State changed:", state);
});

// User List functionality
const userList = document.getElementById("userList") as HTMLElement;
atom.connect(userList);

const userForm = document.getElementById("userForm") as HTMLFormElement;
const clearUsersButton = document.getElementById(
  "clearUsersButton"
) as HTMLElement;

// Handle form submission
userForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(userForm);
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;

  if (name && email) {
    const newUser = {
      id: Date.now() + Math.random(),
      name: name.trim(),
      email: email.trim(),
    };

    atom.setState({
      users: [...atom.state.users, newUser],
    });

    // Clear the form
    userForm.reset();
  }
});

clearUsersButton.addEventListener("click", () => {
  atom.setState({ users: [] });
});

// Event delegation for remove buttons
userList.addEventListener("click", (event) => {
  const target = event.target as HTMLElement;
  if (target.classList.contains("remove-user-btn")) {
    const userId = target.getAttribute("data-user-id");
    if (userId) {
      const id = parseFloat(userId);
      atom.setState({
        users: atom.state.users.filter((user: any) => user.id !== id),
      });
    }
  }
});
