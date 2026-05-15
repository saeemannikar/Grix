# Grix – The Shadow AI for Slack
## Manual Concierge MVP (Week 1)

### Deploy in 5 minutes

1. Push this repo to GitHub
2. Go to Settings → Pages → Branch: `main` → Save
3. Live at `https://yourusername.github.io/grix/`

Or deploy to Vercel (faster, custom domain):
1. Import repo at vercel.com/new
2. Deploy — done. Get `grix.vercel.app` for free.

---

### Connect the forms to Google Sheets

1. Go to forms.google.com → New form
2. Add these fields:
   - Email (short answer, required)
   - Slack workspace name (short answer, required)
   - Role (dropdown: CTO, Team Lead, PM, Founder, EM, Other)
   - Which Slack channel? (short answer — for free analysis form only)
3. In form settings → Responses → Link to Sheets
4. Replace the form `action` URLs in `index.html` with your Google Form action URL
   - Find it: Form → ⋮ → Get pre-filled link → inspect the URL

Alternatively use [Tally.so](https://tally.so) (nicer UI, free) — create form, get embed link, replace buttons with Tally popup embed.

---

### Manual workflow (your daily checklist)

When someone signs up for free analysis:

**Step 1 — Email them within 24 hours:**

> Hi [Name],
> 
> Thanks for signing up for Grix's free Decision Report! I'm the founder and I'll be doing this analysis personally.
> 
> To get started, could you either:
> a) Invite me (hello@grix.so) to #[their-channel] as a guest with read-only access, or
> b) Export your last 7 days from Slack (Workspace Settings → Import/Export) and reply with the file
> 
> I'll have your Decision Report ready within 48 hours.
> 
> – [Your name]

**Step 2 — Extract decisions manually:**

Open the Slack export or browse the channel. Look for:
- ✅ Decisions: "We're going with X", "Let's do Y", "Agreed on Z"
- 📋 Action items: "[Name] will...", "Can you...", "By [date]..."
- 🚧 Blockers: "Blocked by...", "Waiting on...", "Can't proceed until..."
- ❓ Open questions: "Still need to decide...", "TBD"

**Step 3 — Create the report:**

Use this Google Doc template structure:
```
Decision Report – [Team Name] – [Date]
Channel: #[channel-name] | Period: [date range]

DECISIONS MADE (3)
• Use Stripe for payments [May 12, Priya]
• Block v2 on payments [May 12, Ayasha]
• ...

ACTION ITEMS (4)
• Marco → auth module by Thursday
• ...

BLOCKERS (1)
• v2 launch blocked until payments complete

OPEN QUESTIONS (2)
• Token timeout duration — unresolved
• ...
```

Export as PDF. Send via email.

**Step 4 — Follow up:**

> Hi [Name],
> 
> Here's your Grix Decision Report for #[channel] attached.
> 
> Quick question: would you pay $49/month for this to run automatically every day across all your channels?
> 
> Reply yes/no — it takes 5 seconds and directly shapes what we build next.

One "yes" = green light to build Week 2.

---

### Success metrics for Week 1

- [ ] 10–20 signups (post in Slack communities, LinkedIn, Reddit r/startups, r/SaaS)
- [ ] 3–5 teams give Slack access
- [ ] 1+ "yes I'd pay" response

That's your green light.
