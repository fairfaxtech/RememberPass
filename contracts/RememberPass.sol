// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title RememberPass - A decentralized password manager using FHEVM
/// @notice Stores encrypted passwords with titles and FHE-encrypted key addresses
contract RememberPass is SepoliaConfig {
    struct PasswordEntry {
        string title;
        string encryptedPassword;
        string encryptedKeyAddress; // Frontend-encrypted key address
        euint32 accessControl; // FHE-encrypted access control value
        uint256 timestamp;
    }

    mapping(address => PasswordEntry[]) private userPasswords;
    mapping(address => uint256) private userPasswordCount;

    event PasswordStored(address indexed user, uint256 indexed index, string title);
    event PasswordRetrieved(address indexed user, uint256 indexed index);

    /// @notice Store a new password entry
    /// @param title The plain text title for the password
    /// @param encryptedPassword The encrypted password string
    /// @param encryptedKeyAddress The frontend-encrypted key address
    /// @param accessControlExt The encrypted access control value (external format)
    /// @param inputProof The proof for the encrypted access control value
    function storePassword(
        string memory title,
        string memory encryptedPassword,
        string memory encryptedKeyAddress,
        externalEuint32 accessControlExt,
        bytes calldata inputProof
    ) external {
        euint32 accessControl = FHE.fromExternal(accessControlExt, inputProof);

        PasswordEntry memory newEntry = PasswordEntry({
            title: title,
            encryptedPassword: encryptedPassword,
            encryptedKeyAddress: encryptedKeyAddress,
            accessControl: accessControl,
            timestamp: block.timestamp
        });

        userPasswords[msg.sender].push(newEntry);
        uint256 index = userPasswordCount[msg.sender];
        userPasswordCount[msg.sender]++;

        FHE.allowThis(accessControl);
        FHE.allow(accessControl, msg.sender);

        emit PasswordStored(msg.sender, index, title);
    }

    /// @notice Get the number of password entries for the caller
    /// @return The number of password entries
    function getPasswordCount() external view returns (uint256) {
        return userPasswordCount[msg.sender];
    }

    /// @notice Get password entry by index (without encrypted key address)
    /// @param index The index of the password entry
    /// @return title The title of the password
    /// @return encryptedPassword The encrypted password string
    /// @return timestamp The timestamp when password was stored
    function getPasswordEntry(uint256 index) external view returns (
        string memory title,
        string memory encryptedPassword,
        uint256 timestamp
    ) {
        require(index < userPasswordCount[msg.sender], "Index out of bounds");

        PasswordEntry storage entry = userPasswords[msg.sender][index];
        return (entry.title, entry.encryptedPassword, entry.timestamp);
    }

    /// @notice Get the encrypted key address for a password entry
    /// @param index The index of the password entry
    /// @return The encrypted key address
    function getEncryptedKeyAddress(uint256 index) external view returns (string memory) {
        require(index < userPasswordCount[msg.sender], "Index out of bounds");

        return userPasswords[msg.sender][index].encryptedKeyAddress;
    }

    /// @notice Get all password entries for the caller (without encrypted key addresses)
    /// @return An array of password entries
    function getAllPasswordEntries() external view returns (PasswordEntry[] memory) {
        uint256 count = userPasswordCount[msg.sender];
        PasswordEntry[] memory entries = new PasswordEntry[](count);

        for (uint256 i = 0; i < count; i++) {
            PasswordEntry storage entry = userPasswords[msg.sender][i];
            entries[i] = PasswordEntry({
                title: entry.title,
                encryptedPassword: entry.encryptedPassword,
                encryptedKeyAddress: "", // Don't expose encrypted key in batch
                accessControl: euint32.wrap(0), // Don't expose access control in batch
                timestamp: entry.timestamp
            });
        }

        return entries;
    }

    /// @notice Update a password entry
    /// @param index The index of the password entry to update
    /// @param title The new title
    /// @param encryptedPassword The new encrypted password
    /// @param encryptedKeyAddress The new frontend-encrypted key address
    /// @param accessControlExt The new encrypted access control value (external format)
    /// @param inputProof The proof for the new encrypted access control value
    function updatePassword(
        uint256 index,
        string memory title,
        string memory encryptedPassword,
        string memory encryptedKeyAddress,
        externalEuint32 accessControlExt,
        bytes calldata inputProof
    ) external {
        require(index < userPasswordCount[msg.sender], "Index out of bounds");

        euint32 accessControl = FHE.fromExternal(accessControlExt, inputProof);

        PasswordEntry storage entry = userPasswords[msg.sender][index];
        entry.title = title;
        entry.encryptedPassword = encryptedPassword;
        entry.encryptedKeyAddress = encryptedKeyAddress;
        entry.accessControl = accessControl;
        entry.timestamp = block.timestamp;

        FHE.allowThis(accessControl);
        FHE.allow(accessControl, msg.sender);
    }

    /// @notice Delete a password entry
    /// @param index The index of the password entry to delete
    function deletePassword(uint256 index) external {
        require(index < userPasswordCount[msg.sender], "Index out of bounds");

        uint256 lastIndex = userPasswordCount[msg.sender] - 1;

        if (index != lastIndex) {
            userPasswords[msg.sender][index] = userPasswords[msg.sender][lastIndex];
        }

        userPasswords[msg.sender].pop();
        userPasswordCount[msg.sender]--;
    }
}