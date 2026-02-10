# Contributing to CodeNames Duet

Thank you for your interest in contributing! Please follow these guidelines.

## Development Setup

1. **Fork & clone the repo**
   ```bash
   git clone https://github.com/YOUR_USERNAME/CodeNames.git
   cd CodeNames
   ```

2. **Backend setup**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

3. **Frontend setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Branch Naming

- `feature/description` - New features
- `bugfix/description` - Bug fixes
- `docs/description` - Documentation updates

## Commit Messages

Use descriptive, imperative commit messages:

```
✨ Add WebSocket game state sync
🐛 Fix card reveal timing bug
📝 Update deployment guide
♻️ Refactor GameService
```

Emojis:
- ✨ Feature
- 🐛 Bug fix
- 📝 Documentation
- ♻️ Refactor
- 🎨 UI/style
- ⚡ Performance

## Code Standards

### TypeScript/Node.js (Backend)
- Use strict TypeScript (no `any`)
- Functional services with clear interfaces
- ESLint config included
- Error handling in all endpoints
- WebSocket validation for all messages

### TypeScript/React (Frontend)
- Use functional components with hooks
- ESLint strict mode
- Props types in separate `.ts` file
- One component per file
- Use React Router for navigation

### Testing

```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test
```

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes with clear commits
3. Add/update tests
4. Update documentation if needed
5. Submit PR with:
   - Clear description of what changed
   - Link to related issues
   - Screenshots for UI changes
   - Testing instructions

## Code Review

- Be respectful and constructive
- Ask questions rather than make demands
- Approve once you're satisfied

## Issues

When reporting bugs, include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Logs/screenshots if applicable
- Environment info (OS, browser, Node.js version, etc.)

## Feature Requests

Describe:
- Use case
- Proposed solution
- Alternative approaches
- Impact assessment

---

Thanks for making CodeNames Duet better! 🎉
