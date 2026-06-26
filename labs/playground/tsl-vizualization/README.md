# TSL Visualization

## Goal
Show the cycle produced by `current = (current * 5) % 23`.

## Run
From `labs/playground`:

```sh
npm run tsl:dev
```

Check TypeScript:

```sh
npm run tsl:typecheck
```

## Result
The page shows the current value, step count, calculation history, and an SVG dial with visited positions and transitions.

## What I Learned
The sequence eventually returns to a previously visited value, making the modular multiplication cycle visible.

## Next
Add controls for changing the multiplier, modulus, and starting position.
