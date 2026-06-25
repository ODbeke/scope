# SCOPE

An onchain verification engine for service agreements, freelance milestones, and B2B deliverables. 

SCOPE replaces centralized escrow agents and subjective human disputes with an objective, consensus-backed AI arbiter run by GenLayer validators. Clients and providers submit a Scope of Work (SOW) agreement and the finished outcome evidence. The network audits the deliverables against the criteria and records an immutable, verified completion grade.

- **Live Deployment:** [scope-omega.vercel.app](https://scope-omega.vercel.app/)
- **Bradbury Contract:** `0x1e76778777e5e0E7afcc8d43fFfEC76117DE4575`

---

## About the Protocol

Traditional freelance agreements and B2B service contracts rely on centralized dispute managers who are slow, expensive, and often struggle to understand technical deliverables. **SCOPE** changes this by introducing automated, objective, and decentralized milestone verification.

### How GenLayer Empowers SCOPE
* **Consensus-Backed AI Judgment:** Instead of relying on a single model or server (which could be biased or hacked), SCOPE runs subjective appraisals under GenLayer validator consensus. Multiple independent validators verify the outcome before sealing the verdict.
* **Equivalence Rules:** Tolerance rules absorb natural LLM variations (up to 12% drift in scores), ensuring that minor model deviations do not block consensus.
* **Deterministic Backstops:** Hard clamps prevent model glitches from storing invalid outcome scores, enforcing rating bands for verified deliverables.

---

## Technical Architecture

Centralized escrow systems and milestone platforms are prone to single-party censorship, rating inflation, or biased disputes. SCOPE guarantees that project evaluations are subjective yet reproducible:

```
[ Client & Provider ]
        |
        v
[ Submit Milestone ] ---> ( Validation Input Guards )
                                  |
                                  v
                       [ GenLayer Consensus ]
                                  |
                     +------------+------------+
                     |                         |
            [ Leader Draft ]         [ Validator Audits ]
            (Model Exec Prompt)      (Independent Verification)
                     |                         |
                     +------------+------------+
                                  |
                                  v
                      ( Check Equivalence Rule )
                      - Strict Verdict Agreement
                      - 12% Score Drift Tolerance
                                  |
                                  v
                       ( Clamp Score Backstops )
                       - VERIFIED: 70-100
                       - DEFICIENT: 35-69
                       - DEFAULT: 0-34
                                  |
                                  v
                        [ Immutable Ledger ]
```

### 1. Verification Timeline
1. **Intake & Guards:** The contract validates string lengths (`MAX_CRITERIA_LEN` = 500, `MAX_EVIDENCE_LEN` = 1000) deterministically to prevent gas manipulation.
2. **Leader Appraisal:** The block leader executes the LLM arbiter prompt, assessing the evidence against the scope of work. It returns a verdict, rating score, and professional reasoning sentence.
3. **Equivalence Auditing:** Independent validators run the same evaluation. The equivalence logic requires that they agree exactly on the categorical verdict (`VERIFIED`, `DEFICIENT`, or `DEFAULT`), allowing a rating variance of up to 12 points or 12% drift to tolerate non-deterministic LLM variance.
4. **Deterministic Clamping:** The contract applies strict score boundary clamp backstops. A `VERIFIED` milestone can never settle below a score of 70, preventing model glitches from recording corrupt data.
5. **State Storage:** The audited milestone is serialized as JSON and pushed to a `TreeMap` storage layout for paginated frontend fetching.

---

## Project Structure

```
SCOPE/
├── contracts/
│   └── scope_evaluator.py     # Intelligent Contract with validator checks
├── tests/
│   └── integration/
│       └── test_scope.py      # Integration tests running LLM/VM checks
├── scripts/
│   ├── deploy.py              # Deploy contract and write deployment.json
│   ├── gl.py                  # Read/write ABI encoding helpers
│   ├── verify_read.py         # Verify read methods on the deployed address
│   └── verify_write.py        # Execute AI write validation on Bradbury
├── frontend/
│   ├── src/
│   │   ├── app/               # Next.js App Router (Layout & Dashboard)
│   │   ├── components/        # Header, Stats, Cards, Modal, Consensus Timeline
│   │   ├── hooks/             # useWallet, useContractData, useTransaction hooks
│   │   └── lib/               # genlayer-js connection and formatting libraries
│   ├── tailwind.config.ts     # Executive slate/gold theme parameters
│   └── package.json           # Frontend dependency manifest
├── deployment.json            # Deployment receipt logs (reads automatically)
└── gltest.config.yaml         # Python testing configurations
```

---

## Getting Started

### 1. Contract Setup & Testing
Ensure you have the GenVM testing suite and development dependencies installed:

```bash
# Install genlayer dev tools
pip install genvm-linter genlayer-test

# Lint the contract
genvm-lint check contracts/scope_evaluator.py

# Run integration tests locally
gltest tests/integration/ -v -s --network studionet
```

### 2. Deployment
Setup your private key inside a `.env` file in the root directory:

```env
GENLAYER_PRIVATE_KEY=your_private_key_here
```

Execute the deployment script:
```bash
# Deploy to Bradbury Testnet
python scripts/deploy.py

# Verify contract read methods
python scripts/verify_read.py

# Verify AI audit write flow
python scripts/verify_write.py
```

### 3. Frontend Execution
The Next.js web application automatically reads the contract address and transaction hash outputted inside `deployment.json`. No copy-pasting is required.

```bash
cd frontend

# Install package dependencies
npm install --legacy-peer-deps

# Run the local development server
npm run dev
```

Navigate to `http://localhost:3000` to interact with the executive audit dashboard.

---

## Examples for Testing

Use the following real-world milestone scenarios to test the validation states on your local server or Vercel live application:

### Example 1: Resolving a VERIFIED Verdict
* **Scope of Work (Criteria):**
  ```text
  Create a responsive contact form in React with fields for Name, Email (validated), and Message. The form must mock submit data to an API endpoint and display a visual confirmation toast upon successful completion.
  ```
* **Outcome Evidence:**
  ```text
  Delivered the React contact form. Designed responsive flex layouts, added a regex check on the Email input field, and integrated a form submit handler that queries a mock API endpoint, successfully displaying a 'Message Sent' toast notification.
  ```

### Example 2: Resolving a DEFICIENT Verdict
* **Scope of Work (Criteria):**
  ```text
  Build a user settings page featuring an avatar upload input, text fields for display name and bio, and a functional 'Save Changes' button that persists configuration data to the database.
  ```
* **Outcome Evidence:**
  ```text
  Designed the settings page UI. Display name and bio fields are fully styled with a 'Save Changes' action button. However, the avatar upload component is currently static (does not accept files), and database persistence API calls have not yet been integrated.
  ```

### Example 3: Resolving a DEFAULT Verdict
* **Scope of Work (Criteria):**
  ```text
  Set up a Redis caching layer for active user sessions to reduce overall database query latency below 50ms.
  ```
* **Outcome Evidence:**
  ```text
  Created a simple Python script that connects to a local SQLite database and prints the user counts. We did not have time to install Redis or configure session caching variables during this sprint.
  ```
