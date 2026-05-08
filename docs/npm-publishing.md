# npm Publishing

Publish the current package version to npm with:

```bash
npm run publish:npm -- patch
```

Allowed version arguments:

- `patch`
- `minor`
- `major`
- exact version like `2.5.7`

Examples:

```bash
npm run publish:npm -- patch
npm run publish:npm -- minor
npm run publish:npm -- major
npm run publish:npm -- 2.5.7
npm run publish:npm -- patch --tag beta
```

The script checks that the git working tree is clean, verifies npm login, runs `npm version`, executes tests, rebuilds `dist`, validates the publish payload with `npm pack`, and then calls `npm publish --access public`.
