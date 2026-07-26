// ---------------------------------------------------------------------------
// Shared reward configuration
// ---------------------------------------------------------------------------
// Single source of truth for the card reward pool. Both seed.js (to
// generate cards) and models/Card.js (to enforce a schema-level enum)
// import from here, so the two can never drift out of sync.
//
// To change the reward mix in the future, edit only the constants below.

const TOTAL_CARDS = 500;

// The "grand prize" cards. Each gets a randomly chosen card number within
// its own range, so the winning positions can never be predicted.
const GRAND_PRIZE_REWARD = '₹200';
const GRAND_PRIZE_RANGES = [
  { min: 41, max: 50 },
  { min: 91, max: 100 },
];

// Cash rewards, ordered from most common (smallest payout) to rarest
// (largest payout). Counts here + GRAND_PRIZE_RANGES.length must equal 202.
const CASH_DISTRIBUTION = [
  { reward: '₹50', count: 60 },
  { reward: '₹55', count: 45 },
  { reward: '₹60', count: 35 },
  { reward: '₹75', count: 25 },
  { reward: '₹80', count: 15 },
  { reward: '₹85', count: 10 },
  { reward: '₹90', count: 6 },
  { reward: '₹100', count: 4 },
];

// Product rewards. Counts here must sum to 298.
const PRODUCT_DISTRIBUTION = [
  { reward: '6D Glass', count: 200 },
  { reward: 'Data Cable ₹30', count: 98 },
];

const EXPECTED_CASH_COUNT =
  GRAND_PRIZE_RANGES.length +
  CASH_DISTRIBUTION.reduce((sum, item) => sum + item.count, 0);
const EXPECTED_PRODUCT_COUNT = PRODUCT_DISTRIBUTION.reduce(
  (sum, item) => sum + item.count,
  0
);
const EXPECTED_TOTAL_COUNT = EXPECTED_CASH_COUNT + EXPECTED_PRODUCT_COUNT;

// The full set of valid reward strings, derived from the distributions
// above rather than hand-maintained. Used as the Card schema's `reward`
// enum, so the database rejects anything outside the configured pool.
const REWARD_VALUES = [
  GRAND_PRIZE_REWARD,
  ...CASH_DISTRIBUTION.map((item) => item.reward),
  ...PRODUCT_DISTRIBUTION.map((item) => item.reward),
];

module.exports = {
  TOTAL_CARDS,
  GRAND_PRIZE_REWARD,
  GRAND_PRIZE_RANGES,
  CASH_DISTRIBUTION,
  PRODUCT_DISTRIBUTION,
  EXPECTED_CASH_COUNT,
  EXPECTED_PRODUCT_COUNT,
  EXPECTED_TOTAL_COUNT,
  REWARD_VALUES,
};