'use strict';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const state = {
  page: 'home',
  learningIndex: 0,
  currentCase: 'A',
  currentFrame: 0,
  solvedActions: [],
  activeHotspot: null,
  quiz: {
    name: '',
    nim: '',
    index: 0,
    selected: null,
    answers: []
  }
};

const learningModules = [
  {
    tag: 'K3 BENGKEL',
    title: 'Pedoman keselamatan kerja mesin frais',
    short: 'Do dan Don’t',
    icon: 'K3',
    intro: 'Keselamatan menjadi prasyarat sebelum pemeriksaan mekanis maupun elektrikal.',
    boxes: [
      ['Tindakan wajib', 'Gunakan pelindung mata, rapikan pakaian kerja, lakukan pelumasan awal, dan jaga lantai bebas tumpahan.'],
      ['Larangan kritis', 'Jangan menyentuh bagian berputar, membersihkan beram dengan tangan, atau mengubah V-Belt saat sumber daya terhubung.']
    ],
    bullets: [
      'Pastikan Emergency Stop dapat dijangkau sebelum pengoperasian.',
      'Gunakan kuas atau vakum untuk membersihkan beram.',
      'Isolasi sumber listrik sebelum membuka pelindung transmisi.',
      'Jangan meninggalkan mesin menyala tanpa pengawasan.'
    ]
  },
  {
    tag: 'MODUL I',
    title: 'Spindle utama dan transmisi V-Belt',
    short: 'Spindle & V-Belt',
    icon: '01',
    intro: 'Motor dan sistem sabuk meneruskan daya menuju spindle serta menentukan kestabilan putaran.',
    boxes: [
      ['Gejala umum', 'Spindle mati, putaran melemah saat dibebani, bunyi decit, atau muncul getaran tidak normal.'],
      ['Pemeriksaan awal', 'Periksa overload, ketegangan V-Belt, keterlibatan gearbox, kondisi cutter, dan kekencangan drawbar.']
    ],
    bullets: [
      'Sabuk terlalu longgar dapat menimbulkan slip dan stalling.',
      'Sabuk terlalu tegang dapat mempercepat kerusakan bearing.',
      'Pengaturan transmisi hanya dilakukan ketika mesin benar-benar mati.'
    ]
  },
  {
    tag: 'MODUL II',
    title: 'Panel elektrikal dan Digital Read Out',
    short: 'Panel & DRO',
    icon: '02',
    intro: 'Panel kontrol mengatur energi utama, sedangkan DRO menampilkan koordinat gerakan meja.',
    boxes: [
      ['Komponen penting', 'Emergency Stop, MCB, kontaktor, Thermal Overload Relay, saklar motor, dan saklar pompa coolant.'],
      ['Gejala umum', 'Motor mati total, tombol tidak merespons, overload trip, atau pembacaan DRO tidak sinkron.']
    ],
    bullets: [
      'Periksa apakah Emergency Stop masih terkunci.',
      'Periksa MCB, sekring, kontaktor, dan TOR sebelum membongkar motor.',
      'Jangan membuka panel saat sumber energi masih aktif.'
    ]
  },
  {
    tag: 'MODUL III',
    title: 'Sirkulasi dan filtrasi coolant',
    short: 'Sistem Coolant',
    icon: '03',
    intro: 'Coolant menurunkan panas pemotongan sekaligus mengurangi gesekan pada zona penyayatan.',
    boxes: [
      ['Aliran sistem', 'Reservoir → pompa → katup → selang fleksibel → zona pemotongan → saringan → reservoir.'],
      ['Gejala umum', 'Pompa berdengung tetapi coolant tidak keluar, aliran lemah, atau nosel tersumbat.']
    ],
    bullets: [
      'Pastikan saklar pompa berada pada mode ON/Auto.',
      'Buka katup pada pangkal selang fleksibel.',
      'Periksa volume reservoir dan bersihkan saringan dari gram.'
    ]
  },
  {
    tag: 'MODUL IV',
    title: 'Mekanisme meja dan one-shot lubricator',
    short: 'Meja & Lubricator',
    icon: '04',
    intro: 'Gerak meja bergantung pada lead screw, slideway, pengunci sumbu, dan suplai pelumas.',
    boxes: [
      ['Gejala umum', 'Handwheel terasa sangat berat, meja tersendat, automatic feed overload, atau muncul stick-slip.'],
      ['Pemeriksaan awal', 'Lepaskan pengunci meja, bersihkan beram, lalu operasikan one-shot lubricator.']
    ],
    bullets: [
      'Jangan memaksa handwheel ketika pengunci sumbu masih aktif.',
      'Gunakan pelumas slideway sesuai spesifikasi.',
      'Bersihkan area ulir transportir secara berkala.'
    ]
  },
  {
    tag: 'MODUL V',
    title: 'Ragum, arbor, dan sistem pencekaman',
    short: 'Pencekaman',
    icon: '05',
    intro: 'Pencekaman yang tidak rigid dapat menimbulkan chatter, pergeseran benda, dan hasil permukaan buruk.',
    boxes: [
      ['Komponen', 'Ragum presisi, T-bolt, parallel block, collet, arbor, cutter, dan drawbar.'],
      ['Gejala umum', 'Getaran tinggi, benda bergeser, cutter longgar, atau permukaan hasil frais bergelombang.']
    ],
    bullets: [
      'Pastikan benda kerja duduk rata di atas parallel block.',
      'Periksa kekencangan ragum dan drawbar.',
      'Gunakan cutter tajam dan parameter pemotongan sesuai.'
    ]
  }
];

const hotspots = {
  HS_01: {
    name: 'Spindle Motor Utama',
    description: 'Motor, V-Belt, spindle, cutter, dan sistem thermal overload pada kepala frais.',
    actions: [
      ['motor_overload', 'Periksa apakah thermal overload motor mengalami trip.'],
      ['v_belt', 'Periksa dan setel ketegangan V-Belt.'],
      ['cutter_condition', 'Periksa apakah cutter tumpul atau somplak.'],
      ['motor_replace', 'Langsung mengganti motor tanpa pemeriksaan awal.']
    ]
  },
  HS_02: {
    name: 'Panel Kontrol Utama',
    description: 'Panel operator yang berisi Emergency Stop, tombol start, dan saklar pompa coolant.',
    actions: [
      ['emergency_stop', 'Lepaskan kuncian tombol Emergency Stop.'],
      ['coolant_switch', 'Pastikan saklar pompa coolant berada pada mode ON/Auto.'],
      ['press_all', 'Tekan semua tombol secara bersamaan.']
    ]
  },
  HS_03: {
    name: 'Selang Coolant Fleksibel',
    description: 'Selang dan katup yang mengarahkan cairan pendingin menuju area pemotongan.',
    actions: [
      ['coolant_valve', 'Buka dan periksa katup aliran coolant pada pangkal selang.'],
      ['coolant_hose_clean', 'Periksa dan bersihkan sumbatan pada selang/nozel.'],
      ['bend_hose', 'Tekuk selang sekuat mungkin agar aliran meningkat.']
    ]
  },
  HS_04: {
    name: 'Gearbox Kecepatan Spindle',
    description: 'Mekanisme pengaturan rasio transmisi dan kecepatan spindle.',
    actions: [
      ['gear_engagement', 'Pastikan tuas transmisi bertautan penuh dan tidak menggantung di posisi netral.'],
      ['reduce_rpm', 'Turunkan RPM dan sesuaikan feed/depth of cut.'],
      ['force_gear', 'Pindahkan gigi saat spindle masih berputar.']
    ]
  },
  HS_05: {
    name: 'Meja Kerja dan Ragum',
    description: 'Meja sumbu X/Y, ragum, pengunci meja, arbor/drawbar, serta area akumulasi gram.',
    actions: [
      ['release_table_lock', 'Lepaskan tuas pengunci slide meja.'],
      ['clean_table_chips', 'Bersihkan gram pada meja dan ulir transportir.'],
      ['tighten_vise', 'Kencangkan pencekaman ragum dan gunakan ganjal paralel.'],
      ['tighten_drawbar', 'Periksa kekencangan arbor/drawbar agar cutter tidak longgar.'],
      ['loosen_vise', 'Longgarkan ragum saat proses pemotongan berlangsung.']
    ]
  },
  HS_06: {
    name: 'Pompa Oli Manual',
    description: 'One-shot lubricator untuk menyalurkan oli ke dovetail slideway.',
    actions: [
      ['pump_lubricator', 'Tarik tuas one-shot lubricator satu kali penuh.'],
      ['fill_water', 'Isi lubricator dengan air pendingin.']
    ]
  },
  HS_07: {
    name: 'Kepala Pembagi',
    description: 'Dividing head untuk pembagian sudut dan pengerjaan roda gigi.',
    actions: [
      ['check_dividing_head', 'Periksa penguncian dan indeks kepala pembagi.'],
      ['remove_dividing_head', 'Lepaskan kepala pembagi saat spindle bermasalah.']
    ]
  },
  HS_08: {
    name: 'Panel MCB dan TOR',
    description: 'Kabinet kelistrikan belakang yang memuat MCB, sekring, kontaktor, dan Thermal Overload Relay.',
    detailImage: 'assets/detail-hs08.webp',
    actions: [
      ['check_mcb_tor', 'Periksa MCB, sekring utama, dan kondisi trip TOR.'],
      ['bypass_mcb', 'Bypass MCB agar motor dapat langsung menyala.']
    ]
  },
  HS_09: {
    name: 'Reservoir dan Saringan Coolant',
    description: 'Area pompa, bak penampung bawah, dan saringan coolant di bagian bawah-belakang mesin.',
    detailImage: 'assets/detail-hs09.webp',
    actions: [
      ['reservoir_filter', 'Periksa volume coolant dan bersihkan saringan reservoir.'],
      ['add_thick_oil', 'Tambahkan oli transmisi kental ke reservoir coolant.']
    ]
  }
};

const spinFrames = [
  {
    angle: 0,
    label: 'Tampak depan',
    image: 'assets/machine-360/frame-01.webp',
    spots: {
      HS_01:[44.5,9.0], HS_02:[82.0,29.5], HS_03:[28.5,38.0],
      HS_05:[43.3,46.5], HS_06:[21.8,59.8], HS_07:[72.0,42.0]
    }
  },
  {
    angle: 30,
    label: 'Depan–kanan',
    image: 'assets/machine-360/frame-02.webp',
    spots: {
      HS_01:[44.5,9.5], HS_02:[82.2,29.5], HS_03:[29.5,37.6],
      HS_05:[39.2,46.1], HS_06:[21.5,60.0], HS_07:[66.4,42.4]
    }
  },
  {
    angle: 60,
    label: 'Serong kanan',
    image: 'assets/machine-360/frame-03.webp',
    spots: {
      HS_01:[44.5,10.0], HS_02:[82.7,29.5], HS_03:[29.0,37.8],
      HS_05:[38.0,46.1], HS_06:[22.0,59.5], HS_07:[66.0,42.0]
    }
  },
  {
    angle: 90,
    label: 'Tampak kanan',
    image: 'assets/machine-360/frame-04.webp',
    spots: {
      HS_01:[44.5,10.0], HS_02:[82.7,29.5], HS_03:[29.0,37.8],
      HS_05:[38.0,46.1], HS_06:[22.0,59.5], HS_07:[66.0,42.0]
    }
  },
  {
    angle: 120,
    label: 'Belakang–kanan',
    image: 'assets/machine-360/frame-05.webp',
    spots: {
      HS_01:[45.0,10.0], HS_02:[83.0,29.5], HS_03:[29.0,38.5],
      HS_05:[39.0,46.0], HS_06:[23.0,59.0], HS_07:[66.0,42.0]
    }
  },
  {
    angle: 150,
    label: 'Serong belakang kanan',
    image: 'assets/machine-360/frame-06.webp',
    spots: {
      HS_01:[50.5,10.5], HS_02:[80.3,30.0], HS_03:[34.0,41.2],
      HS_04:[51.5,20.5], HS_05:[55.4,44.2], HS_06:[51.2,57.8],
      HS_07:[76.0,40.5], HS_08:[24.2,56.0]
    }
  },
  {
    angle: 180,
    label: 'Tampak belakang',
    image: 'assets/machine-360/frame-07.webp',
    spots: {
      HS_01:[50.0,11.5], HS_03:[65.0,36.0], HS_05:[35.5,45.5],
      HS_06:[28.5,57.5], HS_07:[72.0,42.5], HS_08:[49.5,58.0],
      HS_09:[36.0,80.0]
    }
  },
  {
    angle: 210,
    label: 'Serong belakang kiri',
    image: 'assets/machine-360/frame-08.webp',
    spots: {
      HS_01:[53.0,9.5], HS_02:[21.5,29.5], HS_03:[67.5,38.0],
      HS_04:[58.0,19.0], HS_05:[51.0,45.0], HS_06:[61.0,59.0], HS_07:[29.8,41.5]
    }
  },
  {
    angle: 240,
    label: 'Tampak kiri',
    image: 'assets/machine-360/frame-09.webp',
    spots: {
      HS_01:[49.0,9.5], HS_02:[79.0,29.5], HS_03:[32.0,38.0],
      HS_04:[44.0,19.0], HS_05:[49.0,45.2], HS_06:[37.0,59.0], HS_07:[72.0,41.5]
    }
  },
  {
    angle: 270,
    label: 'Serong kiri',
    image: 'assets/machine-360/frame-10.webp',
    spots: {
      HS_01:[49.0,9.5], HS_02:[79.0,29.5], HS_03:[32.0,38.0],
      HS_04:[44.0,19.0], HS_05:[49.0,45.2], HS_06:[37.0,59.0], HS_07:[72.0,41.5]
    }
  },
  {
    angle: 300,
    label: 'Depan–kiri',
    image: 'assets/machine-360/frame-11.webp',
    spots: {
      HS_01:[56.0,9.5], HS_02:[17.0,29.5], HS_03:[70.5,38.5],
      HS_05:[60.5,46.0], HS_06:[79.0,59.0], HS_07:[34.0,42.0]
    }
  },
  {
    angle: 330,
    label: 'Mendekati depan',
    image: 'assets/machine-360/frame-12.webp',
    spots: {
      HS_01:[44.5,9.0], HS_02:[82.0,29.5], HS_03:[28.5,38.0],
      HS_05:[43.3,46.5], HS_06:[21.8,59.8], HS_07:[72.0,42.0]
    }
  }
];

const cases = {
  A: {
    title: 'Spindle mesin frais tidak berputar',
    symptoms: 'Saklar utama ON dan tombol start sudah ditekan, tetapi motor spindle tetap diam tanpa dengung.',
    required: ['emergency_stop', 'check_mcb_tor', 'motor_overload']
  },
  B: {
    title: 'Putaran spindle slip atau melemah',
    symptoms: 'Spindle normal tanpa beban, tetapi melambat atau berhenti ketika cutter menyentuh benda kerja.',
    required: ['v_belt', 'gear_engagement', 'tighten_drawbar']
  },
  C: {
    title: 'Coolant tidak mengalir',
    symptoms: 'Pompa terdengar bekerja, tetapi cairan tidak keluar dari ujung selang fleksibel.',
    required: ['coolant_valve', 'reservoir_filter', 'coolant_switch']
  },
  D: {
    title: 'Meja kerja macet atau sangat berat',
    symptoms: 'Handwheel sulit diputar dan gerakan meja tersendat meskipun motor feed tidak rusak.',
    required: ['release_table_lock', 'pump_lubricator', 'clean_table_chips']
  },
  E: {
    title: 'Hasil pemotongan kasar dan chatter',
    symptoms: 'Muncul getaran frekuensi tinggi, suara berisik, dan permukaan hasil pemotongan bergelombang.',
    required: ['tighten_vise', 'cutter_condition', 'reduce_rpm']
  }
};

const questions = [
  {
    topic: 'Kelistrikan spindle',
    text: 'Saklar utama panel sudah ON dan tombol start ditekan, tetapi spindle tetap diam tanpa dengung. Langkah awal paling logis adalah…',
    options: [
      'Membuka housing motor dan langsung mengganti V-Belt.',
      'Memeriksa Emergency Stop serta MCB/TOR pada panel daya.',
      'Menarik tuas lubricator untuk melumasi slideway.',
      'Memasang kepala pembagi pada meja.'
    ], answer: 1
  },
  {
    topic: 'Slip transmisi daya',
    text: 'Putaran melambat disertai suara decit ketika cutter mulai menyayat. Tindakan yang paling tepat adalah…',
    options: [
      'Menutup katup coolant.',
      'Memeriksa dan mengencangkan V-Belt pada puli.',
      'Melonggarkan pengunci sumbu Z.',
      'Mengganti ragum dengan kepala pembagi.'
    ], answer: 1
  },
  {
    topic: 'Sirkulasi coolant',
    text: 'Pompa coolant terdengar mendengung tetapi cairan tidak keluar. Bagian yang perlu diperiksa adalah…',
    options: [
      'Gearbox automatic feed.',
      'Drawbar spindle.',
      'Katup selang dan saringan reservoir dari gram.',
      'Bearing spindle.'
    ], answer: 2
  },
  {
    topic: 'Perawatan slideway',
    text: 'Perawatan rutin untuk mencegah slideway aus dan macet adalah…',
    options: [
      'Melonggarkan drawbar.',
      'Membersihkan gram dan mengoperasikan one-shot lubricator.',
      'Memutar handwheel dengan kecepatan maksimum.',
      'Mengisi alur meja dengan coolant.'
    ], answer: 1
  },
  {
    topic: 'Mitigasi chatter',
    text: 'Chatter menimbulkan permukaan kasar dan bergelombang. Kombinasi tindakan mekanis yang tepat adalah…',
    options: [
      'Menaikkan RPM dan depth of cut.',
      'Melonggarkan ragum.',
      'Mengencangkan pencekaman/drawbar dan menurunkan parameter pemotongan.',
      'Menyiram meja dengan oli transmisi.'
    ], answer: 2
  },
  {
    topic: 'Meja kerja macet',
    text: 'Handwheel terasa sangat keras meskipun automatic feed tidak rusak. Tindakan awal yang tepat adalah…',
    options: [
      'Memindahkan gearbox spindle ke netral.',
      'Melepas pengunci meja dan membersihkan gram pada jalur gerak.',
      'Mengencangkan drawbar.',
      'Mengisi reservoir coolant dengan oli transmisi.'
    ], answer: 1
  },
  {
    topic: 'Panel daya',
    text: 'Emergency Stop tidak tertekan tetapi motor spindle tetap mati. Pemeriksaan selanjutnya adalah…',
    options: [
      'Mengatur saklar coolant ke Auto.',
      'Menarik lubricator.',
      'Memeriksa MCB, sekring, dan TOR.',
      'Membuka katup coolant.'
    ], answer: 2
  },
  {
    topic: 'Gearbox spindle',
    text: 'V-Belt sudah kencang tetapi spindle tetap stalling saat dibebani. Kemungkinan penyebab lain adalah…',
    options: [
      'Lubricator belum dipompa.',
      'Selang coolant tersumbat.',
      'Tuas gearbox tidak bertautan penuh atau berada di posisi netral.',
      'Piringan kepala pembagi belum dikunci.'
    ], answer: 2
  },
  {
    topic: 'Kualitas pemotongan',
    text: 'Chatter keras menyebabkan hasil permukaan kasar. Tindakan gabungan yang tepat adalah…',
    options: [
      'Menaikkan RPM dan depth of cut.',
      'Melonggarkan drawbar.',
      'Memeriksa pencekaman, ketajaman cutter, dan menurunkan RPM.',
      'Membiarkan pengunci meja longgar.'
    ], answer: 2
  },
  {
    topic: 'Reservoir coolant',
    text: 'Pompa aktif dan katup sudah terbuka, tetapi coolant tetap tidak keluar. Bagian landasan bawah yang harus diperiksa adalah…',
    options: [
      'Gearbox spindle.',
      'Lead screw meja.',
      'Volume coolant dan saringan reservoir.',
      'One-shot lubricator.'
    ], answer: 2
  }
];

function showPage(pageName) {
  state.page = pageName;
  $$('.page').forEach(page => page.classList.toggle('active', page.dataset.pageSection === pageName));
  $$('.nav-link').forEach(link => link.classList.toggle('active', link.dataset.page === pageName));
  $('#mainNav').classList.remove('open');
  $('#menuToggle').setAttribute('aria-expanded', 'false');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  $('#appMain').focus({ preventScroll: true });
}

$$('[data-page]').forEach(control => control.addEventListener('click', event => {
  event.preventDefault();
  showPage(control.dataset.page);
}));

$('#menuToggle').addEventListener('click', () => {
  const nav = $('#mainNav');
  nav.classList.toggle('open');
  $('#menuToggle').setAttribute('aria-expanded', String(nav.classList.contains('open')));
});

const nextLearningBtn = $('#nextLearning');
if (nextLearningBtn) {
  nextLearningBtn.addEventListener('click', () => {
    state.learningIndex = state.learningIndex < learningModules.length - 1 ? state.learningIndex + 1 : 0;
    renderLearning();
  });
}

function getLearningIllustration(index) {
  const figures = [
    'assets/module-k3.png',
    'assets/module-1.png',
    'assets/module-2.png',
    'assets/module-3.png',
    'assets/module-4.png',
    'assets/module-5.png'
  ];
  return figures[index] || 'assets/module-k3.png';
}

function renderLearning() {
  $('#learningGrid').innerHTML = learningModules.map((item, index) => `
    <button class="learning-card ${index === state.learningIndex ? 'active' : ''}" type="button" data-learning="${index}">
      <b>${item.icon}</b><span><strong>${item.short}</strong><small>${item.title}</small></span>
    </button>`).join('');

  const current = learningModules[state.learningIndex];
  $('#learningTag').textContent = current.tag;
  $('#learningTitle').textContent = current.title;
  $('#learningBody').innerHTML = `
    <div class="learning-hero-figure">
      <img src="${getLearningIllustration(state.learningIndex)}" alt="Ilustrasi modul ${current.title}" />
      <button class="learning-image-zoom" type="button" id="openLearningImage" aria-label="Perbesar gambar ${current.title}">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5M10.5 7.5v6M7.5 10.5h6"/></svg>
        <span>Perbesar gambar</span>
      </button>
    </div>
    <p class="page-lead">${current.intro}</p>
    <div class="info-grid">${current.boxes.map(box => `<div class="info-box"><strong>${box[0]}</strong><p>${box[1]}</p></div>`).join('')}</div>
    <div class="detail-section">
      <h3>Pokok pemeriksaan</h3>
      <ul>${current.bullets.map(item => `<li>${item}</li>`).join('')}</ul>
    </div>
    <div class="detail-section detail-section-soft">
      <h3>Langkah belajar cepat</h3>
      <ol>
        <li>Amati letak komponen pada ilustrasi mesin.</li>
        <li>Cocokkan fungsi komponen dengan potensi gejalanya.</li>
        <li>Hubungkan tindakan pemeriksaan dengan keselamatan kerja.</li>
      </ol>
    </div>`;

  const nextBtn = $('#nextLearning');
  if (nextBtn) {
    const hasNext = state.learningIndex < learningModules.length - 1;
    nextBtn.textContent = hasNext ? 'Lanjut ke modul selanjutnya' : 'Kembali ke modul pertama';
  }

  $$('[data-learning]').forEach(btn => btn.addEventListener('click', () => {
    state.learningIndex = Number(btn.dataset.learning);
    renderLearning();
  }));

  const openLearningImageButton = $('#openLearningImage');
  if (openLearningImageButton) {
    openLearningImageButton.addEventListener('click', openLearningImageDialog);
  }
}

let learningImageZoom = 100;

function applyLearningImageZoom() {
  const image = $('#learningImageDialogImage');
  const label = $('#learningImageZoomLabel');
  if (!image || !label) return;
  image.style.width = `${learningImageZoom}%`;
  label.textContent = `${learningImageZoom}%`;
}

function openLearningImageDialog() {
  const current = learningModules[state.learningIndex];
  const dialog = $('#learningImageDialog');
  const image = $('#learningImageDialogImage');
  const title = $('#learningImageDialogTitle');
  if (!dialog || !image || !title) return;

  learningImageZoom = 100;
  image.src = getLearningIllustration(state.learningIndex);
  image.alt = `Ilustrasi lengkap ${current.title}`;
  title.textContent = current.title;
  applyLearningImageZoom();
  dialog.showModal();
  requestAnimationFrame(() => {
    const viewport = $('#learningImageViewport');
    if (viewport) viewport.scrollTo({ top: 0, left: 0 });
  });
}

function closeLearningImageDialog() {
  const dialog = $('#learningImageDialog');
  if (dialog?.open) dialog.close();
}

function changeLearningImageZoom(delta) {
  learningImageZoom = Math.min(250, Math.max(75, learningImageZoom + delta));
  applyLearningImageZoom();
}

function renderCases() {
  $('#caseList').innerHTML = Object.entries(cases).map(([key, item]) => `
    <button class="case-button ${key === state.currentCase ? 'active' : ''}" type="button" data-case="${key}">Kasus ${key}</button>`).join('');
  $$('[data-case]').forEach(btn => btn.addEventListener('click', () => selectCase(btn.dataset.case)));
}

function selectCase(caseKey) {
  state.currentCase = caseKey;
  state.solvedActions = [];
  const current = cases[caseKey];
  $('#caseTitle').textContent = current.title;
  $('#caseSymptoms').textContent = current.symptoms;
  $('.case-code').textContent = `KASUS ${caseKey}`;
  renderCases();
  renderChecklist();
  renderHotspots();
}

function renderChecklist() {
  const slots = $$('.check-slot');
  slots.forEach((slot, index) => {
    const actionId = state.solvedActions[index];
    const actionLabel = actionId ? findActionLabel(actionId) : 'Belum ditemukan';
    slot.classList.toggle('complete', Boolean(actionId));
    $('span', slot).textContent = actionId ? '✓' : String(index + 1);
    $('small', slot).textContent = actionLabel;
  });
  $('#progressText').textContent = `${state.solvedActions.length}/3`;
}

function findActionLabel(actionId) {
  for (const hotspot of Object.values(hotspots)) {
    const found = hotspot.actions.find(action => action[0] === actionId);
    if (found) return found[1];
  }
  return actionId;
}

function normalizeFrameIndex(index) {
  const total = spinFrames.length;
  return ((index % total) + total) % total;
}

function syncMachineCanvasSize() {
  const stage = $('#machineStage');
  const canvas = $('#machineCanvas');
  if (!stage || !canvas) return;

  const imageRatio = 1122 / 1402;
  const stageWidth = stage.clientWidth;
  const stageHeight = stage.clientHeight;
  let canvasHeight = stageHeight;
  let canvasWidth = canvasHeight * imageRatio;

  if (canvasWidth > stageWidth) {
    canvasWidth = stageWidth;
    canvasHeight = canvasWidth / imageRatio;
  }

  canvas.style.width = `${Math.max(1, canvasWidth)}px`;
  canvas.style.height = `${Math.max(1, canvasHeight)}px`;
}

function renderSpinFrame(index, options = {}) {
  const normalized = normalizeFrameIndex(index);
  const frame = spinFrames[normalized];
  const image = $('#machineImage');
  state.currentFrame = normalized;

  if (image.src.endsWith(frame.image)) {
    syncMachineCanvasSize();
    renderHotspots();
  } else {
    if (!options.immediate) $('#machineStage').classList.add('spinning');
    image.src = frame.image;
    image.alt = `Mesin frais GUT ${frame.label.toLowerCase()}, sudut ${frame.angle} derajat`;
    image.onload = () => {
      $('#machineStage').classList.remove('spinning');
      syncMachineCanvasSize();
      renderHotspots();
    };
  }

}

function renderHotspots() {
  const layer = $('#hotspotLayer');
  const frame = spinFrames[state.currentFrame];
  layer.innerHTML = Object.entries(frame.spots).map(([id, pos]) => {
    const hotspot = hotspots[id];
    const hasFoundAction = hotspot.actions.some(action => state.solvedActions.includes(action[0]));
    return `
      <button class="hotspot hotspot-minimal ${hasFoundAction ? 'found' : ''}" type="button" data-hotspot="${id}" style="left:${pos[0]}%;top:${pos[1]}%" aria-label="Periksa ${hotspot.name}" title="${hotspot.name}">
        <span class="hotspot-dot" aria-hidden="true"></span>
      </button>`;
  }).join('');
  $$('[data-hotspot]').forEach(btn => btn.addEventListener('click', () => openHotspot(btn.dataset.hotspot)));
}

function preloadSpinFrames() {
  const loading = $('#spinLoading');
  let loaded = 0;
  const total = spinFrames.length;
  spinFrames.forEach(frame => {
    const img = new Image();
    img.onload = img.onerror = () => {
      loaded += 1;
      const ratio = loaded / total;
      if (loading) {
        const bar = $('span', loading);
        if (bar) bar.style.setProperty('--load-progress', `${Math.round(ratio * 100)}%`);
      }
      if (loaded >= total && loading) loading.classList.add('done');
    };
    img.src = frame.image;
  });
}

function initSpinViewer() {
  syncMachineCanvasSize();
  renderSpinFrame(0, { immediate: true });
  preloadSpinFrames();
  window.addEventListener('resize', syncMachineCanvasSize);
}

function openHotspot(id) {
  const hotspot = hotspots[id];
  state.activeHotspot = id;
  $('#dialogHotspotId').textContent = id;
  $('#dialogHotspotTitle').textContent = hotspot.name;
  $('#dialogHotspotDescription').textContent = hotspot.description;
  const media = $('#dialogHotspotMedia');
  const mediaImage = $('#dialogHotspotImage');
  if (hotspot.detailImage) {
    mediaImage.src = hotspot.detailImage;
    mediaImage.alt = `Detail ${hotspot.name}`;
    media.classList.remove('hidden');
  } else {
    media.classList.add('hidden');
    mediaImage.removeAttribute('src');
    mediaImage.alt = '';
  }
  $('#dialogActionList').innerHTML = hotspot.actions.map(action => `<button class="action-option" type="button" data-action="${action[0]}">${action[1]}</button>`).join('');
  $$('[data-action]').forEach(btn => btn.addEventListener('click', () => chooseAction(btn.dataset.action)));
  $('#actionDialog').showModal();
}

function chooseAction(actionId) {
  const required = cases[state.currentCase].required;
  $('#actionDialog').close();
  if (state.solvedActions.includes(actionId)) {
    toast('Tindakan ini sudah masuk ke checklist.', 'info');
    return;
  }
  if (required.includes(actionId)) {
    state.solvedActions.push(actionId);
    renderChecklist();
    renderHotspots();
    if (state.solvedActions.length === 3) {
      toast('Diagnosis lengkap. Tiga tindakan pemeriksaan berhasil ditemukan.', 'success');
    } else {
      toast(`Benar. ${state.solvedActions.length} dari 3 tindakan sudah ditemukan.`, 'success');
    }
  } else {
    toast('Tindakan tersebut belum sesuai dengan gejala kasus ini. Periksa hubungan gejala dan komponen.', 'error');
  }
}

function toast(message, type = 'info') {
  const el = $('#feedbackToast');
  el.textContent = message;
  el.className = `feedback-toast ${type} show`;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove('show'), 2800);
}

function renderLegend() {
  $('#legendGrid').innerHTML = Object.entries(hotspots).map(([id, item]) => `<div class="legend-item"><b>${id} — ${item.name}</b><small>${item.description}</small></div>`).join('');
}

$('#showHotspotLegend').addEventListener('click', () => $('#legendDialog').showModal());
$('#closeLegendDialog').addEventListener('click', () => $('#legendDialog').close());
$('#closeActionDialog').addEventListener('click', () => $('#actionDialog').close());
$('#actionDialog').addEventListener('click', e => { if (e.target === $('#actionDialog')) $('#actionDialog').close(); });
$('#legendDialog').addEventListener('click', e => { if (e.target === $('#legendDialog')) $('#legendDialog').close(); });

$('#closeLearningImageDialog').addEventListener('click', closeLearningImageDialog);
$('#learningImageZoomIn').addEventListener('click', () => changeLearningImageZoom(25));
$('#learningImageZoomOut').addEventListener('click', () => changeLearningImageZoom(-25));
$('#learningImageZoomReset').addEventListener('click', () => { learningImageZoom = 100; applyLearningImageZoom(); });
$('#learningImageDialog').addEventListener('click', event => {
  if (event.target === $('#learningImageDialog')) closeLearningImageDialog();
});
$('#learningImageDialogImage').addEventListener('dblclick', () => {
  learningImageZoom = learningImageZoom === 100 ? 175 : 100;
  applyLearningImageZoom();
});

let spinPointerId = null;
let spinStartX = 0;
let spinStartFrame = 0;
let spinLastFrame = 0;
let spinRaf = 0;

function updateSpinFromPointer(clientX) {
  const delta = spinStartX - clientX;
  const stepWidth = window.innerWidth <= 780 ? 22 : 28;
  const frameDelta = Math.trunc(delta / stepWidth);
  const nextFrame = normalizeFrameIndex(spinStartFrame + frameDelta);
  if (nextFrame !== spinLastFrame) {
    spinLastFrame = nextFrame;
    renderSpinFrame(nextFrame, { immediate: true });
  }
}

$('#machineStage').addEventListener('pointerdown', event => {
  if (event.target.closest('.hotspot')) return;
  spinPointerId = event.pointerId;
  spinStartX = event.clientX;
  spinStartFrame = state.currentFrame;
  spinLastFrame = state.currentFrame;
  $('#machineStage').classList.add('is-dragging');
  $('#machineStage').setPointerCapture(event.pointerId);
});

$('#machineStage').addEventListener('pointermove', event => {
  if (spinPointerId !== event.pointerId) return;
  const clientX = event.clientX;
  cancelAnimationFrame(spinRaf);
  spinRaf = requestAnimationFrame(() => updateSpinFromPointer(clientX));
});

function finishSpinDrag(event) {
  if (spinPointerId === null) return;
  if (event && $('#machineStage').hasPointerCapture(spinPointerId)) {
    $('#machineStage').releasePointerCapture(spinPointerId);
  }
  spinPointerId = null;
  $('#machineStage').classList.remove('is-dragging');
}

$('#machineStage').addEventListener('pointerup', finishSpinDrag);
$('#machineStage').addEventListener('pointercancel', finishSpinDrag);
$('#machineStage').addEventListener('lostpointercapture', finishSpinDrag);
$('#machineStage').addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft') {
    event.preventDefault();
    renderSpinFrame(state.currentFrame - 1);
  }
  if (event.key === 'ArrowRight') {
    event.preventDefault();
    renderSpinFrame(state.currentFrame + 1);
  }
});

function startQuiz(name, nim) {
  state.quiz = { name: name.trim(), nim: nim.trim(), index: 0, selected: null, answers: [] };
  $('#evaluationStart').classList.add('hidden');
  $('#evaluationResult').classList.add('hidden');
  $('#evaluationArea').classList.remove('hidden');
  renderQuestion();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

$('#evaluationForm').addEventListener('submit', event => {
  event.preventDefault();
  const name = $('#studentName').value.trim();
  const nim = $('#studentNim').value.trim();
  if (name.length < 3 || nim.length < 3) {
    $('#identityError').textContent = 'Nama dan NIM wajib diisi dengan benar.';
    return;
  }
  $('#identityError').textContent = '';
  startQuiz(name, nim);
});

function renderQuestion() {
  const current = questions[state.quiz.index];
  state.quiz.selected = null;
  $('#questionNumber').textContent = String(state.quiz.index + 1);
  $('#questionTopic').textContent = current.topic;
  $('#questionText').textContent = current.text;
  $('#optionList').innerHTML = current.options.map((option, index) => `
    <button class="option-button" type="button" data-option="${index}"><b>${String.fromCharCode(65 + index)}</b><span>${option}</span></button>`).join('');
  $$('[data-option]').forEach(btn => btn.addEventListener('click', () => {
    state.quiz.selected = Number(btn.dataset.option);
    $$('[data-option]').forEach(item => item.classList.toggle('selected', item === btn));
    $('#answerError').textContent = '';
  }));
  const percent = state.quiz.index * 10;
  $('#quizProgressBar').style.width = `${percent}%`;
  $('#quizProgressText').textContent = `${percent}%`;
}

$('#saveEvaluationAnswer').addEventListener('click', () => {
  if (state.quiz.selected === null) {
    $('#answerError').textContent = 'Pilih salah satu jawaban sebelum melanjutkan.';
    return;
  }
  const current = questions[state.quiz.index];
  state.quiz.answers.push({ selected: state.quiz.selected, correct: current.answer, isCorrect: state.quiz.selected === current.answer });
  if (state.quiz.index >= questions.length - 1) finishQuiz();
  else {
    state.quiz.index += 1;
    renderQuestion();
  }
});

function finishQuiz() {
  $('#evaluationArea').classList.add('hidden');
  $('#evaluationResult').classList.remove('hidden');
  const correctCount = state.quiz.answers.filter(item => item.isCorrect).length;
  const score = correctCount * 10;
  $('#finalScore').textContent = String(score);
  $('#resultName').textContent = state.quiz.name;
  $('#resultNim').textContent = state.quiz.nim;
  $('#resultDate').textContent = new Intl.DateTimeFormat('id-ID', { dateStyle: 'long', timeStyle: 'short' }).format(new Date());
  $('#resultCorrect').textContent = `${correctCount}/10`;
  $('#resultMessage').textContent = score >= 86 ? 'Sangat baik. Diagnosis troubleshooting telah dikuasai.' : score >= 76 ? 'Baik. Pertahankan ketelitian menghubungkan gejala dan komponen.' : score >= 66 ? 'Cukup. Pelajari kembali alur pemeriksaan setiap subsistem.' : 'Perlu mengulang modul pembelajaran dan simulasi troubleshooting.';
  $('#resultRows').innerHTML = state.quiz.answers.map((item, index) => `<tr><td>${index + 1}</td><td>${String.fromCharCode(65 + item.selected)}</td><td>${String.fromCharCode(65 + item.correct)}</td><td class="${item.isCorrect ? 'correct' : 'wrong'}">${item.isCorrect ? 'Benar' : 'Salah'}</td></tr>`).join('');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

$('#printResult').addEventListener('click', () => window.print());
$('#repeatEvaluation').addEventListener('click', () => startQuiz(state.quiz.name, state.quiz.nim));

renderLearning();
renderCases();
selectCase('A');
initSpinViewer();
renderLegend();
