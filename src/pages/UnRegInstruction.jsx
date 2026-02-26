
import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useGlobalContext } from '../Context'
import { createTransaction, initVoletPayment } from '../api'
import { useNotification } from '../components/Notification'
import '../styles/unreginstruction.css'

const UnRegInstruction = () => {
  const { t, transferData: contextTransferData } = useGlobalContext()
  const notify = useNotification()
  const navigate = useNavigate()
  const location = useLocation()
  const [isChecked, setIsChecked] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Get all transfer data from previous pages (merge context + location.state)
  const transferData = { ...contextTransferData, ...(location.state || {}) }

  const steps = [
    t('step1Instructions'),
    t('step2Instructions'),
    t('step3Instructions'),
    t('step4Instructions'),
    t('step5Instructions')
  ]

  return (
    <div className="instruction-container">
      <div className="instruction-card">
        <div className="instruction-header">
          <button 
            className="instruction-back"
            onClick={() => navigate(-1)}
          >
            ← {t('back')}
          </button>
          <h1 className="instruction-title">{t('howToPay')}</h1>
          <p className="instruction-subtitle">{t('followSteps')}</p>
        </div>

        <div className="instruction-steps">
          {steps.map((step, index) => (
            <div key={index} className="instruction-step">
              <span className="step-number">{index + 1}</span>
              <p className="step-text">{step}</p>
            </div>
          ))}
        </div>

        <label className="instruction-checkbox">
          <input 
            type="checkbox"
            className="checkbox-input"
            checked={isChecked}
            onChange={(e) => setIsChecked(e.target.checked)}
          />
          <span className="checkbox-label">
            {t('agreeWithInstructions')}
          </span>
        </label>

        <button
          className="continue-button"
          disabled={!isChecked || isLoading}
          onClick={async () => {
            try {
              setIsLoading(true)

              // Build transaction data for API
              const { recipient, feeCalculation, fromCurrency: ctxFromCurrency, toCurrency, paymentMethod, cryptoDetails, bankDetails, cryptoCurrency, senderCard } = transferData

              // sendAmount: use context value, fallback to sessionStorage (survives page refresh)
              const rawSendAmount = transferData.sendAmount || sessionStorage.getItem('transfer_sendAmount') || ''
              const sendAmount = rawSendAmount
              const fromCurrency = ctxFromCurrency || sessionStorage.getItem('transfer_fromCurrency') || 'USD'

              // Validate required fields before API call
              const parsedAmount = parseFloat(String(sendAmount).replace(/\s/g, ''))
              if (!sendAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
                notify.error(t('amountRequired') || 'Please go back and enter the transfer amount')
                setIsLoading(false)
                return
              }

              // Log sender card info (card from which payment will be taken via Volet)

              // Determine payment method type based on paymentMethod string
              let paymentMethodType = 'DEBIT_CARD'
              if (paymentMethod === 'CRYPTO' || paymentMethod?.toLowerCase()?.includes('крипто') || paymentMethod?.toLowerCase()?.includes('crypto')) {
                paymentMethodType = 'CRYPTO'
              } else if (paymentMethod === 'BANK_TRANSFER' || paymentMethod?.toLowerCase()?.includes('банк') || paymentMethod?.toLowerCase()?.includes('bank')) {
                paymentMethodType = 'BANK_TRANSFER'
              }

              // Helper to detect card network from card number
              const detectCardNetwork = (cardNumber) => {
                const num = String(cardNumber).replace(/\s/g, '')
                if (!num) return 'VISA'
                if (num.startsWith('8600') || num.startsWith('5614')) return 'UZCARD'
                if (num.startsWith('9860')) return 'HUMO'
                if (num.startsWith('4')) return 'VISA'
                if (num.length >= 2) {
                  const first2 = parseInt(num.slice(0, 2))
                  if (first2 >= 51 && first2 <= 55) return 'MASTERCARD'
                }
                if (num.length >= 4) {
                  const first4 = parseInt(num.slice(0, 4))
                  if (first4 >= 2221 && first4 <= 2720) return 'MASTERCARD'
                }
                return 'VISA'
              }

              // Check if receiver currency is a crypto currency
              const cryptoCurrencies = ['USDT', 'BTC', 'ETH', 'USDC', 'BNB']
              const isCryptoReceiver = cryptoCurrencies.includes(toCurrency?.toUpperCase())

              // Build the transaction request according to Swagger API spec
              const transactionRequest = {
                paymentMethod: paymentMethodType,
                amountSent: parsedAmount,
                sourceCurrency: fromCurrency || 'USD',
                receiverCurrency: toCurrency || 'UZS',
                receiverName: recipient?.receiverName || `${recipient?.firstName || ''} ${recipient?.lastName || ''}`.trim(),
                receiverCountryId: transferData.receiverCountryId || recipient?.receiverCountryId || 1
              }

              // Add sender card details (card from which payment is taken)
              if (senderCard && senderCard.cardNumber) {
                const senderExpYear = senderCard.expiryYear?.toString() || '2026'
                const senderExpYearFormatted = senderExpYear.length === 2 ? `20${senderExpYear}` : senderExpYear
                const senderExpMonth = String(senderCard.expiryMonth || '12').padStart(2, '0')

                transactionRequest.senderCardDetails = {
                  cardId: senderCard.cardId,
                  cardNumber: senderCard.cardNumber.replace(/\s/g, ''),
                  cardNetwork: senderCard.cardNetwork || detectCardNetwork(senderCard.cardNumber),
                  expirationMonth: senderExpMonth,
                  expirationYear: senderExpYearFormatted,
                  cardHolderName: (senderCard.cardHolderName || '').toUpperCase().trim(),
                  bankName: senderCard.bankName || ''
                }
              }

              // ===== DEBIT_CARD PAYMENT METHOD =====
              if (paymentMethodType === 'DEBIT_CARD') {
                if (recipient?.cardNumber) {
                  // Format expiration year - ensure it's 4 digits
                  const rawExpYear = recipient.expiryYear || recipient.expirationYear || '2026'
                  const expYear = rawExpYear.toString().length === 2 ? `20${rawExpYear}` : rawExpYear.toString()
                  const expMonth = String(recipient.expiryMonth || recipient.expirationMonth || '12').padStart(2, '0')

                  transactionRequest.debitCardDetails = {
                    cardNumber: recipient.cardNumber.replace(/\s/g, ''),
                    cardNetwork: recipient.cardNetwork || detectCardNetwork(recipient.cardNumber),
                    expirationMonth: expMonth,
                    expirationYear: expYear,
                    cardHolderName: (recipient.cardHolderName || recipient.receiverName || `${recipient.firstName || ''} ${recipient.lastName || ''}`).toUpperCase().trim()
                  }

                  // Add bankName only for fiat-to-fiat transfers (not when receiver is crypto)
                  if (!isCryptoReceiver && recipient.bankName) {
                    transactionRequest.debitCardDetails.bankName = recipient.bankName
                  }
                }

                // For registered user transfers (via Fastorika ID)
                if (recipient?.mode === 'user' && recipient?.userId) {
                  transactionRequest.receiverUserId = parseInt(recipient.userId)
                  transactionRequest.receiverName = recipient.receiverName || recipient.foundUser?.fullName

                  // Use country from found user's card
                  if (recipient.receiverCountryId) {
                    transactionRequest.receiverCountryId = recipient.receiverCountryId
                  }
                }
              }

              // ===== CRYPTO PAYMENT METHOD =====
              else if (paymentMethodType === 'CRYPTO') {
                // Get crypto details from transferData.cryptoDetails (set in UnRegSelProvide)
                const crypto = cryptoDetails || {}

                transactionRequest.cryptoDetails = {
                  cryptoCurrency: crypto.cryptoCurrency || cryptoCurrency || toCurrency || 'USDT',
                  blockchainNetwork: crypto.blockchainNetwork || 'TRC20',
                  walletAddress: crypto.walletAddress || recipient?.walletAddress || ''
                }

                // For crypto, receiverCountryId is typically 2 (crypto country)
                transactionRequest.receiverCountryId = transferData.receiverCountryId || 2
              }

              // ===== BANK_TRANSFER PAYMENT METHOD =====
              else if (paymentMethodType === 'BANK_TRANSFER') {
                const bank = bankDetails || recipient?.bankDetails || {}

                transactionRequest.bankTransferDetails = {
                  bankName: bank.bankName || '',
                  accountNumber: bank.accountNumber || '',
                  swiftCode: bank.swiftCode || '',
                  iban: bank.iban || bank.accountNumber || '',
                  accountHolderName: bank.accountHolderName || transactionRequest.receiverName
                }
              }


              // Step 1: Create transaction
              const transaction = await createTransaction(transactionRequest)

              // Step 2: Initialize Volet payment
              const paymentData = await initVoletPayment(transaction.transactionId)

              // Step 3: Redirect to Volet payment page
              const formData = paymentData?.formData || paymentData?.data?.formData || paymentData

              // Convert camelCase to snake_case for Volet form fields
              // Backend returns: acAccountEmail, acSciName, etc.
              // Volet expects: ac_account_email, ac_sci_name, etc.
              const camelToSnake = (str) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)

              const voletFieldMapping = {
                'acAccountEmail': 'ac_account_email',
                'acSciName': 'ac_sci_name',
                'acAmount': 'ac_amount',
                'acCurrency': 'ac_currency',
                'acOrderId': 'ac_order_id',
                'acSign': 'ac_sign',
                'acSuccessUrl': 'ac_success_url',
                'acFailUrl': 'ac_fail_url',
                'acStatusUrl': 'ac_status_url',
                'acComments': 'ac_comments'
              }

              // Check if we have the required fields (in either format)
              const hasActionUrl = formData?.actionUrl
              const hasAccountEmail = formData?.acAccountEmail || formData?.ac_account_email
              const hasSciName = formData?.acSciName || formData?.ac_sci_name
              const hasAmount = formData?.acAmount || formData?.ac_amount
              const hasCurrency = formData?.acCurrency || formData?.ac_currency
              const hasOrderId = formData?.acOrderId || formData?.ac_order_id

              if (hasActionUrl && hasAccountEmail && hasSciName && hasAmount && hasCurrency && hasOrderId) {
                // Create and submit form to Volet
                const form = document.createElement('form')
                form.method = 'POST'
                form.action = formData.actionUrl

                // Add all form fields, converting camelCase to snake_case
                Object.entries(formData).forEach(([key, value]) => {
                  if (key !== 'actionUrl' && key !== 'internalTransactionId' && key !== 'paymentOrderId' && key !== 'instructions' && value) {
                    const input = document.createElement('input')
                    input.type = 'hidden'
                    // Convert to snake_case if it's a camelCase Volet field
                    input.name = voletFieldMapping[key] || key
                    input.value = value
                    form.appendChild(input)
                  }
                })

                document.body.appendChild(form)
                sessionStorage.removeItem('transfer_sendAmount')
                sessionStorage.removeItem('transfer_fromCurrency')
                form.submit()
              } else if (hasActionUrl) {
                // Has URL but missing some fields - log and show error
                console.error('Missing required Volet parameters:', {
                  formData,
                  hasAccountEmail,
                  hasSciName,
                  hasAmount,
                  hasCurrency,
                  hasOrderId
                })
                notify.error(t('paymentConfigError') || 'Payment configuration error. Please contact support.')
                // Still clear pending and go to transactions since transaction was created
                localStorage.removeItem('pending')
                navigate('/transactions')
              } else {
                // No payment URL - just complete without redirect
                localStorage.removeItem('pending')
                sessionStorage.removeItem('transfer_sendAmount')
                sessionStorage.removeItem('transfer_fromCurrency')
                notify.success(t('transactionCreated') || 'Transaction created successfully!')
                navigate('/transactions')
              }

            } catch (error) {
              console.error('Transaction error:', error)
              notify.error(error.message || t('transactionError') || 'Failed to create transaction')
            } finally {
              setIsLoading(false)
            }
          }}
        >
          {isLoading ? (t('processing') || 'Processing...') : t('continue')}
        </button>
      </div>
    </div>
  )
}

export default UnRegInstruction