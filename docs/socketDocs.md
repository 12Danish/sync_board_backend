# Socket Events Guide

---

## 📦 Connection Prerequisites

Before connecting, clients **must be authenticated**. Authentication is handled via middleware (`socketAuthMiddleware`) which validates the user.

Upon successful connection, a user may join a board via the `joinBoard` event, which internally checks permissions using `socketPermMiddleware`.

---

## 🚀 Connection Flow

```ts
// Authentication happens automatically via cookies
// The server expects a 'token' cookie to be present in the request
const socket = io("https://your-api-url");
```

**Note:** Make sure you're authenticated and have a valid `token` cookie set before attempting to connect.
```

---

## 🔐 Authentication & Permissions

* All socket connections go through an **authentication layer** that verifies the JWT token from cookies.
* Authentication is handled by `socketAuthMiddleware` which extracts the token from the `token` cookie.
* On `joinBoard`, the user's **permissions** (`view` or `edit`) are verified through `socketPermMiddleware`.
* Only users with `"edit"` permission can draw or modify text.
* Permission levels are determined by:
  - Board creator automatically gets `"edit"` permission
  - Collaborators have either `"view"` or `"edit"` as specified in their collaborator entry
  - Public boards grant `"view"` permission to authenticated users

---

## 📌 Supported Events

### 1. **joinBoard**

Join a collaborative session (room) by board ID.

```ts
socket.emit("joinBoard", boardId);
```

**Listening for response:**

```ts
socket.on("joinedBoard", ({ boardId, userEmail, userId }) => { ... });
```

**Listening for failure:**

```ts
socket.on("error", ({ message }) => { ... });
```

---

### 2. **leaveBoard**

Leaves the current board session.

```ts
socket.emit("leaveBoard", boardId);
```

**Listening for response:**

```ts
socket.on("leftBoard", ({ boardId, userEmail, userId }) => { ... });
```

---

### 3. **cursorMove**

Broadcasts live cursor position to other users in the same board.

```ts
socket.emit("cursorMove", {
  boardId,
  x: 100,
  y: 120,
});
```

**Listening for others' cursors:**

```ts
socket.on("cursorMoved", ({ boardId, x, y, userId, userEmail }) => { ... });
```

---

### 4. **Drawing Events** (Permission: `edit`)

#### ➤ draw

```ts
socket.emit("draw", {
  boardId,
  updatedBoardShapes: [...],
});
```

**Listening for others' drawings:**

```ts
socket.on("newDrawing", ({ updatedBoardShapes, userId }) => { ... });
```

#### ➤ erase

```ts
socket.emit("erase", {
  boardId,
  updatedBoardShapes: [...],
});
```

**Listening for erase events:**

```ts
socket.on("erased", ({ updatedBoardShapes, userId }) => { ... });
```

#### ➤ editShape

```ts
socket.emit("editShape", {
  boardId,
  updatedBoardShapes: [...],
});
```

**Listening for shape edits:**

```ts
socket.on("editedShape", ({ updatedBoardShapes, userId }) => { ... });
```

#### ➤ clearBoard

```ts
socket.emit("clearBoard", boardId);
```

**Listening for board clear events:**

```ts
socket.on("clearedBoard", ({ userId }) => { ... });
```

---

### 5. **Text Events** (Permission: `edit`)

#### ➤ addText

```ts
socket.emit("addText", {
  boardId,
  newTextElement: {...},
  updatedBoardShapes: [...],
});
```

**Listening for text additions:**

```ts
socket.on("addedText", ({ newTextElement, userId }) => { ... });
```

#### ➤ backspaceText

```ts
socket.emit("backspaceText", {
  boardId,
  textId,
  updatedBoardShapes: [...],
});
```

**Listening for text backspace events:**

```ts
socket.on("backspacedText", ({ textId, userId }) => { ... });
```

#### ➤ editText

```ts
socket.emit("editText", {
  boardId,
  textId,
  updatedText: "new content",
  updatedBoardShapes: [...],
});
```

**Listening for text edit events:**

```ts
socket.on("editedText", ({ textId, updatedText, userId }) => { ... });
```

---

### 6. **disconnect**

Triggered automatically when user leaves the page or loses connection.

```ts
socket.on("disconnect", () => {
  console.log("Disconnected from server.");
});
```