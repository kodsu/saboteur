const _ = require ('lodash')

// Plansza:
// 0 <= x <= 6, 0 <= y <= 10;
// Gracze (blokady):
// 20 <= x <= 49
// Karty:
// E__ to te dotykajace planszy
// B__ to te dotykajace graczy
// F00 to puste pole
// R00 to odwrocone karty

// 'karty' po inicie staje sie stosem kart do dobrania
let karty = []
// 'gracze' informuje o rolach poszczegolnych graczy
// przyda sie do podliczania punktow po kazdej rundzie
let gracze = []
// aktualne rece graczy
let rece = []
// 'plansza' jest 7x11 i kladzie sie na nia karty tuneli
let plansza = []
// 'zloto' to stos kart wynagrodzenia uzywany na koniec rundy
let zloto = []
// tablica blokad kazdego gracza (n-ty gracz ma pola 3*(n-1), 3*(n-1)+1, 3*(n-1)+2)
// kolejnosc: kilof, latarnia, wozek
let blokady = []
// suma punktow uzyskana po kazdej turze przez kazdego gracza
let wyniki = []
// zakryte karty - osobno, bo ich nie wyswietlamy
let skarby = []
// licznik czyja tura
let kto=0
let ile=0

// do DFSa
let vstd = []
// mapa do sprawdzania spojnosci kafelkow
let tunele = {"S01": [1,1,1,1,1],"S02": [0,1,1,0,1],"S03": [0,0,1,1,1],"S04": [1,1,1,1,1],"E03": [1,0,1,0,1],"E04": [1,1,1,0,1],"E05": [1,1,1,1,1],"E06": [0,1,1,0,1],"E07": [0,0,1,1,1],"E08": [0,0,1,0,0],"E09": [1,0,1,1,0],"E10": [1,1,1,1,0],"E11": [0,1,1,0,0],"E12": [0,0,1,1,0],"E13": [0,0,0,1,0],"E14": [1,1,0,1,1],"E15": [0,1,0,1,1],"E16": [1,0,1,0,0],"E17": [1,1,0,1,0],"E18": [0,1,0,1,0],"E24": [1,0,1,1,1],"E26": [1,0,0,1,1],"E27": [1,1,0,0,1],"E28": [1,0,0,0,0],"E29": [1,1,1,0,0],"E31": [1,0,0,1,0],"E32": [1,1,0,0,0],"E33": [0,1,0,0,0],"E34": [0,1,1,1,1],"E37": [0,1,1,1,0],"S22": [1,0,0,1],"S23": [1,1,0,0,1]}

// przygotowanie planszy (polozenie karty startowej, kamieni, zlota)
function przygotowanie_planszy()
{
    for (let i=0;i<7;i++)
    {
        let wiersz = []
        for (let j=0;j<11;j++)
        {
            wiersz.push("F00")
        }
        plansza.push(wiersz)
    }
    plansza[3][1]="S04"
    plansza[1][9]="R00"
    plansza[3][9]="R00"
    plansza[5][9]="R00"
    skarby=["S01","S02","S03"]
    skarby=_.shuffle(skarby)
}

// potasowanie kart na start
function tasowanie_kart()
{
    for (let i=0;i<6;i++)
    {
        karty.push("E01")
    }
    for (let i=0;i<3;i++)
    {
        karty.push("E02")
    }
    for (let i=0;i<4;i++)
    {
        karty.push("E03")
    }
    for (let i=0;i<5;i++)
    {
        karty.push("E04")
    }
    for (let i=0;i<5;i++)
    {
        karty.push("E05")
    }
    for (let i=0;i<4;i++)
    {
        karty.push("E06")
    }
    for (let i=0;i<5;i++)
    {
        karty.push("E07")
    }
    karty.push("E08")
    karty.push("E09")
    karty.push("E10")
    karty.push("E11")
    karty.push("E12")
    karty.push("E13")
    for (let i=0;i<5;i++)
    {
        karty.push("E14")
    }
    for (let i=0;i<3;i++)
    {
        karty.push("E15")
    }
    karty.push("E16")
    karty.push("E17")
    karty.push("E18")
    for (let i=0;i<3;i++)
    {
        karty.push("B01")
    }
    for (let i=0;i<3;i++)
    {
        karty.push("B02")
    }
    for (let i=0;i<3;i++)
    {
        karty.push("B03")
    }
    for (let i=0;i<2;i++)
    {
        karty.push("B04")
    }
    for (let i=0;i<2;i++)
    {
        karty.push("B05")
    }
    for (let i=0;i<2;i++)
    {
        karty.push("B06")
    }
    karty.push("B07")
    karty.push("B08")
    karty.push("B09")
    karty=_.shuffle(karty)
}

// rozdanie kart (rozdane znikaja ze stosu)
function rozdawanie_kart()
{
    let d=0
    if (ile<=5)
    {
        d=6
    }
    else if (ile<=7)
    {
        d=5
    }
    else
    {
        d=4
    }
    for (let i=0;i<ile;i++)
    {
        let reka = []
        for (let j=0;j<d;j++)
        {
            reka.push(karty.pop())
        }
        rece.push(reka)
    }
    return rece
}

// potasowanie i rozdanie rol na start
function role()
{
    if (ile==3)
    {
        gracze.push("M02")
        for (let i=0;i<3;i++)
        {
            gracze.push("M01")
        }
    }
    else if (ile==4)
    {
        gracze.push("M02")
        for (let i=0;i<4;i++)
        {
            gracze.push("M01")
        }
    }
    else if (ile==5)
    {
        for (let i=0;i<2;i++)
        {
            gracze.push("M02")
        }
        for (let i=0;i<4;i++)
        {
            gracze.push("M01")
        }
    }
    else if (ile==6)
    {
        for (let i=0;i<2;i++)
        {
            gracze.push("M02")
        }
        for (let i=0;i<5;i++)
        {
            gracze.push("M01")
        }
    }
    else if (ile==7)
    {
        for (let i=0;i<3;i++)
        {
            gracze.push("M02")
        }
        for (let i=0;i<5;i++)
        {
            gracze.push("M01")
        }
    }
    else if (ile==8)
    {
        for (let i=0;i<3;i++)
        {
            gracze.push("M02")
        }
        for (let i=0;i<6;i++)
        {
            gracze.push("M01")
        }
    }
    else if (ile==9)
    {
        for (let i=0;i<3;i++)
        {
            gracze.push("M02")
        }
        for (let i=0;i<7;i++)
        {
            gracze.push("M01")
        }
    }
    else
    {
        for (let i=0;i<4;i++)
        {
            gracze.push("M02")
        }
        for (let i=0;i<7;i++)
        {
            gracze.push("M01")
        }
    }
    gracze=_.shuffle(gracze)
    gracze.pop()
    return gracze
}

function tasowanie_zlota()
{
    for (let i=0;i<16;i++)
    {
        zloto.push("G01")
    }
    for (let i=0;i<8;i++)
    {
        zloto.push("G02")
    }
    for (let i=0;i<4;i++)
    {
        zloto.push("G03")
    }
    zloto=_.shuffle(zloto)
}

// wyzerowanie blokad nalozonych na graczy
function ustaw_blokady()
{
    for (let i=0;i<3*ile;i++)
    {
        blokady.push(0)
    }
}

// restartowanie planszy miedzy turami
function reset()
{
    karty = []
    gracze = []
    plansza = []
    blokady = []
    rece = []
} 

// sprawdzanie spojnosci planszy
function DFS(x,y,fst)
{
    vstd[x][y]=1
    if (fst==1||tunele[plansza[x][y]][4]==1)
    {
        if (y<10 && plansza[x][y+1] in tunele)
        {
            if (tunele[plansza[x][y]][1]==1)
            {
                DFS(x,y+1,0)
            }
        }
        if (y>0 && plansza[x][y-1] in tunele)
        {
            if (tunele[plansza[x][y]][3]==1)
            {
                DFS(x,y-1,0)
            }
        }
        if (x<6 && plansza[x+1][y] in tunele)
        {
            if (tunele[plansza[x][y]][0]==1)
            {
                DFS(x+1,y,0)
            }
        }
        if (x>0 && plansza[x-1][y] in tunele)
        {
            if (tunele[plansza[x][y]][2]==1)
            {
                DFS(x-1,y,0)
            }
        }
    }
}

// obsluga karty mapa
function mapa(x,y)
{
    if ((x==1||x==3||x==5)&&y==9)
    {
        if (x==1)
        {
            return skarby[0]
        }
        if (x==3)
        {
            return skarby[1]
        }
        return skarby[2]
    }
    return "Możesz użyć mapy wyłącznie na podświetlonych polach."
}

// obsluga karty rozwal tunel
function rozwal_tunel(x,y)
{
    if (plansza[x][y][0]=='E')
    {
        plansza[x][y]="F00"
        return plansza
    }
    return "Możesz wyburzyć jedynie tunel. Nie może to być tunel startowy."
}

// obsluga akcji odblokuj
function odblokuj(x,numer)
{
    if (x<20)
    {
        return "Zagrywając tę kartę kliknij na gracza, a nie na planszę."
    }
    if ((numer<=6&&(numer+2)%3!=(x-20)%3)||(numer==7&&(x-20)%3==2)||(numer==8&&(x-20)%3==1)||(numer==9&&(x-20)%3==0))
    {
        return "Typ odblokowania musi być zgodny z typem blokady"
    }
    if (blokady[x-20]==0)
    {
        return "Nie możesz odblokować czegoś, co nie jest zablokowane."
    }
    blokady[x-20]=0
    return [(x-20)/3,[blokady[(x-20)/3],blokady[(x-20)/3+1],blokady[(x-20)/3+2]]]
}

// obsluga akcji zablokuj
function zablokuj(x,numer)
{
    if (x<20)
    {
        return "Zagrywając tę kartę kliknij na gracza, a nie na planszę."
    }
    if (blokady[(x-20)*3+(numer+2)%3]==0)
    {
        return "Nie możesz zablokować czegoś, co jest już zablokowane."
    }
    blokady[(x-20)*3+(numer+2)%3]=1
    return [(x-20),[blokady[(x-20)*3],blokady[(x-20)*3+1],blokady[(x-20)*3+2]]]
}

// obsluga akcji doloz tunel
function doloz_tunel(x,y,karta,czy)
{
    if (plansza[x][y][0]!='F')
    {
        return "Tunele można dokładać jedynie na pustych polach."
    }
    if ((y<10 && plansza[x][y+1] in tunele && tunele[plansza[x][y+1]][3]!=tunele[plansza[x][y]][1])||(y>0 && plansza[x][y-1] in tunele && tunele[plansza[x][y-1]][1]!=tunele[plansza[x][y]][3])||(x<6 && plansza[x+1][y] in tunele && tunele[plansza[x+1][y]][2]!=tunele[plansza[x][y]][0])||(x>0 && plansza[x-1][y] in tunele && tunele[plansza[x-1][y]][0]!=tunele[plansza[x][y]][2]))
    {
        return "Tunel musi pasować do sąsiednich tuneli."
    }
    vstd = []
    for (let i=0;i<7;i++)
    {
        let wiersz = []
        for (let j=0;j<11;j++)
        {
            wiersz.push(0)
        }
        vstd.push(wiersz)
    }
    if (czy==1 && ("E"+String(Number((karta[1])*10+karta[2]+20))) in tunele)
    {
        karta="E"+String(Number((karta[1])*10+karta[2]+20))
    }
    plansza[x][y]=karta
    DFS(x,y,1)
    if (vstd[3][1]==0)
    {
        plansza[x][y]="F00"
        return "Musi istnieć ścieżka między tunelami nowym oraz startowym."
    }
    if (tunele[plansza[x][y]][4]==1)
    {
        if ((x==0&&y==9&&tunele[plansza[x][y]][2]==1)||(x==1&&y==10&&tunele[plansza[x][y]][3]==1)||(x==2&&y==9&&tunele[plansza[x][y]][0]==1)||(x==1&&y==8&&tunele[plansza[x][y]][1]==1))
        {
            if (skarby[0]=="S01")
            {
                plansza[1][9]="S01"
            }
            else if (skarby[0]=="S02")
            {
                if (((plansza[0][9][0]!='F'&&tunele[plansza[0][9]][2]==1)||(plansza[1][10][0]!='F'&&tunele[plansza[1][10]][3]==0)||(plansza[2][9][0]!='F'&&tunele[plansza[2][9]][2]==0)||(plansza[1][8][0]!='F'&&tunele[plansza[1][8]][1]==1))&&((plansza[0][9][0]=='F'||tunele[plansza[0][9]][2]==1)||(plansza[1][10][0]=='F'||tunele[plansza[1][10]][3]==0)||(plansza[2][9][0]=='F'||tunele[plansza[2][9]][2]==0)||(plansza[1][8][0]=='F'||tunele[plansza[1][8]][1]==1)))
                {
                    plansza[1][9]="S22"
                }
                else
                {
                    plansza[1][9]="S02"
                }
            }
            else
            {
                if (((plansza[0][9][0]!='F'&&tunele[plansza[0][9]][2]==1)||(plansza[1][10][0]!='F'&&tunele[plansza[1][10]][3]==1)||(plansza[2][9][0]!='F'&&tunele[plansza[2][9]][2]==0)||(plansza[1][8][0]!='F'&&tunele[plansza[1][8]][1]==0))&&((plansza[0][9][0]=='F'||tunele[plansza[0][9]][2]==1)||(plansza[1][10][0]=='F'||tunele[plansza[1][10]][3]==1)||(plansza[2][9][0]=='F'||tunele[plansza[2][9]][2]==0)||(plansza[1][8][0]=='F'||tunele[plansza[1][8]][1]==0)))
                {
                    plansza[1][9]="S23"
                }
                else
                {
                    plansza[1][9]="S03"
                }
            }
        }
        else if ((x==2&&y==9&&tunele[plansza[x][y]][2]==1)||(x==3&&y==10&&tunele[plansza[x][y]][3]==1)||(x==4&&y==9&&tunele[plansza[x][y]][0]==1)||(x==3&&y==8&&tunele[plansza[x][y]][1]==1))
        {
            if (skarby[1]=="S01")
            {
                plansza[3][9]="S01"
            }
            else if (skarby[1]=="S02")
            {
                if (((plansza[2][9][0]!='F'&&tunele[plansza[2][9]][2]==1)||(plansza[3][10][0]!='F'&&tunele[plansza[3][10]][3]==0)||(plansza[4][9][0]!='F'&&tunele[plansza[4][9]][2]==0)||(plansza[3][8][0]!='F'&&tunele[plansza[3][8]][1]==1))&&((plansza[2][9][0]=='F'||tunele[plansza[2][9]][2]==1)||(plansza[3][10][0]=='F'||tunele[plansza[3][10]][3]==0)||(plansza[4][9][0]=='F'||tunele[plansza[4][9]][2]==0)||(plansza[3][8][0]=='F'||tunele[plansza[3][8]][1]==1)))
                {
                    plansza[3][9]="S22"
                }
                else
                {
                    plansza[3][9]="S02"
                }
            }
            else
            {
                if (((plansza[2][9][0]!='F'&&tunele[plansza[2][9]][2]==1)||(plansza[3][10][0]!='F'&&tunele[plansza[3][10]][3]==1)||(plansza[4][9][0]!='F'&&tunele[plansza[4][9]][2]==0)||(plansza[3][8][0]!='F'&&tunele[plansza[3][8]][1]==0))&&((plansza[2][9][0]=='F'||tunele[plansza[2][9]][2]==1)||(plansza[3][10][0]=='F'||tunele[plansza[3][10]][3]==1)||(plansza[4][9][0]=='F'||tunele[plansza[4][9]][2]==0)||(plansza[3][8][0]=='F'||tunele[plansza[3][8]][1]==0)))
                {
                    plansza[3][9]="S23"
                }
                else
                {
                    plansza[3][9]="S03"
                }
            }
        }
        else if ((x==4&&y==9&&tunele[plansza[x][y]][2]==1)||(x==5&&y==10&&tunele[plansza[x][y]][3]==1)||(x==6&&y==9&&tunele[plansza[x][y]][0]==1)||(x==5&&y==8&&tunele[plansza[x][y]][1]==1))
        {
            if (skarby[2]=="S01")
            {
                plansza[5][9]="S01"
            }
            else if (skarby[2]=="S02")
            {
                if (((plansza[4][9][0]!='F'&&tunele[plansza[4][9]][2]==1)||(plansza[5][10][0]!='F'&&tunele[plansza[5][10]][3]==0)||(plansza[6][9][0]!='F'&&tunele[plansza[6][9]][2]==0)||(plansza[5][8][0]!='F'&&tunele[plansza[5][8]][1]==1))&&((plansza[4][9][0]=='F'||tunele[plansza[4][9]][2]==1)||(plansza[5][10][0]=='F'||tunele[plansza[5][10]][3]==0)||(plansza[6][9][0]=='F'||tunele[plansza[6][9]][2]==0)||(plansza[5][8][0]=='F'||tunele[plansza[5][8]][1]==1)))
                {
                    plansza[5][9]="S22"
                }
                else
                {
                    plansza[5][9]="S02"
                }
            }
            else
            {
                if (((plansza[4][9][0]!='F'&&tunele[plansza[4][9]][2]==1)||(plansza[5][10][0]!='F'&&tunele[plansza[5][10]][3]==1)||(plansza[6][9][0]!='F'&&tunele[plansza[6][9]][2]==0)||(plansza[5][8][0]!='F'&&tunele[plansza[5][8]][1]==0))&&((plansza[4][9][0]=='F'||tunele[plansza[4][9]][2]==1)||(plansza[5][10][0]=='F'||tunele[plansza[5][10]][3]==1)||(plansza[6][9][0]=='F'||tunele[plansza[6][9]][2]==0)||(plansza[5][8][0]=='F'||tunele[plansza[5][8]][1]==0)))
                {
                    plansza[5][9]="S23"
                }
                else
                {
                    plansza[5][9]="S03"
                }
            }
        }
    }
    return plansza
}

// restart na poczatku tury
function init(gracze)
{
    ile=gracze
    reset()
    przygotowanie_planszy()
    tasowanie_kart()
    ustaw_blokady()
    kto=Math.floor(Math.random()*gracze)
    return [kto, plansza, rozdawanie_kart(), role()]
}

// zakonczenie gry
function koniec()
{
    kto=(kto-1)%ile
    if (plansza[1][9]=="S01"||plansza[3][9]=="S01"||plansza[5][9]=="S01")
    {
        let nagroda = []
        let licz=0
        for (let j=0;j<ile;j++)
        {
            if (gracze[j]=="M01")
            {
                licz++
            }
        }
        for (let j=0;j<licz;j++)
        {
            nagroda.push(zloto.pop())
        }
        for (let j=0;j<ile;j++)
        {
            if (gracze[(kto-j)%ile]=="M01")
            {
                // wyslanie kart do Kuby
                return nagroda
                // Kuba zwraca mi opis karty, ktora ktos wybral zebym mogla ja usunac
                wyniki[(kto-j)%ile]+=Number(feedback[2])
                nagroda=nagroda.filter(function(it){
                    return it!=feedback
                })
            }
            kto=(kto-1)%ile
        }
    }
    else
    {
        let licz=0
        for (let j=0;j<ile;j++)
        {
            if (gracze[j]=="M02")
            {
                licz++
            }
        }
        for (let j=0;j<ile;j++)
        {
            if (gracze[j]=="M02")
            {
                if (licz==1)
                {
                    wyniki[j]+=4
                }
                else if (licz==4)
                {
                    wyniki[j]+=2
                }
                else
                {
                    wyniki[j]+=3
                }
            }
        }
    }
    return wyniki
}

// obsluga wykonywanych ruchow
function ruch(x,y,karta,czy,kto)
{
    if (x!=-1)
    {
        if (karta=="E01")
        {
            mapa(x,y)
        }
        else if (karta=="E02")
        {
            rozwal_tunel(x,y)
        }
        else if (karta[0]=='E')
        {
            doloz_tunel(x,y,karta,czy)
        }
        else if (karta[0]=='B'&&Number(karta[2])<4)
        {
            zablokuj(x,Number(Number(karta[1])*10+Number(karta[2])))
        }
        else (karta[0]=='B')
        {
            odblokuj(x,Number(Number(karta[1])*10+Number(karta[2])))
        }
    }
    if (karty.length>0)
    {
        for (let j=0;j<rece[kto].length;j++)
        {
            if (rece[kto][j]==karta)
            {
                rece[kto][j]=karty.pop()
                kto=(kto+1)%ile
                return [kto, plansza, rece[kto]]
            }
        }
    }
    rece[kto]=rece[kto].filter(function(it){
        return it!=karta
    })
    kto=(kto+1)%ile
    return [kto, plansza, rece[kto]]
}

// przebieg gry
function gra(gracze,tury)
{
    tasowanie_zlota()
    for (let i=0;i<gracze;i++)
    {
        wyniki.push(0)
    }
    for (let i=0;i<tury;i++)
    {
        init(gracze)
        while (true)
        {
            // dostan info od Kuby
            ruch(x,y,karta,czy)
            if (plansza[1][9]=="S01"||plansza[3][9]=="S01"||plansza[5][9]=="S01"||rece[kto].length==0)
            {
                koniec()
                break
            }
        }
    }
}

gra(10)
console.log(skarby)
