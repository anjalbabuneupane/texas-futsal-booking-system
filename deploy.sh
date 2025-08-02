#!/bin/bash

echo "🚀 Deploying Texas Futsal Booking System to Firebase..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Please install it first:"
    echo "npm install -g firebase-tools"
    exit 1
fi

# Check if user is logged in to Firebase
if ! firebase projects:list &> /dev/null; then
    echo "❌ Not logged in to Firebase. Please login first:"
    echo "firebase login"
    exit 1
fi

echo "📦 Building and deploying..."

# Deploy everything
firebase deploy

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "🌐 Live URL: https://texas-futsal-booking.web.app"
    echo "📊 Firebase Console: https://console.firebase.google.com/project/texas-futsal-booking/overview"
else
    echo "❌ Deployment failed!"
    exit 1
fi 