import Link from "next/link";

export default function NotFound() {
  return (
    <div className="pt-16 space-y-3">
      <h1 className="text-2xl font-semibold">Not found</h1>
      <p className="muted text-sm">That page does not exist.</p>
      <Link href="/" className="btn">
        Back to home
      </Link>
    </div>
  );
}
