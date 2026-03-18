# Welcome-To-Albania

## Clerk Auth Setup

Install is already done:

```bash
npm install @clerk/clerk-react
```

Create a `.env` file in the project root and add:
kgjrniwebnr
```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
NEWSLETTER_ENCRYPTION_KEY=replace_with_a_long_random_secret
ADMIN_DASHBOARD_TOKEN=choose_a_strong_private_token
```

Then run:

```bash
npm run dev:client
```

Auth routes:

- `/sign-in`
- `/sign-up`

Admin route:

- `/admin/newsletter`
