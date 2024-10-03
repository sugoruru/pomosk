import { NextRequest, NextResponse } from "next/server";
import db from "@/app/db";
import { LimitChecker } from "@/app/limitChecker";
import { headers } from "next/headers";
import { getServerSession } from "next-auth/next";
import AuthOPTIONS from "../auth/[...nextauth]/options";

const allowOrigin = process.env.IS_DEV === "true" ? "https://localhost:3001" : "https://pomosk.tellpro.net";
const corsHeaders = {
  'Access-Control-Allow-Origin': allowOrigin,
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

const returnRandomString = (length: number) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

const limitChecker = LimitChecker();
export async function POST(req: NextRequest) {
  req.headers.set("Access-Control-Allow-Origin", allowOrigin);
  req.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  req.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  // ipの取得
  const headersList = headers();
  const ip = headersList.get("X-Forwarded-For");
  if (!ip) {
    return NextResponse.json({ ok: false, error: "not found your IP" }, { status: 400, headers: corsHeaders });
  }

  // 毎分100requestの制限.
  try {
    await limitChecker.check(100, ip);
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: "Too many requests",
    }, { status: 429, headers: corsHeaders });
  }

  // nextauthのsessionを取得
  const session = await getServerSession(AuthOPTIONS);
  if (!session) {
    return NextResponse.json({ ok: false, error: "not found session" }, { status: 400, headers: corsHeaders });
  }
  const sql = `
  select key from api_keys where user_id = $1;
  `;
  const { user } = session;
  if (!user) {
    return NextResponse.json({ ok: false, error: "not found user" }, { status: 400, headers: corsHeaders });
  }
  const email = user.email;
  const result = await db.query(sql, [email]);
  if (result.length === 0) {
    // 32文字のランダムな文字列を生成
    const key = returnRandomString(32);
    const insertSql = `
    insert into api_keys (user_id, key, created_at) values ($1, $2, now());
    `;
    await db.query(insertSql, [email, key]);
    return NextResponse.json({ ok: true, key }, { status: 200, headers: corsHeaders });
  }

  return NextResponse.json({ ok: true, key: result[0].key }, { status: 200, headers: corsHeaders });
}

export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
}
