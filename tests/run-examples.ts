#!/usr/bin/env bun
/**
 * Test runner that verifies all examples work in both Node.js and Bun
 */

import { $ } from "bun";
import { existsSync } from "fs";

const EXAMPLES = [
  "examples/minimal.ts",
  "examples/fetch-news.ts",
  "examples/fetch-recaps.ts",
  // Note: websocket.ts and full-demo.ts are excluded as they're interactive/long-running
];

interface TestResult {
  example: string;
  runtime: string;
  success: boolean;
  error?: string;
}

const results: TestResult[] = [];

async function runExample(example: string, runtime: "node" | "bun"): Promise<TestResult> {
  const startTime = Date.now();

  try {
    console.log(`\n🧪 Testing ${example} with ${runtime}...`);

    if (!existsSync(example)) {
      throw new Error(`Example file not found: ${example}`);
    }

    // Run with a timeout of 10 seconds
    const proc = runtime === "node"
      ? Bun.spawn(["npx", "tsx", example], {
          stdout: "pipe",
          stderr: "pipe",
        })
      : Bun.spawn(["bun", example], {
          stdout: "pipe",
          stderr: "pipe",
        });

    // Wait for the process with a timeout
    const timeoutMs = 10000;
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), timeoutMs)
    );

    const exitCode = await Promise.race([
      proc.exited,
      timeout
    ]);

    const stdout = await new Response(proc.stdout).text();
    const stderr = await new Response(proc.stderr).text();

    if (exitCode !== 0 && typeof exitCode === 'number') {
      throw new Error(`Exit code ${exitCode}\nStderr: ${stderr}`);
    }

    const duration = Date.now() - startTime;
    console.log(`  ✓ Success (${duration}ms)`);

    return {
      example,
      runtime,
      success: true,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.log(`  ✗ Failed (${duration}ms): ${errorMsg}`);

    return {
      example,
      runtime,
      success: false,
      error: errorMsg,
    };
  }
}

async function main() {
  console.log("🚀 Gloria SDK - Cross-Runtime Example Tests\n");
  console.log("Testing examples in both Node.js and Bun...\n");

  // Test with Bun first (native runtime)
  console.log("=" .repeat(60));
  console.log("Testing with Bun");
  console.log("=".repeat(60));

  for (const example of EXAMPLES) {
    const result = await runExample(example, "bun");
    results.push(result);
  }

  // Test with Node.js
  console.log("\n" + "=".repeat(60));
  console.log("Testing with Node.js");
  console.log("=".repeat(60));

  for (const example of EXAMPLES) {
    const result = await runExample(example, "node");
    results.push(result);
  }

  // Print summary
  console.log("\n" + "=".repeat(60));
  console.log("Test Summary");
  console.log("=".repeat(60));

  const bunResults = results.filter(r => r.runtime === "bun");
  const nodeResults = results.filter(r => r.runtime === "node");

  const bunPassed = bunResults.filter(r => r.success).length;
  const nodePassed = nodeResults.filter(r => r.success).length;

  console.log(`\nBun:  ${bunPassed}/${bunResults.length} passed`);
  console.log(`Node: ${nodePassed}/${nodeResults.length} passed`);

  const failures = results.filter(r => !r.success);
  if (failures.length > 0) {
    console.log("\n❌ Failed tests:");
    failures.forEach(f => {
      console.log(`  - ${f.example} (${f.runtime}): ${f.error}`);
    });
    process.exit(1);
  }

  console.log("\n✅ All tests passed!");
}

main().catch(error => {
  console.error("Fatal error:", error);
  process.exit(1);
});
