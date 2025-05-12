## 📦 Connection Prerequisites

Clients **must be authenticated** before establishing a socket connection. Authentication is performed via `socketAuthMiddleware`, which extracts and validates a JWT from the `token` cookie.

Once authenticated, users can join a board by emitting the `joinBoard` event. Permissions are checked using `socketPermMiddleware`.

---

## 🚀 Connection Flow

```ts
// Authentication via cookies (token cookie must be present)
const socket = io("https://your-api-url");
```

> **Note:** Ensure that the client is authenticated and the `token` cookie is set before connecting.

---

## 🔐 Authentication & Permissions

- All connections go through `socketAuthMiddleware`, which reads the `token` from cookies.
- Board access and action permissions (`view` or `edit`) are enforced by `socketPermMiddleware`.
- Only users with `edit` permission can draw or manipulate text.
- Permission rules:

  - Board creator always has `edit`
  - Collaborators are assigned either `view` or `edit`
  - Public boards grant `view` access to authenticated users

---

## 📌 Supported Events

### `joinBoard`

Joins the client to a board room.

```ts
socket.emit("joinBoard", boardId);
```

**Success response:**

```ts
socket.on("joinedBoard", ({ boardId, userEmail, userId }) => { ... });
```

**Failure response:**

```ts
socket.on("error", ({ message }) => { ... });
```

---

###  `leaveBoard`

Leaves the current board session.

> ⚠️ It is recommended to wait **at least 5 seconds** before calling `leaveBoard` to allow syncing to complete.

```ts
socket.emit("leaveBoard", boardId);
```

**Response:**

```ts
socket.on("leftBoard", ({ boardId, userEmail, userId }) => { ... });
```

---

###  `cursorMove`

Broadcasts live cursor movement to other users.

```ts
socket.emit("cursorMove", {
  boardId,
  x: 100,
  y: 120,
});
```

**Receive updates from others:**

```ts
socket.on("cursorMoved", ({...data, userId, userEmail }) => { ... });
```

---

### 🖌️ Drawing Events (Requires `edit` permission)

> The `boardId` and a `updatedBoardPage` object with `pageNumber` and `whiteBoardObjects` are required for all drawing events.

#### `draw`

```ts
socket.emit("draw", {
  boardId,
  updatedBoardPage: {
    pageNumber,
    whiteBoardObjects: {
      type: "rectangle",
      x: 10,
      y: 20,
      width: 100,
      height: 50,
    },
  },
});
```

**Response:**

```ts
socket.on("newDrawing", ({ ...data, userId, userEmail }) => { ... });
```

#### `erase`

```ts
socket.emit("erase", {
  boardId,
  updatedBoardPage: {
    pageNumber,
    whiteBoardObjects: {
      type: "rectangle",
      x: 10,
      y: 20,
      width: 100,
      height: 50,
    },
  },
});
```

**Response:**

```ts
socket.on("erased", ({ ...data, userId, userEmail }) => { ... });
```

#### `editShape`

```ts
socket.emit("editShape", {
  boardId,
  updatedBoardPage: {
    pageNumber,
    whiteBoardObjects: {
      type: "rectangle",
      x: 10,
      y: 20,
      width: 100,
      height: 50,
    },
  },
});
```

**Response:**

```ts
socket.on("editedShape", ({ ...data, userId, userEmail }) => { ... });
```

---

### 📤 `clearPage` Event

**Description**:
Clears all shapes on a specific page of the board and notifies all users in the board room. Also updates the database with the cleared page data.

**Client Request Format**:

```ts
socket.emit("clearPage", {
  boardId: string,
  updatedBoardPage: {
    pageNumber: number,
    whiteBoardObjects: {}, // Empty
  },
});
```

**Server Emits To Room**:
`"clearedPage"` with the same `...data` plus `userEmail` and `userId`.

---

### ❌ `deletePage` Event

**Description**:
Deletes an entire page from the board and notifies all users in the board room. Also synchronizes the deletion to the database.

**Client Request Format**:

```ts
socket.emit("deletePage", {
  boardId: string,
  pageNumber: number,
});
```

**Server Emits To Room**:
`"deletedPage"` with `userEmail` and `userId`.

Sure! Here's your rewritten **Text Events** section, now fully aligned with the structure and format you provided earlier (matching other event documentation for consistency):

---

### 5. 📝 Text Events (Requires `edit` permission)

These events allow collaborative text manipulation on a whiteboard. All changes are synced with the backend and broadcast to other users in the board room.

---

#### 🔤 `addText`

```ts
socket.emit("addText", {
  boardId,
  updatedBoardPage: {
    pageNumber,
    whiteBoardObjects: {
      textId123: {
        type: "text",
        x: 100,
        y: 150,
        content: "New Text Here",
        fontSize: 16,
        color: "#000000",
        // ...other style properties
      }
    }
  }
});
```

**Response:**

```ts
socket.on("addedText", ({ ...data, userId, userEmail }) => {
  // Handle new text addition
});
```

---

#### ⌫ `backspaceText`

```ts
socket.emit("backspaceText", {
  boardId,
  updatedBoardPage: {
    pageNumber,
    whiteBoardObjects: {
      textId123: {
        ...updatedObjectAfterBackspace
      }
    }
  }
});
```

**Response:**

```ts
socket.on("backspacedText", ({ ...data, userId, userEmail }) => {
  // Handle backspace effect
});
```

---

#### ✏️ `editText`

```ts
socket.emit("editText", {
  boardId,
  updatedBoardPage: {
    pageNumber,
    whiteBoardObjects: {
      textId123: {
        content: "Updated text content",
        // Optional: updated styles (font, size, color, etc.)
      }
    }
  }
});
```

**Response:**

```ts
socket.on("editedText", ({ ...data, userId, userEmail }) => {
  // Handle text edit
});
```

---

---

###  `disconnect`

Fired automatically when a user disconnects (e.g. closes the tab, loses connection).For safety
add delay here too so that data persists.

```ts
socket.on("disconnect", () => {
  console.log("Disconnected from server.");
});
---

```
