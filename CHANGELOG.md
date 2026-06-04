# Midnight Drambler Changelog

Wersja dodatku jest brana z `version` w `manifest.json`.

## 0.1.0 - 2026-06-04

Pierwsza wersja MVP wysłana do Mozilla Add-ons jako `self-distributed` / `unlisted`.

Status wydania:

- AMO validation: `0 errors`, `1 warning`.
- Znany warning dotyczy Firefox Android i `data_collection_permissions`.
- Wersja została automatycznie sprawdzona i zaakceptowana przez Mozilla Add-ons.
- Podpisany plik `.xpi` został pobrany i uruchomiony w Firefoksie.
- Dodatek może nadal zostać poddany późniejszemu ręcznemu review przez Mozilla Add-ons.

Zakres:

- Blokowanie pól pisania na Facebooku i Messengerze.
- Harmonogram blokady z obsługą zakresu przechodzącego przez północ.
- Popup ustawień.
- Emergency unlock na 5 minut.
- Lokalizacja polska i angielska.
- Angielski fallback dla wszystkich języków innych niż polski.
- Lokalne ustawienia przez `browser.storage.local`.
- Brak backendu, analityki, telemetrii i zewnętrznych requestów.
