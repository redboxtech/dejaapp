# DejaBackend - .NET 8 Web API

This project is a robust and scalable backend implemented in **.NET 8** following the principles of **Clean Architecture** (Onion/Hexagonal). It is designed to serve the Deja frontend application, providing core functionalities for user authentication, patient management, medication tracking, stock control, and replenishment requests.

## 1. Architecture Overview

The project is structured into four layers to ensure a clear separation of concerns, maintainability, and testability:

| Layer | Responsibility | Key Components |
| :--- | :--- | :--- |
| **DejaBackend.Api** | Presentation Layer (Entry Point) | ASP.NET Core Controllers, Dependency Injection setup, CORS, JWT Configuration. |
| **DejaBackend.Application** | Business Logic | MediatR Commands/Queries/Handlers, Interfaces (`IApplicationDbContext`, `ICurrentUserService`, `IJwtService`), DTOs. |
| **DejaBackend.Domain** | Core Business Rules | Entities (`User`, `Patient`, `Medication`, etc.), Enums, Value Objects. **No external dependencies.** |
| **DejaBackend.Infrastructure** | Data Access & External Services | Entity Framework Core (`ApplicationDbContext`), Identity implementation, JWT Service, Repository implementations. |

## 2. Getting Started

### Prerequisites

*   [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
*   A code editor (e.g., Visual Studio Code, Visual Studio)

### Setup and Run

1.  **Clone the repository (or navigate to the project root):**
    ```bash
    cd DejaBackend
    ```

2.  **Restore dependencies:**
    ```bash
    dotnet restore
    ```

3.  **Apply Database Migrations:**
    The project uses SQLite for simplicity. The database file (`deja.db`) will be created automatically.
    ```bash
    dotnet ef database update --project DejaBackend.Infrastructure --startup-project DejaBackend.Api
    ```

4.  **Run the application:**
    ```bash
    dotnet run --project DejaBackend.Api
    ```
    The API will typically run on `https://localhost:7001` and `http://localhost:5001`.

## 3. API Endpoints

The API documentation is available via **Swagger UI** when the application is running.

### Authentication

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Registers a new user. |
| `POST` | `/api/auth/login` | Authenticates a user and returns a JWT token. |

### Patients (Requires JWT Token)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/patients` | Retrieves all patients owned by or shared with the current user. |
| `POST` | `/api/patients` | Adds a new patient. |
| `PUT` | `/api/patients/{id}` | Updates an existing patient (owner only). |
| `DELETE` | `/api/patients/{id}` | Deletes a patient (owner only). |
| `POST` | `/api/patients/{id}/share` | Shares a patient with another representative (owner only). |

### Medications (Requires JWT Token)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/medications` | Retrieves all medications for accessible patients. |
| `POST` | `/api/medications` | Adds a new medication and initializes its stock. |
| `PUT` | `/api/medications/{id}` | Updates a medication's details (owner only). |
| `DELETE` | `/api/medications/{id}` | Deletes a medication (owner only). |

### Stock and Replenishment (Requires JWT Token)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/stock/entry` | Adds a stock entry (replenishment) for a medication. |
| `GET` | `/api/replenishment` | Retrieves all replenishment requests relevant to the user (requested by or owned). |
| `POST` | `/api/replenishment` | Creates a new replenishment request. |
| `POST` | `/api/replenishment/{id}/approve` | Approves a request, updating the stock (medication owner only). |
| `POST` | `/api/replenishment/{id}/reject` | Rejects a request (medication owner only). |

## 4. Configuration

The application uses `appsettings.json` for configuration.

| Setting | Location | Description |
| :--- | :--- | :--- |
| `ConnectionStrings:DefaultConnection` | `appsettings.json` | SQLite connection string (`Data Source=deja.db`). |
| `Jwt:Key` | `appsettings.json` | Secret key for JWT signing. **MUST be kept secure and long.** |
| `Jwt:Issuer` | `appsettings.json` | Issuer of the JWT token. |
| `Jwt:Audience` | `appsettings.json` | Audience of the JWT token. |

## 5. Next Steps for Frontend Integration

1.  **Update API URLs:** Change the frontend's API base URL to point to the running backend instance (e.g., `https://localhost:7001/api`).
2.  **Update Auth Logic:** The frontend's `login` and `register` functions must now send requests to the backend's `/api/auth/login` and `/api/auth/register` endpoints and store the returned JWT token.
3.  **Attach JWT Token:** All subsequent requests to protected endpoints (`/api/patients`, `/api/medications`, etc.) must include the JWT token in the `Authorization` header in the format: `Bearer YOUR_TOKEN`.
4.  **Handle Data Structure:** The frontend should be updated to handle the data structures (DTOs) returned by the .NET API. The current implementation uses `Guid` for IDs, which will be returned as strings in the JSON response.

---
*Developed by Manus AI*
