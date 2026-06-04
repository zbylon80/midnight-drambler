# Midnight Drambler Release

Krótka procedura przygotowania paczki do podpisania przez Mozilla Add-ons.

## Cel

Na co dzień rozszerzenie ma działać jako podpisany dodatek Firefoxa, a nie jako temporary add-on z `about:debugging`.

Preferowana ścieżka:

- dystrybucja `unlisted` / `self-distributed`,
- brak publicznego listingu w katalogu AMO,
- podpisany plik `.xpi` instalowany lokalnie w Firefoksie.

## Wersjonowanie

Źródłem wersji dodatku jest `version` w `manifest.json`.

Przed każdym kolejnym uploadem do AMO:

1. Zwiększ `version` w `manifest.json`.
2. Dopisz zmianę w `CHANGELOG.md`.
3. Zbuduj nową paczkę ZIP.

Nie trzeba podbijać wersji dla każdego commita. Wersję podbijamy wtedy, gdy przygotowujemy nowy ZIP do podpisania albo publikacji.

Praktyczna konwencja na czas MVP:

- `0.1.x` - poprawki błędów, heurystyk, tekstów i procesu wydania,
- `0.2.x` - nowe małe funkcje albo widoczne zmiany UX,
- `1.0.0` - stabilna wersja po dłuższym codziennym użyciu.

## Przed Pakowaniem

1. Upewnij się, że zmiany są zapisane w git.
2. Zwiększ `version` w `manifest.json`, jeśli przygotowujesz nową wersję do AMO.
3. Dopisz wpis w `CHANGELOG.md`, jeśli to nowa wersja wysyłana do AMO.
4. Uruchom podstawową walidację:

```powershell
Get-Content manifest.json -Raw | ConvertFrom-Json | Out-Null
node --check content.js
node --check popup.js
npx --yes web-ext@10.3.0 lint --source-dir .
```

Oczekiwany wynik `web-ext lint`: `0 errors`. Znany warning Androidowy jest zaakceptowany i opisany w README.

## Pakowanie ZIP

Zbuduj paczkę:

```powershell
npx --yes web-ext@10.3.0 build --source-dir . --artifacts-dir web-ext-artifacts --overwrite-dest
```

Wynik pojawi się w `web-ext-artifacts/`, np.:

```text
web-ext-artifacts/midnight_drambler-0.1.0.zip
```

`web-ext-artifacts/` jest ignorowany przez git i nie powinien być commitowany.

Lista plików pomijanych przy pakowaniu jest w `web-ext-config.mjs`.

## Sprawdzenie Zawartości Paczki

Paczka powinna zawierać tylko pliki potrzebne rozszerzeniu:

- `manifest.json`
- `content.js`
- `popup.html`
- `popup.css`
- `popup.js`
- `styles.css`
- `_locales/`
- `icons/`
- opcjonalnie `LICENSE`

Nie powinna zawierać plików roboczych projektu, takich jak:

- `README.md`
- `ROADMAP.md`
- `STEPS.md`
- `AGENTS.md`
- `CHANGELOG.md`
- `RELEASE.md`
- `.gitignore`
- `.gitattributes`

## Podpisanie Przez AMO

1. Wejdź do AMO Developer Hub.
2. Wybierz dodanie nowego dodatku albo nowej wersji istniejącego dodatku.
3. Wybierz dystrybucję `On your own` / `self-distributed` / `unlisted`.
4. Wgraj ZIP z `web-ext-artifacts/`.
5. Przejdź walidację AMO.
6. Poczekaj na podpisanie.
7. Pobierz podpisany plik `.xpi`.

AMO może poprosić o dodatkowe informacje albo skierować dodatek do ręcznego review. To normalne nawet przy małym prywatnym dodatku.

## Instalacja Podpisanego Pliku

1. Otwórz Firefox.
2. Wejdź w `about:addons`.
3. Kliknij zębatkę.
4. Wybierz `Install Add-on From File`.
5. Wskaż podpisany plik `.xpi`.
6. Potwierdź instalację.

Po instalacji podpisany dodatek zostaje w Firefoksie po restarcie przeglądarki.

## Aktualizacje

Dla każdej kolejnej wersji:

1. Zwiększ `version` w `manifest.json`.
2. Dopisz wpis w `CHANGELOG.md`.
3. Zbuduj nowy ZIP.
4. Wyślij nową wersję do AMO.
5. Pobierz nowy podpisany `.xpi`.
6. Zainstaluj nowy plik w Firefoksie.

Na tym etapie nie konfigurujemy automatycznych aktualizacji ani `update_url`.
