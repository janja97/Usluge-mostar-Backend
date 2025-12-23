# ServiGo Backend 🛠️

## 🌟 Service Provider Platform API

ServiGo is a modern web application designed to connect independent workers, freelancers, and small organizations (such as plumbers, babysitters, caregivers, etc.) with users looking for their services. This repository hosts the robust **Backend API** that manages all data, business logic, and real-time communication for the platform.

### Key Features of the API:

* **User Management & Authentication:** Secure registration, login, and authorization via **JWT**.
* **Service & Ad Management:** Complete CRUD operations for service listings and user requests (ads).
* **Real-Time Messaging (Chat):** Instant communication between users powered by **Socket.IO**.
* **Review and Rating System:** Allows users to rate providers for transparency and trust.
* **Media Handling:** Secure user profile and service image uploads and processing.

---

## 💻 Tech Stack

This backend is built on the **MERN** stack, focusing on performance, scalability, and real-time capabilities.

| Component | Technology | Role and Key Packages |
| :--- | :--- | :--- |
| **Server** | **Node.js, Express** | Core runtime and minimal web framework. |
| **Database** | **MongoDB (Mongoose)** | NoSQL database with an object data modeling (ODM) layer. |
| **Real-Time** | **Socket.IO** | Enables persistent, bi-directional communication for the chat feature. |
| **Security** | **JWT, bcrypt/bcryptjs** | Token-based authorization and secure password hashing. |
| **Media/Uploads** | **Multer, Sharp** | Handling multipart form data and high-performance image processing/resizing. |
| **Utilities** | **CORS, dotenv** | Cross-Origin Resource Sharing and environment variable management. |

---

## 🚀 Getting Started

Follow these instructions to set up and run the ServiGo Backend locally.

### 1. Prerequisites

Ensure you have the following installed:

* [Node.js](https://nodejs.org/en) (LTS recommended)
* [MongoDB](https://www.mongodb.com/try/download/community) (Local instance or remote cluster like Atlas)

### 2. Installation

1.  Clone the repository:
    ```bash
    git clone [YOUR_REPO_URL]
    cd servigo-backend
    ```
2.  Install dependencies using npm:
    ```bash
    npm install
    ```

### 3. Environment Configuration

Create a file named `.env` in the root directory and define the following variables:

```env
# MongoDB Connection String (e.g., local or Atlas URI)
MONGODB_URI="mongodb://localhost:27017/servigo" 

# Server Port 
PORT=5000 

# Secret key for signing JSON Web Tokens (MUST be a long, random, secure string)
JWT_SECRET="your_very_secure_secret_key_change_me_in_production"

```

### 4. Running the Server

Use the defined scripts from package.json:

1. Development Mode (Recommended): Uses nodemon to automatically restart the server on file changes.

 ```bash
  npm ran dev
 ```

2. Production Mode: Starts the server directly with Node.js.

 ```bash
  npm start
 ```

The API will be accessible at http://localhost:5000 (or your defined PORT).


🗺️ API Endpoints Overview

All routes are prefixed with /api/.
Path,Method,Description,Authentication Required
/api/auth/register,POST,Creates a new user account.,No
/api/auth/login,POST,Authenticates user and returns a JWT token.,No
/api/users/:id,GET/PUT,Retrieve or update a user's profile information.,Yes
/api/services,GET/POST,Search services or create a new service listing/ad.,Yes (for POST)
/api/favorites,POST/DELETE,Add or remove a provider/service from favorites.,Yes
/api/reviews,POST/GET,Post a new rating/review or fetch reviews for a user.,Yes (for POST)
/api/messages,GET,Retrieve list of conversations and message history.,Yes


Apsolutno, sve informacije su bazirane na kodu (service.js) i ovisnostima (package.json) koje si mi dao, tako da su vrlo precizne.Sada ću kreirati kompletan, prezentativan README.md fajl na engleskom jeziku koji možeš direktno kopirati i zalijepiti u svoj GitHub repozitorij.Markdown# ServiGo Backend 🛠️

## 🌟 Service Provider Platform API

ServiGo is a modern web application designed to connect independent workers, freelancers, and small organizations (such as plumbers, babysitters, caregivers, etc.) with users looking for their services. This repository hosts the robust **Backend API** that manages all data, business logic, and real-time communication for the platform.

### Key Features of the API:

* **User Management & Authentication:** Secure registration, login, and authorization via **JWT**.
* **Service & Ad Management:** Complete CRUD operations for service listings and user requests (ads).
* **Real-Time Messaging (Chat):** Instant communication between users powered by **Socket.IO**.
* **Review and Rating System:** Allows users to rate providers for transparency and trust.
* **Media Handling:** Secure user profile and service image uploads and processing.

---

## 💻 Tech Stack

This backend is built on the **MERN** stack, focusing on performance, scalability, and real-time capabilities.

| Component | Technology | Role and Key Packages |
| :--- | :--- | :--- |
| **Server** | **Node.js, Express** | Core runtime and minimal web framework. |
| **Database** | **MongoDB (Mongoose)** | NoSQL database with an object data modeling (ODM) layer. |
| **Real-Time** | **Socket.IO** | Enables persistent, bi-directional communication for the chat feature. |
| **Security** | **JWT, bcrypt/bcryptjs** | Token-based authorization and secure password hashing. |
| **Media/Uploads** | **Multer, Sharp** | Handling multipart form data and high-performance image processing/resizing. |
| **Utilities** | **CORS, dotenv** | Cross-Origin Resource Sharing and environment variable management. |

---

## 🚀 Getting Started

Follow these instructions to set up and run the ServiGo Backend locally.

### 1. Prerequisites

Ensure you have the following installed:

* [Node.js](https://nodejs.org/en) (LTS recommended)
* [MongoDB](https://www.mongodb.com/try/download/community) (Local instance or remote cluster like Atlas)

### 2. Installation

1.  Clone the repository:
    ```bash
    git clone ...
    cd servigo-backend
    ```
2.  Install dependencies using npm:
    ```bash
    npm install
    ```

### 3. Environment Configuration

Create a file named `.env` in the root directory and define the following variables:

```env
# MongoDB Connection String (e.g., local or Atlas URI)
MONGODB_URI="mongodb://localhost:27017/servigo" 

# Server Port 
PORT=5000 

# Secret key for signing JSON Web Tokens (MUST be a long, random, secure string)
JWT_SECRET="your_very_secure_secret_key_change_me_in_production" 

```
### 4. Running the Server
Use the defined scripts from package.json:
Development Mode (Recommended): Uses nodemon to automatically restart the server on file changes.
```bash
    npm run dev
```
Production Mode: Starts the server directly with Node.js.
```bash
    npm start
```
The API will be accessible at http://localhost:5000 (or your defined PORT).

### 🗺️ API Endpoints Overview
## 🗺️ API Endpoints Overview

All routes are prefixed with `/api/`.

| Path | Method | Description | Authentication Required |
| :--- | :--- | :--- | :--- |
| `/api/auth/register` | `POST` | Creates a new user account. | No |
| `/api/auth/login` | `POST` | Authenticates user and returns a **JWT token**. | No |
| `/api/users/:id` | `GET`/`PUT` | Retrieve or update a specific user's profile information. | Yes |
| `/api/services` | `GET`/`POST` | Search services / Create a new service listing or ad. | Yes (for POST) |
| `/api/favorites` | `POST`/`DELETE` | Add or remove a provider/service from the user's favorites list. | Yes |
| `/api/reviews` | `POST`/`GET` | Post a new rating/review or fetch reviews for a specific service or user. | Yes (for POST) |
| `/api/messages` | `GET` | Retrieve list of conversations and message history for the authenticated user. | Yes |

### 💬 Real-Time Communication (Socket.IO)
The chat functionality is handled by a separate WebSocket layer integrated into the Express server.

Socket Authentication Flow
Client connects to Socket.IO, sending the valid JWT token via the auth object or query parameters.

The server's Socket.IO middleware verifies the token using jsonwebtoken and attaches the userId to the socket instance.

If validation fails, the connection is rejected.

### Key Socket Events

| Event Name | Direction | Payload Example | Description |
| :--- | :--- | :--- | :--- |
| `sendMessage` | Client $\rightarrow$ Server | `{ to: userId, content: 'Hi there' }` | Client sends a new message (text or image data). The server saves it to the database and forwards it to the receiver. |
| `newMessage` | Server $\rightarrow$ Client | `{ _id: '...', sender: {}, content: '...' }` | Notifies the recipient (and the sender, for confirmation) that a new message has arrived. |
| `markRead` | Client $\rightarrow$ Server | `{ conversationWith: otherUserId }` | Client notifies the server that all messages from the specified user in the current conversation should be marked as read. |

