# Medical-Chain

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org/)
[![Solidity](https://img.shields.io/badge/Solidity-%5E0.8.0-363636?logo=solidity)](https://soliditylang.org/)
[![Truffle](https://img.shields.io/badge/Truffle-Framework-f0ad4e)](https://trufflesuite.com/)

A decentralized application (DApp) for managing and tracking hospital sanitization processes using blockchain technology. This system ensures transparency, immutability, and accountability in healthcare stuff hygiene management.

## Features

- Real-time sanitization task tracking
- Historical data with immutable blockchain records
- Real-time sanitization status dashboard
- Smart contract-based task validation


## Technologies Used

### Frontend
- **HTML5/CSS3/JavaScript**: Core web technologies
- **Web3.js**: Ethereum blockchain interaction
- **MetaMask**: Crypto wallet integration
- **Bootstrap**: Responsive UI framework

### Backend
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework

### Database
- **MongoDB Atlas**: Cloud-hosted NoSQL database, free tier
- **Mongoose**: MongoDB object modeling

### Blockchain
- **Solidity**: Smart contract programming language
- **Truffle Suite**: Development framework
  - Truffle: Smart contract compilation and deployment
  - Ganache: Local blockchain for testing
- **Ethereum**: Blockchain platform
- **MetaMask**: Browser-based wallet

### Development Tools
- **npm**: Package manager
- **Git**: Version control
- **Nodemon**: Development server auto-restart

## Prerequisites

Before running this project, ensure you have the following installed:

- **Node.js** (v16.0.0 or higher)
- **npm** (v7.0.0 or higher)
- **MetaMask** browser extension
- **MongoDB Atlas** account (for production)
- **Truffle Suite**

```bash
# Install Truffle globally
npm install -g truffle
```

## Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/benzebra/medical-chain.git
cd medical-chain
```

### 2. Install Dependencies
```bash
# Install dependencies
npm install

### 3. Environment Configuration
Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3002

# Database Configuration
MONGODB_URI=mongodb+srv://user:user@medical-chain.dq3npdk.mongodb.net/
```

### 4. Database Setup
```bash
# MongoDB Atlas setup is handled automatically
# Ensure your MongoDB URI is correct in .env file
```

### 5. Smart Contract Deployment

#### For Local Development (Ganache):
```bash
# Start Ganache
ganache-cli

# Compile and deploy contracts
truffle compile
truffle migrate
```

### 6. Start the Application
```bash
# Start the backend server and frontend application
npm run start:all
```

The application will be available at:
- **Frontend**: http://localhost:3000

## Usage

### Initial Setup
1. **Install MetaMask** and create/import a wallet
2. **Configure Network**: Add your local Ganache network or testnet
3. **Import Accounts**: Import test accounts from Ganache for development
4. **Access Application**: Navigate to http://localhost:3000

### User Roles & Access
- The user and roles are totally handled by MetaMask
- All the users are able to *use*, *clean* and *create* objects
- All the users are able to look at the last activities

### Smart Contract Interactions
The DApp interacts with smart contract:

#### Contract
```solidity
// Contract for managing user roles and permissions
contract Cleaning {
    uint256 public numObjects;
    address[] public cleaned;
    address[] public used;
    uint256[] public timestamp;

    constructor(uint256 _numObjects) public {
        ...
    }

    function cleanObject(uint objectId) public returns (bool) {
        ...
    }

    function useObject(uint objectId) public returns (bool) {
        ...
    }
}
```

## Testing

### Unit Tests
```bash
# Run Solidity contract tests
truffle test
```

## API Documentation

### Sanitization Management
```http
GET     /api/objects                            Get all the objects in the DB
POST    /api/objects                            Add a new object
PUT     /api/objects/:id/blockchain-status      Update object status
```

## Mobile Responsiveness

The application is fully responsive and optimized for:
- **Desktop**: Full feature set with comprehensive dashboards
- **Tablet**: Optimized interface for managers and inspectors
- **Mobile**: Essential features for staff task management (*TODO*: implement QR-Code scanner)


## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Project Statistics

![GitHub stars](https://img.shields.io/github/stars/benzebra/medical-chain)
![GitHub forks](https://img.shields.io/github/forks/benzebra/medical-chain)
![GitHub issues](https://img.shields.io/github/issues/benzebra/medical-chain)
![GitHub pull requests](https://img.shields.io/github/issues-pr/benzebra/medical-chain)
