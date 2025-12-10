import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.hero}>
          <h1 className={styles.title}>Wallet Service API</h1>
          <p className={styles.description}>
            A secure and scalable wallet service with Google OAuth authentication, 
            API key management, Paystack payment integration, and seamless wallet-to-wallet transfers.
          </p>
        </div>

        <div className={styles.features}>
          <div className={styles.feature}>
            <h3>🔐 Authentication</h3>
            <p>Google OAuth with JWT tokens and API key management</p>
          </div>
          <div className={styles.feature}>
            <h3>💳 Payments</h3>
            <p>Secure Paystack integration with webhook handling</p>
          </div>
          <div className={styles.feature}>
            <h3>💰 Transfers</h3>
            <p>Fast and reliable wallet-to-wallet transactions</p>
          </div>
          <div className={styles.feature}>
            <h3>📊 Tracking</h3>
            <p>Complete transaction history and balance management</p>
          </div>
        </div>

        <div className={styles.ctas}>
          <Link className={styles.primary} href="/api-doc">
            📚 View API Documentation
          </Link>
          <a
            className={styles.secondary}
            href="https://github.com/ALADETAN-IFE/Hng-Stage7-be-Wallet-Service-with-Paystack-JWT-API-Keys"
            target="_blank"
            rel="noopener noreferrer"
          >
            🔗 GitHub Repository
          </a>
        </div>
      </main>
    </div>
  );
}
