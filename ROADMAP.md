# Midnight Drambler Roadmap

Ten dokument opisuje proponowany plan dalszego rozwoju po działającym MVP.

To jest mały projekt hobbystyczny, nie produkt komercyjny. Priorytetem jest prostota, przewidywalność i lokalne działanie w Firefoksie.

## Cel Najbliższego Etapu

Utwierdzić MVP tak, żeby było stabilne, czytelne dla użytkownika i gotowe do testów u kilku osób.

Nie dodajemy jeszcze dużych funkcji. Najpierw poprawiamy fundamenty projektu, walidację, ręczne testy i odporność blokowania na zmiany DOM Facebooka.

## Zasady Projektowe

- Rozszerzenie działa tylko jako Firefox extension, przynajmniej na tym etapie.
- Wszystko działa lokalnie w przeglądarce.
- Brak backendu.
- Brak telemetrii.
- Brak analityki.
- Brak zewnętrznych requestów.
- Nie zbieramy, nie zapisujemy i nie analizujemy treści wiadomości, komentarzy ani postów.
- Czytanie Facebooka i Messengera ma działać normalnie.
- Blokowanie ma dotyczyć pisania, wysyłania i publikowania.

## Faza 0: Stabilizacja MVP

Cel: potwierdzić, że MVP rzeczywiście rozwiązuje realny problem użytkownika, zanim projekt zostanie dalej rozbudowany.

Zadania:

- Korzystać z rozszerzenia przez minimum 1-2 tygodnie.
- Zanotować przypadki, w których blokada pomogła.
- Zanotować przypadki fałszywych blokad.
- Zanotować przypadki, w których blokada była zbyt łatwa do obejścia.
- Zanotować sytuacje, w których użytkownik potrzebował emergency unlock.

Kryterium ukończenia:

- Jest jasne, czy Midnight Drambler faktycznie pomaga ograniczyć nocne pisanie i publikowanie.
- Najważniejsze problemy z użycia MVP są zapisane jako konkretne obserwacje do dalszych poprawek.
- Rozszerzenie było używane przez minimum 7 dni.
- Zebrano minimum 5 rzeczywistych przypadków użycia albo prób użycia.
- Zidentyfikowano i zapisano zauważone fałszywe blokady oraz sytuacje, w których użyto emergency unlock.

## Faza 1: Porządek W Repozytorium

Cel: przygotować projekt tak, żeby był łatwy do utrzymania i dalszego testowania.

Zadania:

- Dodać `LICENSE`.
- Dodać `.gitignore`.
- Dodać `.gitattributes`, żeby ustabilizować końce linii między Windows i GitHubem.
- Dodać ikony rozszerzenia.
- Podpiąć ikony w `manifest.json`.
- Uporządkować README, jeśli po testach pojawią się niejasności instalacyjne.

Kryterium ukończenia:

- Repo ma podstawowe metadane projektu.
- Firefox dalej ładuje rozszerzenie jako temporary add-on.
- `manifest.json`, `content.js` i `popup.js` przechodzą podstawową walidację.

## Faza 2: Walidacja WebExtension

Cel: sprawdzić projekt narzędziami przeznaczonymi dla rozszerzeń Firefoksa.

Zadania:

- Dodać lokalną instrukcję użycia `web-ext`.
- Uruchomić `web-ext lint`.
- Poprawić błędy i ostrzeżenia z lintera.
- Zdecydować, czy dodawać `package.json` wyłącznie dla narzędzi walidacyjnych.

Kryterium ukończenia:

- `web-ext lint` przechodzi bez błędów.
- Znane ostrzeżenia są poprawione albo świadomie opisane.
- Decyzja o `package.json` jest zapisana w README albo roadmapie.

## Faza 2a: Wersja Angielska

Cel: przygotować pierwszą angielską wersję rozszerzenia.

Na tym etapie planujemy tylko dwa języki: polski i angielski. Pełna internacjonalizacja jest świadomie poza zakresem, bo projekt ma pozostać prosty. Dodatkowe języki można rozważyć później, jeśli pojawi się realne zapotrzebowanie.

Reguła wyboru języka jest prosta: Firefox w języku `pl` albo `pl-*` dostaje polski interfejs, a wszystkie pozostałe języki dostają angielski. Angielski jest domyślnym fallbackiem.

Zadania:

- Oddzielić teksty UI od logiki.
- Przygotować obsługę dwóch języków:
  - polski
  - angielski
- Przetłumaczyć wszystkie komunikaty użytkownika:
  - popup
  - overlay
  - emergency unlock
  - countdown
  - komunikaty błędów
- Wybrać sposób przełączania języka:
  - automatycznie na podstawie języka Firefoxa
  - albo ręcznie w ustawieniach
- Preferować natywny mechanizm lokalizacji Firefox WebExtensions (`_locales`) zamiast tworzenia własnego systemu tłumaczeń.
- Rozważyć wykorzystanie:
  - `_locales/pl/messages.json`
  - `_locales/en/messages.json`

Kryterium ukończenia:

- Rozszerzenie działa po polsku i po angielsku.
- Wszystkie komunikaty są przetłumaczone.
- Nie ma mieszania języków w interfejsie.
- Dla wszystkich języków innych niż polski rozszerzenie używa angielskiego.
- Rozwiązanie wykorzystuje standardowe mechanizmy Firefoxa, jeśli okażą się wystarczające.

## Faza 3: Testy Ręczne Na Facebooku I Messengerze

Cel: znaleźć miejsca, gdzie heurystyki blokują za dużo, za mało albo nie nadążają za dynamicznym DOM.

Scenariusze testowe:

- Tworzenie posta na głównym feedzie Facebooka.
- Tworzenie posta w grupie Facebooka.
- Komentarze pod postami.
- Odpowiedzi na komentarze.
- Wiadomości na `messenger.com`.
- Wiadomości przez Facebook Messages.
- Wyszukiwarka Facebooka.
- Wyszukiwarka Messengera.
- Aktywacja blokady, gdy pole pisania jest już otwarte.
- Emergency unlock i automatyczny powrót blokady po 5 minutach.

Kryterium ukończenia:

- Pisanie i wysyłanie jest blokowane w głównych miejscach publikacji.
- Czytanie, przewijanie, otwieranie profili, grup i rozmów nadal działa.
- Wyszukiwarki nie są blokowane w typowych przypadkach.
- Znane problemy są zapisane jako konkretne przypadki do poprawy.

## Faza 4: Utwardzenie Heurystyk Blokowania

Cel: poprawić odporność blokowania przed polerowaniem UX, żeby nie upiększać zachowania, które nadal jest niestabilne.

Zadania:

- Poprawić wykrywanie pól pisania.
- Poprawić wykrywanie przycisków wysyłania i publikacji, jeśli testy pokażą taką potrzebę.
- Lepiej ignorować pola wyszukiwania, filtrowania i nawigacji.
- Dodać throttling albo debouncing, jeśli `MutationObserver` okaże się zbyt kosztowny.
- Udokumentować znane ograniczenia wynikające z dynamicznego DOM Facebooka.

Kryterium ukończenia:

- Blokowanie działa stabilnie po zmianie widoków bez odświeżania strony.
- Nie ma zauważalnego spowolnienia Facebooka ani Messengera.
- Fałszywe blokady są ograniczone do akceptowalnego minimum.
- Znane ograniczenia są opisane prostym językiem.

## Faza 5: Poprawki UX

Cel: użytkownik ma od razu rozumieć, czy blokada działa i dlaczego.

Zadania:

- Pokazać w popupie aktualny status:
  - `Blokada aktywna`
  - `Poza godzinami blokady`
  - `Odblokowane wyjątkowo`
- Pokazać countdown emergency unlock także w popupie.
- Poprawić komunikaty błędu w ekranie emergency unlock.
- Sprawdzić overlay na mniejszych ekranach.
- Sprawdzić kontrast i czytelność tekstu.

Kryterium ukończenia:

- Popup jasno pokazuje aktualny stan.
- Overlay nie zasłania więcej niż musi, ale skutecznie zatrzymuje pisanie.
- Emergency unlock jest zrozumiały bez instrukcji z README.

## Faza 6: Strategia Wydania

Cel: zdecydować, jak realnie udostępniać rozszerzenie znajomym.

GitHub ZIP jest przydatny dla deweloperów i testów, ale temporary add-on w Firefoksie znika po restarcie przeglądarki. To jest dobre do developmentu, niekoniecznie do wygodnego używania przez nietechniczne osoby.

Decyzja:

- Przygotować podpisane rozszerzenie przez Mozilla Add-ons.
- Preferować dystrybucję `unlisted` / `self-distributed`, czyli podpisany plik `.xpi` bez publicznego listingu w katalogu AMO.
- Temporary add-on zostaje tylko trybem developerskim.

Zadania:

- Opisać w README różnicę między temporary add-on, ZIP z GitHuba i podpisanym dodatkiem.
- Udokumentować decyzję, że celem jest podpisany dodatek do codziennego używania.
- Przygotować proces pakowania ZIP/XPI.
- Dodać prosty changelog i zasady wersjonowania.
- Wysłać pierwszą paczkę do AMO jako self-distributed / unlisted.
- Pobrać i przetestować podpisany plik `.xpi`.
- Przygotować GitHub Release ZIP dopiero po zapisaniu powyższej decyzji.
- Opisać, dlaczego Mozilla Add-ons może być potrzebne dla nietechnicznych użytkowników.

Kryterium ukończenia:

- Wiadomo, czy pierwsza dystrybucja jest tylko testerska, czy ma być wygodna dla znajomych.
- README nie sugeruje, że temporary add-on jest trwałą instalacją.
- Jest jasne, jak uzyskać podpisany plik `.xpi`.
- Wiadomo, kiedy podbijać wersję w `manifest.json`.
- GitHub Release ZIP, jeśli powstanie, ma jasne przeznaczenie.

## Non-goals

- Brak AI do analizy treści.
- Brak czytania i zapisywania wiadomości użytkownika.
- Brak blokowania całego Facebooka, chyba że okaże się to absolutnie konieczne.
- Brak wsparcia Chrome i Edge w MVP.
- Brak aplikacji desktopowej albo tray application w MVP.
- Brak cloud sync.
- Brak systemu kont.
- Brak monetyzacji.

## Known Risks

- Facebook regularnie zmienia DOM, więc selektory i heurystyki mogą z czasem przestać działać.
- Messenger może wprowadzać nowe pola edycji albo zmieniać strukturę istniejących.
- Niektóre pola mogą być błędnie rozpoznane jako pola pisania.
- Niektóre pola pisania mogą nie zostać wykryte.
- Zbyt agresywne skanowanie DOM może spowolnić Facebooka lub Messengera.
- Firefox może zmienić wymagania dla rozszerzeń albo sposób obsługi WebExtensions.
- Temporary add-on znika po restarcie Firefoksa, więc ten tryb nie nadaje się jako wygodna dystrybucja dla nietechnicznych użytkowników.

## Proponowana Kolejność Commitów

1. `Add MVP stabilization phase to roadmap`
2. `Add project metadata`
3. `Add extension icons`
4. `Add web-ext validation notes`
5. `Add English language support`
6. `Harden Facebook and Messenger composer detection`
7. `Document manual test scenarios`
8. `Improve popup status and countdown UX`
9. `Document release and signing strategy`

Uwaga: `Harden Facebook and Messenger composer detection` jest celowo przed `Document manual test scenarios`, bo finalne scenariusze testowe zależą od tego, jak ustabilizujemy wykrywanie pól pisania i przycisków wysyłania.

## Otwarte Decyzje

- Licencja: rekomendowane MIT, bo projekt ma być prosty do udostępniania znajomym oraz prywatnego i niekomercyjnego użycia. Brak licencji oznacza domyślnie "all rights reserved", co może utrudniać ponowne użycie nawet w małym projekcie hobbystycznym.
- Czy dodawać `package.json` tylko dla `web-ext`, czy zostawić projekt bez Node tooling.
- Rekomendowane: dodać szybki `Force Blocking Mode` / `Tryb testowy blokady` w popupie, żeby można było testować blokowanie bez czekania na skonfigurowane okno nocne.

## Future Ideas

Ta sekcja nie jest częścią aktywnej roadmapy. To tylko parking dla pomysłów, które mogą się kiedyś przydać, ale nie są obiecane ani zaplanowane do najbliższej pracy.

- Wsparcie dla Chrome.
- Wsparcie dla Edge.
- Desktop / tray application.
- Lokalne statystyki użycia.
- Osobne harmonogramy dla dni roboczych i weekendów.
- Osobne reguły dla Facebooka i Messengera.
- Dodatkowe komunikaty motywacyjne.
- Bardziej rozbudowany tryb testowy.
- Dodatkowe języki (DE, ES, FR itd.).
