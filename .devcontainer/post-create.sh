#!/bin/bash

# FANZ DevContainer Post-Create Setup Script

set -e

echo "🚀 Setting up FANZ development environment..."

# Install mise if not already installed
if ! command -v mise &> /dev/null; then
    echo "📦 Installing mise..."
    curl https://mise.run | sh
    export PATH="$HOME/.local/bin:$PATH"
fi

# Install tools via mise
echo "🔧 Installing development tools..."
mise install

# Set up Git configuration
echo "📝 Setting up Git configuration..."
git config --global init.defaultBranch main
git config --global pull.rebase true
git config --global rerere.enabled true

# Install global npm packages
echo "📦 Installing global npm packages..."
pnpm add -g \
    typescript \
    tsx \
    nodemon \
    eslint \
    prettier \
    @types/node \
    turbo \
    concurrently \
    rimraf

# Set up pre-commit hooks
echo "🪝 Setting up pre-commit hooks..."
if [ ! -d ".git" ]; then
    echo "⚠️  Not a git repository, skipping pre-commit setup"
else
    pnpm add -D husky lint-staged
    npx husky install
    echo "pnpm lint-staged" > .husky/pre-commit
    chmod +x .husky/pre-commit
fi

# Create necessary directories
echo "📁 Creating project directories..."
mkdir -p {apps,packages,services}/{src,dist,tests}
mkdir -p .github/workflows
mkdir -p docs/{api,guides,architecture}
mkdir -p scripts

# Set up environment
echo "🌍 Setting up environment..."
if [ ! -f "env/.env.local" ]; then
    echo "⚠️  No .env.local found, creating from template..."
    cp env/.env.local env/.env.local.example 2>/dev/null || true
fi

# Install dependencies if package.json exists
if [ -f "package.json" ]; then
    echo "📦 Installing project dependencies..."
    pnpm install
fi

# Set up Docker Compose for services
echo "🐳 Setting up Docker services..."
cat > docker-compose.dev.yml << EOF
version: '3.8'
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: fanzdash_dev
      POSTGRES_USER: fanzdash
      POSTGRES_PASSWORD: secure_dev_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
      
  mailhog:
    image: mailhog/mailhog
    ports:
      - "1025:1025"
      - "8025:8025"

volumes:
  postgres_data:
  redis_data:
EOF

echo "✅ FANZ development environment setup complete!"
echo ""
echo "🎯 Next steps:"
echo "   1. Review env/.env.local and add your API keys"
echo "   2. Run 'docker-compose -f docker-compose.dev.yml up -d' to start services"
echo "   3. Run 'pnpm dev' to start development servers"
echo "   4. Visit http://localhost:5000 for FanzDash"
echo ""
echo "🚀 Happy coding!"