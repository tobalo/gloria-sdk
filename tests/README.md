# Gloria SDK Tests

This directory contains the testing infrastructure for ensuring the Gloria SDK works correctly across different JavaScript runtimes (Bun and Node.js).

## Test Scripts

### `run-examples.ts`
Runs all example files in both Bun and Node.js to verify cross-runtime compatibility.

```bash
bun tests/run-examples.ts
# or
bun run test:examples
```

**What it tests:**
- Examples run successfully in Bun runtime
- Examples run successfully in Node.js runtime (using tsx)
- No runtime-specific errors or crashes

### `verify-build.ts`
Verifies that the SDK build outputs are correct and complete.

```bash
bun tests/verify-build.ts
# or
bun run test:build
```

**What it checks:**
- ESM bundle exists (`dist/index.js`)
- CJS bundle exists (`dist/index.cjs`)
- TypeScript definitions exist (`dist/index.d.ts`)
- Bundles contain valid exports
- Source maps are generated

### `pre-ship.ts`
Comprehensive pre-release validation that runs all checks before publishing.

```bash
bun tests/pre-ship.ts
# or
bun run preship
```

**Steps performed:**
1. Type checking (`bun run typecheck`)
2. Unit tests (`bun test`)
3. Build SDK (`bun run build`)
4. Verify build outputs
5. Test examples in both runtimes

## Available npm Scripts

```json
{
  "test": "bun test",                    // Run unit tests only
  "test:examples": "...",                 // Test examples in both runtimes
  "test:build": "...",                    // Verify build outputs
  "test:all": "...",                      // Run all tests
  "preship": "..."                        // Full pre-ship validation
}
```

## Testing Strategy

### Unit Tests
Located in `src/**/*.test.ts`, these test individual functions and validators using Bun's built-in test runner.

### Integration Tests
The example files in `examples/` serve as integration tests, ensuring the SDK works end-to-end in real-world scenarios.

### Cross-Runtime Testing
By running examples in both Bun and Node.js, we ensure:
- No Bun-specific APIs leak into the SDK
- The build outputs work correctly in both environments
- TypeScript types are correctly generated

## Before Publishing

Always run the pre-ship validation before publishing:

```bash
bun run preship
```

This ensures all tests pass, the build is correct, and examples work in both runtimes.

## Adding New Examples

When adding new examples to the `examples/` directory:

1. Add the file path to the `EXAMPLES` array in [run-examples.ts](run-examples.ts#L7)
2. Ensure it completes within 10 seconds (or adjust the timeout)
3. Make sure it works with both `bun` and `npx tsx`

Note: Interactive or long-running examples (like websocket demos) should be excluded from automated tests.
