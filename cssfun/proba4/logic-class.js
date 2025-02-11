class GameSupervisor {
  constructor() {
    this._ = require("lodash");

    // 'karty' po inicie staje sie stosem kart do dobrania
    this.karty = [];
    // 'gracze' informuje o rolach poszczegolnych graczy
    // przyda sie do podliczania punktow po kazdej rundzie
    this.gracze = [];
    // aktualne rece graczy
    this.rece = [];
    // 'plansza' jest 7x11 i kladzie sie na nia karty tuneli
    this.plansza = [];
    // 'zloto' to stos kart wynagrodzenia uzywany na koniec rundy
    this.zloto = [];
    // tablica blokad kazdego gracza (n-ty gracz ma pola 3*(n-1), 3*(n-1)+1, 3*(n-1)+2)
    // kolejnosc: kilof, latarnia, wozek
    this.blokady = [];
    // suma punktow uzyskana po kazdej turze przez kazdego gracza
    this.wyniki = [];
    // zakryte karty - osobno, bo ich nie wyswietlamy
    this.skarby = [];
    // licznik czyja tura
    this.kto = 0;
    this.ile = 0;

    // do DFSa
    this.vstd = [];
    // mapa do sprawdzania spojnosci kafelkow
    this.tunele = {
      "S01": [1, 1, 1, 1, 1],
      "S02": [0, 1, 1, 0, 1],
      "S03": [0, 0, 1, 1, 1],
      "S04": [1, 1, 1, 1, 1],
      "E03": [1, 0, 1, 0, 1],
      "E04": [1, 1, 1, 0, 1],
      "E05": [1, 1, 1, 1, 1],
      "E06": [0, 1, 1, 0, 1],
      "E07": [0, 0, 1, 1, 1],
      "E08": [0, 0, 1, 0, 0],
      "E09": [1, 0, 1, 1, 0],
      "E10": [1, 1, 1, 1, 0],
      "E11": [0, 1, 1, 0, 0],
      "E12": [0, 0, 1, 1, 0],
      "E13": [0, 0, 0, 1, 0],
      "E14": [1, 1, 0, 1, 1],
      "E15": [0, 1, 0, 1, 1],
      "E16": [1, 0, 1, 0, 0],
      "E17": [1, 1, 0, 1, 0],
      "E18": [0, 1, 0, 1, 0],
      "E24": [1, 0, 1, 1, 1],
      "E26": [1, 0, 0, 1, 1],
      "E27": [1, 1, 0, 0, 1],
      "E28": [1, 0, 0, 0, 0],
      "E29": [1, 1, 1, 0, 0],
      "E31": [1, 0, 0, 1, 0],
      "E32": [1, 1, 0, 0, 0],
      "E33": [0, 1, 0, 0, 0],
      "E34": [0, 1, 1, 1, 1],
      "E37": [0, 1, 1, 1, 0],
      "S22": [1, 0, 0, 1],
      "S23": [1, 1, 0, 0, 1]
    };
  }

  // przygotowanie planszy (polozenie karty startowej, kamieni, zlota)
  przygotowanie_planszy() {
    this.plansza = [];
    for (let i = 0; i < 7; i++) {
      let wiersz = [];
      for (let j = 0; j < 11; j++) {
        wiersz.push("F00");
      }
      this.plansza.push(wiersz);
    }
    this.plansza[3][1] = "S04";
    this.plansza[1][9] = "R00";
    this.plansza[3][9] = "R00";
    this.plansza[5][9] = "R00";
    this.skarby = ["S01", "S02", "S03"];
    this.skarby = this._.shuffle(this.skarby);
  }

  // potasowanie kart na start
  tasowanie_kart() {
    this.karty = [];

    for (let i = 0; i < 6; i++) {
      this.karty.push("E01");
    }
    for (let i = 0; i < 3; i++) {
      this.karty.push("E02");
    }
    for (let i = 0; i < 4; i++) {
      this.karty.push("E03");
    }
    for (let i = 0; i < 5; i++) {
      this.karty.push("E04");
    }
    for (let i = 0; i < 5; i++) {
      this.karty.push("E05");
    }
    for (let i = 0; i < 4; i++) {
      this.karty.push("E06");
    }
    for (let i = 0; i < 5; i++) {
      this.karty.push("E07");
    }

    this.karty.push("E08");
    this.karty.push("E09");
    this.karty.push("E10");
    this.karty.push("E11");
    this.karty.push("E12");
    this.karty.push("E13");

    for (let i = 0; i < 5; i++) {
      this.karty.push("E14");
    }
    for (let i = 0; i < 3; i++) {
      this.karty.push("E15");
    }
    this.karty.push("E16");
    this.karty.push("E17");
    this.karty.push("E18");

    for (let i = 0; i < 3; i++) {
      this.karty.push("B01");
    }
    for (let i = 0; i < 3; i++) {
      this.karty.push("B02");
    }
    for (let i = 0; i < 3; i++) {
      this.karty.push("B03");
    }
    for (let i = 0; i < 2; i++) {
      this.karty.push("B04");
    }
    for (let i = 0; i < 2; i++) {
      this.karty.push("B05");
    }
    for (let i = 0; i < 2; i++) {
      this.karty.push("B06");
    }
    this.karty.push("B07");
    this.karty.push("B08");
    this.karty.push("B09");

    this.karty = this._.shuffle(this.karty);
  }

  // rozdanie kart (rozdane znikaja ze stosu)
  rozdawanie_kart() {
    this.rece = [];
    let d = 0;
    if (this.ile <= 5) {
      d = 6;
    } else if (this.ile <= 7) {
      d = 5;
    } else {
      d = 4;
    }
    for (let i = 0; i < this.ile; i++) {
      let reka = [];
      for (let j = 0; j < d; j++) {
        reka.push(this.karty.pop());
      }
      this.rece.push(reka);
    }
    return this.rece;
  }

  // potasowanie i rozdanie rol na start
  role() {
    this.gracze = [];

    if (this.ile == 3) {
      this.gracze.push("M02");
      for (let i = 0; i < 3; i++) {
        this.gracze.push("M01");
      }
    } else if (this.ile == 4) {
      this.gracze.push("M02");
      for (let i = 0; i < 4; i++) {
        this.gracze.push("M01");
      }
    } else if (this.ile == 5) {
      for (let i = 0; i < 2; i++) {
        this.gracze.push("M02");
      }
      for (let i = 0; i < 4; i++) {
        this.gracze.push("M01");
      }
    } else if (this.ile == 6) {
      for (let i = 0; i < 2; i++) {
        this.gracze.push("M02");
      }
      for (let i = 0; i < 5; i++) {
        this.gracze.push("M01");
      }
    } else if (this.ile == 7) {
      for (let i = 0; i < 3; i++) {
        this.gracze.push("M02");
      }
      for (let i = 0; i < 5; i++) {
        this.gracze.push("M01");
      }
    } else if (this.ile == 8) {
      for (let i = 0; i < 3; i++) {
        this.gracze.push("M02");
      }
      for (let i = 0; i < 6; i++) {
        this.gracze.push("M01");
      }
    } else if (this.ile == 9) {
      for (let i = 0; i < 3; i++) {
        this.gracze.push("M02");
      }
      for (let i = 0; i < 7; i++) {
        this.gracze.push("M01");
      }
    } else {
      for (let i = 0; i < 4; i++) {
        this.gracze.push("M02");
      }
      for (let i = 0; i < 7; i++) {
        this.gracze.push("M01");
      }
    }

    this.gracze = this._.shuffle(this.gracze);
    // pop one off
    this.gracze.pop();
    return this.gracze;
  }

  tasowanie_zlota() {
    this.zloto = [];
    for (let i = 0; i < 16; i++) {
      this.zloto.push("G01");
    }
    for (let i = 0; i < 8; i++) {
      this.zloto.push("G02");
    }
    for (let i = 0; i < 4; i++) {
      this.zloto.push("G03");
    }
    this.zloto = this._.shuffle(this.zloto);
  }

  // wyzerowanie blokad nalozonych na graczy
  ustaw_blokady() {
    this.blokady = [];
    for (let i = 0; i < 3 * this.ile; i++) {
      this.blokady.push(0);
    }
  }

  // restartowanie planszy miedzy turami
  reset() {
    this.karty = [];
    this.gracze = [];
    this.plansza = [];
    this.blokady = [];
    this.rece = [];
  }

  // sprawdzanie spojnosci planszy
  DFS(x, y, fst) {
    this.vstd[x][y] = 1;
    // this.tunele stores arrays of connectivity
    if (fst == 1 || this.tunele[this.plansza[x][y]][4] == 1) {
      // Right
      if (y < 10 && this.plansza[x][y + 1] in this.tunele) {
        if (this.tunele[this.plansza[x][y]][1] == 1) {
          this.DFS(x, y + 1, 0);
        }
      }
      // Left
      if (y > 0 && this.plansza[x][y - 1] in this.tunele) {
        if (this.tunele[this.plansza[x][y]][3] == 1) {
          this.DFS(x, y - 1, 0);
        }
      }
      // Down
      if (x < 6 && this.plansza[x + 1][y] in this.tunele) {
        if (this.tunele[this.plansza[x][y]][0] == 1) {
          this.DFS(x + 1, y, 0);
        }
      }
      // Up
      if (x > 0 && this.plansza[x - 1][y] in this.tunele) {
        if (this.tunele[this.plansza[x][y]][2] == 1) {
          this.DFS(x - 1, y, 0);
        }
      }
    }
  }

  // obsluga karty mapa
  mapa(x, y) {
    if ((x == 1 || x == 3 || x == 5) && y == 9) {
      if (x == 1) {
        return this.skarby[0];
      }
      if (x == 3) {
        return this.skarby[1];
      }
      return this.skarby[2];
    }
    return "Możesz użyć mapy wyłącznie na podświetlonych polach.";
  }

  // obsluga karty rozwal tunel
  rozwal_tunel(x, y) {
    if (this.plansza[x][y][0] == "E") {
      this.plansza[x][y] = "F00";
      return this.plansza;
    }
    return "Możesz wyburzyć jedynie tunel. Nie może to być tunel startowy.";
  }

  // obsluga akcji odblokuj
  odblokuj(x, numer) {
    if (x < 20) {
      return "Zagrywając tę kartę kliknij na gracza, a nie na planszę.";
    }
    if (
      (numer <= 6 && (numer + 2) % 3 != (x - 20) % 3) ||
      (numer == 7 && (x - 20) % 3 == 2) ||
      (numer == 8 && (x - 20) % 3 == 1) ||
      (numer == 9 && (x - 20) % 3 == 0)
    ) {
      return "Typ odblokowania musi być zgodny z typem blokady";
    }
    if (this.blokady[x - 20] == 0) {
      return "Nie możesz odblokować czegoś, co nie jest zablokowane.";
    }
    this.blokady[x - 20] = 0;
    return [
      (x - 20) / 3,
      [
        this.blokady[(x - 20) / 3],
        this.blokady[(x - 20) / 3 + 1],
        this.blokady[(x - 20) / 3 + 2]
      ]
    ];
  }

  // obsluga akcji zablokuj
  zablokuj(x, numer) {
    if (x < 20) {
      return "Zagrywając tę kartę kliknij na gracza, a nie na planszę.";
    }
    // figure out the correct index in blokady
    const idx = (x - 20) * 3 + ((numer + 2) % 3);
    if (idx < 0 || idx >= this.blokady.length) {
      return "Index out of range for blokady.";
    }
    if (this.blokady[idx] == 1) {
      return "Nie możesz zablokować czegoś, co jest już zablokowane.";
    }
    this.blokady[idx] = 1;
    return [
      x - 20,
      [
        this.blokady[(x - 20) * 3],
        this.blokady[(x - 20) * 3 + 1],
        this.blokady[(x - 20) * 3 + 2]
      ]
    ];
  }

  // obsluga akcji doloz tunel
  doloz_tunel(x, y, karta, czy) {
    if (this.plansza[x][y][0] != "F") {
      return "Tunele można dokładać jedynie na pustych polach.";
    }
    const tile = this.plansza[x][y];
    // check adjacency consistency
    if (
      (y < 10 &&
        this.plansza[x][y + 1] in this.tunele &&
        this.tunele[this.plansza[x][y + 1]][3] != this.tunele[tile][1]) ||
      (y > 0 &&
        this.plansza[x][y - 1] in this.tunele &&
        this.tunele[this.plansza[x][y - 1]][1] != this.tunele[tile][3]) ||
      (x < 6 &&
        this.plansza[x + 1][y] in this.tunele &&
        this.tunele[this.plansza[x + 1][y]][2] != this.tunele[tile][0]) ||
      (x > 0 &&
        this.plansza[x - 1][y] in this.tunele &&
        this.tunele[this.plansza[x - 1][y]][0] != this.tunele[tile][2])
    ) {
      return "Tunel musi pasować do sąsiednich tuneli.";
    }
    this.vstd = [];
    for (let i = 0; i < 7; i++) {
      let wiersz = [];
      for (let j = 0; j < 11; j++) {
        wiersz.push(0);
      }
      this.vstd.push(wiersz);
    }
    if (czy == 1) {
      const potential = "E" + String(Number(karta[1] * 10 + karta[2] + 20));
      if (potential in this.tunele) {
        karta = potential;
      }
    }
    this.plansza[x][y] = karta;
    this.DFS(x, y, 1);
    // check if connected to the start
    if (this.vstd[3][1] == 0) {
      this.plansza[x][y] = "F00";
      return "Musi istnieć ścieżka między tunelami nowym oraz startowym.";
    }
    // if it's a potential gold tile
    if (this.tunele[this.plansza[x][y]][4] == 1) {
      // Possibly reveal one of the skarby if correct adjacency
      // first "S01"
      if (
        (x == 0 && y == 9 && this.tunele[this.plansza[x][y]][2] == 1) ||
        (x == 1 && y == 10 && this.tunele[this.plansza[x][y]][3] == 1) ||
        (x == 2 && y == 9 && this.tunele[this.plansza[x][y]][0] == 1) ||
        (x == 1 && y == 8 && this.tunele[this.plansza[x][y]][1] == 1)
      ) {
        this.revealSkarb(0, [1, 9]);
      } else if (
        (x == 2 && y == 9 && this.tunele[this.plansza[x][y]][2] == 1) ||
        (x == 3 && y == 10 && this.tunele[this.plansza[x][y]][3] == 1) ||
        (x == 4 && y == 9 && this.tunele[this.plansza[x][y]][0] == 1) ||
        (x == 3 && y == 8 && this.tunele[this.plansza[x][y]][1] == 1)
      ) {
        this.revealSkarb(1, [3, 9]);
      } else if (
        (x == 4 && y == 9 && this.tunele[this.plansza[x][y]][2] == 1) ||
        (x == 5 && y == 10 && this.tunele[this.plansza[x][y]][3] == 1) ||
        (x == 6 && y == 9 && this.tunele[this.plansza[x][y]][0] == 1) ||
        (x == 5 && y == 8 && this.tunele[this.plansza[x][y]][1] == 1)
      ) {
        this.revealSkarb(2, [5, 9]);
      }
    }
    return this.plansza;
  }

  // Helper for revealing a skarb on the field
  revealSkarb(index, position) {
    let [px, py] = position;
    if (this.skarby[index] == "S01") {
      this.plansza[px][py] = "S01";
    } else if (this.skarby[index] == "S02") {
      // If statement from original code
      if (
        ((this.plansza[0][9][0] != "F" &&
          this.tunele[this.plansza[0][9]][2] == 1) ||
          (this.plansza[1][10][0] != "F" &&
            this.tunele[this.plansza[1][10]][3] == 0) ||
          (this.plansza[2][9][0] != "F" &&
            this.tunele[this.plansza[2][9]][2] == 0) ||
          (this.plansza[1][8][0] != "F" &&
            this.tunele[this.plansza[1][8]][1] == 1)) &&
        ((this.plansza[0][9][0] == "F" ||
          this.tunele[this.plansza[0][9]][2] == 1) ||
          (this.plansza[1][10][0] == "F" ||
            this.tunele[this.plansza[1][10]][3] == 0) ||
          (this.plansza[2][9][0] == "F" ||
            this.tunele[this.plansza[2][9]][2] == 0) ||
          (this.plansza[1][8][0] == "F" ||
            this.tunele[this.plansza[1][8]][1] == 1))
      ) {
        this.plansza[px][py] = "S22";
      } else {
        this.plansza[px][py] = "S02";
      }
    } else {
      if (
        ((this.plansza[0][9][0] != "F" &&
          this.tunele[this.plansza[0][9]][2] == 1) ||
          (this.plansza[1][10][0] != "F" &&
            this.tunele[this.plansza[1][10]][3] == 1) ||
          (this.plansza[2][9][0] != "F" &&
            this.tunele[this.plansza[2][9]][2] == 0) ||
          (this.plansza[1][8][0] != "F" &&
            this.tunele[this.plansza[1][8]][1] == 0)) &&
        ((this.plansza[0][9][0] == "F" ||
          this.tunele[this.plansza[0][9]][2] == 1) ||
          (this.plansza[1][10][0] == "F" ||
            this.tunele[this.plansza[1][10]][3] == 1) ||
          (this.plansza[2][9][0] == "F" ||
            this.tunele[this.plansza[2][9]][2] == 0) ||
          (this.plansza[1][8][0] == "F" ||
            this.tunele[this.plansza[1][8]][1] == 0))
      ) {
        this.plansza[px][py] = "S23";
      } else {
        this.plansza[px][py] = "S03";
      }
    }
  }

  // restart na poczatku tury
  init(graczeQty) {
    this.ile = graczeQty;
    this.reset(); // sets everything to default arrays
    this.przygotowanie_planszy();
    this.tasowanie_kart();
    this.ustaw_blokady();
    this.kto = Math.floor(Math.random() * graczeQty);
    const rozdane = this.rozdawanie_kart();
    const roles = this.role();
    return [this.kto, this.plansza, rozdane, roles];
  }

  // zakonczenie gry
  koniec() {
    this.kto = (this.kto - 1) % this.ile;
    if (
      this.plansza[1][9] == "S01" ||
      this.plansza[3][9] == "S01" ||
      this.plansza[5][9] == "S01"
    ) {
      let nagroda = [];
      let licz = 0;
      for (let j = 0; j < this.ile; j++) {
        if (this.gracze[j] == "M01") {
          licz++;
        }
      }
      for (let j = 0; j < licz; j++) {
        nagroda.push(this.zloto.pop());
      }
      for (let j = 0; j < this.ile; j++) {
        if (this.gracze[(this.kto - j) % this.ile] == "M01") {
          // wyslanie kart do Kuby
          return nagroda;
          // Kuba zwraca mi opis karty, ktora ktos wybral zebym mogla ja usunac
          // e.g. this.wyniki[(this.kto-j)%this.ile]+=Number(feedback[2])
          // and so on...
        }
        this.kto = (this.kto - 1) % this.ile;
      }
    } else {
      let licz = 0;
      for (let j = 0; j < this.ile; j++) {
        if (this.gracze[j] == "M02") {
          licz++;
        }
      }
      for (let j = 0; j < this.ile; j++) {
        if (this.gracze[j] == "M02") {
          if (licz == 1) {
            this.wyniki[j] += 4;
          } else if (licz == 4) {
            this.wyniki[j] += 2;
          } else {
            this.wyniki[j] += 3;
          }
        }
      }
    }
    return this.wyniki;
  }

  // obsluga wykonywanych ruchow
  ruch(x, y, karta, czy, graczNaRuchu) {
    // if x!=-1, we perform card-based action
    if (x != -1) {
      if (karta == "E01") {
        this.mapa(x, y);
      } else if (karta == "E02") {
        this.rozwal_tunel(x, y);
      } else if (karta[0] == "E") {
        this.doloz_tunel(x, y, karta, czy);
      } else if (karta[0] == "B" && Number(karta[2]) < 4) {
        // block
        this.zablokuj(x, Number(Number(karta[1]) * 10 + Number(karta[2])));
      } else if (karta[0] == "B") {
        // unblock
        this.odblokuj(x, Number(Number(karta[1]) * 10 + Number(karta[2])));
      }
    }
    // if the deck still has cards, replace the used card
    if (this.karty.length > 0) {
      for (let j = 0; j < this.rece[graczNaRuchu].length; j++) {
        if (this.rece[graczNaRuchu][j] == karta) {
          this.rece[graczNaRuchu][j] = this.karty.pop();
          this.kto = (this.kto + 1) % this.ile;
          return [this.kto, this.plansza, this.rece[this.kto]];
        }
      }
    }
    // otherwise, just remove it from player's hand
    this.rece[graczNaRuchu] = this.rece[graczNaRuchu].filter((it) => it != karta);
    this.kto = (this.kto + 1) % this.ile;
    return [this.kto, this.plansza, this.rece[this.kto]];
  }

  // przebieg gry
  init_game(graczeQty, tury) {
    this.zloto = [];
    this.wyniki = [];
    this.tasowanie_zlota();
    for (let i = 0; i < graczeQty; i++) {
      this.wyniki.push(0);
    }
  }

  check_end() {
    return (
      this.plansza[1][9] == "S01" ||
      this.plansza[3][9] == "S01" ||
      this.plansza[5][9] == "S01" ||
      this.rece[this.kto].length == 0
    )
  }
}

module.exports = GameSupervisor;

// -------------------------------
// Example usage (uncomment to run):
// const supervisor = new GameSupervisor();
// supervisor.gra(10, 1);
// console.log(supervisor.skarby);
