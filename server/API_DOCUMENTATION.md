# Employee Management API

## Base URL

By default, the server listens on port `5000`:

```text
http://localhost:5000/api
```

Set `PORT` in the server environment to use a different port. The frontend
development origin `http://localhost:5173` is allowed by the current CORS
configuration.

All request bodies must be JSON and use the `Content-Type: application/json`
header.

## Employee endpoints

| Method | Path | Purpose | Success status |
|---|---|---|---:|
| POST | `/employees` | Create an employee | 201 |
| GET | `/employees` | List employees | 200 |
| GET | `/employees/:id` | Retrieve one employee | 200 |
| PUT | `/employees/:id` | Replace an employee's editable fields | 200 |
| DELETE | `/employees/:id` | Delete an employee | 200 |

`GET /employees/` is equivalent to `GET /employees`. Employee IDs must be
positive integers. PUT requires the same full employee payload as POST; PATCH
is not supported.

### Request body

Required fields:

- `employee_code`: non-empty string, at most 30 characters.
- `first_name`: non-empty string, at most 100 characters.
- `last_name`: non-empty string, at most 100 characters.
- `email`: valid email address, at most 150 characters.

Optional fields:

- `phone`: string or `null`, at most 20 characters.
- `job_title`: string or `null`, at most 100 characters.
- `department_id`: positive integer or `null`. The ID must reference an
  existing department.
- `date_of_joining`: a valid `YYYY-MM-DD` date from `1000-01-01` onward, or
  `null`.
- `employment_status`: `ACTIVE` or `INACTIVE`. Defaults to `ACTIVE` if omitted.

Empty strings, wrong types, and fields not listed above are rejected.

Example POST or PUT request:

```json
{
  "employee_code": "EMP-1001",
  "first_name": "Ada",
  "last_name": "Lovelace",
  "email": "ada@example.com",
  "phone": null,
  "job_title": "Analyst",
  "department_id": 1,
  "date_of_joining": "2024-02-29",
  "employment_status": "ACTIVE"
}
```

### Success responses

Create (`201`), get-one (`200`), and update (`200`) return:

```json
{
  "status": "success",
  "message": "Employee created successfully.",
  "data": {
    "id": 1,
    "employee_code": "EMP-1001",
    "first_name": "Ada",
    "last_name": "Lovelace",
    "email": "ada@example.com",
    "phone": null,
    "job_title": "Analyst",
    "department_id": 1,
    "date_of_joining": "2024-02-29",
    "employment_status": "ACTIVE",
    "created_at": "2026-11-09T12:00:00.000Z",
    "updated_at": "2026-11-09T12:00:00.000Z",
    "department_name": "Engineering"
  }
}
```

The message varies by endpoint. `department_name` is `null` when the employee
has no matching department.

List (`200`) returns the same envelope with `data` as an array:

```json
{
  "status": "success",
  "message": "Employees retrieved successfully.",
  "data": []
}
```

Delete (`200`) returns:

```json
{
  "status": "success",
  "message": "Employee deleted successfully."
}
```

## Error responses

API errors use this envelope. Validation errors include an `errors` object
whose keys identify invalid fields:

```json
{
  "status": "error",
  "success": false,
  "message": "Employee request validation failed.",
  "errors": {
    "email": "email must be a valid email address."
  }
}
```

| Status | Example cause | Message |
|---:|---|---|
| 400 | Invalid ID, invalid/missing body field, unsupported field, malformed JSON, or invalid department reference | Validation-specific message |
| 404 | Valid employee ID does not exist | `Employee not found.` |
| 404 | No matching API route | `Route not found.` |
| 409 | Duplicate employee code or email | Duplicate-specific message |
| 500 | Unexpected server or database failure | `Internal server error.` |

Unexpected database errors are logged server-side and are not returned with SQL
details or stack traces.

## Health checks

| Method | Path | Purpose |
|---|---|---|
| GET | `/health` | Check whether the backend process is responding |
| GET | `/health/db` | Check whether a database query succeeds |

`GET /health` returns `200` with:

```json
{
  "status": "ok",
  "message": "Backend is running."
}
```

`GET /health/db` returns `200` with `{"status":"ok","database":"connected"}`
when the database is reachable, or `503` with
`{"status":"error","database":"disconnected","message":"Unable to connect to the database."}`
when it is not.

## Local setup

From the `server` directory:

1. Copy `.env.example` to `.env` and set `DB_HOST`, `DB_PORT`, `DB_USER`,
   `DB_PASSWORD`, `DB_NAME`, and optionally `PORT` for your local environment.
2. Install dependencies with `npm install`.
3. Start the server with `npm start`, or use `npm run dev` for development.
