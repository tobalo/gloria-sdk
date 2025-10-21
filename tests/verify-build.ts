#!/usr/bin/env bun
/**
 * Verifies that the SDK builds correctly and outputs are valid
 */

import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

interface BuildCheck {
  name: string;
  check: () => boolean | Promise<boolean>;
  required: boolean;
}

const checks: BuildCheck[] = [
  {
    name: "ESM bundle exists",
    check: () => existsSync("dist/index.js"),
    required: true,
  },
  {
    name: "CJS bundle exists",
    check: () => existsSync("dist/index.cjs"),
    required: true,
  },
  {
    name: "TypeScript definitions exist",
    check: () => existsSync("dist/index.d.ts"),
    required: true,
  },
  {
    name: "ESM bundle has valid exports",
    check: () => {
      const content = readFileSync("dist/index.js", "utf-8");
      return content.includes("export") && content.includes("GloriaClient");
    },
    required: true,
  },
  {
    name: "CJS bundle has valid exports",
    check: () => {
      const content = readFileSync("dist/index.cjs", "utf-8");
      return content.includes("exports") && content.includes("GloriaClient");
    },
    required: true,
  },
  {
    name: "TypeScript definitions include GloriaClient",
    check: () => {
      const content = readFileSync("dist/index.d.ts", "utf-8");
      return content.includes("GloriaClient");
    },
    required: true,
  },
  {
    name: "Source maps exist",
    check: () => existsSync("dist/index.js.map") && existsSync("dist/index.cjs.map"),
    required: false,
  },
];

async function main() {
  console.log("🔍 Gloria SDK - Build Verification\n");

  let passed = 0;
  let failed = 0;

  for (const check of checks) {
    try {
      const result = await check.check();
      if (result) {
        console.log(`✓ ${check.name}`);
        passed++;
      } else {
        console.log(`✗ ${check.name}`);
        if (check.required) {
          failed++;
        }
      }
    } catch (error) {
      console.log(`✗ ${check.name}: ${error instanceof Error ? error.message : String(error)}`);
      if (check.required) {
        failed++;
      }
    }
  }

  console.log(`\n${passed} passed, ${failed} failed\n`);

  if (failed > 0) {
    console.error("❌ Build verification failed!");
    process.exit(1);
  }

  console.log("✅ Build verification passed!");
}

main().catch(error => {
  console.error("Fatal error:", error);
  process.exit(1);
});
