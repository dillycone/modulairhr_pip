# Contributing Guide

## Version Control Best Practices

### What NOT to commit

To maintain a clean and efficient repository, never commit:

- **Build outputs** (`.next/`, `out/`, `build/`)
- **Dependencies** (`node_modules/`)
- **Environment files** (`.env*`)
- **OS specific files** (`.DS_Store`)
- **Logs and debug files**

### Why?

- Large build artifacts and dependencies inflate repository size
- They break meaningful diff history
- They cause unnecessary merge conflicts
- They slow down cloning and fetching

### Development Workflow

1. Dependencies are installed with `npm install` (using package.json and package-lock.json)
2. Build outputs are generated locally with build commands

Our `.gitignore` file is configured to exclude these directories. If you see git attempting to track them, run:

```bash
git rm -r --cached node_modules/ .next/
git commit -m "Remove node_modules and .next from git tracking"
```

Remember: Only commit source code, configuration, and documentation!
