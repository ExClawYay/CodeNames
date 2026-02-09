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
   mvn clean install
   mvn spring-boot:run
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

### Java
- Use Google Java Style Guide
- Write unit tests for new features
- Lombok for getters/setters (use `@Data`, `@NoArgsConstructor`)

### TypeScript/React
- Use functional components with hooks
- ESLint strict mode
- Props types in separate `.ts` file
- One component per file

### Testing

```bash
# Backend
cd backend && mvn test

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
- Environment info (OS, browser, Java version, etc.)

## Feature Requests

Describe:
- Use case
- Proposed solution
- Alternative approaches
- Impact assessment

---

Thanks for making CodeNames Duet better! 🎉
