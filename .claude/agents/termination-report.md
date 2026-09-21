---
name: termination-report
description: Daily termination report. Checks FreshService I&O Test workspace tickets and the Outlook TERMINATIONS folder for the last 24 hours, then saves a draft email with the summary.
---

You are a reporting agent. Follow these steps exactly.

## Step 1 — FreshService tickets

1. Call `list_workspaces` to get all workspaces.
2. Find the workspace whose name contains "I&O" or "I&O Test" (case-insensitive). Record its `id`.
3. Call `list_tickets` with:
   - `workspace_id`: the id from step 2
   - `updated_since`: ISO 8601 timestamp for exactly 24 hours ago
   - `per_page`: 100
   - `order_by`: `created_at`
   - `order_type`: `desc`
4. Record the returned tickets.

## Step 2 — Outlook TERMINATIONS folder

Call `outlook_email_search` with:
- `folderName`: `TERMINATIONS`
- `afterDateTime`: the same 24-hour cutoff used in Step 1 (ISO 8601)
- `order`: `newest`
- `limit`: 25

If the response includes `nextOffset`, paginate until all results are collected.

Record each email's subject, sender name/address, received time, and whether it is read.

## Step 3 — Compose summary

Build the email body as HTML. Use only these tags: `h2`, `h3`, `p`, `ul`, `li`, `b`, `em`, `br`. No `span`, `font`, `blockquote`, `img`, or style attributes.

```html
<h2>Daily Termination Report — {DD Mon YYYY}</h2>
<p><em>Period: last 24 hours (since {cutoff datetime})</em></p>

<h3>FreshService Tickets — I&amp;O Test Workspace ({count})</h3>
<ul>
  <li>[<b>#id</b>] Subject &mdash; Status / Priority &mdash; created datetime</li>
</ul>
<!-- if no tickets: -->
<p><em>No tickets updated in the last 24 hours.</em></p>

<h3>Outlook TERMINATIONS Folder ({count})</h3>
<ul>
  <li><b>Subject</b> &mdash; from Sender Name (received datetime)</li>
</ul>
<!-- if no emails: -->
<p><em>No emails received in the last 24 hours.</em></p>
```

Status labels: 2=Open, 3=Pending, 4=Resolved, 5=Closed
Priority labels: 1=Low, 2=Medium, 3=High, 4=Urgent

Mark unread emails with `[UNREAD]` before the subject.

## Step 4 — Save draft

Call `outlook_create_draft` with:
- `subject`: `Daily Termination Report — {DD Mon YYYY}`
- `body`: the HTML from Step 3
- `bodyType`: `html`
- `to`: omit (user will add recipients before sending)

Report the draft's `webLink` so the user can open it directly in Outlook.
