#!/usr/bin/env node
/**
 * 여행지/대표 소개 이미지가 아직 없는 상태에서(public/images/*), 지역마다 실제로
 * 다르게 보이는 SVG 플레이스홀더를 만든다. 실제 사진을 구할 때까지의 임시
 * 대체물이며, 각 destination.id로부터 결정적으로 유도한 색상 + 지역명/국가명을
 * 표시해 최소한 "그 지역 카드"처럼 서로 구별되게 한다.
 *
 * 사용법: node scripts/generate_placeholder_images.mjs
 * 다시 실행해도 항상 같은 결과를 만든다(결정적 해시 기반).
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");

function hashString(input) {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function hueFromId(id) {
  return hashString(id) % 360;
}

function escapeXml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildCardSvg({ title, subtitle, hue }) {
  const hue2 = (hue + 42) % 360;
  const gradientId = `g-${hue}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" role="img" aria-label="${escapeXml(
    title,
  )}">
  <defs>
    <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="hsl(${hue}, 62%, 45%)" />
      <stop offset="100%" stop-color="hsl(${hue2}, 55%, 32%)" />
    </linearGradient>
  </defs>
  <rect width="640" height="480" fill="url(#${gradientId})" />
  <text x="320" y="248" text-anchor="middle" font-family="'Segoe UI', system-ui, sans-serif" font-size="40" font-weight="700" fill="#FFFFFF">${escapeXml(
    title,
  )}</text>
  ${
    subtitle
      ? `<text x="320" y="288" text-anchor="middle" font-family="'Segoe UI', system-ui, sans-serif" font-size="20" fill="#F7F6F4" opacity="0.9">${escapeXml(
          subtitle,
        )}</text>`
      : ""
  }
</svg>
`;
}

function generateDestinationImages() {
  const filePath = path.join(ROOT, "src/data/destinations.ts");
  let text = readFileSync(filePath, "utf-8");

  const entryRe =
    /id:\s*"([^"]+)",\s*name:\s*"([^"]+)",\s*country:\s*"([^"]+)",/g;
  const urlRe = /url:\s*"\/images\/destinations\/([\w-]+)\.jpg"/g;

  const entries = [...text.matchAll(entryRe)].map((m) => ({
    id: m[1],
    name: m[2],
    country: m[3],
  }));
  const urlSlugs = [...text.matchAll(urlRe)].map((m) => m[1]);

  if (entries.length !== urlSlugs.length) {
    throw new Error(
      `destinations.ts entry count(${entries.length}) !== image url count(${urlSlugs.length}) — 수동 확인 필요`,
    );
  }

  const outDir = path.join(ROOT, "public/images/destinations");
  mkdirSync(outDir, { recursive: true });

  entries.forEach((entry, index) => {
    const slug = urlSlugs[index];
    const svg = buildCardSvg({
      title: entry.name,
      subtitle: entry.country,
      hue: hueFromId(entry.id),
    });
    writeFileSync(path.join(outDir, `${slug}.svg`), svg, "utf-8");
  });

  text = text.replace(
    /url:\s*"\/images\/destinations\/([\w-]+)\.jpg"/g,
    'url: "/images/destinations/$1.svg"',
  );
  writeFileSync(filePath, text, "utf-8");

  console.log(`destinations: ${entries.length}개 SVG 생성 완료 (${outDir})`);
}

function generateRepresentativeImages() {
  const filePath = path.join(ROOT, "src/data/representative.ts");
  let text = readFileSync(filePath, "utf-8");

  const galleryRe =
    /url:\s*"\/images\/representative\/(gallery-\d+)\.jpg",\s*alt:\s*"([^"]+)",\s*sourceUrl:\s*"[^"]*",\s*attribution:\s*"([^"]+)",/g;

  const entries = [...text.matchAll(galleryRe)].map((m) => ({
    slug: m[1],
    alt: m[2],
    attribution: m[3],
  }));

  if (entries.length === 0) {
    throw new Error("representative.ts에서 gallery 항목을 찾지 못했습니다");
  }

  const outDir = path.join(ROOT, "public/images/representative");
  mkdirSync(outDir, { recursive: true });

  entries.forEach((entry) => {
    const yearMatch = entry.attribution.match(/\((\d{4})\)/);
    const year = yearMatch ? yearMatch[1] : "";
    const svg = buildCardSvg({
      title: "free_traveler",
      subtitle: year,
      hue: hueFromId(entry.slug),
    });
    writeFileSync(path.join(outDir, `${entry.slug}.svg`), svg, "utf-8");
  });

  text = text.replace(
    /url:\s*"\/images\/representative\/(gallery-\d+)\.jpg"/g,
    'url: "/images/representative/$1.svg"',
  );
  writeFileSync(filePath, text, "utf-8");

  console.log(`representative: ${entries.length}개 SVG 생성 완료 (${outDir})`);
}

generateDestinationImages();
generateRepresentativeImages();
