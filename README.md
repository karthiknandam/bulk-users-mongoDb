# Bulk User Management System

A high-performance REST API for bulk inserting and updating large volumes of user records into MongoDB, built with **Bun**, **Express**, **Mongoose**, and **Zod**.

---

## Tech Stack

| Layer | Tool |
|---|---|
| Runtime | Bun |
| Framework | Express 5 |
| Database | MongoDB via Mongoose |
| Validation | Zod |
| Language | TypeScript |

---

## Setup

```bash
bun install
```

Configure environment variables in `.env`:

```env
MONGO_URI=mongodb://localhost:27017/users
NODE_ENV=dev
PORT=3000
```

---

## Scripts

| Command | Description |
|---|---|
| `bun run dev` | Run with `--watch` (hot reload) |
| `bun run start` | Run without watch |
| `bun run test` | Run tests with `--watch` |
| `bun run build` | Bundle entry point |

---

## API Endpoints

Base path: `/api/users`

### Health Check

```
GET /health
```

Returns `{ msg: "Running..." }` to confirm the server is up.

---

### Bulk Create Users

```
POST /api/users/bulk-create
Content-Type: application/json
Body: User[]
```

Inserts an array of user objects in chunks of 500. Each entry is validated individually with Zod — invalid entries are skipped and counted.

**Request body shape:**

```json
[
  {
    "fullName": "User Name",
    "email": "user@example.com",
    "phone": "+919876543210",
    "walletBalace": 0,
    "isBlocked": false,
    "kycStatus": "Pending",
    "deviceInfo": {
      "ipAddress": "192.168.1.1",
      "deviceType": "Mobile",
      "os": "Android"
    }
  }
]
```

**Field rules:**

| Field | Type | Required | Rules |
|---|---|---|---|
| `fullName` | string | Yes | min 3 characters |
| `email` | string | Yes | valid email format |
| `phone` | string | Yes | regex `+91[6-9]\d{9}` (Indian mobile) |
| `walletBalace` | number | No | defaults to `0` |
| `isBlocked` | boolean | No | defaults to `false` |
| `kycStatus` | enum | No | `Pending` / `Approved` / `Rejected`, defaults to `Pending` |
| `deviceInfo` | object | Yes | must contain `ipAddress`, `deviceType`, `os` |

**Responses:**

| Status | Meaning |
|---|---|
| `200` | All entries inserted successfully |
| `207` | Partial success — some entries were skipped |
| `400` | Body missing, empty array, or all entries invalid |
| `500` | Internal server error |

```json
// 207 example
{ "message": "Bulk insert completed", "inserted": 270, "skipped": 30 }

// 400 — all invalid
{ "message": "No valid entries found to insert", "skipped": 10 }
```

---

### Bulk Update Users

```
PUT /api/users/bulk-update
Content-Type: application/json
Body: UpdateUser[]
```

Updates existing users in bulk. Each entry **must include at least `email` or `phone`** to identify the user. All other fields are optional.

**Request body shape:**

```json
[
  {
    "email": "user@example.com",
    "kycStatus": "Approved",
    "isBlocked": false
  }
]
```

**Field rules:**

| Field | Type | Required | Rules |
|---|---|---|---|
| `email` | string | Conditional | Required if `phone` not provided |
| `phone` | string | Conditional | Required if `email` not provided |
| `fullName` | string | No | min 3 characters |
| `walletBalace` | number | No | — |
| `isBlocked` | boolean | No | — |
| `kycStatus` | enum | No | `Pending` / `Approved` / `Rejected` |
| `deviceInfo` | object | No | `ipAddress`, `deviceType`, `os` all optional |

> At least one of `email` or `phone` is required per entry. Entries missing both are skipped.

Filter priority: `email` is used first if present, otherwise `phone`.

**Responses:**

| Status | Meaning |
|---|---|
| `200` | All entries updated successfully |
| `207` | Partial success — some entries were skipped |
| `400` | Body missing, empty array, or all entries invalid |
| `500` | Internal server error |

```json
// 207 example
{ "message": "Bulk update completed", "updated": 18, "skipped": 2 }
```

---

## Validation Rules Summary

- Empty body `null` / `undefined` → `400`
- Empty array `[]` → `400`
- Array of only empty objects `[{}, {}]` → `400` (all skipped)
- Mixed valid + invalid → `207` with counts
- All valid → `200` with counts

---

## Database Export (Makefile)

```bash
make dump          # mongodump full backup to backup/
make export-users  # mongoexport users collection to users.json
```

Both commands use `MONGO_URI` from `.env` automatically.

---

## Testing with Sample Data

A `test-users.json` file is included with **300 entries** (270 valid, 30 invalid) for bulk insert testing.

```bash
curl -X POST http://localhost:3000/api/users/bulk-create \
  -H "Content-Type: application/json" \
  -d @test-users.json
```

Expected response: `207` with `inserted: 270, skipped: 30`.

Invalid entry types included in test data:
- Bad email format
- Phone not matching `+91[6-9]\d{9}`
- `fullName` shorter than 3 characters
- `deviceInfo: null`
- Empty object `{}`
- Invalid `kycStatus` value
- `walletBalace` as a string instead of number

---

## Project Structure

```
src/
├── index.ts               # Express app entry point
├── config/
│   └── db.ts              # Mongoose connection
├── controller/
│   └── user.controller.ts # BulkCreate, BulkUpdate handlers
├── model/
│   └── user.model.ts      # Mongoose User schema
├── routes/
│   ├── index.ts           # Root router (/api)
│   └── user.route.ts      # User routes (/api/users)
└── utils/
    └── validation.ts      # Zod schemas for create and update
```
