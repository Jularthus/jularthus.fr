/* ==================================================================
   DATA: everything the page says that is not in the HTML.
   - EN: English for every [data-i18n] key (French lives in the HTML,
     so the page is complete without JS and for search engines).
   - SKILLS: the "how I learned it" sheets, in both languages.
   - UI: strings used by scripts (toasts, terminal, palette).
   House rule: no em dashes in any visible string.
   ================================================================== */
window.SITE_DATA = (function () {
  var GH = "https://github.com/Jularthus/";
  function link(url, label) {
    return '<a href="' + url + '" target="_blank" rel="noopener noreferrer"><code>' + label + "</code> ↗</a>";
  }

  var META = {
    fr: {
      title: "Jules-Arthus Klein · Portfolio · jularthus.fr",
      desc: "Jules-Arthus Klein, élève ingénieur à l'EPITA Paris, majeure SRS (cybersécurité). Infra auto-hébergée depuis 2022, projets open source, automatisation.",
    },
    en: {
      title: "Jules-Arthus Klein · Portfolio · jularthus.fr",
      desc: "Jules-Arthus Klein, engineering student at EPITA Paris, majoring in security (SRS). Self-hosted infrastructure since 2022, open-source projects, automation.",
    },
  };

  var EN = {
    skip: "Skip to content",
    "nav.sub": "Portfolio",
    "nav.label": "Sections",
    "nav.about": "About",
    "nav.projects": "Projects",
    "nav.path": "Journey",
    "nav.stack": "Stack",
    "nav.contact": "Contact",
    "nav.palette": "Open the command palette",
    "nav.lang": "Language",

    "hero.caption": '<span class="hero-name">Jules-Arthus Klein</span>, engineering student at EPITA Paris, majoring in Systems, Networks &amp; Security.',
    "hero.tagline": "I build, I automate, I secure.",
    "hero.cta1": "See the projects",
    "hero.cta2": "Get in touch",
    "hero.scroll": "Scroll down",

    "proof.since": "year of my first lines of code",
    "proof.selfhosted": "self-hosted, since 2022",
    "proof.langs": "programming languages, and more to come",
    "proof.students": "students taught at EPITA as an assistant",
    "proof.devdocker": "stars on a hand-crafted tool, used by fellow students",

    "about.eyebrow": "01 · About",
    "about.title": "Who I am",
    "about.p1": "I'm <strong>Jules-Arthus «&nbsp;JA&nbsp;» Klein</strong>. I'm from <strong>Nancy</strong>, I went through <strong>Strasbourg</strong>, <strong>Prague</strong> and <strong>Luxembourg</strong>, and I'm now completing my engineering degree at <strong>EPITA Paris</strong>, majoring in <strong>SRS</strong>.",
    "about.p2": "What gets me up in the morning: <i>cybersecurity</i>, first. And a habit of <strong>automating</strong> everything that can be: if a task comes back twice, it ends up as a script. On the side, I play the <strong>Pokémon battle simulator</strong>, with the same reflexes as in security: read the opponent, anticipate, leave nothing to chance.",
    "about.p3": "My current playground is <strong>home automation</strong>: gate security, and home-made sensors that switch off lights and heating when nobody needs them.",
    "about.p4": "People call me friendly and open. The part of the portrait I really stand for is the other one: serious, efficient, <strong>reliable</strong>. The kind of person you hand the keys to, and who gives them back with a labelled spare.",
    "about.latios": "Latios, on the team since forever.",

    "id.base": "Based in",
    "id.school": "School",
    "id.school.v": "EPITA Paris<small>SRS major · cybersecurity</small>",
    "id.xp": "Experience",
    "id.xp.v": "Internship at INCERT GIE<small>Luxembourg · AI project</small>",
    "id.obs": "Obsessions",
    "id.obs.v": "Automate, secure, understand",
    "id.play": "Playground",
    "id.play.v": "Pokémon battle simulator<small>strategy · composure · prediction</small>",

    "proj.eyebrow": "02 · Projects",
    "flag.kicker": "JArvis · the flagship, since 2022",
    "flag.sub": "It started with a simple idea: build my own Netflix. Python scripts written during high-school classes grew into a <strong>full server</strong>, running on a Razer Blade 15 bought for <strong>€50</strong> (broken screen, keyboard and chassis; everything else runs 24/7). It taught me more than anything else: to code, to administer, and above all to <strong>secure</strong>.",
    "flag.secLabel": "Security and operations",
    "flag.s1": "Authelia SSO (OIDC) + LDAP directory",
    "flag.s2": "Passkey login, no passwords",
    "flag.s3": "Deny by default, one group per service",
    "flag.s4": "Services bound to 127.0.0.1, exposed via nginx + TLS",
    "flag.s5": "Admin reachable only through an SSH tunnel",
    "flag.s6": "Pre-commit hook that blocks secrets",
    "flag.s7": "Monitoring with Prometheus + Grafana",
    "flag.s8": "Automated daily updates",
    "flag.note": "Almost everything is private: behind single sign-on, or not exposed at all. Only two doors open without an account: <strong>invitations</strong> to the media library, and the <a href=\"#p-beers\">1 million d'amis</a> beer counter.",
    "flag.cta": "Visit home.jularthus.fr",
    "term.log": "Terminal output",
    "term.hint": "This terminal is real: type <code>help</code>.",

    "sel.title": "The selection",
    "sel.note": "Five public projects, each with code or a live demo to show.",
    "sel.end": "The rest is on GitHub",
    "p.devdocker.pitch": "A Linux debugging environment, ready in one command, for EPITA students who code on macOS: gcc, gdb, Valgrind, and even x86-64 assembly.",
    "p.devdocker.why": "<b>Why it matters:</b> other EPITA students use it to debug their projects. 10 stars on GitHub, my most followed repository.",
    "p.stars10": "10 stars",
    "p.testsuite.alt": "Test trace generated by Testsuite, displayed in the EPITA intranet",
    "p.testsuite.pitch": "Turns any Bash test suite into an XML trace the EPITA intranet can read: what passes and what breaks, at a glance.",
    "p.testsuite.why": "<b>The story:</b> so clean and so well documented that the teaching assistants suspected cheating. One explanation session later, they were speechless.",
    "p.aucoin.alt": "AuCoin home page, with its duck and the field to send a message",
    "p.aucoin.pitch": "An anonymous message box: anyone can write to me from the site, the message pops up in the corner of my screen, then disappears once read.",
    "p.aucoin.why": "<b>Why it matters:</b> born during the piscine to stay in touch with friends, and still online. Try it, I'll read it.",
    "tag.selfhosted": "Self-hosted",
    "p.live": "Live demo",
    "p.ndot.pitch": "A co-op pixel-art puzzle game built by five people in C#: two friends, one of them turned into a dog, and more than 30 puzzles in an increasingly hostile forest.",
    "p.ndot.why": "<b>My role:</b> technical lead of the team. Keeping five people's code working together, from the first idea to the final defense.",
    "p.ndot.alt": "New Dog, Old Tricks pixel-art title screen: a wooden sign above the forest",
    "p.ndot.link": "Game website",
    "p.ndot.href": "https://shinyduckstudio.fr/ndot_en/",
    "tag.coop": "Co-op",
    "tag.team5": "Team of 5",
    "p.beers.alt": "Home page of the 1 million d'amis beer counter, in demo mode",
    "p.beers.pitch": "A group of friends counting their beers toward an absurd goal: one million. A Discord bot logs them, a public website turns the history into rankings, maps and records.",
    "p.beers.why": "<b>Under the hood:</b> three services (bot, public site, private admin tool) sharing one SQLite database, with unit tests and Playwright browser tests.",
    "p.site": "Live site",

    "also.school": "School projects, code not publishable",
    "also.schoolNote": "EPITA rules forbid publishing their code. I'm happy to talk about them, in an interview or over coffee.",
    "also.42sh": "POSIX shell · C",
    "also.tiger": "compiler · C++",
    "also.make": "simplified GNU Make · C",
    "also.malloc": "malloc, calloc, realloc and free rebuilt · C",
    "also.httpd": "daemonized HTTP server · C",
    "also.ocr": "word-search solver · C",
    "also.jws": "Quarkus + PostgreSQL backend · Java",
    "also.zork": "JSON game client · C++",
    "also.eplace": "r/place clone · JS",
    "also.oss": "Open source, too",
    "also.ossNote": "Tools born from a need, shared in case they help someone else.",
    "also.ytdl": "self-hosted video downloader",
    "also.dotfiles": "my configuration, public",
    "also.fokprint": "printing service for macOS",
    "also.bn": "workshop for the 2024 Fête de la Science",

    "path.eyebrow": "03 · Journey",
    "path.title": "The journey",
    "path.note": "From Nancy to Paris, through Strasbourg, Prague and Luxembourg. And along the way, a move to the other side of the classroom.",
    "tl.1.when": "Nancy · high school",
    "tl.1.desc": "Baccalauréat <strong>with honours</strong>, majoring in <strong>Computer Science</strong>, Physics-Chemistry and Maths, with advanced maths and the European German section. Not to mention the first Python scripts, written, I admit, during class.",
    "tl.2.when": "Strasbourg · 1.5 years",
    "tl.2.title": "EPITA · integrated prep",
    "tl.2.desc": "Maths, projects, short nights, and the certainty of being exactly where I belonged.",
    "tl.3.when": "Prague · 1 semester",
    "tl.3.desc": "Classes in English, a new culture, the same bugs. This is where my <strong>server</strong> really took off: lots of new features, and a project that became much more serious.",
    "tl.4.when": "Strasbourg · 1 year",
    "tl.4.title": "EPITA · ING1",
    "tl.4.desc": "The infamous ING1, the densest year of the curriculum: 42sh, Tiger, and a lot of coffee. Result: <strong>zero resits</strong>. At the same time, I taught programming as an ACDC assistant.",
    "tl.5.when": "Luxembourg · Sept 2026 → Jan 2027",
    "tl.5.title": "Internship · INCERT GIE",
    "tl.5.desc": "My first real professional ground: I lead an <strong>artificial intelligence project</strong> at INCERT GIE, in Luxembourg.",
    "tl.6.when": "Paris · today",
    "tl.6.title": "EPITA · engineering cycle",
    "tl.6.small": "SRS major",
    "tl.6.desc": "<strong>Systems, Networks &amp; Security</strong>: cybersecurity, the thing that has been on my mind from the start, now on the syllabus.",

    "acdc.title": "Alongside · ACDC assistant",
    "acdc.note": "C Programming and Development Assistant, during ING1.",
    "acdc.p": "I moved to the other side of the classroom: <strong>I teach programming</strong> (Python, C) to students in the years below.",
    "acdc.1": "Teaching a class of about 40 students, as a pair",
    "acdc.2": "Running sessions and supporting students as they code",
    "acdc.3": "Reviewing, validating and improving lab assignments",
    "acdc.4": "Helping with understanding, debugging and method",
    "acdc.quote": "My goal: that <b>every</b> student understands the week's concepts. Not the average, every one. A group of first-year students even interviewed me for their methodology class: being a student assistant aiming for cyber, and my view on the place of AI in the field.",
    "acdc.cite": "The interview I'm proudest of isn't about code.",

    "stack.eyebrow": "04 · Tech stack",
    "stack.title": "The stack",
    "stack.note": "None of these skills come from a checklist: each one answers a problem I ran into. Click, they tell you how.",
    "sk.more": "how I learned it",
    "sk.lang": "Language",
    "sk.secu.tag": "SRS major",
    "sk.secu.name": "Security · Infra",
    "sk.secu.desc": "Authentication, isolation, least privilege: applied at home before they were on the syllabus.",
    "sk.docker.tag": "Containers",
    "sk.docker.desc": "Home of my server: the whole infrastructure fits in Compose files.",
    "sk.unix.tag": "Systems",
    "sk.unix.desc": "My natural habitat, at the keyboard or over SSH.",
    "sk.shell.tag": "Scripting",
    "sk.shell.desc": "The glue between systems, and the shortest path from A to B.",
    "sk.c.desc": "The language that taught me what the machine really does.",
    "sk.python.desc": "My toolbox: anything that repeats ends up here.",
    "sk.git.tag": "Version control",
    "sk.git.desc": "The first reflex, before the first line of code.",
    "sk.cpp.desc": "A whole compiler, and a game client as a rush.",
    "sk.java.tag": "Language · Data",
    "sk.java.desc": "From the piscine to layered backends, data included.",
    "sk.csharp.desc": "A year of algorithms, and a video game built by five.",
    "sk.js.desc": "From the piscine to community pixels, and this hand-made site.",
    "sk.editors.tag": "Editors",
    "sk.editors.desc": "Three tools, one obsession: never wait for the editor.",

    "langs.title": "Languages",
    "langs.note": "Certified, stamped.",
    "langs.fr.level": "Native language",
    "langs.fr.name": "French",
    "langs.fr.cert": "Native",
    "langs.en.level": "Fluent",
    "langs.en.name": "English",
    "langs.de.level": "Intermediate",
    "langs.de.name": "German",

    "contact.eyebrow": "05 · Contact",
    "contact.title": "Shall we work<br />together?",
    "contact.sub": "An engineering student aiming for cybersecurity, who automates anything that moves, teaches what he learns, and whose server has been in production since 2022. Friendly at first contact, reliable over time.",
    "contact.mail": "Send an email",
    "contact.copy": "Copy the address",
    "contact.copyShort": "copy",
    "contact.server": "Server",
    "contact.made": "© Jules-Arthus Klein · hand-made, no framework, hosted on JArvis.",
    "contact.hint": "<kbd>Ctrl</kbd> <kbd>K</kbd> to navigate · try the terminal",

    close: "Close",
    "sheet.sub": "How I learned it",
    "pal.placeholder": "Go to… projects, skills, actions",
    "pal.foot": "<kbd>↑</kbd><kbd>↓</kbd> navigate · <kbd>↵</kbd> open · <kbd>Esc</kbd> close",
  };

  var SKILLS = {
    secu: {
      about: {
        fr: "<p>La majeure <strong>SRS</strong> met des mots sur ce que je pratique déjà chez moi : un serveur exposé à Internet, ça se défend. Tout part d'un principe simple, <strong>refuser par défaut</strong>.</p>",
        en: "<p>The <strong>SRS</strong> major puts words on what I already practise at home: a server exposed to the Internet has to be defended. It all starts from one simple principle, <strong>deny by default</strong>.</p>",
      },
      points: {
        fr: [
          "SSO <i>Authelia</i> (OIDC) adossé à un annuaire <i>LLDAP</i> : un groupe par application, politique deny par défaut",
          "Second facteur par passkey (WebAuthn) avec vérification de l'utilisateur, à la place du TOTP",
          "Services liés à 127.0.0.1, publiés uniquement derrière un reverse proxy nginx avec TLS (Let's Encrypt)",
          "Interfaces d'administration joignables seulement par tunnel SSH, annuaire LDAP jamais publié",
          "Secrets hors du dépôt, et un hook pre-commit qui refuse tout ce qui ressemble à une fuite",
          "Majeure Systèmes, Réseaux &amp; Sécurité à l'EPITA Paris",
        ],
        en: [
          "<i>Authelia</i> SSO (OIDC) backed by an <i>LLDAP</i> directory: one group per application, deny-by-default policy",
          "Passkey second factor (WebAuthn) with user verification, instead of TOTP",
          "Services bound to 127.0.0.1, published only behind an nginx reverse proxy with TLS (Let's Encrypt)",
          "Admin interfaces reachable only through an SSH tunnel, LDAP directory never published",
          "Secrets kept out of the repository, and a pre-commit hook that rejects anything that looks like a leak",
          "Systems, Networks &amp; Security major at EPITA Paris",
        ],
      },
    },
    docker: {
      about: {
        fr: "<p>Appris en production, la mienne. Toute la pile de <a href=\"https://home.jularthus.fr\" target=\"_blank\" rel=\"noopener noreferrer\"><strong>home.jularthus.fr</strong></a> vit en conteneurs, et le cours <strong>IDVOC</strong> de l'EPITA a mis des mots (et des bonnes pratiques) sur ce que je faisais déjà.</p>",
        en: "<p>Learned in production, my own. The whole <a href=\"https://home.jularthus.fr\" target=\"_blank\" rel=\"noopener noreferrer\"><strong>home.jularthus.fr</strong></a> stack lives in containers, and EPITA's <strong>IDVOC</strong> course put words (and best practices) on what I was already doing.</p>",
      },
      points: {
        fr: [
          "home.jularthus.fr : 18 conteneurs décrits en Compose, un fichier par service, réseaux cloisonnés",
          "Mises à jour quotidiennes scriptées : on tire les images, on ne recrée que ce qui a changé",
          "Cours IDVOC de l'EPITA, dont la supervision Prometheus + Grafana du serveur",
          "<i>DevDocker</i> : un environnement Linux reproductible pour travailler depuis macOS · " + link(GH + "DevDocker", "github.com/Jularthus/DevDocker"),
          "Réflexe pris au passage : chaque outil que je crée est pensé pour être conteneurisable",
        ],
        en: [
          "home.jularthus.fr: 18 containers described in Compose, one file per service, isolated networks",
          "Scripted daily updates: pull the images, recreate only what changed",
          "EPITA's IDVOC course, including the server's Prometheus + Grafana monitoring",
          "<i>DevDocker</i>: a reproducible Linux environment to work from macOS · " + link(GH + "DevDocker", "github.com/Jularthus/DevDocker"),
          "A reflex picked up along the way: every tool I build is designed to be containerizable",
        ],
      },
    },
    unix: {
      about: {
        fr: "<p>Des systèmes que je n'utilise pas seulement : je les <strong>configure, les scripte et les administre</strong>, chez moi comme à distance.</p>",
        en: "<p>Systems I don't just use: I <strong>configure, script and administer</strong> them, at home and remotely.</p>",
      },
      points: {
        fr: [
          "Utilisation avancée de systèmes Unix : configuration, scripting",
          "Utilisateur macOS depuis plus de 6 ans",
          "Gestion d'un serveur Unix (SSH, Git, SMB) depuis plus de 5 ans",
        ],
        en: [
          "Advanced use of Unix systems: configuration, scripting",
          "macOS user for more than 6 years",
          "Running a Unix server (SSH, Git, SMB) for more than 5 years",
        ],
      },
    },
    shell: {
      about: {
        fr: "<p>Là où quelques lignes suffisent, pas besoin de plus : le shell est mon outil de <strong>mise en place et d'outillage</strong>.</p>",
        en: "<p>When a few lines are enough, there's no need for more: the shell is my tool for <strong>setup and tooling</strong>.</p>",
      },
      points: {
        fr: [
          "Scripts de configuration de systèmes, et la mise à jour automatique de mon serveur",
          "<i>Testsuite</i> : formateur pour testsuites Bash, qui génère une trace XML lisible dans l'intranet de l'école · " + link(GH + "CheatersTestsuite", "GitHub"),
          "Si bien documenté et si propre que les assistants ont cru à de la triche. Une soutenance d'explication plus tard, ils en sont restés bouche bée",
          "<i>42sh</i> : un shell POSIX écrit en C, pour comprendre l'outil de l'intérieur",
        ],
        en: [
          "System setup scripts, and the automatic updates of my server",
          "<i>Testsuite</i>: a formatter for Bash test suites that generates an XML trace the school intranet can read · " + link(GH + "CheatersTestsuite", "GitHub"),
          "So well documented and so clean that the assistants suspected cheating. One explanation session later, they were speechless",
          "<i>42sh</i>: a POSIX shell written in C, to understand the tool from the inside",
        ],
      },
    },
    c: {
      about: {
        fr: "<p>Le C est la colonne vertébrale du cursus EPITA, le langage de mes projets les plus formateurs, et celui que j'ai <strong>enseigné</strong> à mon tour.</p>",
        en: "<p>C is the backbone of the EPITA curriculum, the language of my most formative projects, and the one I went on to <strong>teach</strong>.</p>",
      },
      points: {
        fr: [
          "Validation de la « Piscine C » de l'EPITA, assez longue pour compter deux « rushs », les projets concrets qui la clôturent",
          "<i>42sh</i> : un shell POSIX complet",
          "Implémentation simplifiée de GNU Make",
          "Malloc : mes propres malloc, calloc, realloc et free",
          "OCR : résolveur de grilles de mots mêlés",
          "Serveur HTTP daemonisé",
          "Cours ACDC donnés en C à une promotion entière",
        ],
        en: [
          "Completed EPITA's \"C Piscine\", long enough to include two \"rushes\", the hands-on projects that close it",
          "<i>42sh</i>: a full POSIX shell",
          "A simplified implementation of GNU Make",
          "Malloc: my own malloc, calloc, realloc and free",
          "OCR: a word-search grid solver",
          "A daemonized HTTP server",
          "ACDC classes taught in C to a whole year group",
        ],
      },
    },
    python: {
      about: {
        fr: "<p>Le langage de mes automatisations : quand une tâche revient deux fois, elle devient un <strong>outil Python</strong> qui tourne tout seul.</p>",
        en: "<p>The language of my automations: when a task comes back twice, it becomes a <strong>Python tool</strong> that runs by itself.</p>",
      },
      points: {
        fr: [
          "<i>1 million d'amis</i> : bot Discord (discord.py) et site public, avec tests unitaires",
          "Rapports quotidiens automatisés, envoyés sur Discord par webhook",
          "Générateur de rapports pour le parcours Assistant EPITA (ACDC)",
          "<i>FokPrint</i> : serveur d'impression de fichiers sous macOS · " + link(GH + "FokPrint", "github.com/Jularthus/FokPrint"),
        ],
        en: [
          "<i>1 million d'amis</i>: a Discord bot (discord.py) and a public website, with unit tests",
          "Automated daily reports, posted to Discord via webhook",
          "A report generator for the EPITA assistant programme (ACDC)",
          "<i>FokPrint</i>: a file printing server on macOS · " + link(GH + "FokPrint", "github.com/Jularthus/FokPrint"),
        ],
      },
    },
    git: {
      about: {
        fr: "<p>Appris là où on apprend vraiment Git : <strong>en équipe</strong>, quand un rebase raté coûte une soirée à tout le monde.</p>",
        en: "<p>Learned where you really learn Git: <strong>in a team</strong>, when a botched rebase costs everyone an evening.</p>",
      },
      points: {
        fr: [
          "Projets scolaires en équipe (jusqu'à 5 membres)",
          "Mise en place de pipelines CI/CD sur GitLab",
          "Infra versionnée, secrets exclus : un hook pre-commit maison bloque les fuites avant qu'elles ne partent",
        ],
        en: [
          "Team school projects (up to 5 members)",
          "Setting up CI/CD pipelines on GitLab",
          "Version-controlled infrastructure, secrets excluded: a home-made pre-commit hook stops leaks before they leave",
        ],
      },
    },
    cpp: {
      about: {
        fr: "<p>Le C++ de l'ING1 : une semaine de piscine pour les bases, puis <strong>Tiger</strong>, le compilateur qui occupe toute l'année.</p>",
        en: "<p>The C++ of ING1: a piscine week for the basics, then <strong>Tiger</strong>, the compiler that fills the whole year.</p>",
      },
      points: {
        fr: [
          "Une semaine d'exercices intensifs de type « piscine »",
          "<i>libzork</i> : le rush, un client de jeu qui dialogue avec un serveur et interprète ses réponses JSON (nlohmann)",
          "<i>Tiger</i> : le compilateur du langage Tiger, projet phare de l'ING1",
        ],
        en: [
          "An intensive \"piscine\" week of exercises",
          "<i>libzork</i>: the rush, a game client that talks to a server and interprets its JSON responses (nlohmann)",
          "<i>Tiger</i>: the compiler for the Tiger language, ING1's flagship project",
        ],
      },
    },
    java: {
      about: {
        fr: "<p>Découvert au format piscine, puis pratiqué sur de vrais projets : un agent autonome d'abord, un <strong>backend structuré</strong> ensuite, avec ses données.</p>",
        en: "<p>Discovered in piscine format, then used on real projects: an autonomous agent first, then a <strong>structured backend</strong>, with its data.</p>",
      },
      points: {
        fr: [
          "Semaine de piscine Java, puis semaine de piscine PostgreSQL",
          "« Creeps » : un agent autonome dans un jeu vidéo existant, via son API officielle",
          "« JWS » : serveur backend en Quarkus, architecture en couches (présentation, service, repository), données dans PostgreSQL",
          "<i>DataClash</i> : le rush PostgreSQL, des bases de données manipulées dans une multitude de cas concrets",
        ],
        en: [
          "A Java piscine week, then a PostgreSQL piscine week",
          "\"Creeps\": an autonomous agent in an existing video game, through its official API",
          "\"JWS\": a Quarkus backend server with a layered architecture (presentation, service, repository), data in PostgreSQL",
          "<i>DataClash</i>: the PostgreSQL rush, databases handled in many real-world cases",
        ],
      },
    },
    csharp: {
      about: {
        fr: "<p>Un langage pratiqué dans la durée, entre rigueur hebdomadaire et <strong>projet d'équipe</strong> mené jusqu'au bout.</p>",
        en: "<p>A language practised over time, between weekly rigour and a <strong>team project</strong> seen through to the end.</p>",
      },
      points: {
        fr: [
          "Exercices algorithmiques hebdomadaires, pendant un an",
          "<i>New Dog, Old Tricks</i> : jeu d'énigmes coopératif développé à 5, dont j'étais le responsable technique · " + link("https://shinyduckstudio.fr/ndot/", "shinyduckstudio.fr/ndot"),
        ],
        en: [
          "Weekly algorithm exercises, for a year",
          "<i>New Dog, Old Tricks</i>: a co-op puzzle game built by a team of 5, where I was the technical lead · " + link("https://shinyduckstudio.fr/ndot_en/", "shinyduckstudio.fr/ndot_en"),
        ],
      },
    },
    js: {
      about: {
        fr: "<p>Une piscine pour les bases, puis des projets qui ont continué sur leur lancée. Et ce site : <strong>fait main</strong>, sans framework.</p>",
        en: "<p>A piscine for the basics, then projects that kept going. And this site: <strong>hand-made</strong>, no framework.</p>",
      },
      points: {
        fr: [
          "Une semaine d'exercices intensifs de type « piscine »",
          "<i>e-place</i> : réplique de r/place, où chacun pose un pixel sur un grand canvas partagé jusqu'à faire émerger des dessins communautaires",
          "<i>AuCoin</i> : boîte à messages anonyme en Node.js, en ligne · " + link(GH + "AuCoin", "github.com/Jularthus/AuCoin"),
          "Ce portfolio : WebGL, GSAP, un vrai terminal et une palette de commandes, sans build",
        ],
        en: [
          "An intensive \"piscine\" week of exercises",
          "<i>e-place</i>: an r/place clone, where everyone places a pixel on a shared canvas until community drawings emerge",
          "<i>AuCoin</i>: an anonymous message box in Node.js, live · " + link(GH + "AuCoin", "github.com/Jularthus/AuCoin"),
          "This portfolio: WebGL, GSAP, a real terminal and a command palette, no build step",
        ],
      },
    },
    editors: {
      about: {
        fr: "<p>Chacun a son terrain, tous ont un point commun : une configuration <strong>taillée à la main</strong>, affûtée à l'usage.</p>",
        en: "<p>Each has its own ground, all share one thing: a <strong>hand-tailored</strong> configuration, sharpened by use.</p>",
      },
      points: {
        fr: [
          "Utilisation quotidienne optimisée",
          "Plugins et configuration personnalisée",
          "Ma configuration est publique · " + link(GH + "dotfiles-i3", "github.com/Jularthus/dotfiles-i3"),
        ],
        en: [
          "Optimized daily use",
          "Plugins and custom configuration",
          "My configuration is public · " + link(GH + "dotfiles-i3", "github.com/Jularthus/dotfiles-i3"),
        ],
      },
    },
  };

  /* Projects the terminal and the palette know about. */
  var PROJECTS = [
    { slug: "jarvis", id: "projets", name: "JArvis · home.jularthus.fr", url: "https://home.jularthus.fr", keys: "homeserver serveur server infra" },
    { slug: "devdocker", id: "p-devdocker", name: "DevDocker", url: GH + "DevDocker" },
    { slug: "testsuite", id: "p-testsuite", name: "Testsuite", url: GH + "CheatersTestsuite", keys: "l9 moulinette tests bash xml" },
    { slug: "aucoin", id: "p-aucoin", name: "AuCoin", url: "https://aucoin.jularthus.fr" },
    { slug: "ndot", id: "p-ndot", name: "New Dog, Old Tricks", url: "https://shinyduckstudio.fr/ndot/", keys: "jeu game coop pixel" },
    { slug: "beers", id: "p-beers", name: "1 million d'amis", url: "https://beers.jularthus.fr", keys: "bieres beer discord" },
  ];

  var UI = {
    fr: {
      copied: "Copié dans le presse-papiers ✓",
      copiedDiscord: "Pseudo Discord copié : jularthus ✓",
      copyFail: "Impossible de copier, désolé.",
      beers: function (d) {
        return d.total.toLocaleString("fr-FR") + " / 1 000 000 · arrivée estimée : " + d.eta.slice(0, 4);
      },
      pal: { section: "section", project: "projet", skill: "compétence", action: "action", none: "Aucun résultat. Essayez « docker » ou « contact »." },
      palActions: {
        lang: "Switch to English",
        email: "Copier l'adresse e-mail",
        discord: "Copier le pseudo Discord",
        github: "Ouvrir GitHub",
        term: "Ouvrir le terminal",
        top: "Remonter en haut",
      },
      sections: { "a-propos": "À propos", projets: "Projets", selection: "La sélection", parcours: "Parcours", stack: "Stack", contact: "Contact" },
      term: {
        hint: "Tapez <b>help</b> pour voir les commandes.",
        help: [
          ["help", "cette aide"],
          ["whoami", "qui est derrière"],
          ["neofetch", "la machine, en un coup d'œil"],
          ["ls", "les projets"],
          ["cat &lt;projet&gt;", "aller voir un projet"],
          ["open &lt;projet&gt;", "l'ouvrir dans un onglet"],
          ["stack", "les compétences"],
          ["contact", "me joindre"],
          ["lang en", "switch to English"],
          ["clear", "effacer l'écran"],
        ],
        whoami: "<b>Jules-Arthus Klein</b>, élève ingénieur à l'EPITA Paris, majeure SRS.\nJe construis, j'automatise, je sécurise.",
        uptime: "en service <b>depuis 2022</b> · 24 h/24",
        issue: "Ubuntu 24.04 LTS · Razer Blade 15 (2020)",
        ps: "<b>18 conteneurs</b> · running",
        policy: "default_policy: <b>deny</b> · 2FA: passkey",
        neo: [
          ["OS", "Ubuntu 24.04 LTS"],
          ["Machine", "Razer Blade 15 (2020), payé 50 €"],
          ["Uptime", "depuis 2022"],
          ["Conteneurs", "18, presque tous privés"],
          ["Auth", "Authelia + LLDAP · passkeys"],
          ["Proxy", "nginx · TLS Let's Encrypt"],
          ["Monitoring", "Prometheus + Grafana"],
          ["Admin", "tunnel SSH uniquement"],
        ],
        lsHint: "Astuce : <b>cat devdocker</b>",
        stack: "Sécurité · Docker · Linux · Shell · C · Python · Git · C++ · Java · C# · JS",
        contact: "Écrivez-moi : ",
        notFound: function (c) {
          return "commande introuvable : " + c + ". Essayez <b>help</b>.";
        },
        noProject: function (p) {
          return "aucun projet nommé « " + p + " ». Essayez <b>ls</b>.";
        },
        catGo: function (n) {
          return "→ direction " + n;
        },
        openGo: function (n) {
          return "→ ouverture de " + n + " dans un nouvel onglet";
        },
        sudo: "visiteur n'apparaît pas dans le fichier sudoers. Cet incident sera signalé. 🙂",
        rm: "Bien essayé. Ce serveur a survécu à pire (et il a des sauvegardes).",
        ssh: "Permission denied (publickey). Ici, même root passe par une passkey.",
        exit: "On ne quitte pas un si bon terminal. Mais Échap fonctionne.",
        cd: "Pas besoin de bouger : tout est ici.",
        pwd: "/home/visiteur",
        langSet: "Langue : français.",
        hack: "Accès refusé. Mais si la sécurité vous intéresse, on devrait parler : <b>contact</b>.",
      },
    },
    en: {
      copied: "Copied to clipboard ✓",
      copiedDiscord: "Discord handle copied: jularthus ✓",
      copyFail: "Couldn't copy, sorry.",
      beers: function (d) {
        return d.total.toLocaleString("en-US") + " / 1,000,000 · estimated arrival: " + d.eta.slice(0, 4);
      },
      pal: { section: "section", project: "project", skill: "skill", action: "action", none: "No results. Try \"docker\" or \"contact\"." },
      palActions: {
        lang: "Passer en français",
        email: "Copy the email address",
        discord: "Copy the Discord handle",
        github: "Open GitHub",
        term: "Open the terminal",
        top: "Back to top",
      },
      sections: { "a-propos": "About", projets: "Projects", selection: "The selection", parcours: "Journey", stack: "Stack", contact: "Contact" },
      term: {
        hint: "Type <b>help</b> to see the commands.",
        help: [
          ["help", "this help"],
          ["whoami", "who's behind it"],
          ["neofetch", "the machine, at a glance"],
          ["ls", "the projects"],
          ["cat &lt;project&gt;", "go see a project"],
          ["open &lt;project&gt;", "open it in a tab"],
          ["stack", "the skills"],
          ["contact", "reach me"],
          ["lang fr", "passer en français"],
          ["clear", "clear the screen"],
        ],
        whoami: "<b>Jules-Arthus Klein</b>, engineering student at EPITA Paris, SRS major.\nI build, I automate, I secure.",
        uptime: "running <b>since 2022</b> · 24/7",
        issue: "Ubuntu 24.04 LTS · Razer Blade 15 (2020)",
        ps: "<b>18 containers</b> · running",
        policy: "default_policy: <b>deny</b> · 2FA: passkey",
        neo: [
          ["OS", "Ubuntu 24.04 LTS"],
          ["Machine", "Razer Blade 15 (2020), bought for €50"],
          ["Uptime", "since 2022"],
          ["Containers", "18, almost all private"],
          ["Auth", "Authelia + LLDAP · passkeys"],
          ["Proxy", "nginx · TLS Let's Encrypt"],
          ["Monitoring", "Prometheus + Grafana"],
          ["Admin", "SSH tunnel only"],
        ],
        lsHint: "Tip: <b>cat devdocker</b>",
        stack: "Security · Docker · Linux · Shell · C · Python · Git · C++ · Java · C# · JS",
        contact: "Write to me: ",
        notFound: function (c) {
          return "command not found: " + c + ". Try <b>help</b>.";
        },
        noProject: function (p) {
          return "no project called \"" + p + "\". Try <b>ls</b>.";
        },
        catGo: function (n) {
          return "→ heading to " + n;
        },
        openGo: function (n) {
          return "→ opening " + n + " in a new tab";
        },
        sudo: "visitor is not in the sudoers file. This incident will be reported. 🙂",
        rm: "Nice try. This server has survived worse (and it has backups).",
        ssh: "Permission denied (publickey). Here, even root goes through a passkey.",
        exit: "You don't leave a terminal this good. But Esc works.",
        cd: "No need to move: everything is right here.",
        pwd: "/home/visitor",
        langSet: "Language: English.",
        hack: "Access denied. But if security is your thing, we should talk: <b>contact</b>.",
      },
    },
  };

  return { META: META, EN: EN, SKILLS: SKILLS, PROJECTS: PROJECTS, UI: UI };
})();
