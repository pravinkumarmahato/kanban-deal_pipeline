# Deal Pipeline API Documentation

## Base URL
```
http://localhost:8000
```

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <access_token>
```

---

## Table of Contents
1. [Public Endpoints](#public-endpoints)
2. [Authenticated Endpoints (All Roles)](#authenticated-endpoints-all-roles)
3. [Partner Only Endpoints](#partner-only-endpoints)
4. [Admin Only Endpoints](#admin-only-endpoints)
5. [Admin & Analyst Endpoints](#admin--analyst-endpoints)

---

## Public Endpoints

### 1. Login
Authenticate and receive an access token.

**Endpoint:** `POST /users/login`

**Access:** Public (no authentication required)

**Request Body:**
```json
{
  "email": "analyst@example.com",
  "password": "securepassword123"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Error Responses:**
- `401 Unauthorized`: Incorrect email or password
- `400 Bad Request`: Inactive user

---

### 2. Root/API Info
Get API information and version.

**Endpoint:** `GET /`

**Access:** Public (no authentication required)

**Response (200 OK):**
```json
{
  "message": "Deal Pipeline API",
  "version": "1.0.0"
}
```

---

### 3. Health Check
Check the health status of the API.

**Endpoint:** `GET /health`

**Access:** Public (no authentication required)

**Response (200 OK):**
```json
{
  "status": "healthy"
}
```

---

### 4. Register User
Register a new user account (public registration).

**Endpoint:** `POST /users/register`

**Access:** Public (no authentication required)

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "securepassword123",
  "full_name": "New User",
  "role": "admin"
}
```

**Available Roles:**
- `admin`: Full access, can manage users
- `analyst`: Can create/edit deals and memos
- `partner`: Can view deals and activities, comment, vote, approve/decline

**Response (201 Created):**
```json
{
  "id": 4,
  "email": "newuser@example.com",
  "full_name": "New User",
  "role": "analyst",
  "is_active": true,
  "created_at": "2024-01-16T10:00:00Z",
  "updated_at": null
}
```

**Error Responses:**
- `400 Bad Request`: Email already registered

---

## Authenticated Endpoints (All Roles)

These endpoints are accessible to all authenticated users (Admin, Analyst, Partner).

### 5. Get Current User
Get information about the currently authenticated user.

**Endpoint:** `GET /users/me`

**Access:** All authenticated users

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "id": 1,
  "email": "analyst@example.com",
  "full_name": "John Analyst",
  "role": "analyst",
  "is_active": true,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": null
}
```

---

### 6. List Deals
Get a list of all deals with optional filtering by stage.

**Endpoint:** `GET /deals`

**Access:** All authenticated users

**Query Parameters:**
- `skip` (integer, optional): Number of records to skip (default: 0)
- `limit` (integer, optional): Maximum number of records to return (default: 100)
- `stage` (string, optional): Filter by deal stage. Values: `sourced`, `screen`, `diligence`, `ic`, `invested`, `passed`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Example Request:**
```
GET /deals?skip=0&limit=10&stage=diligence
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Tech Startup Inc",
    "company_url": "https://techstartup.com",
    "owner_id": 2,
    "stage": "diligence",
    "round": "Series A",
    "check_size": "500000.00",
    "status": "active",
    "created_at": "2024-01-10T09:00:00Z",
    "updated_at": "2024-01-15T14:30:00Z"
  },
  {
    "id": 2,
    "name": "AI Innovations Ltd",
    "company_url": "https://aiinnovations.com",
    "owner_id": 2,
    "stage": "diligence",
    "round": "Seed",
    "check_size": "250000.00",
    "status": "active",
    "created_at": "2024-01-12T11:00:00Z",
    "updated_at": null
  }
]
```

---

### 7. Get Deal by ID
Get detailed information about a specific deal.

**Endpoint:** `GET /deals/{deal_id}`

**Access:** All authenticated users

**Path Parameters:**
- `deal_id` (integer, required): The ID of the deal

**Headers:**
```
Authorization: Bearer <access_token>
```

**Example Request:**
```
GET /deals/1
```

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "Tech Startup Inc",
  "company_url": "https://techstartup.com",
  "owner_id": 2,
  "stage": "diligence",
  "round": "Series A",
  "check_size": "500000.00",
  "status": "active",
  "created_at": "2024-01-10T09:00:00Z",
  "updated_at": "2024-01-15T14:30:00Z"
}
```

**Error Response:**
- `404 Not Found`: Deal not found

---

### 8. Get Activities for Deal
Get all activities (stage changes, comments, etc.) for a specific deal.

**Endpoint:** `GET /activities/deal/{deal_id}`

**Access:** All authenticated users

**Path Parameters:**
- `deal_id` (integer, required): The ID of the deal

**Query Parameters:**
- `skip` (integer, optional): Number of records to skip (default: 0)
- `limit` (integer, optional): Maximum number of records to return (default: 100)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Example Request:**
```
GET /activities/deal/1?skip=0&limit=20
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "deal_id": 1,
    "user_id": 2,
    "activity_type": "stage_change",
    "description": "Deal created in sourced stage",
    "created_at": "2024-01-10T09:00:00Z"
  },
  {
    "id": 2,
    "deal_id": 1,
    "user_id": 2,
    "activity_type": "stage_change",
    "description": "Moved from sourced to screen",
    "created_at": "2024-01-11T10:15:00Z"
  },
  {
    "id": 3,
    "deal_id": 1,
    "user_id": 2,
    "activity_type": "stage_change",
    "description": "Moved from screen to diligence",
    "created_at": "2024-01-15T14:30:00Z"
  }
]
```

---

### 9. Add Comment to Deal
Add a comment to a deal.

**Endpoint:** `POST /activities/comment`

**Access:** All authenticated users (Admin, Analyst, Partner)

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "deal_id": 1,
  "comment": "This looks like a promising opportunity. Let's schedule a meeting."
}
```

**Response (201 Created):**
```json
{
  "id": 4,
  "deal_id": 1,
  "user_id": 3,
  "activity_type": "comment",
  "description": "This looks like a promising opportunity. Let's schedule a meeting.",
  "created_at": "2024-01-16T14:30:00Z"
}
```

**Note:** Creates an activity record with type `comment`.

---

### 10. Get User Vote on Deal
Check if the current user has voted on a deal.

**Endpoint:** `GET /activities/deal/{deal_id}/vote`

**Access:** All authenticated users

**Path Parameters:**
- `deal_id` (integer, required): The ID of the deal

**Headers:**
```
Authorization: Bearer <access_token>
```

**Example Request:**
```
GET /activities/deal/1/vote
```

**Response (200 OK):**
```json
{
  "id": 1,
  "deal_id": 1,
  "user_id": 3,
  "created_at": "2024-01-16T15:00:00Z"
}
```

**Response (200 OK - No vote):**
```
null
```

---

### 11. Get Memo by Deal ID
Get the IC memo for a specific deal.

**Endpoint:** `GET /memos/deal/{deal_id}`

**Access:** All authenticated users

**Path Parameters:**
- `deal_id` (integer, required): The ID of the deal

**Headers:**
```
Authorization: Bearer <access_token>
```

**Example Request:**
```
GET /memos/deal/1
```

**Response (200 OK):**
```json
{
  "id": 1,
  "deal_id": 1,
  "created_by_id": 2,
  "summary": "# Executive Summary\n\nTech Startup Inc is a B2B SaaS platform...",
  "market": "## Market Analysis\n\nThe TAM for this market is estimated at...",
  "product": "## Product Overview\n\nThe product offers...",
  "traction": "## Traction Metrics\n\n- MRR: $50k\n- Customers: 150\n- Growth rate: 20% MoM",
  "risks": "## Key Risks\n\n1. Market competition\n2. Customer acquisition costs",
  "open_questions": "## Open Questions\n\n1. Unit economics validation\n2. Technical scalability",
  "created_at": "2024-01-12T10:00:00Z",
  "updated_at": "2024-01-15T16:00:00Z"
}
```

**Error Response:**
- `404 Not Found`: Memo not found for this deal

---

### 12. Get Memo by ID
Get a memo by its ID.

**Endpoint:** `GET /memos/{memo_id}`

**Access:** All authenticated users

**Path Parameters:**
- `memo_id` (integer, required): The ID of the memo

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "id": 1,
  "deal_id": 1,
  "created_by_id": 2,
  "summary": "# Executive Summary\n\n...",
  "market": "## Market Analysis\n\n...",
  "product": "## Product Overview\n\n...",
  "traction": "## Traction Metrics\n\n...",
  "risks": "## Key Risks\n\n...",
  "open_questions": "## Open Questions\n\n...",
  "created_at": "2024-01-12T10:00:00Z",
  "updated_at": "2024-01-15T16:00:00Z"
}
```

---

### 13. Get Memo Version History
Get all versions of a memo.

**Endpoint:** `GET /memos/{memo_id}/versions`

**Access:** All authenticated users

**Path Parameters:**
- `memo_id` (integer, required): The ID of the memo

**Headers:**
```
Authorization: Bearer <access_token>
```

**Example Request:**
```
GET /memos/1/versions
```

**Response (200 OK):**
```json
[
  {
    "id": 3,
    "memo_id": 1,
    "version_number": 3,
    "summary": "# Executive Summary\n\nUpdated content...",
    "market": "## Market Analysis\n\n...",
    "product": "## Product Overview\n\n...",
    "traction": "## Traction Metrics\n\n...",
    "risks": "## Key Risks\n\n...",
    "open_questions": "## Open Questions\n\n...",
    "created_by_id": 2,
    "created_at": "2024-01-15T16:00:00Z"
  },
  {
    "id": 2,
    "memo_id": 1,
    "version_number": 2,
    "summary": "# Executive Summary\n\nPrevious content...",
    "market": "## Market Analysis\n\n...",
    "product": "## Product Overview\n\n...",
    "traction": "## Traction Metrics\n\n...",
    "risks": "## Key Risks\n\n...",
    "open_questions": "## Open Questions\n\n...",
    "created_by_id": 2,
    "created_at": "2024-01-14T12:00:00Z"
  },
  {
    "id": 1,
    "memo_id": 1,
    "version_number": 1,
    "summary": "# Executive Summary\n\nInitial content...",
    "market": "## Market Analysis\n\n...",
    "product": "## Product Overview\n\n...",
    "traction": "## Traction Metrics\n\n...",
    "risks": "## Key Risks\n\n...",
    "open_questions": "## Open Questions\n\n...",
    "created_by_id": 2,
    "created_at": "2024-01-12T10:00:00Z"
  }
]
```

---

### 14. Get Specific Memo Version
Get a specific version of a memo by version ID.

**Endpoint:** `GET /memos/versions/{version_id}`

**Access:** All authenticated users

**Path Parameters:**
- `version_id` (integer, required): The ID of the memo version

**Headers:**
```
Authorization: Bearer <access_token>
```

**Example Request:**
```
GET /memos/versions/2
```

**Response (200 OK):**
```json
{
  "id": 2,
  "memo_id": 1,
  "version_number": 2,
  "summary": "# Executive Summary\n\nPrevious version content...",
  "market": "## Market Analysis\n\n...",
  "product": "## Product Overview\n\n...",
  "traction": "## Traction Metrics\n\n...",
  "risks": "## Key Risks\n\n...",
  "open_questions": "## Open Questions\n\n...",
  "created_by_id": 2,
  "created_at": "2024-01-14T12:00:00Z"
}
```

**Error Response:**
- `404 Not Found`: Memo version not found

---

## Partner Only Endpoints

These endpoints are only accessible to users with the `partner` role.

### 15. Vote on Deal
Cast a vote on a deal. Partners only, one vote per partner per deal.

**Endpoint:** `POST /activities/deal/{deal_id}/vote`

**Access:** Partner only

**Path Parameters:**
- `deal_id` (integer, required): The ID of the deal

**Headers:**
```
Authorization: Bearer <partner_access_token>
```

**Example Request:**
```
POST /activities/deal/1/vote
```

**Response (201 Created):**
```json
{
  "id": 1,
  "deal_id": 1,
  "user_id": 3,
  "created_at": "2024-01-16T15:00:00Z"
}
```

**Error Responses:**
- `400 Bad Request`: User has already voted on this deal
- `403 Forbidden`: Insufficient permissions (not partner)
- `404 Not Found`: Deal not found

**Note:** Creates an activity record with type `vote`. Each partner can only vote once per deal.

---

### 16. Approve Deal
Approve a deal. Partners only. Changes deal status to `approved`.

**Endpoint:** `POST /activities/deal/{deal_id}/approve`

**Access:** Partner only

**Path Parameters:**
- `deal_id` (integer, required): The ID of the deal to approve

**Headers:**
```
Authorization: Bearer <partner_access_token>
```

**Example Request:**
```
POST /activities/deal/1/approve
```

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "Tech Startup Inc",
  "company_url": "https://techstartup.com",
  "owner_id": 2,
  "stage": "ic",
  "round": "Series A",
  "check_size": "500000.00",
  "status": "approved",
  "created_at": "2024-01-10T09:00:00Z",
  "updated_at": "2024-01-16T16:00:00Z"
}
```

**Note:** Creates an activity record with type `approval` and updates deal status to `approved`.

**Error Responses:**
- `403 Forbidden`: Insufficient permissions (not partner)
- `404 Not Found`: Deal not found

---

### 17. Decline Deal
Decline a deal. Partners only. Changes deal status to `declined`.

**Endpoint:** `POST /activities/deal/{deal_id}/decline`

**Access:** Partner only

**Path Parameters:**
- `deal_id` (integer, required): The ID of the deal to decline

**Headers:**
```
Authorization: Bearer <partner_access_token>
```

**Example Request:**
```
POST /activities/deal/1/decline
```

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "Tech Startup Inc",
  "company_url": "https://techstartup.com",
  "owner_id": 2,
  "stage": "ic",
  "round": "Series A",
  "check_size": "500000.00",
  "status": "declined",
  "created_at": "2024-01-10T09:00:00Z",
  "updated_at": "2024-01-16T16:30:00Z"
}
```

**Note:** Creates an activity record with type `decline` and updates deal status to `declined`.

**Error Responses:**
- `403 Forbidden`: Insufficient permissions (not partner)
- `404 Not Found`: Deal not found

---

## Admin Only Endpoints

These endpoints are only accessible to users with the `admin` role.

### 18. List All Users
Get a list of all users in the system.

**Endpoint:** `GET /users`

**Access:** Admin only

**Query Parameters:**
- `skip` (integer, optional): Number of records to skip (default: 0)
- `limit` (integer, optional): Maximum number of records to return (default: 100)

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Example Request:**
```
GET /users?skip=0&limit=10
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "email": "admin@example.com",
    "full_name": "Admin User",
    "role": "admin",
    "is_active": true,
    "created_at": "2024-01-01T08:00:00Z",
    "updated_at": null
  },
  {
    "id": 2,
    "email": "analyst@example.com",
    "full_name": "John Analyst",
    "role": "analyst",
    "is_active": true,
    "created_at": "2024-01-05T09:00:00Z",
    "updated_at": null
  },
  {
    "id": 3,
    "email": "partner@example.com",
    "full_name": "Jane Partner",
    "role": "partner",
    "is_active": true,
    "created_at": "2024-01-08T10:00:00Z",
    "updated_at": null
  }
]
```

---

### 19. Get User by ID
Get detailed information about a specific user.

**Endpoint:** `GET /users/{user_id}`

**Access:** Admin only

**Path Parameters:**
- `user_id` (integer, required): The ID of the user

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Example Request:**
```
GET /users/2
```

**Response (200 OK):**
```json
{
  "id": 2,
  "email": "analyst@example.com",
  "full_name": "John Analyst",
  "role": "analyst",
  "is_active": true,
  "created_at": "2024-01-05T09:00:00Z",
  "updated_at": null
}
```

**Error Response:**
- `404 Not Found`: User not found

---

### 20. Create User
Create a new user account.

**Endpoint:** `POST /users`

**Access:** Admin only

**Headers:**
```
Authorization: Bearer <admin_access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "securepassword123",
  "full_name": "New User",
  "role": "analyst"
}
```

**Available Roles:**
- `admin`: Full access, can manage users
- `analyst`: Can create/edit deals and memos
- `partner`: Can view deals and activities (future: comment, vote, approve/decline)

**Response (201 Created):**
```json
{
  "id": 4,
  "email": "newuser@example.com",
  "full_name": "New User",
  "role": "analyst",
  "is_active": true,
  "created_at": "2024-01-16T10:00:00Z",
  "updated_at": null
}
```

**Error Responses:**
- `400 Bad Request`: Email already registered
- `403 Forbidden`: Insufficient permissions (not admin)

---

### 21. Update User
Update an existing user's information.

**Endpoint:** `PUT /users/{user_id}`

**Access:** Admin only

**Path Parameters:**
- `user_id` (integer, required): The ID of the user to update

**Headers:**
```
Authorization: Bearer <admin_access_token>
Content-Type: application/json
```

**Request Body (all fields optional):**
```json
{
  "email": "updated@example.com",
  "full_name": "Updated Name",
  "role": "partner",
  "is_active": false
}
```

**Example Request:**
```
PUT /users/2
```

**Response (200 OK):**
```json
{
  "id": 2,
  "email": "updated@example.com",
  "full_name": "Updated Name",
  "role": "partner",
  "is_active": false,
  "created_at": "2024-01-05T09:00:00Z",
  "updated_at": "2024-01-16T11:00:00Z"
}
```

**Error Responses:**
- `404 Not Found`: User not found
- `403 Forbidden`: Insufficient permissions (not admin)

---

## Admin & Analyst Endpoints

These endpoints are accessible to users with `admin` or `analyst` roles.

### 22. Create Deal
Create a new deal in the pipeline.

**Endpoint:** `POST /deals`

**Access:** Admin, Analyst

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "New Tech Company",
  "company_url": "https://newtechcompany.com",
  "stage": "sourced",
  "round": "Seed",
  "check_size": "100000.00",
  "status": "active"
}
```

**Available Stages:**
- `sourced`: Initial stage
- `screen`: Screening stage
- `diligence`: Due diligence stage
- `ic`: Investment committee stage
- `invested`: Deal invested
- `passed`: Deal passed/rejected

**Available Status:**
- `active`: Active deal
- `approved`: Deal approved by partner
- `declined`: Deal declined by partner

**Response (201 Created):**
```json
{
  "id": 3,
  "name": "New Tech Company",
  "company_url": "https://newtechcompany.com",
  "owner_id": 2,
  "stage": "sourced",
  "round": "Seed",
  "check_size": "100000.00",
  "status": "active",
  "created_at": "2024-01-16T12:00:00Z",
  "updated_at": null
}
```

**Note:** Creating a deal automatically creates an activity record: "Deal created in {stage} stage"

**Error Response:**
- `403 Forbidden`: Insufficient permissions (not admin or analyst)

---

### 23. Update Deal
Update an existing deal. Changing the stage automatically creates an activity record.

**Endpoint:** `PUT /deals/{deal_id}`

**Access:** Admin, Analyst

**Path Parameters:**
- `deal_id` (integer, required): The ID of the deal to update

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body (all fields optional):**
```json
{
  "name": "Updated Company Name",
  "company_url": "https://updatedurl.com",
  "stage": "diligence",
  "round": "Series A",
  "check_size": "500000.00",
  "status": "active"
}
```

**Example Request:**
```
PUT /deals/1
```

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "Updated Company Name",
  "company_url": "https://updatedurl.com",
  "owner_id": 2,
  "stage": "diligence",
  "round": "Series A",
  "check_size": "500000.00",
  "status": "active",
  "created_at": "2024-01-10T09:00:00Z",
  "updated_at": "2024-01-16T13:00:00Z"
}
```

**Note:** If the stage is changed, an activity is automatically created: "Moved from {old_stage} to {new_stage}"

**Error Responses:**
- `404 Not Found`: Deal not found
- `403 Forbidden`: Insufficient permissions (not admin or analyst)

---

### 24. Delete Deal
Delete a deal from the pipeline.

**Endpoint:** `DELETE /deals/{deal_id}`

**Access:** Admin, Analyst

**Path Parameters:**
- `deal_id` (integer, required): The ID of the deal to delete

**Headers:**
```
Authorization: Bearer <access_token>
```

**Example Request:**
```
DELETE /deals/3
```

**Response (204 No Content):**
No response body

**Error Responses:**
- `404 Not Found`: Deal not found
- `403 Forbidden`: Insufficient permissions (not admin or analyst)

---

### 25. Create Memo
Create an IC memo for a deal.

**Endpoint:** `POST /memos`

**Access:** Admin, Analyst

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "deal_id": 1,
  "summary": "# Executive Summary\n\nThis is the executive summary of the deal...",
  "market": "## Market Analysis\n\nMarket size and opportunity analysis...",
  "product": "## Product Overview\n\nProduct description and features...",
  "traction": "## Traction Metrics\n\n- MRR: $50k\n- Customers: 150",
  "risks": "## Key Risks\n\n1. Market competition\n2. Regulatory risks",
  "open_questions": "## Open Questions\n\n1. Unit economics\n2. Scalability"
}
```

**Note:** All sections support markdown/plain text. All fields except `deal_id` are optional.

**Response (201 Created):**
```json
{
  "id": 1,
  "deal_id": 1,
  "created_by_id": 2,
  "summary": "# Executive Summary\n\nThis is the executive summary of the deal...",
  "market": "## Market Analysis\n\nMarket size and opportunity analysis...",
  "product": "## Product Overview\n\nProduct description and features...",
  "traction": "## Traction Metrics\n\n- MRR: $50k\n- Customers: 150",
  "risks": "## Key Risks\n\n1. Market competition\n2. Regulatory risks",
  "open_questions": "## Open Questions\n\n1. Unit economics\n2. Scalability",
  "created_at": "2024-01-16T14:00:00Z",
  "updated_at": null
}
```

**Note:** Creating a memo automatically creates version 1.

**Error Responses:**
- `400 Bad Request`: Memo already exists for this deal
- `403 Forbidden`: Insufficient permissions (not admin or analyst)

---

### 26. Update Memo
Update an IC memo. Each update creates a new version automatically.

**Endpoint:** `PUT /memos/{memo_id}`

**Access:** Admin, Analyst

**Path Parameters:**
- `memo_id` (integer, required): The ID of the memo to update

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body (all fields optional):**
```json
{
  "summary": "# Updated Executive Summary\n\nUpdated content...",
  "market": "## Updated Market Analysis\n\n...",
  "product": "## Updated Product Overview\n\n...",
  "traction": "## Updated Traction\n\n- MRR: $60k\n- Customers: 180",
  "risks": "## Updated Risks\n\n1. Competition\n2. Market saturation",
  "open_questions": "## Updated Questions\n\n1. Scalability validated\n2. New questions..."
}
```

**Example Request:**
```
PUT /memos/1
```

**Response (200 OK):**
```json
{
  "id": 1,
  "deal_id": 1,
  "created_by_id": 2,
  "summary": "# Updated Executive Summary\n\nUpdated content...",
  "market": "## Updated Market Analysis\n\n...",
  "product": "## Updated Product Overview\n\n...",
  "traction": "## Updated Traction\n\n- MRR: $60k\n- Customers: 180",
  "risks": "## Updated Risks\n\n1. Competition\n2. Market saturation",
  "open_questions": "## Updated Questions\n\n1. Scalability validated\n2. New questions...",
  "created_at": "2024-01-16T14:00:00Z",
  "updated_at": "2024-01-16T15:00:00Z"
}
```

**Note:** 
- Updating a memo automatically creates a new version snapshot (saves current state before update)
- An activity is automatically created: "Memo updated (version {version_number})"

**Error Responses:**
- `404 Not Found`: Memo not found
- `403 Forbidden`: Insufficient permissions (not admin or analyst)

---

## Error Responses

### Standard Error Format
```json
{
  "detail": "Error message description"
}
```

### Common HTTP Status Codes
- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `204 No Content`: Request successful, no response body
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required or invalid token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `422 Unprocessable Entity`: Validation error

---

## Data Models Reference

### Deal Stages
- `sourced`: Initial deal sourcing
- `screen`: Screening phase
- `diligence`: Due diligence phase
- `ic`: Investment committee review
- `invested`: Deal completed/invested
- `passed`: Deal rejected/passed

### Deal Status
- `active`: Active deal
- `approved`: Deal approved by partner
- `declined`: Deal declined by partner

### User Roles
- `admin`: Full system access, can manage users
- `analyst`: Can create/edit deals and memos
- `partner`: Can view deals and activities, add comments, vote, approve/decline deals

### Activity Types
- `stage_change`: Deal stage changed
- `comment`: Comment added to deal
- `vote`: Vote cast on deal
- `approval`: Deal approved by partner
- `decline`: Deal declined by partner
- `memo_updated`: Memo updated

---

## Quick Reference by Access Level

### Public
- `GET /` - Root/API Info
- `GET /health` - Health Check
- `POST /users/login` - Login
- `POST /users/register` - Register new user

### All Authenticated Users (Admin, Analyst, Partner)
- `GET /users/me` - Get current user
- `GET /deals` - List deals
- `GET /deals/{deal_id}` - Get deal
- `GET /activities/deal/{deal_id}` - Get deal activities
- `POST /activities/comment` - Add comment to deal
- `GET /activities/deal/{deal_id}/vote` - Get user vote on deal
- `GET /memos/deal/{deal_id}` - Get memo by deal
- `GET /memos/{memo_id}` - Get memo
- `GET /memos/{memo_id}/versions` - Get memo versions
- `GET /memos/versions/{version_id}` - Get memo version

### Partner Only
- `POST /activities/deal/{deal_id}/vote` - Vote on deal
- `POST /activities/deal/{deal_id}/approve` - Approve deal
- `POST /activities/deal/{deal_id}/decline` - Decline deal

### Admin Only
- `GET /users` - List users
- `GET /users/{user_id}` - Get user
- `POST /users` - Create user
- `PUT /users/{user_id}` - Update user

### Admin & Analyst
- `POST /deals` - Create deal
- `PUT /deals/{deal_id}` - Update deal
- `DELETE /deals/{deal_id}` - Delete deal
- `POST /memos` - Create memo
- `PUT /memos/{memo_id}` - Update memo
