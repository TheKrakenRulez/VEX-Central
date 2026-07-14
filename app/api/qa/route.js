// app/api/qa/route.js
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { question } = await request.json();
    if (!question?.trim()) {
      return NextResponse.json({ error: "Question missing" }, { status: 400 });
    }

    // Load manual summary (fallback to static file if env var not set)
    let manual = "";
    if (process.env.MANUAL_TEXT) {
      manual = process.env.MANUAL_TEXT;
    } else {
      // Read the public summary file directly from the filesystem
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(process.cwd(), 'public', 'manual_summary.txt');
      manual = fs.readFileSync(filePath, 'utf8');
    }

    const prompt = `Manual excerpt (for context):\n${manual}\n---\nUser question:\n${question}`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`;
    const geminiRes = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }] })
    });
    if (!geminiRes.ok) {
      const err = await geminiRes.text();
      throw new Error(`Gemini error: ${err}`);
    }
    const data = await geminiRes.json();
    const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "No answer";
    return NextResponse.json({ answer });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message || "Internal server error" }, { status: 500 });
  }
}
