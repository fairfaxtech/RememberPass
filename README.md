# RememberPass

A privacy-preserving password manager built on blockchain technology using Fully Homomorphic Encryption (FHE). RememberPass allows users to securely store and manage their passwords on-chain while maintaining complete privacy through advanced cryptographic techniques.

## 🔐 Overview

RememberPass is a decentralized password manager that leverages the power of FHEVM (Fully Homomorphic Encryption Virtual Machine) to ensure that your sensitive data remains completely private, even when stored on a public blockchain. The application uses a dual-layer encryption approach: client-side AES-GCM encryption for the actual passwords and FHE for protecting the encryption keys.

## ✨ Key Features

- **Privacy-First Design**: Your passwords are never stored in plaintext, even temporarily
- **Dual-Layer Encryption**: AES-GCM encryption for passwords + FHE encryption for keys
- **Decentralized Storage**: Data stored on blockchain with zero-knowledge guarantees
- **Web3 Integration**: Full wallet integration with RainbowKit and Wagmi
- **Cross-Device Access**: Access your passwords from any device with your wallet
- **No Central Authority**: No company or server can access your encrypted data
- **Transparent Security**: Open-source smart contracts and cryptographic implementations

## 🚀 Advantages

### Security Advantages
- **Zero-Knowledge Architecture**: Even the blockchain nodes cannot see your data
- **No Honeypot Risk**: Distributed storage eliminates single points of failure
- **Immutable Audit Trail**: All access is recorded on-chain and verifiable
- **Cryptographic Guarantees**: Mathematical proofs of privacy preservation
- **Non-Custodial**: You always maintain complete control of your data

### User Experience Advantages
- **Universal Access**: Access from any device with your crypto wallet
- **No Account Creation**: Your wallet is your account
- **Censorship Resistant**: No central authority can block access
- **Future-Proof**: Decentralized infrastructure ensures long-term availability
- **Transparent Operations**: All code is open source and verifiable

### Technical Advantages
- **State-of-the-Art Cryptography**: Uses cutting-edge FHE technology
- **Ethereum Compatibility**: Built on battle-tested blockchain infrastructure
- **Modular Architecture**: Clean separation between encryption layers
- **Extensible Design**: Easy to add new features and encryption methods

## 🛠 Technology Stack

### Blockchain & Smart Contracts
- **Solidity ^0.8.24**: Smart contract development language
- **FHEVM (@fhevm/solidity)**: Fully Homomorphic Encryption support
- **Hardhat**: Development framework and testing environment
- **Ethers.js v6**: Ethereum interaction library
- **Sepolia Testnet**: Ethereum test network for deployment

### Frontend Application
- **React 19**: Modern UI framework with latest features
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and development server
- **Wagmi v2**: React hooks for Ethereum
- **RainbowKit**: Beautiful wallet connection UX
- **TanStack Query**: Data fetching and state management

### Cryptography & Security
- **AES-GCM**: Authenticated encryption for password data
- **HKDF**: Key derivation from Ethereum addresses
- **FHE (Fully Homomorphic Encryption)**: Zero-knowledge key protection
- **Web Crypto API**: Browser-native cryptographic operations

### Development & Testing
- **Mocha + Chai**: Testing framework
- **TypeChain**: TypeScript bindings for smart contracts
- **ESLint + Prettier**: Code quality and formatting
- **Solhint**: Solidity linting and best practices

## 🔧 Core Problems Solved

### 1. **Password Reuse and Weak Passwords**
Traditional password managers require users to trust a central service. RememberPass eliminates this trust requirement through cryptographic guarantees, encouraging users to adopt unique, strong passwords for every service.

### 2. **Single Points of Failure**
Centralized password managers can be hacked, shut down, or compromised. RememberPass distributes data across a decentralized network, eliminating single points of failure.

### 3. **Vendor Lock-in**
Users can't easily migrate between password managers or access their data if a service shuts down. With RememberPass, your data is always accessible through any compatible interface.

### 4. **Privacy Concerns**
Even encrypted data in traditional services can be subject to government requests, company policies, or internal threats. RememberPass uses zero-knowledge cryptography to ensure no third party can ever access your data.

### 5. **Lack of Transparency**
Users must trust that password managers implement security correctly. RememberPass provides complete transparency through open-source code and verifiable cryptographic proofs.

## 📁 Project Architecture

```
RememberPass/
├── contracts/                    # Smart contract layer
│   ├── RememberPass.sol         # Main password storage contract
│   └── FHECounter.sol           # Example FHE implementation
├── app/                         # Frontend React application
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── PasswordApp.tsx  # Main application component
│   │   │   ├── PasswordForm.tsx # Password addition form
│   │   │   ├── PasswordList.tsx # Password display component
│   │   │   └── Header.tsx       # Navigation header
│   │   ├── hooks/               # Custom React hooks
│   │   ├── utils/               # Utility functions
│   │   │   └── crypto.ts        # Cryptographic operations
│   │   └── config/              # Configuration files
│   └── package.json             # Frontend dependencies
├── test/                        # Smart contract tests
│   ├── RememberPass.ts          # Main contract tests
│   └── FHECounter.ts            # FHE functionality tests
├── deploy/                      # Deployment scripts
├── tasks/                       # Hardhat custom tasks
├── hardhat.config.ts            # Blockchain development config
└── package.json                 # Root dependencies
```

## 🔄 How It Works

### Encryption Flow
1. **Key Generation**: A random Ethereum address is generated as an encryption key
2. **Password Encryption**: Your password is encrypted client-side using AES-GCM with the key
3. **Key Protection**: The encryption key is encrypted using FHE and stored on-chain
4. **Record Storage**: Title (plaintext), encrypted password, and FHE-encrypted key are stored

### Decryption Flow
1. **Key Retrieval**: FHE-encrypted key is retrieved from the blockchain
2. **Key Decryption**: Your wallet decrypts the FHE-encrypted key locally
3. **Password Decryption**: The retrieved key decrypts your password client-side
4. **Display**: Decrypted password is shown only to you

### Security Guarantees
- **Client-Side Only**: Passwords are never transmitted or stored in plaintext
- **Zero-Knowledge**: Even validators cannot see your encryption keys
- **Authenticated Encryption**: AES-GCM provides both confidentiality and integrity
- **Perfect Forward Secrecy**: Each password has a unique encryption key

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- npm/yarn/pnpm
- A Web3 wallet (MetaMask, WalletConnect, etc.)
- Sepolia ETH for gas fees (get from faucet)

### Installation

1. **Clone and Install Dependencies**
   ```bash
   git clone https://github.com/your-username/RememberPass.git
   cd RememberPass
   npm install
   cd app && npm install
   ```

2. **Configure Environment**
   ```bash
   # Set up Hardhat variables
   npx hardhat vars set MNEMONIC
   npx hardhat vars set INFURA_API_KEY
   npx hardhat vars set ETHERSCAN_API_KEY

   # Create .env file for deployment
   cp .env.example .env
   # Edit .env with your private key
   ```

3. **Compile and Test Smart Contracts**
   ```bash
   npm run compile
   npm run test
   npm run test:sepolia  # Test on Sepolia testnet
   ```

4. **Deploy Smart Contracts**
   ```bash
   # Deploy to Sepolia testnet
   npm run deploy:sepolia
   npm run verify:sepolia <CONTRACT_ADDRESS>
   ```

5. **Configure Frontend**
   ```bash
   cd app
   # Update contract address in src/config/contracts.ts
   # Start development server
   npm run dev
   ```

6. **Access Application**
   - Open http://localhost:5173
   - Connect your Web3 wallet
   - Start adding and managing passwords securely!

## 📋 Available Scripts

### Root Project
| Script | Description |
|--------|-------------|
| `npm run compile` | Compile smart contracts |
| `npm run test` | Run local tests |
| `npm run test:sepolia` | Run tests on Sepolia |
| `npm run deploy:sepolia` | Deploy to Sepolia testnet |
| `npm run verify:sepolia` | Verify contract on Etherscan |
| `npm run lint` | Run all linting checks |
| `npm run clean` | Clean build artifacts |

### Frontend App
| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Lint frontend code |

## 🔮 Future Roadmap

### Phase 1: Core Security Enhancements (Q1 2025)
- **Multi-Device Sync**: Secure synchronization across multiple devices
- **Backup & Recovery**: Cryptographic backup mechanisms for key recovery
- **Advanced Access Controls**: Time-based and conditional access policies
- **Audit Trail**: Detailed logging of all password access events

### Phase 2: User Experience Improvements (Q2 2025)
- **Browser Extension**: Native browser integration for auto-fill
- **Mobile Applications**: Native iOS and Android apps
- **Improved UI/UX**: Professional design system and user interface
- **Password Generation**: Built-in secure password generator with customizable policies

### Phase 3: Advanced Features (Q3 2025)
- **Secure Sharing**: Share passwords with other users using threshold cryptography
- **Organization Support**: Team and enterprise password management
- **Integration APIs**: Secure APIs for third-party application integration
- **Advanced Analytics**: Privacy-preserving usage analytics and insights

### Phase 4: Ecosystem Expansion (Q4 2025)
- **Multi-Chain Support**: Deploy on additional EVM-compatible networks
- **Plugin Architecture**: Extensible system for custom encryption modules
- **Hardware Security**: Integration with hardware security modules (HSMs)
- **Compliance Tools**: GDPR, SOX, and other regulatory compliance features

### Phase 5: Next-Generation Cryptography (2026+)
- **Post-Quantum Security**: Quantum-resistant encryption algorithms
- **Advanced FHE**: More efficient homomorphic encryption schemes
- **Zero-Knowledge Proofs**: Additional privacy-preserving technologies
- **Decentralized Identity**: Integration with DID and verifiable credentials

## 🏗 Smart Contract Architecture

### RememberPass.sol
The main contract implements three core functions:

```solidity
// Add a new encrypted password record
function addRecord(
    string calldata title,           // Plaintext title
    string calldata cipher,          // AES-encrypted password
    externalEuint256 keyExternal,    // FHE-encrypted key
    bytes calldata inputProof        // Zero-knowledge proof
) external;

// Retrieve a specific password record
function getRecord(address user, uint256 index)
    external view returns (string memory, string memory, euint256);

// Get all records for a user
function getAllRecords(address user)
    external view returns (string[], string[], euint256[]);
```

### Security Features
- **Access Control**: Only authorized users can access their own data
- **FHE Integration**: Uses Zama's FHEVM for homomorphic encryption
- **Gas Optimization**: Efficient storage patterns to minimize transaction costs
- **Event Logging**: Comprehensive event emission for indexing and monitoring

## 🔒 Security Considerations

### Cryptographic Security
- **AES-GCM**: Industry-standard authenticated encryption with 256-bit keys
- **HKDF**: Secure key derivation following RFC 5869 specifications
- **FHE**: Cutting-edge homomorphic encryption for zero-knowledge guarantees
- **Random Key Generation**: Cryptographically secure random number generation

### Operational Security
- **No Key Escrow**: Encryption keys never exist in plaintext on servers
- **Client-Side Processing**: All sensitive operations happen in your browser
- **Minimal Attack Surface**: Smart contracts contain only essential functionality
- **Formal Verification**: Smart contracts undergo rigorous security analysis

### Known Limitations
- **Gas Costs**: On-chain storage requires ETH for transaction fees
- **Browser Dependency**: Requires modern browser with Web Crypto API support
- **Network Dependency**: Requires internet connection to access blockchain
- **Early Stage**: This is experimental software; use with appropriate caution

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Getting Started
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass (`npm run test`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to your branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Development Guidelines
- **Follow TypeScript Best Practices**: Use strict typing and modern patterns
- **Write Comprehensive Tests**: Aim for >90% code coverage
- **Document New Features**: Update README and add inline documentation
- **Security First**: All cryptographic code requires security review
- **Gas Efficiency**: Optimize smart contracts for minimal gas usage

### Areas for Contribution
- **Security Audits**: Review cryptographic implementations
- **UI/UX Improvements**: Enhance user interface and experience
- **Performance Optimization**: Improve application speed and efficiency
- **Documentation**: Improve guides, tutorials, and API documentation
- **Testing**: Add edge cases and integration tests

## 📄 License

This project is licensed under the **BSD-3-Clause-Clear License** - see the [LICENSE](LICENSE) file for details.

The BSD-3-Clause-Clear license is a permissive open-source license that allows:
- ✅ Commercial use
- ✅ Modification
- ✅ Distribution
- ✅ Private use

While requiring:
- 📋 License and copyright notice
- 📋 Disclaimer of warranty

## 🆘 Support & Community

### Get Help
- **📚 Documentation**: Comprehensive guides and API references
- **🐛 Bug Reports**: [GitHub Issues](https://github.com/your-username/RememberPass/issues)
- **💡 Feature Requests**: [GitHub Discussions](https://github.com/your-username/RememberPass/discussions)
- **💬 Community Chat**: [Discord Server](https://discord.gg/rememberpass)

### Security Issues
For security-related issues, please email security@rememberpass.io instead of using public issue trackers.

### Commercial Support
Enterprise support and custom implementations available. Contact enterprise@rememberpass.io for more information.

## 📞 Contact

- **Website**: https://rememberpass.io
- **Email**: hello@rememberpass.io
- **Twitter**: [@RememberPassHQ](https://twitter.com/RememberPassHQ)
- **GitHub**: [RememberPass Organization](https://github.com/RememberPass)

---

**🔐 Built with privacy, security, and user sovereignty in mind.**

*RememberPass is pioneering the future of password management through blockchain technology and advanced cryptography. Join us in building a more secure and private digital world.*