# Hash Collisions Visualization

## Goal
- Visualize how different inputs may map to the same hash space and where collisions appear.

## Run
```bash
cd labs/playground/hash-collisions
python3 -m http.server 8080
# then open http://localhost:8080
```

## Result
- Interactive page that demonstrates collision behavior.

## What I Learned
- Small output spaces cause collisions faster.
- Distribution quality matters for practical hashing.

## Next
- Add selectable hash algorithms.
- Add random input generator and collision counters.
