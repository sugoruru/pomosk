import Link from "next/link";
import React from "react";

export default function ErrorPage() {
  return (
    <>
      <div className="min-h-screen bg-white text-center text-2xl font-black text-gray-600 py-10">
        <p>ログインに失敗しました</p>
        <p>再度ログインしてください</p>
        <p className="text-sm pt-5">
          <span>(</span>
          <Link href="/" className="text-blue-300">
            こちら
          </Link>
          <span>からホームに戻ることが出来ます)</span>
        </p>
      </div>
    </>
  );
}
