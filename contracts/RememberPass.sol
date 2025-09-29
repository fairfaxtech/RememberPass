// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint256, externalEuint256} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title RememberPass - Store encrypted passwords with FHE-protected keys
/// @notice Stores a plaintext title, a client-side encrypted secret string, and an FHE-encrypted key (as uint256)
contract RememberPass is SepoliaConfig {
    struct Record {
        string title;
        string cipher; // client-side encrypted secret (e.g., base64)
        euint256 keyEnc; // FHE-encrypted key (uint256 encoding of an EVM address)
    }

    mapping(address => Record[]) private _records;

    event RecordAdded(address indexed user, uint256 index);

    /// @notice Add a new record with title, ciphertext and encrypted key
    /// @param title The plaintext title
    /// @param cipher The client-side encrypted secret string
    /// @param keyExternal The external encrypted uint256 key (address encoded as uint256)
    /// @param inputProof The proof for the external encrypted input
    function addRecord(
        string calldata title,
        string calldata cipher,
        externalEuint256 keyExternal,
        bytes calldata inputProof
    ) external {
        euint256 keyEnc = FHE.fromExternal(keyExternal, inputProof);

        // Authorize contract and sender to access the ciphertext when needed
        FHE.allowThis(keyEnc);
        FHE.allow(keyEnc, msg.sender);

        _records[msg.sender].push(Record({title: title, cipher: cipher, keyEnc: keyEnc}));
        emit RecordAdded(msg.sender, _records[msg.sender].length - 1);
    }

    /// @notice Get the number of records for a user
    /// @param user The user address
    /// @return count Number of records
    function getRecordCount(address user) external view returns (uint256 count) {
        return _records[user].length;
    }

    /// @notice Get a single record for a user by index
    /// @dev Does not inspect msg.sender
    function getRecord(
        address user,
        uint256 index
    ) external view returns (string memory title, string memory cipher, euint256 keyEnc) {
        Record storage r = _records[user][index];
        return (r.title, r.cipher, r.keyEnc);
    }

    /// @notice Get all records for a user
    /// @dev Does not inspect msg.sender
    function getAllRecords(
        address user
    ) external view returns (string[] memory titles, string[] memory ciphers, euint256[] memory keys) {
        uint256 n = _records[user].length;
        titles = new string[](n);
        ciphers = new string[](n);
        keys = new euint256[](n);
        for (uint256 i = 0; i < n; i++) {
            Record storage r = _records[user][i];
            titles[i] = r.title;
            ciphers[i] = r.cipher;
            keys[i] = r.keyEnc;
        }
    }
}

