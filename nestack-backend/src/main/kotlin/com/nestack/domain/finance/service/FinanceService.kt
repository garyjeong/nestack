package com.nestack.domain.finance.service

import com.nestack.common.constant.ErrorCode
import com.nestack.common.enum.TransactionType
import com.nestack.common.exception.BusinessException
import com.nestack.common.util.CryptoUtil
import com.nestack.domain.finance.dto.TransactionQueryRequest
import com.nestack.domain.finance.dto.UpdateAccountRequest
import com.nestack.infrastructure.persistence.entity.BankAccount
import com.nestack.infrastructure.persistence.entity.OpenBankingToken
import com.nestack.infrastructure.persistence.entity.Transaction
import com.nestack.infrastructure.persistence.repository.BankAccountRepository
import com.nestack.infrastructure.persistence.repository.OpenBankingTokenRepository
import com.nestack.infrastructure.persistence.repository.TransactionRepository
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime
import java.util.*

@Service
class FinanceService(
    private val bankAccountRepository: BankAccountRepository,
    private val transactionRepository: TransactionRepository,
    private val tokenRepository: OpenBankingTokenRepository
) {
    private val logger = LoggerFactory.getLogger(FinanceService::class.java)

    @Value("\${spring.openbanking.api-url:https://testapi.openbanking.or.kr}")
    private var apiBaseUrl: String = "https://testapi.openbanking.or.kr"

    @Value("\${spring.openbanking.client-id:}")
    private var clientId: String = ""

    @Value("\${spring.openbanking.client-secret:}")
    private var clientSecret: String = ""

    @Value("\${spring.openbanking.redirect-uri:}")
    private var redirectUri: String = ""

    @Value("\${spring.encryption.key:}")
    private var encryptionKey: String = ""

    fun getAuthorizationUrl(state: String): String {
        val params = mapOf(
            "response_type" to "code",
            "client_id" to clientId,
            "redirect_uri" to redirectUri,
            "scope" to "login inquiry transfer",
            "state" to state,
            "auth_type" to "0"
        )

        val queryString = params.entries.joinToString("&") { "${it.key}=${it.value}" }
        return "$apiBaseUrl/oauth/2.0/authorize?$queryString"
    }

    @Transactional
    fun handleCallback(userId: UUID, code: String) {
        try {
            // Exchange authorization code for tokens (simulated)
            val tokenResponse = exchangeCodeForTokens(code)

            // Encrypt tokens
            val encryptedAccessToken = CryptoUtil.encrypt(tokenResponse.accessToken, encryptionKey)
            val encryptedRefreshToken = CryptoUtil.encrypt(tokenResponse.refreshToken, encryptionKey)

            // Store or update tokens
            val existingToken = tokenRepository.findByUserId(userId)

            if (existingToken != null) {
                existingToken.accessToken = encryptedAccessToken
                existingToken.refreshToken = encryptedRefreshToken
                existingToken.tokenType = tokenResponse.tokenType
                existingToken.scope = tokenResponse.scope
                existingToken.userSeqNo = tokenResponse.userSeqNo
                existingToken.expiresAt = LocalDateTime.now().plusSeconds(tokenResponse.expiresIn)
                tokenRepository.save(existingToken)
            } else {
                val newToken = OpenBankingToken().apply {
                    this.userId = userId
                    this.accessToken = encryptedAccessToken
                    this.refreshToken = encryptedRefreshToken
                    this.tokenType = tokenResponse.tokenType
                    this.scope = tokenResponse.scope
                    this.userSeqNo = tokenResponse.userSeqNo
                    this.expiresAt = LocalDateTime.now().plusSeconds(tokenResponse.expiresIn)
                }
                tokenRepository.save(newToken)
            }

            // Sync accounts
            syncAccounts(userId)
        } catch (e: Exception) {
            logger.error("OpenBanking callback error", e)
            throw BusinessException(ErrorCode.FINANCE_001)
        }
    }

    private fun exchangeCodeForTokens(code: String): TokenResponse {
        // In production, make actual HTTP call to OpenBanking API
        logger.info("Exchanging code for tokens: $code")

        // Simulated response
        return TokenResponse(
            accessToken = "access_${System.currentTimeMillis()}",
            refreshToken = "refresh_${System.currentTimeMillis()}",
            tokenType = "Bearer",
            expiresIn = 7776000L, // 90 days
            scope = "login inquiry transfer",
            userSeqNo = "U${System.currentTimeMillis()}"
        )
    }

    @Transactional
    fun syncAccounts(userId: UUID): List<BankAccount> {
        val token = getValidToken(userId)
            ?: throw BusinessException(ErrorCode.FINANCE_002)

        try {
            // Fetch accounts from OpenBanking API (simulated)
            val accountsData = fetchAccountsFromOpenBanking(token)

            val accounts = mutableListOf<BankAccount>()

            accountsData.forEach { accountData ->
                var account = bankAccountRepository.findByUserId(userId)
                    .find { it.fintechUseNum == accountData.fintechUseNum }

                if (account == null) {
                    account = BankAccount().apply {
                        this.userId = userId
                        this.bankCode = accountData.bankCode
                        this.bankName = accountData.bankName
                        this.accountNumber = CryptoUtil.encrypt(accountData.accountNumber, encryptionKey)
                        this.accountNumberMasked = accountData.accountNumberMasked
                        this.accountType = accountData.accountType
                        this.balance = accountData.balance
                        this.fintechUseNum = accountData.fintechUseNum
                        this.lastSyncedAt = LocalDateTime.now()
                    }
                } else {
                    account.balance = accountData.balance
                    account.lastSyncedAt = LocalDateTime.now()
                }

                accounts.add(bankAccountRepository.save(account))
            }

            return accounts
        } catch (e: Exception) {
            logger.error("Error syncing accounts", e)
            throw BusinessException(ErrorCode.FINANCE_001)
        }
    }

    @Transactional(readOnly = true)
    fun isConnected(userId: UUID): Boolean {
        val token = getValidToken(userId)
        return token != null
    }

    @Transactional
    fun disconnect(userId: UUID) {
        tokenRepository.findByUserId(userId)?.let {
            tokenRepository.delete(it)
        }
    }

    @Transactional(readOnly = true)
    fun getAccounts(userId: UUID): List<BankAccount> {
        return bankAccountRepository.findByUserId(userId)
            .filter { !it.isHidden }
            .sortedByDescending { it.createdAt }
    }

    @Transactional(readOnly = true)
    fun getAccountById(userId: UUID, accountId: UUID): BankAccount {
        return bankAccountRepository.findByUserIdAndId(userId, accountId)
            ?: throw BusinessException(ErrorCode.FINANCE_003)
    }

    @Transactional
    fun updateAccount(userId: UUID, accountId: UUID, request: UpdateAccountRequest): BankAccount {
        val account = getAccountById(userId, accountId)

        request.accountAlias?.let { account.accountAlias = it }
        request.shareStatus?.let { account.shareStatus = it }
        request.isHidden?.let { account.isHidden = it }

        return bankAccountRepository.save(account)
    }

    @Transactional
    fun syncAccountTransactions(userId: UUID, accountId: UUID): List<Transaction> {
        val account = getAccountById(userId, accountId)
        val token = getValidToken(userId)
            ?: throw BusinessException(ErrorCode.FINANCE_002)

        try {
            // Fetch transactions from OpenBanking API (simulated)
            val transactionsData = fetchTransactionsFromOpenBanking(token, account.fintechUseNum)

            val transactions = mutableListOf<Transaction>()

            transactionsData.forEach { txData ->
                val existingTx = transactionRepository.findByBankAccountId(account.id)
                    .find { it.transactionId == txData.transactionId }

                if (existingTx == null) {
                    val tx = Transaction().apply {
                        this.bankAccountId = account.id
                        this.transactionId = txData.transactionId
                        this.type = if (txData.inoutType == "I") TransactionType.DEPOSIT else TransactionType.WITHDRAWAL
                        this.amount = txData.amount
                        this.balanceAfter = txData.balanceAfter
                        this.description = txData.description
                        this.counterparty = txData.counterparty
                        this.transactionDate = txData.transactionDate
                        this.transactionTime = txData.transactionTime
                    }
                    transactions.add(transactionRepository.save(tx))
                }
            }

            // Update account balance
            if (transactionsData.isNotEmpty()) {
                account.balance = transactionsData.first().balanceAfter
                account.lastSyncedAt = LocalDateTime.now()
                bankAccountRepository.save(account)
            }

            return transactions
        } catch (e: Exception) {
            logger.error("Error syncing transactions", e)
            throw BusinessException(ErrorCode.FINANCE_001)
        }
    }

    @Transactional(readOnly = true)
    fun getTransactions(userId: UUID, accountId: UUID?, query: TransactionQueryRequest): List<Transaction> {
        val accountIds = if (accountId != null) {
            listOf(accountId)
        } else {
            bankAccountRepository.findByUserId(userId).map { it.id }
        }

        return if (query.startDate != null && query.endDate != null) {
            transactionRepository.findByBankAccountIdsAndDateRange(accountIds, query.startDate, query.endDate)
        } else {
            transactionRepository.findByBankAccountIds(accountIds)
        }.filter { query.type == null || it.type == query.type }
    }

    private fun getValidToken(userId: UUID): OpenBankingToken? {
        val token = tokenRepository.findByUserId(userId) ?: return null
        if (token.expiresAt.isBefore(LocalDateTime.now())) {
            return null
        }
        return token
    }

    private fun fetchAccountsFromOpenBanking(token: OpenBankingToken): List<AccountData> {
        // Simulated - in production, make actual API call
        return listOf(
            AccountData(
                fintechUseNum = "F${System.currentTimeMillis()}_1",
                accountNumber = "1234567890123456",
                accountNumberMasked = "1234-****-****-3456",
                bankCode = "004",
                bankName = "KB국민은행",
                accountType = "입출금",
                balance = java.math.BigDecimal(1500000)
            )
        )
    }

    private fun fetchTransactionsFromOpenBanking(token: OpenBankingToken, fintechUseNum: String): List<TransactionData> {
        // Simulated - in production, make actual API call
        return emptyList()
    }

    private data class TokenResponse(
        val accessToken: String,
        val refreshToken: String,
        val tokenType: String,
        val expiresIn: Long,
        val scope: String,
        val userSeqNo: String
    )

    private data class AccountData(
        val fintechUseNum: String,
        val accountNumber: String,
        val accountNumberMasked: String,
        val bankCode: String,
        val bankName: String,
        val accountType: String,
        val balance: java.math.BigDecimal
    )

    private data class TransactionData(
        val transactionId: String,
        val inoutType: String,
        val amount: java.math.BigDecimal,
        val balanceAfter: java.math.BigDecimal,
        val description: String?,
        val counterparty: String?,
        val transactionDate: java.time.LocalDate,
        val transactionTime: java.time.LocalTime?
    )
}
