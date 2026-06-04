# AGENTS.md

Praktyczne zasady dla agentów pracujących nad projektem Midnight Drambler.

Ten plik ma być krótki i użyteczny. Nie zastępuje `README.md` ani `ROADMAP.md`.

## Charakter Projektu

Midnight Drambler to mały hobbystyczny projekt: rozszerzenie Firefoxa, które pomaga zrobić pauzę przed nocnym pisaniem, wysyłaniem i publikowaniem na Facebooku oraz Messengerze.

Projekt nie jest produktem komercyjnym. Najważniejsze są prostota, prywatność i przewidywalne działanie.

## Źródła Prawdy

- `README.md` opisuje instalację, konfigurację i ręczne testy.
- `ROADMAP.md` jest głównym źródłem prawdy dla kolejności dalszych prac.
- `AGENTS.md` opisuje zasady pracy agentów.

Jeśli nowy pomysł nie jest częścią aktywnej roadmapy, najpierw dopisz go do `Future Ideas` albo omów z użytkownikiem. Nie implementuj go od razu.

## Prywatność

Prywatność jest twardą zasadą projektu.

Agent nie powinien dodawać funkcji, które:

- czytają treść wiadomości użytkownika,
- zapisują treść wiadomości, komentarzy lub postów,
- analizują treść pisaną przez użytkownika,
- wysyłają dane na zewnątrz,
- dodają telemetrię,
- dodają analitykę,
- dodają backend lub cloud sync.

Midnight Drambler ma blokować możliwość pisania i wysyłania w określonym czasie. Nie ma oceniać tego, co użytkownik chciał napisać.

## Zakres Techniczny

Preferowany styl implementacji:

- plain JavaScript,
- HTML,
- CSS,
- brak Reacta, Vue, Angulara i podobnych frameworków,
- brak build stepu, dopóki nie jest naprawdę potrzebny,
- brak nowych zależności bez zgody użytkownika.

Jeśli nowa zależność albo framework wydaje się przydatny, najpierw zapytaj użytkownika.

## Zmiany W Kodzie

- Nie modyfikuj kodu źródłowego, jeśli użytkownik prosi tylko o dokumentację.
- Nie zmieniaj zakresu zadania bez uzgodnienia.
- Trzymaj zmiany małe i zgodne z aktualną fazą w `ROADMAP.md`.
- Czytanie Facebooka i Messengera ma pozostać możliwe.
- Blokowanie powinno dotyczyć pisania, wysyłania i publikowania, a nie całych stron.

## Walidacja Po Zmianach

Po zmianach w kodzie uruchom przynajmniej:

```powershell
Get-Content manifest.json -Raw | ConvertFrom-Json | Out-Null
node --check content.js
node --check popup.js
```

Jeśli `web-ext` jest dostępny, uruchom także:

```powershell
web-ext lint
```

Jeśli walidacja nie może zostać uruchomiona, jasno napisz dlaczego.

## Commit I Push

Agent nie powinien sam commitować ani pushować zmian.

Najpierw pokaż użytkownikowi, co zostało zmienione, i zapytaj o zgodę na commit lub push.

Jeśli użytkownik prosi o nazwę commita, najpierw sprawdź pełen zakres zmian względem ostatniego commita. Użyj co najmniej `git status -sb` oraz diffu względem `HEAD`, a przy plikach nieśledzonych sprawdź także ich zawartość. Nazwa commita ma obejmować faktyczny zakres pracy.

Jeśli użytkownik prosi o PR albo opis PR, również najpierw sprawdź pełen zakres zmian względem ostatniego commita lub brancha bazowego. Nawet jeśli projekt zwykle działa na jednym branchu, opis PR ma wynikać z rzeczywistego diffu.

## Dokumentacja

Aktualizuj dokumentację, jeśli zmiana wpływa na:

- sposób instalacji,
- sposób konfiguracji,
- zachowanie rozszerzenia,
- manualne testy,
- roadmapę,
- zasady pracy agentów.

## UI I UX

UI ma pozostać:

- minimalistyczne,
- praktyczne,
- czytelne,
- bez rozbudowanych ekranów,
- bez ozdobników, które nie pomagają w użyciu rozszerzenia.

## Języki

Domyślnym językiem projektu jest polski.

Planowana jest angielska wersja jako osobny etap w `ROADMAP.md`. Nie planujemy ogólnej platformy wielojęzycznej. Dodatkowe języki mogą trafić do `Future Ideas`, jeśli pojawi się realna potrzeba.

## Quizy I Doprecyzowania

Jeśli trzeba zebrać decyzje od użytkownika, prowadź quizy tak:

- jedno pytanie naraz,
- najlepiej jako test wyboru,
- po odpowiedzi użytkownika dopiero kolejne pytanie,
- jeśli sugerujesz odpowiedź, krótko wyjaśnij dlaczego.

Nie wysyłaj długiej listy pytań naraz.
