#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 Doraemon Chat Bot - Environment Setup for Render + Vercel');
console.log('===========================================================\n');

const questions = [
  {
    name: 'mongodbUri',
    question: 'Enter your MongoDB Atlas URI (mongodb+srv://...): ',
    required: true
  },
  {
    name: 'jwtSecret',
    question: 'Enter your JWT secret (at least 32 characters): ',
    required: true,
    validate: (value) => value.length >= 32
  },
  {
    name: 'openaiKey',
    question: 'Enter your OpenAI API key (sk-...): ',
    required: true,
    validate: (value) => value.startsWith('sk-')
  },
  {
    name: 'googleClientId',
    question: 'Enter your Google OAuth Client ID (optional, press Enter to skip): ',
    required: false
  },
  {
    name: 'googleClientSecret',
    question: 'Enter your Google OAuth Client Secret (optional, press Enter to skip): ',
    required: false
  },
  {
    name: 'renderUrl',
    question: 'Enter your Render backend URL (https://your-app.onrender.com): ',
    required: true,
    validate: (value) => value.startsWith('https://')
  },
  {
    name: 'vercelUrl',
    question: 'Enter your Vercel frontend URL (https://your-app.vercel.app): ',
    required: true,
    validate: (value) => value.startsWith('https://')
  }
];

let answers = {};

function askQuestion(index) {
  if (index >= questions.length) {
    generateConfig();
    return;
  }

  const question = questions[index];
  
  rl.question(question.question, (answer) => {
    if (question.required && !answer.trim()) {
      console.log('❌ This field is required. Please try again.\n');
      askQuestion(index);
      return;
    }

    if (question.validate && !question.validate(answer.trim())) {
      console.log('❌ Invalid format. Please try again.\n');
      askQuestion(index);
      return;
    }

    answers[question.name] = answer.trim();
    askQuestion(index + 1);
  });
}

function generateConfig() {
  console.log('\n📋 Generated Configuration');
  console.log('==========================\n');

  // Render Environment Variables
  console.log('🔧 RENDER ENVIRONMENT VARIABLES:');
  console.log('Copy these to your Render dashboard → Environment Variables\n');
  
  const renderVars = {
    NODE_ENV: 'production',
    MONGODB_URI: answers.mongodbUri,
    JWT_SECRET: answers.jwtSecret,
    OPENAI_API_KEY: answers.openaiKey,
    OPENAI_API_BASE_URL: 'https://api.openai.com/v1',
    CLIENT_URL: answers.vercelUrl,
    SERVER_URL: answers.renderUrl
  };

  if (answers.googleClientId) {
    renderVars.GOOGLE_CLIENT_ID = answers.googleClientId;
  }
  if (answers.googleClientSecret) {
    renderVars.GOOGLE_CLIENT_SECRET = answers.googleClientSecret;
  }

  Object.entries(renderVars).forEach(([key, value]) => {
    console.log(`${key}=${value}`);
  });

  console.log('\n🌐 VERCEL ENVIRONMENT VARIABLES:');
  console.log('Copy these to your Vercel dashboard → Project Settings → Environment Variables\n');
  
  console.log(`REACT_APP_SERVER_URL=${answers.renderUrl}`);

  // Save to files
  const renderConfig = Object.entries(renderVars)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  const vercelConfig = `REACT_APP_SERVER_URL=${answers.renderUrl}`;

  fs.writeFileSync('render-env.txt', renderConfig);
  fs.writeFileSync('vercel-env.txt', vercelConfig);

  console.log('\n💾 Configuration files saved:');
  console.log('- render-env.txt (for Render)');
  console.log('- vercel-env.txt (for Vercel)');

  console.log('\n✅ Setup complete!');
  console.log('\n📝 Next steps:');
  console.log('1. Deploy backend to Render using the environment variables above');
  console.log('2. Deploy frontend to Vercel using the environment variables above');
  console.log('3. Test your application');
  console.log('\n📖 For detailed instructions, see RENDER-VERCEL-DEPLOYMENT.md');

  rl.close();
}

// Start the questionnaire
askQuestion(0); 