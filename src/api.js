export const API_BASE = import.meta.env.VITE_API_URL || '';

// Adds optional Authorization header from sessionStorage/env and sensible defaults
export const apiFetch = async (path, options = {}) => {
  const defaultHeaders = {
    Accept: 'application/json',
  };
  // Prefer Bearer token from sessionStorage; fallback to env auth string
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('token') : null;
  const envAuth = import.meta.env.VITE_API_AUTH; // e.g., "Basic xxx" or "Bearer yyy"
  if (!options.headers?.Authorization) {
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    } else if (envAuth) {
      defaultHeaders['Authorization'] = envAuth;
    }
  }

  const mergedOptions = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
  };

  const response = await fetch(`${API_BASE}${path}`, mergedOptions);

  // Check if token expired (401 Unauthorized)
  // Skip redirect for auth endpoints (login, register, forgot-password, reset-password)
  if (response.status === 401 && !path.startsWith('auth/')) {
    // Clear authentication data
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('logged');

      // Redirect to login page
      window.location.href = '/login';
    }
  }

  return response;
};


// Async funksiya ichida
const fetchUsers = async () => {
  try {
    const response = await apiFetch('admin/users?page=0&size=10');
    const dataAdmins = await response.json();
    return dataAdmins;
  } catch (error) {
    console.error('Error:', error);
  }
};


// ============== USER API ==============

/**
 * Get current logged-in user information
 *
 * @returns {Promise<Object>} Current user data
 *
 * Response 200 structure:
 * {
 *   "success": true,
 *   "message": "string",
 *   "data": {
 *     "id": 0,
 *     "email": "string",
 *     "phone": "string",
 *     "status": "PENDING",
 *     "role": "ADMIN",
 *     "createdAt": "2026-01-10T14:20:48.755Z"
 *   },
 *   "timestamp": "2026-01-10T14:20:48.755Z"
 * }
 */
export const getCurrentUser = async () => {
  try {
    const res = await apiFetch('users/me', { method: 'GET' });
    const response = await res.json();

    if (!res.ok) {
      throw new Error(response?.message || 'Failed to load user');
    }

    return response?.data || response;
  } catch (error) {
    console.error('getCurrentUser error:', error);
    throw error;
  }
};

/**
 * Update current logged-in user information
 *
 * @param {Object} userData - User data to update
 * @param {string} userData.name - User's first name
 * @param {string} userData.surname - User's last name
 * @param {string} userData.phone - User's phone number
 * @param {number} userData.countryId - User's country ID
 * @param {string} userData.dateOfBirth - User's date of birth (YYYY-MM-DD)
 *
 * @returns {Promise<Object>} Updated user data
 */
export const updateCurrentUser = async (userData) => {
  try {
    const res = await apiFetch('users/me', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    const response = await res.json();

    if (!res.ok) {
      throw new Error(response?.message || 'Failed to update user');
    }

    return response?.data || response;
  } catch (error) {
    console.error('updateCurrentUser error:', error);
    throw error;
  }
};

/**
 * Get all cards for the current logged-in user
 *
 * @returns {Promise<Array>} Array of user's cards
 *
 * Response 200 structure:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "id": "card-uuid",
 *       "cardNumber": "****-****-****-1234",
 *       "bankName": "National Bank",
 *       "expiryMonth": 12,
 *       "expiryYear": 25,
 *       "brand": "VISA",
 *       "country": { "name": "Uzbekistan", "code": "UZ" },
 *       "status": "ACTIVE",
 *       "createdAt": "2024-01-15T10:30:00"
 *     }
 *   ]
 * }
 */
export const getUserCards = async () => {
  try {
    const res = await apiFetch('cards/my', { method: 'GET' });
    const response = await res.json();

    if (!res.ok) {
      throw new Error(response?.message || 'Failed to load cards');
    }

    return response?.data || response;
  } catch (error) {
    console.error('getUserCards error:', error);
    throw error;
  }
};

/**
 * Get card requirements for a specific country
 *
 * @param {string} countryCode - Country code (e.g., "UZ", "IN", "CN")
 * @returns {Promise<Object>} Card requirements for the country
 *
 * Response structure:
 * {
 *   "success": true,
 *   "data": {
 *     "countryCode": "UZ",
 *     "cardNumberLength": 16,
 *     "supportedBrands": ["VISA", "MASTERCARD", "HUMO", "UZCARD"],
 *     "requiresCVV": true,
 *     "expiryFormat": "MM/YY",
 *     "additionalFields": ["phone"]
 *   }
 * }
 */
export const getCardRequirements = async (countryCode) => {
  try {
    const res = await apiFetch(`cards/requirements/${countryCode}`, {
      method: 'GET'
    });
    const response = await res.json();

    if (!res.ok) {
      throw new Error(response?.message || 'Failed to load card requirements');
    }

    return response?.data || response;
  } catch (error) {
    console.error('getCardRequirements error:', error);
    throw error;
  }
};

/**
 * Add a new bank card for the current user
 *
 * @param {Object} cardData - Card details
 * @param {Object} cardData.country - Country object { countryId, code, name }
 * @param {string} cardData.bankName - Bank name
 * @param {string} cardData.cardNumber - Card number (16 digits)
 * @param {number} cardData.expiryMonth - Expiry month (1-12)
 * @param {number} cardData.expiryYear - Expiry year (YY format)
 * @param {string} cardData.name - Cardholder name
 * @param {string} cardData.phone - Phone number
 *
 * @returns {Promise<Object>} Created card data
 */
export const addCard = async (cardData) => {
  try {
    const res = await apiFetch('cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cardData)
    });

    const response = await res.json();

    if (!res.ok) {
      throw new Error(response?.message || 'Failed to add card');
    }

    return response?.data || response;
  } catch (error) {
    console.error('addCard error:', error);
    throw error;
  }
};

/**
 * Delete (soft delete) a card by ID
 *
 * @param {string} cardId - Card ID (UUID)
 * @returns {Promise<boolean>} Success status
 *
 * Response 200:
 * {
 *   "success": true,
 *   "message": "Card deleted successfully"
 * }
 */
export const deleteCard = async (cardId) => {
  try {
    const res = await apiFetch(`cards/${cardId}`, {
      method: 'DELETE'
    });
    const response = await res.json();

    if (!res.ok) {
      throw new Error(response?.message || 'Failed to delete card');
    }

    return true;
  } catch (error) {
    console.error('deleteCard error:', error);
    throw error;
  }
};


// ============== VOLET PAYMENT API ==============

/**
 * Initialize Volet SCI payment for a transaction
 *
 * Prerequisites:
 * - Transaction must exist and belong to authenticated user
 * - Transaction status must be TO_PAY
 * - User must be authenticated (JWT)
 *
 * @param {string} transactionId - Transaction ID (UUID)
 * @returns {Promise<Object>} Form data for Volet payment
 *
 * Response 200 structure:
 * {
 *   "success": true,
 *   "message": "Payment initialized successfully",
 *   "data": {
 *     "formData": {
 *       "actionUrl": "https://volet.com/sci/",
 *       "acAccountEmail": "merchant@example.com",
 *       "acSciName": "MyStore",
 *       "acAmount": "100.00",
 *       "acCurrency": "USD",
 *       "acOrderId": "ORD-1705312200000-A1B2C3D4",
 *       "acSign": "abc123def456...",
 *       "acSuccessUrl": "https://your-domain.com/payment/success",
 *       "acFailUrl": "https://your-domain.com/payment/fail",
 *       "acStatusUrl": "https://your-domain.com/api/payments/volet/status",
 *       "acComments": "Payment for transfer TXN-240115-A1B2C3D4",
 *       "internalTransactionId": "TXN-240115-A1B2C3D4",
 *       "paymentOrderId": "550e8400-e29b-41d4-a716-446655440000"
 *     },
 *     "instructions": "Submit form data to actionUrl via POST to initiate payment"
 *   },
 *   "timestamp": "2024-01-15T10:30:00"
 * }
 *
 * Frontend Usage:
 * const formData = await initVoletPayment(transactionId);
 * // Create and submit form with formData
 */
export const initVoletPayment = async (transactionId) => {
  try {

    const res = await apiFetch(`payments/volet/init/${transactionId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const response = await res.json();

    if (!res.ok) {
      throw new Error(response?.message || 'Failed to initialize payment');
    }

    return response?.data || response;
  } catch (error) {
    console.error('initVoletPayment error:', error);
    throw error;
  }
};

/**
 * Volet payment status callback
 *
 * ⚠️ This endpoint is called by Volet servers only!
 * This is NOT meant to be called by frontend or mobile apps.
 *
 * Security:
 * - IP whitelist validation
 * - Hash verification using Volet's signature
 * - No JWT required (public endpoint)
 *
 * Behavior:
 * - If payment COMPLETED: Transaction → PROCESSING
 * - If payment failed: Transaction → REJECTED
 * - Duplicate callbacks are ignored (idempotent)
 *
 * Note: This is documented here for reference only.
 * Frontend should NOT call this endpoint.
 */
// export const voletStatusCallback = ... // NOT for frontend use

// ============== COUNTRY API ==============

/**
 * Get all countries (public endpoint)
 *
 * @returns {Promise<Array>} Array of countries
 *
 * Response 200 structure:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "id": 1,
 *       "name": "Uzbekistan",
 *       "code": "UZ",
 *       "flag": "https://example.com/flags/uz.png",
 *       "currency": "UZS",
 *       "active": true
 *     }
 *   ]
 * }
 */
export const getAllCountries = async () => {
  try {
    const res = await apiFetch('countries', { method: 'GET' });
    const response = await res.json();

    if (!res.ok) {
      throw new Error(response?.message || 'Failed to load countries');
    }

    return response?.data || response;
  } catch (error) {
    console.error('getAllCountries error:', error);
    throw error;
  }
};

/**
 * Get country by ID (public endpoint)
 *
 * @param {number} countryId - Country ID
 * @returns {Promise<Object>} Country details
 *
 * Response 200 structure:
 * {
 *   "success": true,
 *   "data": {
 *     "id": 1,
 *     "name": "Uzbekistan",
 *     "code": "UZ",
 *     "flag": "https://example.com/flags/uz.png",
 *     "currency": "UZS",
 *     "exchangeRate": 12500,
 *     "active": true
 *   }
 * }
 */
export const getCountryById = async (countryId) => {
  try {
    const res = await apiFetch(`countries/${countryId}`, { method: 'GET' });
    const response = await res.json();

    if (!res.ok) {
      throw new Error(response?.message || 'Failed to load country');
    }

    return response?.data || response;
  } catch (error) {
    console.error('getCountryById error:', error);
    throw error;
  }
};

// ============== EXCHANGE RATE API ==============

/**
 * Get exchange rate pair with fee percentages and optional calculation
 * Uses backend /api/rates/pair endpoint
 *
 * @param {string} from - Source currency code (e.g., "USD", "EUR")
 * @param {string} to - Target currency code (e.g., "UZS", "KZT")
 * @param {string} [countryCurrency] - Country currency for fee lookup (e.g., "UZS")
 * @param {number} [amount] - Optional amount for calculation breakdown
 * @returns {Promise<Object>} Exchange rate data with fees and optional calculation
 *
 * Response structure:
 * {
 *   "fromCurrency": "USD",
 *   "toCurrency": "UZS",
 *   "rate": 12180.002266949,
 *   "lastUpdatedAt": "2026-02-19T23:59:59Z",
 *   "feePercentages": {
 *     "countryId": 1,
 *     "countryName": "Uzbekistan",
 *     "transferFeePercentage": 50,
 *     "exchangeRateFeePercentage": 0
 *   },
 *   "calculation": { // only when amount is provided
 *     "originalAmount": 100,
 *     "sourceCurrency": "USD",
 *     "targetCurrency": "UZS",
 *     "originalRate": 12180.002266949,
 *     "transferFeePercentage": 50,
 *     "transferFeeAmount": 50,
 *     "amountAfterTransferFee": 50,
 *     "exchangeRateFeePercentage": 0,
 *     "adjustedExchangeRate": 12180.002266949,
 *     "amountReceived": 609000.11
 *   }
 * }
 */
export const getRatePair = async (from, to, countryCurrency, amount) => {
  try {
    let path = `rates/pair?from=${from}&to=${to}`;
    if (countryCurrency) path += `&countryCurrency=${countryCurrency}`;
    if (amount !== undefined && amount !== null) path += `&amount=${amount}`;

    const res = await apiFetch(path, { method: 'GET' });
    const response = await res.json();

    if (!res.ok) {
      throw new Error(response?.message || 'Failed to fetch exchange rate');
    }

    return response?.data || response;
  } catch (error) {
    console.error('getRatePair error:', error);
    throw error;
  }
};

/**
 * Get latest exchange rate between two currencies
 * Uses Hexarate API for real-time currency conversion rates
 *
 * @param {string} baseCurrency - Base currency code (e.g., "USD", "EUR", "RUB")
 * @param {string} targetCurrency - Target currency code (e.g., "UZS", "KZT", "GBP")
 * @returns {Promise<Object>} Exchange rate data
 *
 * Response structure:
 * {
 *   "status_code": 200,
 *   "data": {
 *     "base": "USD",
 *     "target": "UZS",
 *     "mid": 12500.5,
 *     "unit": 1,
 *     "timestamp": "2024-08-31T05:16:50.272Z"
 *   }
 * }
 */
export const getExchangeRate = async (baseCurrency, targetCurrency) => {
  try {

    const url = `https://hexarate.paikama.co/api/rates/${baseCurrency}/${targetCurrency}/latest`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch exchange rate: ${response.status}`);
    }

    const data = await response.json();

    if (data.status_code !== 200) {
      throw new Error('Invalid exchange rate response');
    }

    return {
      base: data.data.base,
      target: data.data.target,
      rate: data.data.mid,
      unit: data.data.unit,
      timestamp: data.data.timestamp
    };
  } catch (error) {
    console.error('getExchangeRate error:', error);
    throw error;
  }
};

/**
 * Calculate converted amount using exchange rate
 *
 * @param {number} amount - Amount to convert
 * @param {string} fromCurrency - Source currency code
 * @param {string} toCurrency - Target currency code
 * @returns {Promise<Object>} Conversion result with rate and converted amount
 *
 * Response:
 * {
 *   "fromCurrency": "USD",
 *   "toCurrency": "UZS",
 *   "amount": 100,
 *   "rate": 12500.5,
 *   "convertedAmount": 1250050,
 *   "timestamp": "2024-08-31T05:16:50.272Z"
 * }
 */
export const convertCurrency = async (amount, fromCurrency, toCurrency) => {
  try {
    const exchangeData = await getExchangeRate(fromCurrency, toCurrency);

    const convertedAmount = amount * exchangeData.rate;

    return {
      fromCurrency: exchangeData.base,
      toCurrency: exchangeData.target,
      amount: amount,
      rate: exchangeData.rate,
      convertedAmount: Math.round(convertedAmount * 100) / 100, // Round to 2 decimal places
      timestamp: exchangeData.timestamp
    };
  } catch (error) {
    console.error('convertCurrency error:', error);
    throw error;
  }
};

// ============== TRANSACTION API ==============

/**
 * Create a new money transfer transaction with payment method specific details
 *
 * Payment Method Selection:
 * - DEBIT_CARD → requires debitCardDetails
 * - BANK_TRANSFER → requires bankTransferDetails
 * - CRYPTO → requires cryptoDetails
 *
 * @param {Object} transactionData - Transaction details
 * @param {string} transactionData.paymentMethod - "DEBIT_CARD" | "BANK_TRANSFER" | "CRYPTO"
 * @param {number} transactionData.amountSent - Amount to send
 * @param {string} transactionData.sourceCurrency - Source currency code (e.g., "USD")
 * @param {string} transactionData.receiverCurrency - Receiver currency code (e.g., "UZS")
 * @param {string} transactionData.receiverName - Receiver's full name
 * @param {number} transactionData.receiverCountryId - Receiver's country ID
 * @param {number} [transactionData.receiverUserId] - Receiver's user ID (optional, for registered users)
 * @param {Object} [transactionData.debitCardDetails] - Required for DEBIT_CARD
 * @param {string} transactionData.debitCardDetails.cardNumber - Full card number (16 digits)
 * @param {string} transactionData.debitCardDetails.cardNetwork - "VISA", "MASTERCARD", "HUMO", etc.
 * @param {string} transactionData.debitCardDetails.expirationMonth - "01"-"12"
 * @param {string} transactionData.debitCardDetails.expirationYear - "2026"
 * @param {string} transactionData.debitCardDetails.cardHolderName - Name on card
 * @param {string} [transactionData.debitCardDetails.bankName] - Bank name (optional)
 * @param {Object} [transactionData.bankTransferDetails] - Required for BANK_TRANSFER
 * @param {string} transactionData.bankTransferDetails.bankName - Bank name
 * @param {string} transactionData.bankTransferDetails.accountNumber - Account number
 * @param {string} transactionData.bankTransferDetails.swiftCode - SWIFT code
 * @param {Object} [transactionData.cryptoDetails] - Required for CRYPTO
 * @param {string} transactionData.cryptoDetails.cryptoCurrency - "BTC", "ETH", "USDT"
 * @param {string} transactionData.cryptoDetails.blockchainNetwork - "ERC20", "TRC20", etc.
 * @param {string} transactionData.cryptoDetails.walletAddress - Wallet address
 *
 * Fee System (TWO SEPARATE FEES):
 * - Transfer Fee: Applied to amountSent (transferFeePercentage)
 * - Exchange Rate Fee: Applied to exchange rate (exchangeRateFeePercentage)
 *
 * Calculation Flow:
 * 1. amountSent = 200 USD
 * 2. transferFeeAmount = amountSent × transferFeePercentage / 100
 * 3. amountAfterTransferFee = amountSent - transferFeeAmount
 * 4. baseExchangeRate = real-time rate from CurrencyAPI
 * 5. adjustedExchangeRate = baseExchangeRate - (baseExchangeRate × exchangeRateFeePercentage / 100)
 * 6. amountReceived = amountAfterTransferFee × adjustedExchangeRate
 *
 * @returns {Promise<Object>} Created transaction with status TO_PAY
 *
 * Response 200 structure:
 * {
 *   "success": true,
 *   "message": "Transaction created successfully",
 *   "data": {
 *     "transactionId": "550e8400-e29b-41d4-a716-446655440000",
 *     "internalTransactionId": "TXN-240115-A1B2C3D4",
 *     "status": "TO_PAY",
 *     "amountSent": 100,
 *     "transferFeeAmount": 10,
 *     "transferFeePercentage": 10,
 *     "amountAfterTransferFee": 90,
 *     "baseExchangeRate": 12500,
 *     "exchangeRateFeePercentage": 2,
 *     "adjustedExchangeRate": 12250,
 *     "amountReceived": 1102500,
 *     "sourceCurrency": "USD",
 *     "receiverCurrency": "UZS",
 *     "receiverName": "John Doe",
 *     "receiverCountryName": "Uzbekistan",
 *     "createdAt": "2024-01-15T10:30:00"
 *   },
 *   "timestamp": "2024-01-15T10:30:00"
 * }
 */
export const createTransaction = async (transactionData) => {
  try {

    const res = await apiFetch('transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(transactionData)
    });

    const response = await res.json();

    if (!res.ok) {
      throw new Error(response?.message || 'Failed to create transaction');
    }

    return response?.data || response;
  } catch (error) {
    console.error('createTransaction error:', error);
    throw error;
  }
};

/**
 * Get fee configuration for a specific country
 * Used to calculate and display fees before creating transaction
 *
 * @param {number} countryId - Country ID
 * @returns {Promise<Object>} Fee configuration
 *
 * Response structure:
 * {
 *   "countryId": 1,
 *   "countryName": "Uzbekistan",
 *   "transferFeePercentage": 10,
 *   "exchangeRateFeePercentage": 2
 * }
 */
export const getCountryFees = async (countryId) => {
  try {

    const res = await apiFetch(`countries/${countryId}/fees`, {
      method: 'GET'
    });

    const response = await res.json();

    if (!res.ok) {
      // If endpoint doesn't exist, return default fees
      return {
        transferFeePercentage: 0,
        exchangeRateFeePercentage: 0
      };
    }

    return response?.data || response;
  } catch (error) {
    console.error('getCountryFees error:', error);
    // Return default fees on error
    return {
      transferFeePercentage: 0,
      exchangeRateFeePercentage: 0
    };
  }
};

/**
 * Calculate transaction fees and final amount
 * Helper function for frontend to display accurate fees before submitting
 *
 * @param {number} amountSent - Amount to send
 * @param {number} transferFeePercentage - Transfer fee percentage
 * @param {number} exchangeRateFeePercentage - Exchange rate fee percentage
 * @param {number} baseExchangeRate - Exchange rate from CurrencyAPI
 * @returns {Object} Calculated amounts and fees
 */
export const calculateTransactionFees = (amountSent, transferFeePercentage, exchangeRateFeePercentage, baseExchangeRate) => {
  // Step 1: Calculate transfer fee
  const transferFeeAmount = amountSent * (transferFeePercentage || 0) / 100;

  // Step 2: Amount after transfer fee
  const amountAfterTransferFee = amountSent - transferFeeAmount;

  // Step 3: Calculate adjusted exchange rate
  const exchangeRateDeduction = baseExchangeRate * (exchangeRateFeePercentage || 0) / 100;
  const adjustedExchangeRate = baseExchangeRate - exchangeRateDeduction;

  // Step 4: Calculate final amount received
  const amountReceived = amountAfterTransferFee * adjustedExchangeRate;

  return {
    amountSent,
    transferFeePercentage: transferFeePercentage || 0,
    transferFeeAmount: Math.round(transferFeeAmount * 100) / 100,
    amountAfterTransferFee: Math.round(amountAfterTransferFee * 100) / 100,
    baseExchangeRate,
    exchangeRateFeePercentage: exchangeRateFeePercentage || 0,
    adjustedExchangeRate: Math.round(adjustedExchangeRate * 10000) / 10000,
    amountReceived: Math.round(amountReceived * 100) / 100
  };
};

// ============== USER TRANSACTIONS API ==============

/**
 * Get paginated list of user's own transactions (where user is sender or receiver)
 *
 * @param {number} page - Page number (0-based)
 * @param {number} size - Number of items per page (default: 20)
 * @returns {Promise<Object>} Paginated list of transactions
 *
 * Response structure:
 * {
 *   "content": [
 *     {
 *       "transactionId": "550e8400-e29b-41d4-a716-446655440000",
 *       "internalTransactionId": "TXN-240115-A1B2C3D4",
 *       "status": "DELIVERED",
 *       "isSender": true,
 *       "isReceiver": false,
 *       "counterpartyName": "Ivan Petrov",
 *       "amountSent": 100,
 *       "sourceCurrency": "USD",
 *       "amountReceived": 1218750,
 *       "destinationCurrency": "UZS",
 *       "destinationCountry": "Uzbekistan",
 *       "createdAt": "2024-01-15T10:30:00"
 *     }
 *   ],
 *   "pageable": { "pageNumber": 0, "pageSize": 20 },
 *   "totalElements": 2,
 *   "totalPages": 1,
 *   "first": true,
 *   "last": true
 * }
 */
export const fetchMyTransactions = async (page = 0, size = 20) => {
  try {

    const res = await apiFetch(`transactions/my?page=${page}&size=${size}`, {
      method: 'GET'
    });

    const response = await res.json();

    if (!res.ok) {
      throw new Error(response?.message || 'Failed to load transactions');
    }

    return response?.data || response;
  } catch (error) {
    console.error('fetchMyTransactions error:', error);
    throw error;
  }
};

/**
 * Get detailed information about a specific transaction
 * User can only view transactions where they are sender or receiver
 *
 * @param {string} transactionId - Transaction UUID
 * @returns {Promise<Object>} Detailed transaction data
 *
 * Response structure:
 * {
 *   "transactionId": "550e8400-e29b-41d4-a716-446655440000",
 *   "internalTransactionId": "TXN-240115-A1B2C3D4",
 *   "status": "DELIVERED",
 *   "createdAt": "2024-01-15T10:30:00",
 *   "updatedAt": "2024-01-15T11:00:00",
 *   "isSender": true,
 *   "isReceiver": false,
 *   "senderName": "John Doe",
 *   "receiverName": "Ivan Petrov",
 *   "receiverCountry": "Uzbekistan",
 *   "receiverCountryCode": "UZ",
 *   "amountSent": 100,
 *   "sourceCurrency": "USD",
 *   "feeAmount": 2.5,
 *   "exchangeRate": 12500,
 *   "amountReceived": 1218750,
 *   "destinationCurrency": "UZS",
 *   "receiverCard": {
 *     "cardNetwork": "HUMO",
 *     "maskedCardNumber": "**** **** **** 1234",
 *     "cardHolderName": "IVAN PETROV"
 *   },
 *   "paymentInfo": {
 *     "paymentInitiated": true,
 *     "paymentStatus": "SUCCESS",
 *     "paymentInitiatedAt": "2024-01-15T10:35:00",
 *     "paymentUpdatedAt": "2024-01-15T10:40:00"
 *   }
 * }
 */
export const fetchMyTransactionDetails = async (transactionId) => {
  try {

    const res = await apiFetch(`transactions/my/${transactionId}`, {
      method: 'GET'
    });

    const response = await res.json();

    if (!res.ok) {
      throw new Error(response?.message || 'Failed to load transaction details');
    }

    return response?.data || response;
  } catch (error) {
    console.error('fetchMyTransactionDetails error:', error);
    throw error;
  }
};

// ============== CLIENT/FASTORIKA ID API ==============

/**
 * Check if a client is verified by Fastorika ID
 *
 * @param {string} fastorikaId - Fastorika ID to verify
 * @returns {Promise<Object>} Verification status
 *
 * Response structure:
 * {
 *   "success": true,
 *   "data": {
 *     "fastorikaId": "FST123456",
 *     "isVerified": true,
 *     "verificationStatus": "VERIFIED"
 *   }
 * }
 */
export const verifyClientByFastorikaId = async (fastorikaId) => {
  try {

    const res = await apiFetch(`clients/verify/${fastorikaId}`, {
      method: 'GET'
    });

    const response = await res.json();

    if (!res.ok) {
      throw new Error(response?.message || 'Client not found or not verified');
    }

    return response?.data || response;
  } catch (error) {
    console.error('verifyClientByFastorikaId error:', error);
    throw error;
  }
};

/**
 * Find verified client by Fastorika ID with FULL card data
 * Returns complete client details including card numbers for money transfers
 *
 * Use Cases:
 * - Find a recipient before sending money (internal trusted flow)
 * - Verify a client's identity by Fastorika ID
 * - Look up client details and available cards for transactions
 *
 * Card Data Security:
 * - Returns FULL card numbers (trusted internal use)
 * - Full numbers are allowed because this API is used for money transfers
 * - JWT authentication is REQUIRED
 *
 * @param {string} fastorikaId - Fastorika ID to search
 * @returns {Promise<Object>} Client details with cards
 *
 * Response structure:
 * {
 *   "success": true,
 *   "data": {
 *     "userId": 123,
 *     "fastorikaId": "FST123456",
 *     "fullName": "John Doe",
 *     "email": "john@example.com",
 *     "phone": "+998901234567",
 *     "verificationStatus": "VERIFIED",
 *     "cards": [
 *       {
 *         "cardId": "card-uuid",
 *         "cardNumber": "8600123456781234",
 *         "cardNetwork": "UZCARD",
 *         "bankName": "National Bank",
 *         "expiryMonth": 12,
 *         "expiryYear": 26,
 *         "cardHolderName": "JOHN DOE",
 *         "country": {
 *           "id": 1,
 *           "name": "Uzbekistan",
 *           "code": "UZ"
 *         }
 *       }
 *     ]
 *   }
 * }
 */
export const findClientByFastorikaId = async (fastorikaId) => {
  try {

    const res = await apiFetch(`clients/by-fastorika-id/${fastorikaId}`, {
      method: 'GET'
    });

    const response = await res.json();

    if (!res.ok) {
      if (res.status === 404) {
        return null; // Client not found
      }
      throw new Error(response?.message || 'Failed to find client');
    }

    return response?.data || response;
  } catch (error) {
    console.error('findClientByFastorikaId error:', error);
    throw error;
  }
};

// ============== KYC VERIFICATION API ==============

/**
 * Start KYC verification process for the authenticated user
 * Returns access token for Sumsub WebSDK integration
 *
 * @param {number} userId - User ID to start verification for
 * @returns {Promise<Object>} KYC start data with applicantId and accessToken
 *
 * Response structure:
 * {
 *   "applicantId": "5eb...abc",
 *   "userId": 123,
 *   "accessToken": "eyJhbGc...",
 *   "message": "KYC verification started. Use the access token with Sumsub WebSDK."
 * }
 */
export const startKycVerification = async (userId) => {
  try {

    const res = await apiFetch('kyc/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId })
    });

    const response = await res.json();

    if (!res.ok) {
      throw new Error(response?.message || 'Failed to start KYC verification');
    }

    return response?.data || response;
  } catch (error) {
    console.error('startKycVerification error:', error);
    throw error;
  }
};

/**
 * Get a new access token for Sumsub WebSDK
 * Use this if the previous token expired or user refreshed the page
 *
 * @returns {Promise<string>} New access token
 */
export const refreshKycAccessToken = async () => {
  try {

    const res = await apiFetch('kyc/token', {
      method: 'GET'
    });

    const response = await res.json();

    if (!res.ok) {
      throw new Error(response?.message || 'Failed to refresh KYC access token');
    }

    return response?.data || response;
  } catch (error) {
    console.error('refreshKycAccessToken error:', error);
    throw error;
  }
};

/**
 * Get the current KYC verification status for the authenticated user
 *
 * @returns {Promise<Object>} KYC status data
 *
 * Verification statuses:
 * - PENDING: Verification in progress
 * - VERIFIED: User passed KYC (GREEN)
 * - NOT_VERIFIED: User failed KYC (RED)
 */
export const getKycStatus = async () => {
  try {

    const res = await apiFetch('kyc/status', {
      method: 'GET'
    });

    const response = await res.json();

    if (!res.ok) {
      throw new Error(response?.message || 'Failed to get KYC status');
    }

    return response?.data || response;
  } catch (error) {
    console.error('getKycStatus error:', error);
    throw error;
  }
};