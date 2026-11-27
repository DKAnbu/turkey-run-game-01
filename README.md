# Gobble's Great Escape: The Thanksgiving Run

[![make.fun · turkey-run-game-01](https://make.fun/badge/turkey-run-game-01.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![rank](https://make.fun/badge/turkey-run-game-01/DKAnbu/turkey-run-game-01/rank.svg)](https://make.fun/bounty/turkey-run-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![reward](https://make.fun/badge/turkey-run-game-01/DKAnbu/turkey-run-game-01/reward.svg)](https://make.fun/bounty/turkey-run-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)

**Gobble's Great Escape** adalah game arkade side-scrolling runner bertema Thanksgiving yang dibangun dengan HTML5 Canvas dan Web Audio API mandiri. Pemain mengendalikan Gobble si kalkun cerdas yang berusaha melarikan diri dari takdir makan malam Thanksgiving melintasi 3 zona menegangkan: **Farmyard Frenzy** (dikejar Farmer John bergarpu rumput), **Cornfield Labyrinth** (dikejar anjing pelacak lincah), dan **The Fiery Kitchen** (dikejar Chef Pierre dengan pisau koki raksasa).

Game ini dibangun secara mandiri tanpa aset gambar atau suara eksternal (zero external dependencies). Seluruh visual digambar secara prosedural dengan Canvas 2D API dan seluruh efek suara (suara gobble, kepakan sayap flutter, loncatan, dash boost, collect corn, dan fanfare kemenangan) disintesis secara real-time melalui Web Audio API synthesizer.

## Fitur Utama

- **3 Stage Berkarakter & Menantang**:
  - *Stage 1: Farmyard Frenzy* — Latar peternakan lumbung merah, pagar kayu, rintangan labu, tumpukan jerami, dan kejaran Farmer John.
  - *Stage 2: Cornfield Labyrinth* — Labirin jagung tinggi, orang-orangan sawah, jebakan tanah, dan anjing pelacak cepat.
  - *Stage 3: The Fiery Kitchen* — Dapur restoran panas penuh rak panci, parutan api oven, golok berputar di udara, dan kejaran sengit Chef Pierre.
- **Mekanika Gerak Kaya & Responsif**:
  - *Lari Cepat & Duck / Slide*: Meluncur di bawah pisau dan rintangan tinggi.
  - *Double Jump & Flutter*: Sayap kalkun mengepak untuk memperpanjang waktu melayang di udara.
  - *Dash Boost*: Akselerasi kilat untuk memperlebar jarak dari pengejar.
  - *Gobble Taunt*: Suara kalkun khas berkokok untuk menambah skor dan atmosfer seru.
- **Item Power-Up & Kolektibel**:
  - *Golden Corn Cob*: Menambah skor (+50 poin).
  - *Speed Pepper Seed*: Memberikan dorongan kecepatan instan.
  - *Camouflage Bush*: Menyamar sebagai semak hijau agar tidak terlihat oleh pengejar selama beberapa detik.
- **Sintesis Suara Web Audio Mandiri**: 7 jenis efek audio sintetis dinamis tanpa file audio eksternal (kompatibel penuh dengan browser modern).
- **HUD Lengkap & Layar State**: Menampilkan nyawa (lives), progress bar level, indikator ancaman pengejar (pursuer distance meter), stamina dash, total skor, serta layar transisi Stage Clear, Game Over, dan Victory.

## Kontrol Permainan

- **Lompat / Flutter**: Panah Atas `[↑]`, Tombol `[W]`, atau `[Space]`
- **Menunduk / Meluncur (Duck/Slide)**: Panah Bawah `[↓]` atau Tombol `[S]`
- **Dash Cepat**: Tombol `[Shift]` atau `[D]`
- **Berkokok (Gobble Taunt)**: Tombol `[G]`
- **Mulai / Lanjutkan**: `[Space]` atau `[Enter]`

## Menjalankan Permainan

Cukup buka file `game/index.html` langsung di browser web apa pun (Google Chrome, Firefox, Edge, Safari) tanpa memerlukan web server khusus, atau jalankan melalui local server:

```bash
# Menggunakan Node HTTP server sederhana atau serve.ts
node -e "const http=require('http'),fs=require('fs'),path=require('path');http.createServer((req,res)=>{const p=path.join('game',req.url==='/'?'index.html':req.url.split('?')[0]);try{res.end(fs.readFileSync(p))}catch{res.statusCode=404;res.end('Not found')}}).listen(8080,()=>console.log('http://localhost:8080'))"
```

## Membangun Dossier make.fun

Untuk memvalidasi dan mengemas dossier entri kompetisi:

```bash
MAKEFUN_OUTPUT_DIR=out node main.ts
```

Dossier akan menghasilkan berkas `out/dossier.json` bersama salinan direktori `game/` dan tangkapan layar asli di `screenshots/` sesuai standar make.fun.

## Lisensi

[MIT License](LICENSE) — Copyright (c) 2026 make.fun & Dheka.
