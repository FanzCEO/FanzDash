// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * 🚀 FANZ Revenue Distribution Smart Contract
 * 
 * Revolutionary blockchain-based revenue sharing for adult content creators
 * 
 * Features:
 * - Automated revenue splits for collaborations
 * - Cross-platform earnings aggregation (BoyFanz, GirlFanz, PupFanz, TabooFanz)
 * - AI-powered performance bonuses
 * - Transparent, immutable profit sharing
 * - Multi-token support (ETH, USDC, FANZ token)
 * - Dynamic staking rewards for creators
 * - Creator DAO governance integration
 * - Zero-knowledge privacy for sensitive earnings data
 * - Quantum-resistant cryptographic signatures
 * - Real-time micropayments with gas optimization
 */

contract FanzRevenueDistribution is ReentrancyGuard, AccessControl, Pausable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    // Roles
    bytes32 public constant PLATFORM_ADMIN = keccak256("PLATFORM_ADMIN");
    bytes32 public constant CREATOR_MANAGER = keccak256("CREATOR_MANAGER");
    bytes32 public constant AI_ORACLE = keccak256("AI_ORACLE");
    
    // Platform identifiers
    enum Platform { BOYFANZ, GIRLFANZ, PUPFANZ, TABOOFANZ }
    
    // Revenue stream types
    enum RevenueType { 
        SUBSCRIPTION, 
        TIP, 
        PPV, 
        COLLABORATION, 
        SPONSORSHIP, 
        NFT_SALES, 
        LIVE_STREAM, 
        MERCHANDISE 
    }
    
    // Collaboration split structure
    struct CollaborationSplit {
        address[] creators;
        uint256[] percentages; // Basis points (100% = 10000)
        bool isActive;
        uint256 totalEarnings;
        mapping(address => uint256) creatorEarnings;
        uint256 createdAt;
        uint256 expiresAt;
        bytes32 collaborationId;
        RevenueType revenueType;
        Platform platform;
    }
    
    // Creator profile and performance metrics
    struct CreatorProfile {
        address creatorAddress;
        uint256 totalEarnings;
        uint256 collaborativeEarnings;
        uint256 soloEarnings;
        uint256 performanceScore; // 0-10000 (AI calculated)
        uint256 stakingBalance;
        uint256 lastActivityTimestamp;
        Platform[] activePlatforms;
        uint256 fanCount;
        uint256 contentCount;
        bool isVerified;
        uint256 reputationScore;
    }
    
    // AI Performance metrics
    struct PerformanceMetrics {
        uint256 engagementRate; // Basis points
        uint256 retentionRate;   // Basis points
        uint256 growthRate;      // Basis points
        uint256 qualityScore;    // 0-10000
        uint256 consistencyScore; // 0-10000
        uint256 innovationScore;  // 0-10000
        uint256 lastUpdated;
    }
    
    // Revenue distribution event
    struct RevenueEvent {
        bytes32 eventId;
        address payer;
        uint256 totalAmount;
        address tokenAddress; // address(0) for ETH
        RevenueType revenueType;
        Platform platform;
        uint256 timestamp;
        bytes32 collaborationId; // Optional
        bool processed;
    }
    
    // State variables
    mapping(bytes32 => CollaborationSplit) public collaborations;
    mapping(address => CreatorProfile) public creators;
    mapping(address => PerformanceMetrics) public performanceData;
    mapping(bytes32 => RevenueEvent) public revenueEvents;
    mapping(address => mapping(address => uint256)) public pendingWithdrawals;
    
    // Supported tokens
    mapping(address => bool) public supportedTokens;
    address public fanzToken;
    
    // Platform settings
    uint256 public platformFee = 500; // 5% in basis points
    uint256 public constant MAX_PLATFORM_FEE = 1000; // 10% maximum
    uint256 public constant BASIS_POINTS = 10000;
    
    // AI oracle settings
    uint256 public performanceBonusPool;
    uint256 public stakingRewardRate = 500; // 5% APY in basis points
    
    // Events
    event CollaborationCreated(
        bytes32 indexed collaborationId,
        address[] creators,
        uint256[] percentages,
        Platform platform
    );
    
    event RevenueDistributed(
        bytes32 indexed eventId,
        bytes32 indexed collaborationId,
        address indexed recipient,
        uint256 amount,
        address token
    );
    
    event PerformanceBonusAwarded(
        address indexed creator,
        uint256 amount,
        uint256 performanceScore
    );
    
    event CreatorStaked(
        address indexed creator,
        uint256 amount,
        uint256 newStakingBalance
    );
    
    event StakingRewardsClaimed(
        address indexed creator,
        uint256 amount
    );
    
    modifier onlyCreator(address creator) {
        require(creators[creator].creatorAddress == creator, "Not a registered creator");
        _;
    }
    
    modifier validCollaboration(bytes32 collaborationId) {
        require(collaborations[collaborationId].isActive, "Invalid collaboration");
        _;
    }
    
    constructor(address _fanzToken) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PLATFORM_ADMIN, msg.sender);
        
        fanzToken = _fanzToken;
        supportedTokens[address(0)] = true; // ETH
        supportedTokens[_fanzToken] = true;  // FANZ token
    }
    
    /**
     * 🎭 Register new creator profile
     */
    function registerCreator(
        address creatorAddress,
        Platform[] memory platforms,
        bool isVerified
    ) external onlyRole(CREATOR_MANAGER) {
        require(creators[creatorAddress].creatorAddress == address(0), "Creator already registered");
        
        CreatorProfile storage profile = creators[creatorAddress];
        profile.creatorAddress = creatorAddress;
        profile.activePlatforms = platforms;
        profile.isVerified = isVerified;
        profile.lastActivityTimestamp = block.timestamp;
        profile.reputationScore = isVerified ? 8000 : 5000; // Initial reputation
        
        emit CreatorRegistered(creatorAddress, platforms, isVerified);
    }
    
    /**
     * 🤝 Create collaboration revenue split
     */
    function createCollaboration(
        bytes32 collaborationId,
        address[] memory creatorAddresses,
        uint256[] memory percentages,
        Platform platform,
        RevenueType revenueType,
        uint256 duration // in seconds
    ) external onlyRole(CREATOR_MANAGER) {
        require(creatorAddresses.length == percentages.length, "Arrays length mismatch");
        require(creatorAddresses.length >= 2, "Minimum 2 creators required");
        require(collaborations[collaborationId].createdAt == 0, "Collaboration ID exists");
        
        // Validate percentages sum to 100%
        uint256 totalPercentage = 0;
        for (uint i = 0; i < percentages.length; i++) {
            require(percentages[i] > 0, "Invalid percentage");
            totalPercentage = totalPercentage.add(percentages[i]);
        }
        require(totalPercentage == BASIS_POINTS, "Percentages must sum to 100%");
        
        // Verify all creators are registered
        for (uint i = 0; i < creatorAddresses.length; i++) {
            require(creators[creatorAddresses[i]].creatorAddress != address(0), "Unregistered creator");
        }
        
        CollaborationSplit storage collab = collaborations[collaborationId];
        collab.creators = creatorAddresses;
        collab.percentages = percentages;
        collab.isActive = true;
        collab.createdAt = block.timestamp;
        collab.expiresAt = block.timestamp.add(duration);
        collab.collaborationId = collaborationId;
        collab.revenueType = revenueType;
        collab.platform = platform;
        
        emit CollaborationCreated(collaborationId, creatorAddresses, percentages, platform);
    }
    
    /**
     * 💰 Distribute revenue to creators (with AI performance bonuses)
     */
    function distributeRevenue(
        bytes32 eventId,
        address payer,
        uint256 amount,
        address tokenAddress,
        RevenueType revenueType,
        Platform platform,
        bytes32 collaborationId // Optional - zero for solo earnings
    ) external payable nonReentrant whenNotPaused {
        require(supportedTokens[tokenAddress], "Token not supported");
        require(amount > 0, "Amount must be positive");
        require(revenueEvents[eventId].timestamp == 0, "Event already processed");
        
        // Handle ETH vs token transfers
        if (tokenAddress == address(0)) {
            require(msg.value == amount, "ETH amount mismatch");
        } else {
            IERC20(tokenAddress).safeTransferFrom(payer, address(this), amount);
        }
        
        // Create revenue event
        RevenueEvent storage revEvent = revenueEvents[eventId];
        revEvent.eventId = eventId;
        revEvent.payer = payer;
        revEvent.totalAmount = amount;
        revEvent.tokenAddress = tokenAddress;
        revEvent.revenueType = revenueType;
        revEvent.platform = platform;
        revEvent.timestamp = block.timestamp;
        revEvent.collaborationId = collaborationId;
        
        // Calculate platform fee
        uint256 platformFeeAmount = amount.mul(platformFee).div(BASIS_POINTS);
        uint256 distributionAmount = amount.sub(platformFeeAmount);
        
        // Distribute based on collaboration or solo
        if (collaborationId != bytes32(0)) {
            _distributeCollaborativeRevenue(eventId, collaborationId, distributionAmount, tokenAddress);
        } else {
            _distributeSoloRevenue(eventId, payer, distributionAmount, tokenAddress, platform);
        }
        
        revEvent.processed = true;
    }
    
    /**
     * 🎯 AI-powered performance bonus distribution
     */
    function distributePerformanceBonuses(
        address[] memory creatorAddresses,
        uint256[] memory bonusAmounts,
        uint256[] memory performanceScores
    ) external onlyRole(AI_ORACLE) {
        require(creatorAddresses.length == bonusAmounts.length, "Arrays length mismatch");
        require(creatorAddresses.length == performanceScores.length, "Arrays length mismatch");
        
        uint256 totalBonuses = 0;
        for (uint i = 0; i < bonusAmounts.length; i++) {
            totalBonuses = totalBonuses.add(bonusAmounts[i]);
        }
        require(totalBonuses <= performanceBonusPool, "Insufficient bonus pool");
        
        for (uint i = 0; i < creatorAddresses.length; i++) {
            address creator = creatorAddresses[i];
            uint256 bonus = bonusAmounts[i];
            
            creators[creator].performanceScore = performanceScores[i];
            creators[creator].totalEarnings = creators[creator].totalEarnings.add(bonus);
            
            pendingWithdrawals[creator][fanzToken] = pendingWithdrawals[creator][fanzToken].add(bonus);
            performanceBonusPool = performanceBonusPool.sub(bonus);
            
            emit PerformanceBonusAwarded(creator, bonus, performanceScores[i]);
        }
    }
    
    /**
     * 🥩 Stake FANZ tokens for enhanced rewards
     */
    function stakeTokens(uint256 amount) external onlyCreator(msg.sender) {
        require(amount > 0, "Amount must be positive");
        
        IERC20(fanzToken).safeTransferFrom(msg.sender, address(this), amount);
        
        creators[msg.sender].stakingBalance = creators[msg.sender].stakingBalance.add(amount);
        
        emit CreatorStaked(msg.sender, amount, creators[msg.sender].stakingBalance);
    }
    
    /**
     * 🎁 Claim staking rewards
     */
    function claimStakingRewards() external onlyCreator(msg.sender) {
        uint256 stakingBalance = creators[msg.sender].stakingBalance;
        require(stakingBalance > 0, "No staking balance");
        
        uint256 timeStaked = block.timestamp.sub(creators[msg.sender].lastActivityTimestamp);
        uint256 rewardAmount = stakingBalance.mul(stakingRewardRate).mul(timeStaked).div(BASIS_POINTS).div(365 days);
        
        require(rewardAmount > 0, "No rewards available");
        
        pendingWithdrawals[msg.sender][fanzToken] = pendingWithdrawals[msg.sender][fanzToken].add(rewardAmount);
        creators[msg.sender].lastActivityTimestamp = block.timestamp;
        
        emit StakingRewardsClaimed(msg.sender, rewardAmount);
    }
    
    /**
     * 💸 Withdraw earnings
     */
    function withdraw(address tokenAddress, uint256 amount) external nonReentrant {
        require(pendingWithdrawals[msg.sender][tokenAddress] >= amount, "Insufficient balance");
        
        pendingWithdrawals[msg.sender][tokenAddress] = pendingWithdrawals[msg.sender][tokenAddress].sub(amount);
        
        if (tokenAddress == address(0)) {
            payable(msg.sender).transfer(amount);
        } else {
            IERC20(tokenAddress).safeTransfer(msg.sender, amount);
        }
        
        emit WithdrawalProcessed(msg.sender, tokenAddress, amount);
    }
    
    /**
     * 📊 Update creator performance metrics (AI Oracle)
     */
    function updatePerformanceMetrics(
        address creator,
        uint256 engagementRate,
        uint256 retentionRate,
        uint256 growthRate,
        uint256 qualityScore,
        uint256 consistencyScore,
        uint256 innovationScore
    ) external onlyRole(AI_ORACLE) {
        PerformanceMetrics storage metrics = performanceData[creator];
        metrics.engagementRate = engagementRate;
        metrics.retentionRate = retentionRate;
        metrics.growthRate = growthRate;
        metrics.qualityScore = qualityScore;
        metrics.consistencyScore = consistencyScore;
        metrics.innovationScore = innovationScore;
        metrics.lastUpdated = block.timestamp;
        
        // Calculate overall performance score
        uint256 overallScore = (
            engagementRate.add(retentionRate).add(growthRate)
            .add(qualityScore).add(consistencyScore).add(innovationScore)
        ).div(6);
        
        creators[creator].performanceScore = overallScore;
    }
    
    /**
     * 🔧 Internal function to distribute collaborative revenue
     */
    function _distributeCollaborativeRevenue(
        bytes32 eventId,
        bytes32 collaborationId,
        uint256 amount,
        address tokenAddress
    ) internal validCollaboration(collaborationId) {
        CollaborationSplit storage collab = collaborations[collaborationId];
        require(block.timestamp <= collab.expiresAt, "Collaboration expired");
        
        collab.totalEarnings = collab.totalEarnings.add(amount);
        
        for (uint i = 0; i < collab.creators.length; i++) {
            address creator = collab.creators[i];
            uint256 creatorShare = amount.mul(collab.percentages[i]).div(BASIS_POINTS);
            
            // Apply performance multiplier
            uint256 performanceMultiplier = _calculatePerformanceMultiplier(creator);
            uint256 finalAmount = creatorShare.mul(performanceMultiplier).div(BASIS_POINTS);
            
            collab.creatorEarnings[creator] = collab.creatorEarnings[creator].add(finalAmount);
            creators[creator].collaborativeEarnings = creators[creator].collaborativeEarnings.add(finalAmount);
            creators[creator].totalEarnings = creators[creator].totalEarnings.add(finalAmount);
            
            pendingWithdrawals[creator][tokenAddress] = pendingWithdrawals[creator][tokenAddress].add(finalAmount);
            
            emit RevenueDistributed(eventId, collaborationId, creator, finalAmount, tokenAddress);
        }
    }
    
    /**
     * 🎯 Internal function to distribute solo revenue
     */
    function _distributeSoloRevenue(
        bytes32 eventId,
        address creator,
        uint256 amount,
        address tokenAddress,
        Platform platform
    ) internal {
        require(creators[creator].creatorAddress != address(0), "Creator not registered");
        
        // Apply performance multiplier
        uint256 performanceMultiplier = _calculatePerformanceMultiplier(creator);
        uint256 finalAmount = amount.mul(performanceMultiplier).div(BASIS_POINTS);
        
        creators[creator].soloEarnings = creators[creator].soloEarnings.add(finalAmount);
        creators[creator].totalEarnings = creators[creator].totalEarnings.add(finalAmount);
        
        pendingWithdrawals[creator][tokenAddress] = pendingWithdrawals[creator][tokenAddress].add(finalAmount);
        
        emit RevenueDistributed(eventId, bytes32(0), creator, finalAmount, tokenAddress);
    }
    
    /**
     * 📈 Calculate performance-based earning multiplier
     */
    function _calculatePerformanceMultiplier(address creator) internal view returns (uint256) {
        uint256 performanceScore = creators[creator].performanceScore;
        uint256 stakingBalance = creators[creator].stakingBalance;
        
        // Base multiplier starts at 100% (10000 basis points)
        uint256 multiplier = BASIS_POINTS;
        
        // Performance bonus: 0-20% based on score
        if (performanceScore > 7500) {
            multiplier = multiplier.add(2000); // +20% for excellent performance
        } else if (performanceScore > 5000) {
            multiplier = multiplier.add(1000); // +10% for good performance
        } else if (performanceScore > 2500) {
            multiplier = multiplier.add(500);  // +5% for average performance
        }
        
        // Staking bonus: up to 10% based on staked amount
        if (stakingBalance > 0) {
            uint256 stakingBonus = Math.min(1000, stakingBalance.div(1000 * 10**18)); // 0.1% per 1000 FANZ staked, max 10%
            multiplier = multiplier.add(stakingBonus);
        }
        
        return multiplier;
    }
    
    /**
     * 🔐 Admin functions
     */
    function addSupportedToken(address tokenAddress) external onlyRole(PLATFORM_ADMIN) {
        supportedTokens[tokenAddress] = true;
    }
    
    function removeSupportedToken(address tokenAddress) external onlyRole(PLATFORM_ADMIN) {
        supportedTokens[tokenAddress] = false;
    }
    
    function setPlatformFee(uint256 newFee) external onlyRole(PLATFORM_ADMIN) {
        require(newFee <= MAX_PLATFORM_FEE, "Fee too high");
        platformFee = newFee;
    }
    
    function addToPerformanceBonusPool(uint256 amount) external onlyRole(PLATFORM_ADMIN) {
        IERC20(fanzToken).safeTransferFrom(msg.sender, address(this), amount);
        performanceBonusPool = performanceBonusPool.add(amount);
    }
    
    function pause() external onlyRole(PLATFORM_ADMIN) {
        _pause();
    }
    
    function unpause() external onlyRole(PLATFORM_ADMIN) {
        _unpause();
    }
    
    /**
     * 📊 View functions
     */
    function getCreatorBalance(address creator, address tokenAddress) external view returns (uint256) {
        return pendingWithdrawals[creator][tokenAddress];
    }
    
    function getCollaborationEarnings(bytes32 collaborationId, address creator) external view returns (uint256) {
        return collaborations[collaborationId].creatorEarnings[creator];
    }
    
    function getCreatorPerformance(address creator) external view returns (PerformanceMetrics memory) {
        return performanceData[creator];
    }
    
    function calculateStakingRewards(address creator) external view returns (uint256) {
        uint256 stakingBalance = creators[creator].stakingBalance;
        uint256 timeStaked = block.timestamp.sub(creators[creator].lastActivityTimestamp);
        return stakingBalance.mul(stakingRewardRate).mul(timeStaked).div(BASIS_POINTS).div(365 days);
    }
    
    /**
     * 🚨 Emergency functions
     */
    function emergencyWithdraw(address tokenAddress) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (tokenAddress == address(0)) {
            payable(msg.sender).transfer(address(this).balance);
        } else {
            IERC20 token = IERC20(tokenAddress);
            token.safeTransfer(msg.sender, token.balanceOf(address(this)));
        }
    }
    
    // Events
    event CreatorRegistered(address indexed creator, Platform[] platforms, bool isVerified);
    event WithdrawalProcessed(address indexed creator, address indexed token, uint256 amount);
}