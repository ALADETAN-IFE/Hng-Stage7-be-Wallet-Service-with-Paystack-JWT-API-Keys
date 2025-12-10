import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Image
          className={styles.logo}
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className={styles.intro}>
          <h1>Wallet Service API</h1>
          <p>
            A secure wallet service with Google OAuth, API key authentication, 
            Paystack payment integration, and wallet-to-wallet transfers.
          </p>
        </div>
        <div className={styles.ctas}>
          <Link
            className={styles.primary}
            href="/api-doc"
          >
            View API Documentation
          </Link>
          <a
            className={styles.secondary}
            href="https://github.com/ALADETAN-IFE/Hng-Stage7-be-Wallet-Service-with-Paystack-JWT-API-Keys"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub Repository
          </a>
        </div>
      </main>
    </div>
  );
}
