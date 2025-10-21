#!/usr/bin/env bun
/**
 * Pre-ship validation script
 * Runs all checks before publishing the SDK
 */

import { $ } from "bun";

interface Step {
  name: string;
  command: string;
}

const steps: Step[] = [
  {
    name: "Type checking",
    command: "bun run typecheck",
  },
  {
    name: "Running unit tests",
    command: "bun test",
  },
  {
    name: "Building SDK",
    command: "bun run build",
  },
  {
    name: "Verifying build outputs",
    command: "bun tests/verify-build.ts",
  },
  {
    name: "Testing examples in both runtimes",
    command: "bun tests/run-examples.ts",
  },
];

async function runStep(step: Step): Promise<boolean> {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`📦 ${step.name}`);
  console.log("=".repeat(60));

  try {
    await $`${step.command.split(" ")}`.quiet();
    console.log(`✅ ${step.name} passed`);
    return true;
  } catch (error) {
    console.error(`❌ ${step.name} failed`);
    return false;
  }
}

async function main() {
  console.log("🚀 Gloria SDK - Pre-Ship Validation\n");
  console.log("Running all checks before shipping...\n");

  const startTime = Date.now();
  let allPassed = true;

  for (const step of steps) {
    const passed = await runStep(step);
    if (!passed) {
      allPassed = false;
      break; // Stop on first failure
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log(`\n${"=".repeat(60)}`);
  console.log("Summary");
  console.log("=".repeat(60));
  console.log(`Duration: ${duration}s`);

  if (allPassed) {
    console.log("\n✅ All pre-ship checks passed! Ready to publish.");
    process.exit(0);
  } else {
    console.log("\n❌ Pre-ship validation failed. Please fix the issues above.");
    process.exit(1);
  }
}

main().catch(error => {
  console.error("Fatal error:", error);
  process.exit(1);
});
