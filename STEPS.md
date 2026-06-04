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

- [ ] Dodać lokalną instrukcję użycia `web-ext`.
- [ ] Uruchomić `web-ext lint`.
- [ ] Poprawić błędy i ostrzeżenia z lintera.
- [ ] Zdecydować, czy dodawać `package.json` wyłącznie dla narzędzi walidacyjnych.

Kryterium ukończenia:

- [ ] `web-ext lint` przechodzi bez błędów.
- [ ] Znane ostrzeżenia są poprawione albo świadomie opisane.
- [ ] Decyzja o `package.json` jest zapisana w README albo roadmapie.

## Faza 2a: Wersja Angielska

Zadania:

- [ ] Oddzielić teksty UI od logiki.
- [ ] Przygotować obsługę języka polskiego.
- [ ] Przygotować obsługę języka angielskiego.
- [ ] Przetłumaczyć teksty popupu.
- [ ] Przetłumaczyć teksty overlay.
- [ ] Przetłumaczyć teksty emergency unlock.
- [ ] Przetłumaczyć countdown.
- [ ] Przetłumaczyć komunikaty błędów.
- [ ] Wybrać sposób przełączania języka.
- [ ] Sprawdzić natywny mechanizm `_locales`.
- [ ] Rozważyć `_locales/pl/messages.json`.
- [ ] Rozważyć `_locales/en/messages.json`.

Kryterium ukończenia:

- [ ] Rozszerzenie działa po polsku i po angielsku.
- [ ] Wszystkie komunikaty są przetłumaczone.
- [ ] Nie ma mieszania języków w interfejsie.
- [ ] Rozwiązanie wykorzystuje standardowe mechanizmy Firefoxa, jeśli są wystarczające.

## Faza 3: Testy Ręczne Na Facebooku I Messengerze

Scenariusze testowe:

- [ ] Tworzenie posta na głównym feedzie Facebooka.
- [ ] Tworzenie posta w grupie Facebooka.
- [ ] Komentarze pod postami.
- [ ] Odpowiedzi na komentarze.
- [ ] Wiadomości na `messenger.com`.
- [ ] Wiadomości przez Facebook Messages.
- [ ] Wyszukiwarka Facebooka.
- [ ] Wyszukiwarka Messengera.
- [ ] Aktywacja blokady, gdy pole pisania jest już otwarte.
- [ ] Emergency unlock i automatyczny powrót blokady po 15 minutach.

Kryterium ukończenia:

- [ ] Pisanie i wysyłanie jest blokowane w głównych miejscach publikacji.
- [ ] Czytanie, przewijanie, otwieranie profili, grup i rozmów nadal działa.
- [ ] Wyszukiwarki nie są blokowane w typowych przypadkach.
- [ ] Znane problemy są zapisane jako konkretne przypadki do poprawy.

Notatki z testów:

- 

## Faza 4: Utwardzenie Heurystyk Blokowania

Zadania:

- [ ] Poprawić wykrywanie pól pisania.
- [ ] Poprawić wykrywanie przycisków wysyłania i publikacji, jeśli testy pokażą taką potrzebę.
- [ ] Lepiej ignorować pola wyszukiwania, filtrowania i nawigacji.
- [ ] Dodać throttling albo debouncing, jeśli `MutationObserver` okaże się zbyt kosztowny.
- [ ] Udokumentować znane ograniczenia wynikające z dynamicznego DOM Facebooka.

Kryterium ukończenia:

- [ ] Blokowanie działa stabilnie po zmianie widoków bez odświeżania strony.
- [ ] Nie ma zauważalnego spowolnienia Facebooka ani Messengera.
- [ ] Fałszywe blokady są ograniczone do akceptowalnego minimum.
- [ ] Znane ograniczenia są opisane prostym językiem.

## Faza 5: Poprawki UX

Zadania:

- [ ] Pokazać w popupie status `Blokada aktywna`.
- [ ] Pokazać w popupie status `Poza godzinami blokady`.
- [ ] Pokazać w popupie status `Odblokowane wyjątkowo`.
- [ ] Pokazać countdown emergency unlock także w popupie.
- [ ] Poprawić komunikaty błędu w ekranie emergency unlock.
- [ ] Sprawdzić overlay na mniejszych ekranach.
- [ ] Sprawdzić kontrast i czytelność tekstu.

Kryterium ukończenia:

- [ ] Popup jasno pokazuje aktualny stan.
- [ ] Overlay nie zasłania więcej niż musi, ale skutecznie zatrzymuje pisanie.
- [ ] Emergency unlock jest zrozumiały bez instrukcji z README.

## Faza 6: Strategia Wydania

Zadania:

- [ ] Opisać w README różnicę między temporary add-on, ZIP z GitHuba i podpisanym dodatkiem.
- [ ] Udokumentować decyzję, czy na tym etapie wystarcza instalacja developerska.
- [ ] Przygotować GitHub Release ZIP dopiero po zapisaniu decyzji o dystrybucji.
- [ ] Zostawić Mozilla Add-ons jako opcję na później.
- [ ] Opisać, dlaczego Mozilla Add-ons może być potrzebne dla nietechnicznych użytkowników.

Kryterium ukończenia:

- [ ] Wiadomo, czy pierwsza dystrybucja jest tylko testerska, czy ma być wygodna dla znajomych.
- [ ] README nie sugeruje, że temporary add-on jest trwałą instalacją.
- [ ] GitHub Release ZIP, jeśli powstanie, ma jasne przeznaczenie.

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
