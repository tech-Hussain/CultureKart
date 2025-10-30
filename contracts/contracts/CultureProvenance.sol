// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CultureProvenance
 * @dev Smart contract for registering and tracking Pakistani artisan products with IPFS metadata
 * @notice This contract provides immutable product provenance on the blockchain
 */
contract CultureProvenance is Ownable {
    // Counter for generating unique token IDs
    uint256 private _tokenIdCounter;

    // Struct to store product information
    struct Product {
        address artisan;
        string ipfsHash;
        uint256 timestamp;
        bool exists;
    }

    // Mapping from tokenId to Product
    mapping(uint256 => Product) private _products;

    // Mapping from artisan address to their product token IDs
    mapping(address => uint256[]) private _artisanProducts;

    // Events
    event ProductRegistered(
        uint256 indexed tokenId,
        address indexed artisan,
        string ipfsHash,
        uint256 timestamp
    );

    event ProductUpdated(
        uint256 indexed tokenId,
        string newIpfsHash,
        uint256 timestamp
    );

    /**
     * @dev Constructor - initializes the contract with the deployer as owner
     */
    constructor() Ownable(msg.sender) {
        _tokenIdCounter = 0;
    }

    /**
     * @dev Register a new product on the blockchain
     * @param artisan Address of the artisan who created the product
     * @param ipfsHash IPFS hash containing product metadata
     * @return tokenId Unique identifier for the registered product
     */
    function registerProduct(
        address artisan,
        string calldata ipfsHash
    ) external onlyOwner returns (uint256 tokenId) {
        require(artisan != address(0), "Invalid artisan address");
        require(bytes(ipfsHash).length > 0, "IPFS hash cannot be empty");

        // Increment counter to get new token ID
        _tokenIdCounter++;
        tokenId = _tokenIdCounter;

        // Store product information
        _products[tokenId] = Product({
            artisan: artisan,
            ipfsHash: ipfsHash,
            timestamp: block.timestamp,
            exists: true
        });

        // Add token ID to artisan's product list
        _artisanProducts[artisan].push(tokenId);

        // Emit event
        emit ProductRegistered(tokenId, artisan, ipfsHash, block.timestamp);

        return tokenId;
    }

    /**
     * @dev Update IPFS hash for an existing product (in case of metadata updates)
     * @param tokenId The token ID of the product to update
     * @param newIpfsHash New IPFS hash for updated metadata
     */
    function updateProductMetadata(
        uint256 tokenId,
        string calldata newIpfsHash
    ) external onlyOwner {
        require(_products[tokenId].exists, "Product does not exist");
        require(bytes(newIpfsHash).length > 0, "IPFS hash cannot be empty");

        _products[tokenId].ipfsHash = newIpfsHash;

        emit ProductUpdated(tokenId, newIpfsHash, block.timestamp);
    }

    /**
     * @dev Get product information by token ID
     * @param tokenId The token ID to query
     * @return artisan Address of the artisan
     * @return ipfsHash IPFS hash of product metadata
     * @return timestamp Registration timestamp
     */
    function getProduct(uint256 tokenId)
        external
        view
        returns (
            address artisan,
            string memory ipfsHash,
            uint256 timestamp
        )
    {
        require(_products[tokenId].exists, "Product does not exist");

        Product memory product = _products[tokenId];
        return (product.artisan, product.ipfsHash, product.timestamp);
    }

    /**
     * @dev Check if a product exists
     * @param tokenId The token ID to check
     * @return exists True if product exists, false otherwise
     */
    function productExists(uint256 tokenId) external view returns (bool) {
        return _products[tokenId].exists;
    }

    /**
     * @dev Get all product token IDs for a specific artisan
     * @param artisan Address of the artisan
     * @return tokenIds Array of token IDs belonging to the artisan
     */
    function getArtisanProducts(address artisan)
        external
        view
        returns (uint256[] memory)
    {
        return _artisanProducts[artisan];
    }

    /**
     * @dev Get the current token ID counter value
     * @return Current total number of registered products
     */
    function getTotalProducts() external view returns (uint256) {
        return _tokenIdCounter;
    }

    /**
     * @dev Verify product authenticity by checking on-chain record
     * @param tokenId Token ID to verify
     * @param expectedArtisan Expected artisan address
     * @param expectedIpfsHash Expected IPFS hash
     * @return isValid True if all parameters match on-chain data
     */
    function verifyProduct(
        uint256 tokenId,
        address expectedArtisan,
        string calldata expectedIpfsHash
    ) external view returns (bool isValid) {
        if (!_products[tokenId].exists) {
            return false;
        }

        Product memory product = _products[tokenId];

        return (
            product.artisan == expectedArtisan &&
            keccak256(bytes(product.ipfsHash)) == keccak256(bytes(expectedIpfsHash))
        );
    }
}
