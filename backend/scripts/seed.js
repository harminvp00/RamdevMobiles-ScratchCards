const mongoose = require('mongoose');
const crypto = require('crypto');
const Card = require('../models/Card');
const Admin = require('../models/Admin');
const Campaign = require('../models/Campaign');
const {
  TOTAL_CARDS,
  GRAND_PRIZE_REWARD,
  GRAND_PRIZE_RANGES,
  CASH_DISTRIBUTION,
  PRODUCT_DISTRIBUTION,
  EXPECTED_CASH_COUNT,
  EXPECTED_PRODUCT_COUNT,
  EXPECTED_TOTAL_COUNT,
} = require('./rewardConfig');

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
// All reward-pool constants (TOTAL_CARDS, distributions, expected counts)
// live in ./rewardConfig.js — the single source of truth shared with
// models/Card.js (for its `reward` enum). Edit that file to change the
// reward mix; nothing below needs to change.

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Fisher–Yates shuffle. Mutates and returns the given array.
 */
const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

/**
 * Expands a [{ reward, count }] distribution into a flat array of reward
 * strings, e.g. [{ reward: '₹50', count: 2 }] -> ['₹50', '₹50'].
 * Centralizing this avoids repeating the same push-loop for every
 * distribution table.
 */
const expandDistribution = (distribution) =>
  distribution.flatMap((item) => Array(item.count).fill(item.reward));

/**
 * Generates a cryptographically random, URL-safe token used to encode each
 * card's QR code. Using a random token (rather than the sequential
 * cardNumber) prevents anyone from guessing or enumerating other cards'
 * redemption links.
 */
const generateToken = () => crypto.randomUUID();

/**
 * Picks a random integer card position (inclusive) within a given range,
 * guaranteed not to collide with any position already taken.
 */
const pickUniquePosition = (range, takenPositions) => {
  let position;
  do {
    position = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
  } while (takenPositions.has(position));
  takenPositions.add(position);
  return position;
};

/**
 * Builds the full 500-card reward map (cardNumber -> reward):
 *   1. Reserve one grand-prize slot per configured range at a random position.
 *   2. Build and shuffle the pool of all remaining rewards (cash + product).
 *   3. Fill every other card number with the shuffled pool, in order.
 */
const buildRewardMap = () => {
  const takenPositions = new Set();
  const rewardMap = new Map();

  // Step 1: reserve grand-prize positions.
  GRAND_PRIZE_RANGES.forEach((range) => {
    const position = pickUniquePosition(range, takenPositions);
    rewardMap.set(position, GRAND_PRIZE_REWARD);
  });

  // Step 2: build and shuffle the remaining reward pool.
  const remainingRewards = shuffleArray([
    ...expandDistribution(CASH_DISTRIBUTION),
    ...expandDistribution(PRODUCT_DISTRIBUTION),
  ]);

  const expectedRemaining = TOTAL_CARDS - GRAND_PRIZE_RANGES.length;
  if (remainingRewards.length !== expectedRemaining) {
    throw new Error(
      `Reward pool mismatch: expected ${expectedRemaining} non-grand-prize rewards, got ${remainingRewards.length}`
    );
  }

  // Step 3: assign the shuffled pool to every position not already reserved.
  let poolIndex = 0;
  for (let position = 1; position <= TOTAL_CARDS; position++) {
    if (rewardMap.has(position)) continue;
    rewardMap.set(position, remainingRewards[poolIndex++]);
  }

  return rewardMap;
};

/**
 * Converts the position -> reward map into an array of Card documents
 * ready for insertMany(), with sequential zero-padded card numbers.
 */
const buildCardDocs = (rewardMap) => {
  const now = new Date();
  const cardDocs = [];
  const usedTokens = new Set();

  for (let position = 1; position <= TOTAL_CARDS; position++) {
    // crypto.randomUUID() collisions are astronomically unlikely, but we
    // guard against them anyway since this feeds a `unique` index and a
    // duplicate would fail the whole insertMany batch.
    let token = generateToken();
    while (usedTokens.has(token)) {
      token = generateToken();
    }
    usedTokens.add(token);

    cardDocs.push({
      cardNumber: String(position).padStart(4, '0'),
      reward: rewardMap.get(position),
      token,
      assigned: false,
      assignedUser: null,
      redeemed: false,
      redeemedDate: null,
      createdDate: now,
    });
  }

  return cardDocs;
};

/**
 * Groups card docs by reward and logs a summary table, so an operator can
 * eyeball the actual distribution that was inserted (not just the
 * configured targets) right after seeding.
 */
const logRewardSummary = (cardDocs) => {
  const counts = new Map();
  cardDocs.forEach(({ reward }) => {
    counts.set(reward, (counts.get(reward) || 0) + 1);
  });

  const rows = [...counts.entries()].sort((a, b) => b[1] - a[1]);

  console.log('\nReward distribution summary:');
  console.log('-----------------------------');
  rows.forEach(([reward, count]) => {
    console.log(`${reward.padEnd(20)} x ${count}`);
  });
  console.log('-----------------------------');
  console.log(`Total: ${cardDocs.length} cards\n`);
};

// ---------------------------------------------------------------------------
// Individual seed steps
// ---------------------------------------------------------------------------

const seedCampaign = async () => {
  const campaignCount = await Campaign.countDocuments();
  if (campaignCount > 0) return;

  await Campaign.create({
    status: 'coming_soon',
    startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
  });
  console.log('Campaign settings initialized to coming_soon.');
};

const seedAdmin = async () => {
  const adminCount = await Admin.countDocuments();
  if (adminCount > 0) return;

  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    throw new Error('CRITICAL CONFIG ERROR: Both ADMIN_USERNAME and ADMIN_PASSWORD environment variables must be defined to seed the admin account!');
  }

  await Admin.create({ username, password });
  console.log(`Admin account created with username: ${username}`);
};

const seedCards = async () => {
  const cardCount = await Card.countDocuments();
  if (cardCount > 0) {
    console.log(`Cards already exist (${cardCount} found). Skipping card seeding.`);
    return;
  }

  // Sanity-check the configuration before doing any work, so a
  // misconfigured distribution fails fast with a clear error.
  if (EXPECTED_CASH_COUNT !== 202) {
    throw new Error(
      `Cash distribution misconfigured: expected 202 total cash cards (including grand prizes), got ${EXPECTED_CASH_COUNT}`
    );
  }
  if (EXPECTED_PRODUCT_COUNT !== 298) {
    throw new Error(
      `Product distribution misconfigured: expected 298 total product cards, got ${EXPECTED_PRODUCT_COUNT}`
    );
  }
  // Belt-and-braces check: whatever the individual category counts are,
  // they must always add up to exactly TOTAL_CARDS.
  if (EXPECTED_TOTAL_COUNT !== TOTAL_CARDS) {
    throw new Error(
      `Reward configuration misconfigured: distributions total ${EXPECTED_TOTAL_COUNT} cards, expected ${TOTAL_CARDS}`
    );
  }

  console.log(`Generating ${TOTAL_CARDS} scratch cards...`);

  const rewardMap = buildRewardMap();
  const cardDocs = buildCardDocs(rewardMap);

  await insertCardsInTransaction(cardDocs);
  console.log(`✓ Generated ${cardDocs.length} scratch cards successfully.`);

  logRewardSummary(cardDocs);
};

/**
 * Inserts all card docs atomically inside a MongoDB session/transaction, so
 * a failure partway through never leaves a partial deck in the collection.
 * Transactions require a replica set or mongos deployment; on a standalone
 * MongoDB instance (e.g. local dev) session creation itself will throw, in
 * which case we fall back to a plain insertMany.
 */
const insertCardsInTransaction = async (cardDocs) => {
  let session;
  try {
    session = await mongoose.startSession();
  } catch (error) {
    console.warn(
      'Could not start a MongoDB session (likely a standalone instance without a replica set). ' +
        'Falling back to a non-transactional insertMany.'
    );
    await Card.insertMany(cardDocs);
    return;
  }

  try {
    await session.withTransaction(async () => {
      await Card.insertMany(cardDocs, { session });
    });
  } catch (error) {
    console.warn(
      'Transactional insert failed (transactions may be unsupported on this deployment). ' +
        'Falling back to a non-transactional insertMany.'
    );
    await Card.insertMany(cardDocs);
  } finally {
    await session.endSession();
  }
};

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

const seedDatabase = async () => {
  try {
    await seedCampaign();
    await seedAdmin();
    await seedCards();
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};

module.exports = seedDatabase;