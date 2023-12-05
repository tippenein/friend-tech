
;; title: keys
;; version:
;; summary:
;; description:

(define-constant ERR_NOT_CONTRACT_OWNER (err u6000))
(define-constant ERR_INVALID_FEE_PERCENT (err u6001))
(define-map keysBalance { subject: principal, holder: principal } uint)
(define-map keysSupply { subject: principal } uint)

(define-data-var protocolFeePercent uint u15)
(define-data-var protocolFeeDestination principal tx-sender)

(define-read-only (get-price (supply uint) (amount uint))
  (let
    (
      (base-price u10)
      (price-change-factor u100)
      (adjusted-supply (+ supply amount))
    )
    (+ base-price (* amount (/ (* adjusted-supply adjusted-supply) price-change-factor)))
  )
)
(define-public (buy-keys (subject principal) (amount uint))
  (let
    (
      (supply (default-to u0 (map-get? keysSupply { subject: subject })))
      (price (get-price supply amount))
    )
    (if (or (> supply u0) (is-eq tx-sender subject))
      (begin
        (match (stx-transfer? price tx-sender (as-contract tx-sender))
          success
          (begin
            (map-set keysBalance { subject: subject, holder: tx-sender }
              (+ (default-to u0 (map-get? keysBalance { subject: subject, holder: tx-sender })) amount)
            )
            (map-set keysSupply { subject: subject } (+ supply amount))
            (ok true)
          )
          error
          (err u2)
        )
      )
      (err u1)
    )
  )
)
(define-public (sell-keys (subject principal) (amount uint))
  (let
    (
      (balance (default-to u0 (map-get? keysBalance { subject: subject, holder: tx-sender })))
      (supply (default-to u0 (map-get? keysSupply { subject: subject })))
      (price (get-price supply amount))
      (recipient tx-sender)
    )
    (if (and (>= balance amount) (or (> supply u0) (is-eq tx-sender subject)))
      (begin
        (match (as-contract (stx-transfer? price tx-sender recipient))
          success
          (begin
            (map-set keysBalance { subject: subject, holder: tx-sender } (- balance amount))
            (map-set keysSupply { subject: subject } (- supply amount))
            (ok true)
          )
          error
          (err u2)
        )
      )
      (err u1)
    )
  )
)
(define-read-only (is-keyholder (subject principal) (holder principal))
  (>= (default-to u0 (map-get? keysBalance { subject: subject, holder: holder })) u1)
)
(define-read-only (get-keys-balance (subject principal) (holder principal))
  (default-to u0 (map-get? keysBalance { subject: subject, holder: holder }))
)

(define-read-only (get-keys-supply (subject principal))
  (default-to u0 (map-get? keysSupply { subject: subject }))
)

(define-read-only (get-buy-price (subject principal) (amount uint))
  (let
    (
      (supply (default-to u0 (map-get? keysSupply { subject: subject })))
    )
    (get-price supply amount)
  )
)

(define-read-only (get-sell-price (subject principal) (amount uint))
  (let
    (
      (supply (default-to u0 (map-get? keysSupply { subject: subject })))
    )
    (get-price supply amount)
  )
)

(define-public (set-protocol-fee-percent (feePercent uint))
  (begin
    (asserts! (> feePercent u0) ERR_INVALID_FEE_PERCENT)
    (if (is-eq tx-sender tx-sender)
      (ok (var-set protocolFeePercent feePercent))
      ERR_NOT_CONTRACT_OWNER
    )
  )
)