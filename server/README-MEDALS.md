# Medal System for Doraemon Chat Bot

This document describes the medal system implemented for the Doraemon Chat Bot leaderboard.

## Overview

The medal system awards special badges to the top 3 users on the global leaderboard:

- 🥇 **Gold Medal**: Awarded to the #1 user on the leaderboard
- 🥈 **Silver Medal**: Awarded to the #2 user on the leaderboard
- 🥉 **Bronze Medal**: Awarded to the #3 user on the leaderboard

## How Medals Are Awarded

Medals are awarded through multiple mechanisms:

1. **Real-time checks**: When viewing the leaderboard, the top 3 users are dynamically determined and shown with their medals.

2. **Persistence in database**: When a user earns a medal, it's stored in their badges collection, so they can see their achievements in their profile.

3. **XP Triggered checks**: When a user gains a significant amount of XP (10+), the system checks if they've reached a medal-worthy position and awards the medal if appropriate.

4. **Manual initialization**: The `award-medals.bat` script can be run to initialize medals for the current top 3 users.

## Implementation Details

- Medals appear on the leaderboard UI next to the user's name and rank
- Medals are stored in the user's badges collection in MongoDB
- The system handles edge cases like multiple users with the same XP
- When a user is displaced from the top 3, they keep their medal as a historical achievement

## How to Award Initial Medals

To award medals to the current top 3 users, run:

```
cd server
award-medals.bat
```

This will:
1. Connect to the MongoDB database
2. Find the top 3 users by XP
3. Award the appropriate medals to each user
4. Save the changes to the database

## Technical Implementation

The medal system is implemented across several files:

- `services/xpService.js`: Contains the medal definitions and logic for determining medal awards
- `routes/leaderboard.js`: Handles leaderboard API endpoints with medal information
- `scripts/awardInitialMedals.js`: Script for initial medal awarding

Medals are displayed differently depending on the context:
- Full medals with icons in the leaderboard view
- Medal icons in user profiles
- Medal achievements in the achievements section 