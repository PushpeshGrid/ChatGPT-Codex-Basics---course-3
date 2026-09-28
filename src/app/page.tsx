import Link from "next/link";

export default function Home() {
  return (
    <main>
      <h1>Checkout Service</h1>
      <p>
        Welcome to our simple e-commerce checkout application. Browse our
        curated selection of high-quality items and checkout with ease.
      </p>
      <Link href="/checkout" className="button-link">
        Go to Checkout
      </Link>
    </main>
  );
}
