#!/usr/bin/env node

/**
 * FanzDash Setup Validation Script
 * Validates that the development environment is correctly configured
 * Run with: node scripts/validate-setup.js
 */

import fs from 'fs';
import path from 'path';

console.log('🚀 FanzDash Setup Validation\n');

// Check Node.js version
const nodeVersion = process.version;
const nodeMajor = parseInt(nodeVersion.slice(1).split('.')[0]);
console.log(`Node.js: ${nodeVersion}`);
if (nodeMajor >= 18) {
  console.log('✅ Node.js version is compatible');
} else {
  console.log('❌ Node.js version is too old. Requires 18+');
  process.exit(1);
}

// Check package.json
if (fs.existsSync('package.json')) {
  console.log('✅ package.json found');
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  // Check critical scripts
  const requiredScripts = ['dev', 'build', 'start', 'check', 'db:push'];
  console.log('\nScript availability:');
  requiredScripts.forEach(script => {
    if (pkg.scripts[script]) {
      console.log(`✅ npm run ${script}`);
    } else {
      console.log(`❌ npm run ${script} - missing`);
    }
  });

  // Check critical dependencies
  console.log('\nCritical dependencies:');
  const criticalDeps = [
    'react', 'typescript', 'vite', 'drizzle-orm', 
    '@neondatabase/serverless', 'express', 'openai'
  ];
  criticalDeps.forEach(dep => {
    if (pkg.dependencies[dep] || pkg.devDependencies[dep]) {
      console.log(`✅ ${dep}`);
    } else {
      console.log(`❌ ${dep} - missing`);
    }
  });
} else {
  console.log('❌ package.json not found');
  process.exit(1);
}

// Check environment file
console.log('\nEnvironment configuration:');
if (fs.existsSync('.env')) {
  console.log('✅ .env file exists');
  const envContent = fs.readFileSync('.env', 'utf8');
  
  // Check critical environment variables
  const requiredVars = ['DATABASE_URL', 'JWT_SECRET', 'ENCRYPTION_KEY'];
  const recommendedVars = ['OPENAI_API_KEY', 'NODE_ENV', 'PORT'];
  
  requiredVars.forEach(varName => {
    if (envContent.includes(varName + '=') && !envContent.includes(varName + '=""')) {
      console.log(`✅ ${varName} is configured`);
    } else {
      console.log(`❌ ${varName} is missing or empty`);
    }
  });

  recommendedVars.forEach(varName => {
    if (envContent.includes(varName + '=')) {
      console.log(`✅ ${varName} is configured`);
    } else {
      console.log(`⚠️  ${varName} is not configured (recommended)`);
    }
  });
} else if (fs.existsSync('.env.example')) {
  console.log('⚠️  .env file missing, but .env.example found');
  console.log('   Run: cp .env.example .env');
} else {
  console.log('❌ Neither .env nor .env.example found');
}

// Check directory structure
console.log('\nDirectory structure:');
const requiredDirs = ['client/src', 'server', 'shared'];
requiredDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`✅ ${dir}/`);
  } else {
    console.log(`❌ ${dir}/ - missing`);
  }
});

// Check key files
console.log('\nKey files:');
const keyFiles = [
  'client/src/App.tsx',
  'server/index.ts', 
  'server/routes.ts',
  'shared/schema.ts',
  'drizzle.config.ts',
  'vite.config.ts',
  'WARP.md'
];
keyFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - missing`);
  }
});

// Check node_modules
console.log('\nDependencies:');
if (fs.existsSync('node_modules')) {
  console.log('✅ node_modules exists');
  // Check if we need legacy peer deps
  if (fs.existsSync('node_modules/vite')) {
    console.log('✅ Vite installed (remember to use --legacy-peer-deps)');
  }
} else {
  console.log('❌ node_modules missing');
  console.log('   Run: npm install --legacy-peer-deps');
}

console.log('\n🎯 Next Steps:');
console.log('1. Fix any ❌ issues above');
console.log('2. Run: npm install --legacy-peer-deps');
console.log('3. Configure your .env file with actual values');
console.log('4. Run: npm run db:push');
console.log('5. Run: npm run dev');
console.log('\n📖 See WARP.md for detailed setup instructions');
