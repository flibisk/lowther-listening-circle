import { NextResponse } from "next/server"

export async function GET() {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA || process.env.VERCEL_GIT_COMMIT_REF || "unknown"
  const ref = process.env.VERCEL_GIT_COMMIT_REF || "unknown"
  const repo = process.env.VERCEL_GIT_REPO_SLUG || "unknown"
  const buildAt = new Date().toISOString()
  return NextResponse.json({ sha, ref, repo, buildAt })
}


