# Midnight Drambler Steps

Checklist roboczy na podstawie `ROADMAP.md`.

`ROADMAP.md` opisuje plan i kontekst. Ten plik służy do zaznaczania, co faktycznie zostało zrobione.

Legenda:

- `[ ]` do zrobienia
- `[x]` zrobione

## Faza 0: Stabilizacja MVP

Cel: potwierdzić, że MVP faktycznie pomaga ograniczyć nocne pisanie i publikowanie.

Zadania:

- [ ] Korzystać z rozszerzenia przez minimum 1-2 tygodnie.
- [ ] Zanotować przypadki, w których blokada pomogła.
- [ ] Zanotować przypadki fałszywych blokad.
- [ ] Zanotować przypadki, w których blokada była zbyt łatwa do obejścia.
- [ ] Zanotować sytuacje, w których użytkownik potrzebował emergency unlock.

Kryterium ukończenia:

- [ ] Rozszerzenie było używane przez minimum 7 dni.
- [ ] Zebrano minimum 5 rzeczywistych przypadków użycia albo prób użycia.
- [ ] Zidentyfikowano i zapisano zauważone fałszywe blokady oraz sytuacje użycia emergency unlock.
- [ ] Jest jasne, czy Midnight Drambler faktycznie pomaga ograniczyć nocne pisanie i publikowanie.

Notatki:

- 

## Faza 1: Porządek W Repozytorium

Zadania:

- [x] Dodać `LICENSE`.
- [x] Dodać `.gitignore`.
- [x] Dodać `.gitattributes`.
- [x] Dodać ikony rozszerzenia.
- [x] Podpiąć ikony w `manifest.json`.
- [x] Uporządkować README, jeśli po testach pojawią się niejasności instalacyjne.

Kryterium ukończenia:

- [x] Repo ma podstawowe metadane projektu.
- [x] Firefox dalej ładuje rozszerzenie jako temporary add-on.
- [x] `manifest.json`, `content.js` i `popup.js` przechodzą podstawową walidację.

## Faza 2: Walidacja WebExtension

Zadania:

- [x] Dodać lokalną instrukcję użycia `web-ext`.
- [x] Uruchomić `web-ext lint`.
- [x] Poprawić błędy i opisać świadomie zaakceptowany warning Androidowy z lintera.
- [x] Zdecydować, czy dodawać `package.json` wyłącznie dla narzędzi walidacyjnych.

Kryterium ukończenia:

- [x] `web-ext lint` przechodzi bez błędów.
- [x] Znane ostrzeżenia są poprawione albo świadomie opisane.
- [x] Decyzja o `package.json` jest zapisana w README albo roadmapie.

## Faza 2a: Wersja Angielska

Zadania:

- [x] Oddzielić teksty UI od logiki.
- [x] Przygotować obsługę języka polskiego.
- [x] Przygotować obsługę języka angielskiego.
- [x] Przetłumaczyć teksty popupu.
- [x] Przetłumaczyć teksty overlay.
- [x] Przetłumaczyć teksty emergency unlock.
- [x] Przetłumaczyć countdown.
- [x] Przetłumaczyć komunikaty błędów.
- [x] Wybrać sposób przełączania języka.
- [x] Sprawdzić natywny mechanizm `_locales`.
- [x] Rozważyć `_locales/pl/messages.json`.
- [x] Rozważyć `_locales/en/messages.json`.

Kryterium ukończenia:

- [x] Rozszerzenie działa po polsku i po angielsku.
- [x] Wszystkie komunikaty są przetłumaczone.
- [x] Nie ma mieszania języków w interfejsie.
- [x] Dla języków innych niż polski rozszerzenie używa angielskiego.
- [x] Rozwiązanie wykorzystuje standardowe mechanizmy Firefoxa, jeśli są wystarczające.

## Faza 3: Testy Ręczne Na Facebooku I Messengerze

Scenariusze testowe:

- [x] Tworzenie posta na głównym feedzie Facebooka.
- [x] Tworzenie posta w grupie Facebooka.
- [x] Komentarze pod postami.
- [x] Odpowiedzi na komentarze.
- [x] Wiadomości na `messenger.com`.
- [x] Wiadomości przez Facebook Messages.
- [x] Wyszukiwarka Facebooka.
- [x] Wyszukiwarka Messengera.
- [x] Aktywacja blokady, gdy pole pisania jest już otwarte.
- [x] Emergency unlock i automatyczny powrót blokady po 5 minutach.

Kryterium ukończenia:

- [x] Pisanie i wysyłanie jest blokowane w głównych miejscach publikacji.
- [x] Czytanie, przewijanie, otwieranie profili, grup i rozmów nadal działa.
- [x] Wyszukiwarki nie są blokowane w typowych przypadkach.
- [x] Znane problemy są zapisane jako konkretne przypadki do poprawy.

Notatki z testów:

- Testy ręczne Fazy 3 przeszły po hardeningu heurystyk.
- Akceptowany edge case: aktywny countdown może zmienić język z krótkim opóźnieniem po zmianie języka Firefoksa.

## Faza 4: Utwardzenie Heurystyk Blokowania

Zadania:

- [x] Poprawić wykrywanie pól pisania.
- [x] Poprawić wykrywanie przycisków wysyłania i publikacji, jeśli testy pokażą taką potrzebę.
- [x] Lepiej ignorować pola wyszukiwania, filtrowania i nawigacji.
- [x] Dodać throttling albo debouncing, jeśli `MutationObserver` okaże się zbyt kosztowny.
- [x] Udokumentować znane ograniczenia wynikające z dynamicznego DOM Facebooka.

Kryterium ukończenia:

- [x] Blokowanie działa stabilnie po zmianie widoków bez odświeżania strony.
- [x] Nie ma zauważalnego spowolnienia Facebooka ani Messengera.
- [x] Fałszywe blokady są ograniczone do akceptowalnego minimum.
- [x] Znane ograniczenia są opisane prostym językiem.

## Faza 5: Poprawki UX

Zadania:

- [x] Pokazać w popupie status `Blokada aktywna`.
- [x] Pokazać w popupie status `Poza godzinami blokady`.
- [x] Pokazać w popupie status `Odblokowane wyjątkowo`.
- [x] Pokazać countdown emergency unlock także w popupie.
- [x] Poprawić komunikaty błędu w ekranie emergency unlock.
- [x] Sprawdzić overlay na mniejszych ekranach.
- [x] Sprawdzić kontrast i czytelność tekstu.

Kryterium ukończenia:

- [x] Popup jasno pokazuje aktualny stan.
- [x] Overlay nie zasłania więcej niż musi, ale skutecznie zatrzymuje pisanie.
- [x] Emergency unlock jest zrozumiały bez instrukcji z README.

## Faza 6: Strategia Wydania

Zadania:

- [x] Opisać w README różnicę między temporary add-on, ZIP z GitHuba i podpisanym dodatkiem.
- [x] Udokumentować decyzję, że celem jest podpisane rozszerzenie przez Mozilla Add-ons.
- [x] Przygotować proces pakowania ZIP/XPI.
- [x] Dodać prosty changelog i zasady wersjonowania.
- [x] Wysłać pierwszą paczkę do AMO jako self-distributed / unlisted.
- [x] Pobrać i przetestować podpisany plik `.xpi`.
- [ ] Przygotować GitHub Release ZIP dopiero po zapisaniu decyzji o dystrybucji.
- [x] Opisać, dlaczego Mozilla Add-ons może być potrzebne dla nietechnicznych użytkowników.

Kryterium ukończenia:

- [x] Wiadomo, że pierwsza trwała dystrybucja ma być podpisanym dodatkiem do codziennego używania.
- [x] README nie sugeruje, że temporary add-on jest trwałą instalacją.
- [x] Jest jasne, jak uzyskać podpisany plik `.xpi`.
- [x] Wiadomo, kiedy podbijać wersję w `manifest.json`.
- [ ] GitHub Release ZIP, jeśli powstanie, ma jasne przeznaczenie.

Notatki:

- Wersja `0.1.0` została wysłana do AMO jako self-distributed / unlisted.
- AMO automatycznie sprawdziło i zaakceptowało wersję `0.1.0`.
- Podpisany plik `.xpi` został pobrany i uruchomiony w Firefoksie.
- Dodatek może nadal zostać poddany późniejszemu ręcznemu review przez Mozilla Add-ons.

## Future Ideas Parking

Te pomysły nie są częścią aktywnych kroków. Przenosić je do checklisty dopiero po decyzji w `ROADMAP.md`.

- [ ] Wsparcie dla Chrome.
- [ ] Wsparcie dla Edge.
- [ ] Desktop / tray application.
- [ ] Lokalne statystyki użycia.
- [ ] Osobne harmonogramy dla dni roboczych i weekendów.
- [ ] Osobne reguły dla Facebooka i Messengera.
- [ ] Dodatkowe komunikaty motywacyjne.
- [ ] Bardziej rozbudowany tryb testowy.
- [ ] Dodatkowe języki (DE, ES, FR itd.).
