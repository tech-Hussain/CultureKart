/**
 * Stripe Connect Service
 * Handles artisan payouts and Stripe Connect account management
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Withdrawal = require('../models/Withdrawal');
const Artisan = require('../models/Artisan');

/**
 * Create or get Stripe Connect account for artisan
 * @param {Object} artisan - Artisan document
 * @returns {Promise<string>} Stripe account ID
 */
exports.createConnectAccount = async (artisan) => {
  try {
    // Check if artisan already has a Stripe account
    if (artisan.stripeAccountId) {
      return artisan.stripeAccountId;
    }

    // Create new Stripe Connect account
    const account = await stripe.accounts.create({
      type: 'express', // Express for easier onboarding
      country: 'PK', // Pakistan
      email: artisan.user?.email,
      capabilities: {
        transfers: { requested: true },
      },
      business_type: 'individual',
      metadata: {
        artisanId: artisan._id.toString(),
        displayName: artisan.displayName,
      },
    });

    // Save Stripe account ID to artisan
    artisan.stripeAccountId = account.id;
    await artisan.save();

    console.log(`✅ Created Stripe Connect account for ${artisan.displayName}: ${account.id}`);
    return account.id;
  } catch (error) {
    console.error('Error creating Stripe Connect account:', error);
    throw new Error('Failed to create payment account');
  }
};

/**
 * Create account link for artisan to complete onboarding
 * @param {string} stripeAccountId - Stripe account ID
 * @param {string} returnUrl - URL to return after onboarding
 * @param {string} refreshUrl - URL to return if link expires
 * @returns {Promise<string>} Account link URL
 */
exports.createAccountLink = async (stripeAccountId, returnUrl, refreshUrl) => {
  try {
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });

    return accountLink.url;
  } catch (error) {
    console.error('Error creating account link:', error);
    throw new Error('Failed to create onboarding link');
  }
};

/**
 * Check if artisan has completed Stripe onboarding
 * @param {string} stripeAccountId - Stripe account ID
 * @returns {Promise<boolean>} True if onboarding complete
 */
exports.isOnboardingComplete = async (stripeAccountId) => {
  try {
    const account = await stripe.accounts.retrieve(stripeAccountId);
    return account.details_submitted && account.charges_enabled && account.payouts_enabled;
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return false;
  }
};

/**
 * Create a payout to artisan's bank account
 * @param {Object} withdrawalData - Withdrawal request data
 * @returns {Promise<Object>} Payout result
 */
exports.createPayout = async (withdrawalData) => {
  try {
    const { artisan, amount, netAmount, bankDetails } = withdrawalData;

    console.log(`💰 Creating payout for ${artisan.displayName}: Rs ${amount}`);

    // In test mode, create a mock payout
    if (process.env.NODE_ENV === 'development') {
      return await createMockPayout(withdrawalData);
    }

    // Get or create Stripe Connect account
    let stripeAccountId = artisan.stripeAccountId;
    if (!stripeAccountId) {
      stripeAccountId = await exports.createConnectAccount(artisan);
    }

    // Check if onboarding is complete
    const isComplete = await exports.isOnboardingComplete(stripeAccountId);
    if (!isComplete) {
      throw new Error('Artisan must complete payment account setup first');
    }

    // Create external account (bank account) if not exists
    const externalAccount = await createExternalAccount(stripeAccountId, bankDetails);

    // Create payout
    const payout = await stripe.payouts.create(
      {
        amount: Math.round(netAmount * 100), // Convert to cents
        currency: 'pkr',
        destination: externalAccount.id,
        description: `Withdrawal for ${artisan.displayName}`,
        metadata: {
          artisanId: artisan._id.toString(),
          withdrawalId: withdrawalData._id.toString(),
        },
      },
      {
        stripeAccount: stripeAccountId,
      }
    );

    console.log(`✅ Payout created: ${payout.id}`);

    return {
      success: true,
      payoutId: payout.id,
      status: payout.status,
      arrivalDate: new Date(payout.arrival_date * 1000),
    };
  } catch (error) {
    console.error('Error creating payout:', error);
    return {
      success: false,
      error: error.message,
      code: error.code,
    };
  }
};

/**
 * Create mock payout for testing (simulates Stripe behavior)
 * @param {Object} withdrawalData - Withdrawal request data
 * @returns {Promise<Object>} Mock payout result
 */
const createMockPayout = async (withdrawalData) => {
  const { amount, netAmount, bankDetails } = withdrawalData;

  console.log('🧪 MOCK MODE: Simulating Stripe payout');
  console.log(`   Amount: Rs ${amount}`);
  console.log(`   Net Amount: Rs ${netAmount}`);
  console.log(`   Bank: ${bankDetails.bankName}`);
  console.log(`   Account: ${bankDetails.accountNumber}`);

  // Simulate test account behaviors
  const accountNumber = bankDetails.accountNumber;
  
  // Test account that always fails
  if (accountNumber === '0000000000') {
    return {
      success: false,
      error: 'Invalid bank account',
      code: 'account_invalid',
    };
  }

  // Test account with delayed processing (simulate real scenario)
  if (accountNumber === '9999999999') {
    console.log('   ⏱️  Simulating delayed payout...');
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  // Generate mock payout ID
  const mockPayoutId = `po_test_${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
  const arrivalDate = new Date();
  arrivalDate.setDate(arrivalDate.getDate() + 3); // 3 days

  console.log(`   ✅ Mock payout created: ${mockPayoutId}`);
  console.log(`   📅 Estimated arrival: ${arrivalDate.toLocaleDateString()}`);

  return {
    success: true,
    payoutId: mockPayoutId,
    status: 'in_transit',
    arrivalDate: arrivalDate,
    isMock: true,
  };
};

/**
 * Create external bank account for Stripe Connect account
 * @param {string} stripeAccountId - Stripe account ID
 * @param {Object} bankDetails - Bank account details
 * @returns {Promise<Object>} External account
 */
const createExternalAccount = async (stripeAccountId, bankDetails) => {
  try {
    // Check if external account already exists
    const accounts = await stripe.accounts.listExternalAccounts(stripeAccountId, {
      object: 'bank_account',
      limit: 100,
    });

    // Find matching account
    const existing = accounts.data.find(
      acc => acc.account_number === bankDetails.accountNumber
    );

    if (existing) {
      return existing;
    }

    // Create new external account
    const externalAccount = await stripe.accounts.createExternalAccount(stripeAccountId, {
      external_account: {
        object: 'bank_account',
        country: 'PK',
        currency: 'pkr',
        account_holder_name: bankDetails.accountTitle,
        account_number: bankDetails.accountNumber,
        routing_number: bankDetails.routingNumber || '',
      },
    });

    return externalAccount;
  } catch (error) {
    console.error('Error creating external account:', error);
    throw error;
  }
};

/**
 * Get payout status from Stripe
 * @param {string} payoutId - Stripe payout ID
 * @param {string} stripeAccountId - Stripe account ID (optional)
 * @returns {Promise<Object>} Payout status
 */
exports.getPayoutStatus = async (payoutId, stripeAccountId) => {
  try {
    // In mock mode, simulate status progression
    if (payoutId.startsWith('po_test_')) {
      return getMockPayoutStatus(payoutId);
    }

    const options = stripeAccountId ? { stripeAccount: stripeAccountId } : {};
    const payout = await stripe.payouts.retrieve(payoutId, options);

    return {
      id: payout.id,
      status: payout.status,
      amount: payout.amount / 100,
      arrivalDate: new Date(payout.arrival_date * 1000),
      failureCode: payout.failure_code,
      failureMessage: payout.failure_message,
    };
  } catch (error) {
    console.error('Error getting payout status:', error);
    throw error;
  }
};

/**
 * Get mock payout status (simulates Stripe status progression)
 * @param {string} payoutId - Mock payout ID
 * @returns {Object} Mock status
 */
const getMockPayoutStatus = (payoutId) => {
  // Extract timestamp from mock ID
  const timestamp = parseInt(payoutId.split('_')[2]);
  const ageInSeconds = (Date.now() - timestamp) / 1000;

  let status;
  if (ageInSeconds < 10) {
    status = 'pending';
  } else if (ageInSeconds < 30) {
    status = 'in_transit';
  } else {
    status = 'paid';
  }

  const arrivalDate = new Date(timestamp + 3 * 24 * 60 * 60 * 1000);

  return {
    id: payoutId,
    status: status,
    arrivalDate: arrivalDate,
    isMock: true,
  };
};

/**
 * Cancel pending payout
 * @param {string} payoutId - Stripe payout ID
 * @param {string} stripeAccountId - Stripe account ID
 * @returns {Promise<boolean>} Success status
 */
exports.cancelPayout = async (payoutId, stripeAccountId) => {
  try {
    if (payoutId.startsWith('po_test_')) {
      console.log('🧪 MOCK MODE: Simulating payout cancellation');
      return true;
    }

    const options = stripeAccountId ? { stripeAccount: stripeAccountId } : {};
    await stripe.payouts.cancel(payoutId, options);
    return true;
  } catch (error) {
    console.error('Error cancelling payout:', error);
    return false;
  }
};

module.exports = exports;
