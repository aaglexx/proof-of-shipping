# Proof of Shipping

Proof of Shipping is a hackathon MVP for milestone-based funding.

The product helps teams and contributors answer a simple but important question: should the next tranche of capital be released yet? Instead of relying only on trust, chat updates, or manual review, the builder submits concrete progress evidence, an AI reviewer evaluates whether the milestone was actually shipped, and the protocol interface can unlock funding when the milestone is approved.

This matters because early-stage teams often raise or receive capital in stages, but the decision to release the next tranche is usually fragmented, subjective, and slow. Proof of Shipping turns that process into a structured, reviewable workflow.

## How It Works

1. Users fund a shared vault.
2. The builder submits milestone progress and evidence.
3. AI evaluates the evidence and returns a verdict.
4. Approved milestones can unlock the next tranche of funds.

In the current MVP, the full product flow is already visible in the interface: submit progress, run AI review, and unlock a tranche after approval.

## Architecture

### Frontend
- Built with Next.js App Router and TypeScript.
- Uses a small reusable UI layer for cards, buttons, inputs, badges, selects, and textareas.
- Main pages:
  - `/` for overview and vault discovery
  - `/create-vault` for vault setup mock flow
  - `/submit-progress` for evidence submission
  - `/vault/[id]` for milestone review, AI verdict, and tranche unlock

### Backend / API
- Next.js route handlers provide the backend layer for the MVP.
- `POST /api/submit-evidence` writes builder evidence into the current vault state.
- `POST /api/judge-milestone` loads the selected vault and milestone, reads the latest evidence submission, calls the AI layer, parses the result, stores the verdict, and returns it to the UI.

### AI Layer
- Uses OpenAI through `OPENAI_API_KEY`.
- The judging route sends milestone context plus the latest evidence submission to the model.
- The model returns a strict structured verdict:
  - `APPROVE`
  - `REJECT`
  - `NEED_MORE_EVIDENCE`
- The response also includes confidence, explanation, matched signals, and missing signals.

### Data Layer
- The current MVP uses an in-memory store.
- Vaults, milestones, evidence submissions, verdicts, and unlock state all live in local server/client runtime memory.
- This keeps the project fast to build and easy to demo, while preserving a clean shape for future persistence.

### Solana Layer
- The current repo models the product flow, but does not yet execute real on-chain Solana transactions.
- Conceptually, the Solana layer would own:
  - vault creation
  - deposits from contributors
  - tranche release after approval
- In this MVP, the unlock step is a mock product action designed to demonstrate the intended protocol flow.

## Project Structure

```text
app/
  api/
    judge-milestone/
    submit-evidence/
  create-vault/
  submit-progress/
  vault/[id]/
  layout.tsx
  page.tsx

components/
  layout/
  ui/
  vault/

lib/
  domain/
  store/
  utils.ts
```

## Installation and Run

1. Clone the repository.
2. Install dependencies:

```bash
npm install
```

3. Create an environment file:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

4. Start the development server:

```bash
npm run dev
```

5. Open the app in the browser:

```text
http://localhost:3000
```

## Demo Flow

A fast demo path:

1. Open the homepage and inspect the seeded vault.
2. Go to `/submit-progress`.
3. Select the seeded vault and milestone.
4. Submit evidence describing shipped progress.
5. Open the vault page.
6. Click `Review with AI`.
7. Observe the verdict returned by the model.
8. If the milestone is approved, click `Unlock Tranche`.
9. Confirm the visible state change:
  - milestone becomes unlocked
  - released capital increases
  - remaining capital decreases
  - activity log updates

## MVP Limitations

This project is intentionally lightweight and optimized for hackathon speed.

Current limitations:
- Uses in-memory storage instead of a real database.
- Does not yet execute real Solana smart contract interactions.
- AI judging is simplified and based on a single prompt + latest evidence submission.
- No authentication or role enforcement.
- No persistent audit trail beyond runtime memory.

## Future Development

Natural next steps for the project:
- replace the in-memory store with persistent storage
- connect the unlock flow to a real smart contract on Solana
- add contributor deposit transactions on-chain
- add GitHub integration for PR and diff verification
- add a stronger oracle or attestation layer for milestone evidence
- support richer AI review inputs such as commit history, dashboards, Loom transcripts, and project artifacts
- add wallet auth and role-based permissions for contributors, builders, and reviewers

## Why This Project Is Interesting

Proof of Shipping sits at the intersection of AI, coordination, and on-chain capital allocation.

It demonstrates a product direction where funding is not released only because time passed or because someone asked for it, but because progress is observable, reviewable, and explainable.
