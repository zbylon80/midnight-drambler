# Midnight Drambler

Midnight Drambler to lokalne rozszerzenie Firefoxa, które tworzy nocną pauzę przed pisaniem, wysyłaniem i publikowaniem na Facebooku oraz Messengerze.

Czytanie i przeglądanie jest dozwolone. Pisanie jest blokowane tylko w skonfigurowanym oknie czasowym.

## Instalacja

Wymagany jest desktopowy Firefox 140 lub nowszy.

1. Otwórz Firefox.
2. Przejdź do `about:debugging`.
3. Wybierz `This Firefox`.
4. Kliknij `Load Temporary Add-on`.
5. Wybierz `manifest.json` z katalogu projektu.

Uwaga: temporary add-on znika po restarcie Firefoksa. Ten tryb jest dobry do testowania i developmentu, ale nie jest wygodną trwałą instalacją dla nietechnicznych użytkowników.

## Trwała Instalacja

Do codziennego używania używana jest podpisana wersja rozszerzenia przez Mozilla Add-ons.

ZIP z GitHuba jest przydatny do pobrania kodu, testowania albo developmentu, ale sam w sobie nie jest wygodną trwałą instalacją. Jeśli ZIP zostanie załadowany przez `about:debugging` jako temporary add-on, rozszerzenie nadal zniknie po restarcie Firefoksa.

Preferowana ścieżka to `unlisted` / `self-distributed`, czyli dodatek podpisany przez Mozillę, ale niewidoczny publicznie w katalogu AMO. Taki plik `.xpi` można zainstalować na stałe z pliku i nie znika on po restarcie Firefoksa.

Proces dla pierwszej instalacji albo kolejnej wersji:

1. Zwiększyć `version` w `manifest.json`.
2. Uruchomić walidację lokalną.
3. Spakować rozszerzenie do ZIP/XPI.
4. Wysłać paczkę do AMO jako self-distributed / unlisted.
5. Pobrać podpisany plik `.xpi`.
6. Zainstalować go w Firefoksie przez `about:addons` -> zębatka -> `Install Add-on From File`.

Ta ścieżka wymaga konta Mozilla/AMO i zaakceptowania zasad dystrybucji dodatków. Projekt nie zbiera danych użytkownika, więc deklaracja prywatności powinna pozostać prosta: brak telemetrii, brak analityki, brak zewnętrznych requestów.

Szczegółowa procedura pakowania i podpisywania jest w `RELEASE.md`.

Podpisany plik `.xpi` dla wersji `0.1.0` jest udostępniony jako asset w GitHub Release `v0.1.0`.

## Wersjonowanie

Wersja dodatku jest zapisana w `version` w `manifest.json`. To jest wersja widoczna dla Firefoksa i Mozilla Add-ons.

Na etapie MVP używamy prostego schematu:

- `0.1.x` - poprawki błędów, heurystyk, tekstów i procesu wydania,
- `0.2.x` - nowe małe funkcje albo widoczne zmiany UX,
- `1.0.0` - dopiero gdy rozszerzenie jest sprawdzone w codziennym użyciu i ma stabilny proces instalacji.

Każda kolejna paczka wysyłana do AMO musi mieć nową, wyższą wersję w `manifest.json`. Same commity dokumentacyjne nie wymagają podbijania wersji, dopóki nie przygotowujemy nowego ZIP-a do podpisania.

Historia wersji jest w `CHANGELOG.md`.

## Konfiguracja

Otwórz popup rozszerzenia z paska narzędzi Firefoxa.

- Włącz lub wyłącz blokadę opcją `Włącz blokadę`.
- Ustaw `Od` i `Do`, żeby wybrać godziny blokowania. Okna przechodzące przez północ są obsługiwane, np. `00:00` do `07:00`.
- Zmień `Wiadomość`, jeśli chcesz dostosować tekst overlay.
- Kliknij `Zapisz`.

Ustawienia są przechowywane lokalnie przez `browser.storage.local`.

Popup pokazuje też aktualny stan blokady:

- `Blokada aktywna`
- `Poza godzinami blokady`
- `Odblokowane wyjątkowo` z licznikiem pozostałego czasu

## Języki

Rozszerzenie obsługuje dwa języki:

- polski
- angielski

Język jest wybierany automatycznie przez natywny mechanizm lokalizacji Firefox WebExtensions (`_locales`) na podstawie języka Firefoksa. Jeśli język Firefoksa zaczyna się od `pl`, rozszerzenie działa po polsku. Dla wszystkich pozostałych języków używany jest angielski. Na tym etapie nie ma ręcznego przełącznika języka w ustawieniach.

Popup, overlay i countdown odczytują aktualny język Firefoksa w czasie działania dodatku. Nazwa i opis dodatku widoczne w samym Firefoxie pochodzą z manifestu i mogą wymagać przeładowania dodatku po zmianie języka przeglądarki.

## Zachowanie

Gdy blokada jest aktywna, Midnight Drambler blokuje pola pisania na:

- `facebook.com`
- `messenger.com`

Rozszerzenie celuje w typowe kontrolki pisania:

- `textarea`
- `[contenteditable="true"]`
- `[role="textbox"]`
- `input[type="text"]`

Pola wyszukiwania są pomijane, jeśli da się je rozpoznać po typie pola, roli, etykiecie, placeholderze albo pobliskim kontenerze wyszukiwania.

## Emergency Unlock

Gdy pojawi się overlay blokady, kliknij `Odblokuj wyjątkowo`.

Żeby odblokować, wpisz dokładnie:

```text
JUTRO TEŻ BĘDĘ CHCIAŁ TO WYSŁAĆ
```

Jeśli fraza pasuje dokładnie, blokada zostaje wyłączona na 5 minut i pojawia się widoczny licznik:

```text
Midnight Drambler wyłączony. Pozostało: 5 min.
```

Po 5 minutach blokada wraca automatycznie, jeśli aktualna godzina nadal mieści się w skonfigurowanym oknie blokowania.

## Prywatność

Rozszerzenie działa lokalnie w Firefoksie.

- Brak backendu.
- Brak analityki.
- Brak telemetrii.
- Brak zewnętrznych requestów.
- Brak zbierania treści użytkownika.

Lokalnie zapisywane są tylko ustawienia rozszerzenia i timestamp tymczasowego odblokowania.

Manifest deklaruje `browser_specific_settings.gecko.data_collection_permissions.required` jako `none`, bo rozszerzenie nie zbiera ani nie wysyła danych użytkownika poza rozszerzenie.

## Walidacja WebExtension

Na razie projekt nie ma stałego `package.json`. `web-ext` jest uruchamiany jednorazowo przez `npx`, żeby nie dodawać narzędzi Node do projektu bez potrzeby.

```powershell
npx --yes web-ext@10.3.0 lint --source-dir .
```

Aktualnie oczekiwany wynik to `0 errors`. `web-ext` może pokazać ostrzeżenie Androidowe `KEY_FIREFOX_ANDROID_UNSUPPORTED_BY_MIN_VERSION`, ponieważ manifest deklaruje desktopowego Firefoksa i nie dodaje osobnej sekcji `gecko_android`.

Podstawowa walidacja bez `web-ext`:

```powershell
Get-Content manifest.json -Raw | ConvertFrom-Json | Out-Null
node --check content.js
node --check popup.js
```

## Znane Ograniczenia

Facebook i Messenger często zmieniają strukturę DOM, więc blokowanie opiera się na heurystykach zamiast na stałych, kruchych selektorach.

- Niektóre nowe pola pisania mogą wymagać dopracowania wykrywania.
- Nietypowe pola wyszukiwania albo filtrowania mogą zostać błędnie uznane za pola pisania.
- Aktywny countdown może zmienić język z krótkim opóźnieniem po zmianie języka Firefoksa.
- Temporary add-on nadal wymaga przeładowania po restarcie Firefoksa.

## Testy Ręczne

Przed testowaniem ustaw okno blokady tak, żeby aktualna godzina mieściła się w środku.

### Tworzenie posta na Facebooku

1. Otwórz `facebook.com`.
2. Kliknij composer posta na głównym feedzie.
3. Sprawdź, czy pojawia się overlay Midnight Drambler.
4. Sprawdź, czy wpisywanie tekstu jest blokowane.

### Tworzenie posta w grupie Facebooka

1. Otwórz dowolną grupę na Facebooku.
2. Kliknij pole tworzenia posta w grupie.
3. Sprawdź, czy pojawia się overlay.
4. Sprawdź, czy nie da się wpisać ani wkleić treści.

### Komentarze na Facebooku

1. Otwórz post na feedzie albo w grupie.
2. Kliknij pole komentarza.
3. Sprawdź, czy pojawia się overlay.
4. Sprawdź, czy wpisywanie i wklejanie są blokowane.

### Odpowiedzi na komentarze

1. Otwórz post z komentarzami.
2. Kliknij `Odpowiedz` przy komentarzu.
3. Spróbuj wpisać odpowiedź.
4. Sprawdź, czy overlay blokuje pisanie.

### Messenger na `messenger.com`

1. Otwórz `messenger.com`.
2. Otwórz dowolną rozmowę.
3. Kliknij composer wiadomości.
4. Sprawdź, czy pojawia się overlay.
5. Sprawdź, czy wpisywanie, wklejanie i wysyłanie są blokowane.

### Facebook Messages

1. Otwórz wiadomości przez Facebooka, np. `facebook.com/messages`.
2. Otwórz dowolną rozmowę.
3. Kliknij composer wiadomości.
4. Sprawdź, czy overlay blokuje pisanie i wysyłanie.

### Wyszukiwarka Facebooka

1. Otwórz `facebook.com`.
2. Kliknij pole wyszukiwania.
3. Wpisz tekst testowy.
4. Sprawdź, czy wyszukiwarka nie jest blokowana.

### Wyszukiwarka Messengera

1. Otwórz `messenger.com`.
2. Kliknij pole wyszukiwania rozmów.
3. Wpisz tekst testowy.
4. Sprawdź, czy wyszukiwarka nie jest blokowana.

### Aktywacja przy otwartym polu pisania

1. Ustaw harmonogram tak, żeby blokada miała się zaraz aktywować.
2. Otwórz pole pisania przed aktywacją blokady.
3. Poczekaj, aż aktualna godzina wejdzie w okno blokowania.
4. Spróbuj pisać dalej.
5. Sprawdź, czy blokada przejmuje aktywne pole.

### Emergency unlock

1. Wywołaj overlay blokady.
2. Kliknij `Odblokuj wyjątkowo`.
3. Wpisz cokolwiek poza wymaganą frazą.
4. Sprawdź, czy odblokowanie zostaje odrzucone.
5. Wpisz dokładnie `JUTRO TEŻ BĘDĘ CHCIAŁ TO WYSŁAĆ`.
6. Sprawdź, czy overlay znika i pojawia się countdown.
7. Sprawdź, czy pisanie jest dozwolone, gdy countdown jest aktywny.

### Automatyczny powrót blokady po 5 minutach

1. Przejdź flow emergency unlock.
2. Zostaw aktualną godzinę wewnątrz skonfigurowanego okna blokowania.
3. Poczekaj 5 minut.
4. Kliknij pole pisania ponownie.
5. Sprawdź, czy overlay wraca i pisanie jest blokowane.
