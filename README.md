# Midnight Drambler

Midnight Drambler is a local Firefox extension that creates a late-night pause before posting or sending on Facebook and Messenger.

Reading and browsing are allowed. Writing is blocked only during the configured time window.

## Installation

1. Open Firefox
2. Navigate to `about:debugging`
3. Select "This Firefox"
4. Click "Load Temporary Add-on"
5. Select `manifest.json`

## Configuration

Open the extension popup from the Firefox toolbar.

- Enable or disable the blocker with `Włącz blokadę`.
- Set `Od` and `Do` to choose the blocking hours. Windows that cross midnight are supported, for example `00:00` to `07:00`.
- Change `Wiadomość` to customize the blocking overlay text.
- Click `Zapisz`.

Settings are stored locally with `browser.storage.local`.

## Behavior

When blocking is active, Midnight Drambler blocks writing areas on:

- `facebook.com`
- `messenger.com`

It targets common writing controls such as:

- `textarea`
- `[contenteditable="true"]`
- `[role="textbox"]`
- `input[type="text"]`

Search fields are skipped when they can be recognized from input type, role, label, placeholder, or nearby search containers.

## Emergency Unlock

When the overlay appears, click `Odblokuj wyjątkowo`.

To unlock, type exactly:

```text
JUTRO TEŻ BĘDĘ CHCIAŁ TO WYSŁAĆ
```

If the phrase matches exactly, blocking is disabled for 15 minutes and a visible countdown appears:

```text
Midnight Drambler wyłączony. Pozostało: 14 min.
```

After 15 minutes, blocking returns automatically if the current time is still inside the configured blocking window.

## Privacy

The extension runs locally in Firefox.

- No backend
- No analytics
- No telemetry
- No external requests
- No user content collection

Only extension settings and the temporary unlock timestamp are stored locally.

## Manual Tests

Before testing, set the blocking window so that the current time is inside it.

### Facebook post creation

1. Open `facebook.com`.
2. Click the post composer.
3. Confirm that the Midnight Drambler overlay appears.
4. Confirm that typing is not accepted.

### Facebook comments

1. Open a Facebook feed post.
2. Click a comment text field.
3. Confirm that the overlay appears.
4. Confirm that typing and paste are blocked.

### Facebook group replies

1. Open a Facebook group.
2. Try to reply to a post or comment.
3. Confirm that the overlay appears.
4. Confirm that the reply cannot be written.

### Messenger messages

1. Open `messenger.com`.
2. Open any conversation.
3. Click the message composer.
4. Confirm that the overlay appears.
5. Confirm that typing, paste, and sending are blocked.

### Emergency unlock

1. Trigger the blocking overlay.
2. Click `Odblokuj wyjątkowo`.
3. Type anything except the required phrase.
4. Confirm that unlocking is rejected.
5. Type `JUTRO TEŻ BĘDĘ CHCIAŁ TO WYSŁAĆ` exactly.
6. Confirm that the overlay closes and the countdown appears.
7. Confirm that writing is allowed while the countdown is active.

### Automatic relock after 15 minutes

1. Complete the emergency unlock flow.
2. Keep the current time inside the configured blocking window.
3. Wait 15 minutes.
4. Click a writing field again.
5. Confirm that the overlay returns and writing is blocked.
