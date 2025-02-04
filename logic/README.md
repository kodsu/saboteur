## NAJWAŻNIEJSZE:
Plansza ma wymiary **7x11**, jest gridem który trzyma w sobie trzyliterowe stringi;
Kiedy ją zwracam do Kuby, to znaczy, że powinien ją wyświetlić w tej potencjalnie nowej formie.
Polami, które formalnie na planszy nie są, ale są na stole, są gracze (ich ikonki (?)),
a także znajdujące się przy każdym graczu 3 ikonki blokad.

### JAK DZIAŁAJĄ KARTY?

Zauważcie, że niesymetryczne karty tunelu mają swoje odpowiedniki po obrocie (+20 do numeru).  
+ Mapa (E01)  
+ Rozwal tunel (E02)  
+ Tunel poziomy (E03) ( | )  
+ Tunel T poziome (E04) ( Ͱ) --> (E24)  
+ Tunel skrzyżowanie (+)  
+ Tunel zakręt dół-prawo (E06) ( ┌) --> (E26)  
+ Tunel zakręt dół-lewo (E07) (┐ ) --> (E27)  
+ Tunel ślepa uliczka poziomo (E08) ( , ) --> (E28)  
+ Tunel trzy ślepe uliczki poziomo (E09) (-¦ ) --> (E29)  
+ Tunel cztery ślepe uliczki (E10) (-¦-)  
+ Tunel dwie ślepe uliczki dół-prawo (E11) ( ,-) --> (E31)  
+ Tunel dwie ślepe uliczki dół-lewo (E12) (-, ) --> (E32)  
+ Tunel ślepa uliczka pionowo (E13) (- ) --> (E33)  
+ Tunel T pionowe (E14) (ꓕ) --> (E34)  
+ Tunel pionowy (E15) (-)  
+ Tunel dwie ślepe uliczki poziomo (E16) ( ¦ )  
+ Tunel trzy ślepe uliczki pionowo (E17) (-'-) --> (E37)  
+ Tunel dwie ślepe uliczki pionowo (E18) (--)  
+ Zablokuj kilof (B01)  
+ Zablokuj latarnię (B02)  
+ Zablokuj wózek (B03)  
+ Odblokuj kilof (B04)  
+ Odblokuj latarnię (B05)  
+ Odblokuj wózkek (B06)
+ Odblokuj kilof i latarnię (B07)  
+ Odblokuj kilof i wózek (B08)  
+ Odblokuj latarnię i wózek (B09)  
+ Dobry krasnal (M01)  
+ Sabotażysta (M02)  
+ Pojedyncze złoto (G01)  
+ Podwójne złoto (G02)  
+ Potrójne złoto (G03)  
+ Złoto (S01)  
+ Kamien zakręt dół-prawo (S02) ( ┌) --> (S22)  
+ Kamien zakręt dół-lewo (S03) (┐ ) --> (S23)  
+ Start (S04)  
 
KARTY DUCHY (NIE MA W GRZE, POTRZEBNE DO IMPLEMENTACJI)  
+ Rewers (R00) -> do wyswietlania na polach ze skarbami  
+ Puste pole (F00) -> pole, na ktorym nie ma karty  

## JAK DZIAŁA PLANSZA?

Na starcie wszedzie lezy F00 (puste pola), z wyjatkiem trzech:
+ Na (3,1) lezy S04 (start)  
+ Na (1,9) lezy R00 (rewers) (ja mam wylosowane co tam jest tak legitnie (S01, S02 albo S03))  
+ Na (3,9) lezy R00 (rewers) (ja mam wylosowane co tam jest tak legitnie (S01, S02 albo S03))  
+ Na (5,9) lezy R00 (rewers) (ja mam wylosowane co tam jest tak legitnie (S01, S02 albo S03))    

Podczas robienia legalnych ruchow typu dodaj tunel na planszy pojawia sie nowe pola np E03, E37 itp.  
Beda tez potencjalnie znikac podczas rozwalania (zmienia sie z powrotem w F00)  

## JAK MA DZIALAC PROGRAM? (CZEGO BYM SOBIE ZYCZYLA)

Po tym segmencie bedziecie miec opis tablic i funkcji, ktorych uzywam.  
Wszystkie sprowadzaja sie do jednej, najwazniejszej funkcji - `gra`.   
Funkcja `gra (gracze, tury)` przyjmuje dwa parametry - liczbe graczy, bioracych udzial w rozgrywce oraz liczbe tur, ktore zycza sobie rozegrac
Jedyne co wystarczy zrobic to ją odpalić. Caly przebieg gry, nowe tury, punktacje policzy za nas.

**Jak to osiagnac?** 
Funkcja ma w sobie petle, ktora dla kazdej tury odpala funkcje `init()`, czyli wlasnie przygotowanie nowej tury, obejmujace reset rąk, planszy, nowe rozdania itp itd.
Ten init zwróci Kubie numer gracza startowego, planszę, ręce wszystkich graczy oraz role wszystkich graczy
Następnie chciałabym w pętli odbierać jakoś info o tym co gracz o numerze 'kto' probuje zrobic.
W tym celu potrzebuje jakos pozyskac wspolrzedne pola, na ktore ow gracz chce zagrac karte, numer tej karty oraz parametr "czy", mowiacy o tym czy on tę kartę chce odwrócić.
Mogę wtedy wywołać ruch od tych argumentow i ruch zwroci Kubie informacje kto bedzie teraz robil ruch, jaki jest stan planszy i jaka jest teraz nowa reka tego gracza co gral.
No, chyba że nie udalo sie wykonac poprawnie tego ruchu, wtedy zwracamy blad i nic sie nie dzieje innego.
-> co przyjmuje ruch?
wspolrzedne x,y -> albo te z planszy, czyli odpowiednio od 0 do 6 i od 0 do 10
albo x od 20 do 20+liczba graczy i wtedy chodzi o gracza, y nie ma znaczenia
albo x = -1 to znaczy ze zagrywamy odrzucenie karty, y nie ma znaczenia
karta -> kod karty do zagrania/odrzucenia
czy -> 0 to nie obracamy tunelu; 1 to obracamy tunel
i to wszystko jest przy zalozeniu ze gracz zrobil dobrze
jak cos sie nie zgadza, np ktos probuje odblokowac latarnie klikajac pole na planszy to wiazace jest jaka karte chce zagrac. tzn dam mu komunikat zagraj tę kartę na graczu, a nie komunikat na tym polu zagrywa się karty tuneli.
Potem jest jakis warunek konca, ze albo odkryto zloto, albo reka tego, kto wlasnie ma grac, jest pusta
Jesli on zajdzie, to wywoluje funkcje przyznajaca punkty i mozna zaczac nowa runde. 
Problem jest taki, ze ja nie moge tego zrealizowac returnami.
Na razie w tym kodzie jest ich mnostwo, ale czesc z nich to niekoniecznie powinny byc returny tylko bardziej 'wyslij do Kuby i kontynuuj'; tak samo brakuje zbierania danych od Kuby na biezaco + jakiegos czekania na nie.
No i teraz pytanie - jak to zrobic? czy uda sie to tak dostosowac, czy po prostu zrobic ten kod jako funkcje ktore robia legitne returny i Kuba sam je sobie bedzie wywolywal jak bedzie chcial?

## OPIS TABLIC:

1. `karty`:
jest permutacją wszystkich kart, ktore sie rozdaje graczom;
po rozdaniu reszta kart staje sie stosem kart do dobierania.
2. `gracze`:
jest permutacją wszystkich ról, które wezmą udział w grze;
i-ty gracz ma i-tą rolę.
3. rece:
to tablica n tablic, gdzie n to liczba graczy;
i-ta tablica to aktualna reka i-tego gracza;
przykladowo reka moze byc postaci: ["E02","B07","E01","E13","E07"]
4. `plansza`:
wspomniany wyzej grid 7x11, wypelniony stringami dlugosci 3 tak jak wyjasniono wyzej
5. `zloto`:
jest to permutacja wszystkich kart nagrody;
po kazdej turze wygranej przez kopaczy bierze sie gorne n kart z tej tablicy, gdzie n to liczba kopaczy;
reszta stosu zostaje na kolejne tury.
6. `blokady`:
tablica ktora ma 3 x liczba_graczy elementow.
pola (3*i, 3*(i+1), 3*(i+2)) opisują blokady i-tego gracza;
pole 3*i oznacza stan blokady kilofa, pole 3*(i+1) oznacza stan blokady latarni oraz 3*(i+2) oznacza stan blokady wózka;
stan blokady oznaczamy następująco: 0 jeśli blokady nie ma, 1 jeśli blokada jest
7. `wyniki`:
na starcie kazdy gracz ma wynik 0;
zdobyte przez kazdego gracza punkty na koniec kazdej tury dodaja sie do wynikow;
na koniec gry trzeba to jakos wystwietlic.
8. `skarby`:
permutacja kart "S01", "S02", "S03".
skarby[0] mowi o tym ktora z tych kart lezy na (1,9);
skarby[0] mowi o tym ktora z tych kart lezy na (3,9);
skarby[0] mowi o tym ktora z tych kart lezy na (5,9).
9. `kto`:
mowi ktory gracz ma aktualnie ruch (mozliwe wartosci od 0 do (n-1), gdzie n to liczba graczy);
ta wartosc jest losowana na poczatku kazdej tury.
10. `ile`:
ile jest graczy w grze (chyba mozna sie tego pozbyc i dac jako argument tam gdzie potrzeba).
11. `vstd`:
tablica visited potrzebna do DFSa;
przed kazdym DFSem jest zerowana.
12. `tunele`:
mapa powiazan karta-sasiedztwo.
+ pierwsza liczba oznacza istnienie odnogi w gore;
+ druga liczba oznacza istnienie odnogi w prawo;
+ trzecia liczba oznacza istnienie odnogi w dol; 
+ czwarta liczba oznacza istnienie odnogi w lewo;  
+ 0 to brak odnogi, 1 to istnienie odnogi.
+ piata liczba oznacza, czy karta ma spojny srodek (np + posiada srodek, a -¦- nie posiada i tylko to je rozni).

## OPIS FUNKCJI:
1. `przygotowanie_planszy()`
wypelnia planszę kartami "F00" i tymi startowymi;
losuje układ skarbow
1. `tasowanie_kart()`
w sposob brzydki tworzy stos wszystkich kart (moglabym zrobic mape jakas, podobnie dluga i brzydka jak mapa tunele, ale to skroci do paru linijek tego potworka)
losuje przetasowanie tych kart
1. `rozdawanie_kart()`
w zaleznosci od ilosci graczy rozdaje kazdemu z nich odpowiednio duzo kart;
sa one sciagane ze stosu.
pewnie moglaby dostac 'ile' jako parametr (to rozkmina a propos wywalenia tej zmiennej)
1. `role()`
w zaleznosci od ilosci graczy bierze odpowiedni zestaw rol, tasuje je i potem wklada do tablicy gracze
1. `tasowanie_zlota()`
tasuje stos tych kart przyznawanych jako nagrody
1. ustaw_blokady()
zeruje te blokady na graczach
1. `reset()`
po kazdej turze czysci tablice, ktore tego wymagaja
1. `DFS(x,y,fst)`
x,y to wspolrzedne pola, na ktore gracz chce dolozyc karte (na starcie), fst to parametr, ktory mowi, czy to pierwsze wywolanie.
Wiem, wyglada sus.
Generalnie, jak karta ma pusty srodek to zauwazcie, ze jesli do takiej dochodzicie, to nie ma z niej dalej przejscia. wiec o ile nie startujecie z niej to nie chcecie dorzucac jej sasiadow nigdzie.
Dlatego jak jestesmy na starcie to dorzucamy do przeszukiwania wszystkich sasiadow, a jak nie to dorzucamy ich tylko jak srodek jest niepusty. No i oczywiscie sasiad to taki ziom, co jest na sasiednim kafelku i oboje macie do siebie odnoge odpowiednią.
1. `mapa(x,y)`
podglada pole o danych wspolrzednych i zwraca jego zawartosc (jak wspolrzedne ok) wpp blad
1.  `rozwal_tunel(x,y)`
usuwa kafelek jak byl niepusty i usuwalny, wpp blad
1.  `odblokuj(x,numer)`
sprawdza, czy ktos probuje odblokowac dobry typ blokady i czy ona w ogole istnieje.
jesli git to zmienia stan blokad, wpp blad
1.  `zablokuj(x,numer)`
sprawdza, czy cos nie jest juz zablokowane
jesli git to zmienia stan blokad, wpp blad
1.  `doloz_tunel(x,y,karta,czy)`
sprawdzamy, czy pole na ktore chcemy sie dolozyc jest puste;
sprawdzamy, czy pasujemy do sasiadow (zeby brak odnogi nie właził w odnogę i odwrotnie)
sprawdzamy DFSem czy jest dojście od miejsca, w które chcemy się wrzucić do pola startowego
jesli cos nie siadlo to blad
a jak okej to sprawdzamy, czy sie dokopalismy do ktorejs z kart koncowych, odpowiednio je odkrywamy, potencjalnie z obrotem (obrot TYLKO jesli bez obrotu nie pasuje, a z nim pasuje)
odwrocone karty juz nie sa typu R00 tylko normalnie kazdy widzi np S02
1.  `init(gracze)`
reset rundy itp itd, opisane wyzej
1.  `koniec()`
sprawdzamy jaki byl warunek konca - czy dojscie do zlota, czy koniec kart.
jesli pierwsze, to dla kazdego krasnala kopacza zgodnie z ruchem wskazowek zegara poczawszy od ziomka ktory robil ruch jako ostatni ogarniamy wyswietlanie kart.
Potrzebuje zebys mu je wyswietlil Kuba (tablice nagrody), zeby on cos sobie wybral i zebys mi zwrocil,
jaka karte on wybral.
Ja to odpowiednio dodaje do wynikow, wywalam ją z puli tych nagród i reszta nagród ma być pokazana kolejnemu graczowi.
W razie sabotazystow kazdy dostaje tyle punktow ile wynika z ich liczby.
1.  `ruch(x,y,karta,czy,kto)`
jesli odrzuc karte no to wywalam mu ją z ręki bez efektu i jesli stos niepusty to dostaje nową
jesli nie jest odrzuć karte to przed tym przekierowujemy na podstawie ID karty do odpowiedniej funkcji, ktora ją obsluzy.
chciałabym, zeby returny zwracajace bledy w tych posrednich funkcjach to serio byly returny.
Mają przerywac robienie ruchu i w szczegolnosci karta ma nie znikac z reki gracza no i gracz ma sie nie zmienic (bo po dobrym ruchu robimy zmiane gracza)
1.  `gra(gracze,tury)`
opisana wyzej, tam w akapicie o tym czego ja chce od tego programu

chyba tyle na teraz
jesli chodzi o ladnosc kodu to te rzeczy ifowe zalezne od liczby graczy, ktore sa w przygotowaniu i w punktacji moge powrzucac w spreparowane mapy.
