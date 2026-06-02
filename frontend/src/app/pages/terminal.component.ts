import { Component, OnInit, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GithubService } from '../services/github.service';

interface LogLine {
  text: string;
  type: 'info' | 'success' | 'error' | 'input' | 'warning' | 'ascii';
}

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
}

@Component({
  selector: 'app-terminal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container" style="padding-top: 40px; min-height: 80vh;">
      <div style="text-align: center; margin-bottom: 32px;">
        <span class="badge badge-primary" style="margin-bottom: 12px; background-color: var(--primary); color: #000; font-weight: 600;">INTERACTIVE SHELL</span>
        <h1 class="text-gradient" style="margin-bottom: 16px;">Siber Güvenlik Terminali</h1>
        <p style="max-width: 620px; margin: 0 auto;">
          Mert KARABULUT'un siber güvenlik laboratuvarına hoş geldin. Komutlar yardımıyla sistemi test edebilir,
          canlı GitHub projelerini sorgulayabilir veya siber güvenlik quiz mücadelesine katılabilirsin.
        </p>
      </div>

      <!-- Terminal Window -->
      <div class="terminal-window glass-panel" (click)="focusInput()">
        <!-- Title bar -->
        <div class="terminal-titlebar">
          <div class="terminal-dots">
            <span class="dot red"></span>
            <span class="dot yellow"></span>
            <span class="dot green"></span>
          </div>
          <div class="terminal-title">mert&#64;security-lab:~</div>
          <div style="width: 50px;"></div>
        </div>

        <!-- Content Area -->
        <div class="terminal-body" #terminalBody>
          <div *ngFor="let line of logs" [ngClass]="['log-line', 'line-' + line.type]">
            <pre style="margin: 0; white-space: pre-wrap; font-family: 'Courier New', Courier, monospace;">{{ line.text }}</pre>
          </div>

          <!-- Prompt Area -->
          <div class="prompt-area" style="display: flex; align-items: center; margin-top: 8px;">
            <span class="prompt-prefix" style="color: var(--primary); font-family: monospace; font-weight: 700; margin-right: 8px;">
              mert&#64;sec-lab:~$
            </span>
            <input
              #cmdInput
              type="text"
              class="terminal-input"
              (keydown)="onKeyDown($event, cmdInput)"
              autofocus
              autocomplete="off"
              autocorrect="off"
              autocapitalize="off"
              spellcheck="false"
              placeholder="Komut yazın (yardım için 'help')..."
            />
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .terminal-window {
      background: linear-gradient(145deg, rgba(13, 17, 23, 0.9) 0%, rgba(7, 10, 15, 0.95) 100%) !important;
      border: 1px solid rgba(38, 95, 55, 0.3) !important;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(38, 95, 55, 0.05) !important;
      font-family: 'Courier New', Courier, monospace;
    }

    .terminal-titlebar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: rgba(20, 24, 33, 0.9);
      padding: 10px 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .terminal-dots {
      display: flex;
      gap: 8px;
    }

    .dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      display: inline-block;
    }

    .dot.red { background-color: #ef4444; }
    .dot.yellow { background-color: #eab308; }
    .dot.green { background-color: #22c55e; }

    .terminal-title {
      font-size: 0.85rem;
      color: var(--text-muted);
      font-family: 'Outfit', sans-serif;
    }

    .terminal-body {
      padding: 20px;
      height: 480px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-size: 0.95rem;
      scrollbar-width: thin;
      scrollbar-color: rgba(38, 95, 55, 0.3) rgba(0, 0, 0, 0.1);
    }

    /* Scrollbar styles for modern web */
    .terminal-body::-webkit-scrollbar {
      width: 6px;
    }
    .terminal-body::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.1);
    }
    .terminal-body::-webkit-scrollbar-thumb {
      background-color: rgba(38, 95, 55, 0.3);
      border-radius: 3px;
    }

    .log-line {
      line-height: 1.5;
    }

    .line-info { color: #38bdf8; } /* bright cyan */
    .line-success { color: #4ade80; } /* bright green */
    .line-error { color: #f87171; } /* bright red */
    .line-warning { color: #fbbf24; } /* amber */
    .line-input { color: #ffffff; font-weight: bold; }
    .line-ascii { color: var(--primary); } /* cyber amber primary */

    .terminal-input {
      background: transparent;
      border: none;
      outline: none;
      color: #ffffff;
      font-family: 'Courier New', Courier, monospace;
      font-size: 0.95rem;
      width: 100%;
      caret-color: var(--primary);
    }

    /* HSL Cyber Amber definitions override in styles context */
    :host {
      --primary: hsl(38, 95%, 55%);
    }
  `]
})
export class TerminalComponent implements OnInit, AfterViewChecked {
  @ViewChild('terminalBody') private terminalBody!: ElementRef;
  @ViewChild('cmdInput') private cmdInput!: ElementRef;

  public logs: LogLine[] = [];
  private history: string[] = [];
  private historyIndex = -1;

  // Interactive Quiz States
  private inQuizMode = false;
  private quizIndex = 0;
  private quizScore = 0;
  private quizQuestions: QuizQuestion[] = [
    {
      question: "1. Web uygulamalarında SQL enjeksiyonundan (SQLi) korunmak için en güvenli yöntem hangisidir?",
      options: [
        "Gelen parametreleri JavaScript ile client tarafında doğrulamak",
        "SQL sorgularında parametrelendirilmiş (Prepared Statements) yapılar kullanmak",
        "Girdi içerisindeki tek tırnakları (') basitçe silmek"
      ],
      correct: 2
    },
    {
      question: "2. Veritabanında kullanıcı parolalarını güvenli şekilde saklamak için hangi hash yöntemi tercih edilmelidir?",
      options: [
        "MD5 veya SHA1 algoritmaları",
        "Düz metin (Plain Text) olarak şifreli diske kaydetmek",
        "Argon2 veya bcrypt gibi tuzlanmış (salted) anahtar türetme fonksiyonları"
      ],
      correct: 3
    },
    {
      question: "3. Ağdaki paketleri canlı olarak yakalamak, izlemek ve protokol analizi yapmak için en sık kullanılan araç hangisidir?",
      options: [
        "Wireshark",
        "Nmap",
        "Metasploit Framework"
      ],
      correct: 1
    },
    {
      question: "4. Bir web sitesinde saldırganın enjekte ettiği zararlı JavaScript kodunun diğer kullanıcıların tarayıcısında çalıştırılması saldırısı hangisidir?",
      options: [
        "CSRF (Cross-Site Request Forgery)",
        "XSS (Cross-Site Scripting)",
        "RCE (Remote Code Execution)"
      ],
      correct: 2
    },
    {
      question: "5. Bir şifreli veri üzerinde, şifreleme anahtarını bulmak ya da şifreyi kırmak için yapılan matematiksel inceleme çalışmalarına ne denir?",
      options: [
        "Kriptoanaliz (Cryptanalysis)",
        "Sosyal Mühendislik (Social Engineering)",
        "Kaba Kuvvet (Brute Force) Saldırısı"
      ],
      correct: 1
    }
  ];

  constructor(private githubService: GithubService) {}

  ngOnInit(): void {
    this.showWelcomeMessage();
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  public focusInput(): void {
    if (this.cmdInput) {
      this.cmdInput.nativeElement.focus();
    }
  }

  private scrollToBottom(): void {
    try {
      this.terminalBody.nativeElement.scrollTop = this.terminalBody.nativeElement.scrollHeight;
    } catch (err) {}
  }

  private showWelcomeMessage(): void {
    this.logs.push({ text: `███╗   ███╗███████╗██████╗ ████████╗    ███████╗███████╗ ██████╗`, type: 'ascii' });
    this.logs.push({ text: `████╗ ████║██╔════╝██╔══██╗╚══██╔══╝    ██╔════╝██╔════╝██╔════╝`, type: 'ascii' });
    this.logs.push({ text: `██╔████╔██║█████╗  ██████╔╝   ██║       ███████╗█████╗  ██║     `, type: 'ascii' });
    this.logs.push({ text: `██║╚██╔╝██║██╔══╝  ██╔══██╗   ██║       ╚════██║██╔══╝  ██║     `, type: 'ascii' });
    this.logs.push({ text: `██║ ╚═╝ ██║███████╗██║  ██║   ██║       ███████║███████╗╚██████╗`, type: 'ascii' });
    this.logs.push({ text: `╚═╝     ╚═╝╚══════╝╚═╝  ╚═╝   ╚═╝       ╚══════╝╚══════╝ ╚═════╝`, type: 'ascii' });
    this.logs.push({ text: `===============================================================`, type: 'ascii' });
    this.logs.push({ text: `MERT KARABULUT SECURITY LABORATORY & TERMINAL OS v1.1.0`, type: 'success' });
    this.logs.push({ text: `Bağlantı Türü: Güvenli PostgreSQL (blog_db)`, type: 'info' });
    this.logs.push({ text: `Sistem Sahibi: Mert KARABULUT (Siber Güvenlik Teknolojileri)`, type: 'info' });
    this.logs.push({ text: `Tarih: ${new Date().toLocaleString('tr-TR')}`, type: 'info' });
    this.logs.push({ text: `Yardım almak için 'help' yazın.`, type: 'warning' });
    this.logs.push({ text: `===============================================================`, type: 'ascii' });
  }

  public onKeyDown(event: KeyboardEvent, input: HTMLInputElement): void {
    if (event.key === 'Enter') {
      this.onCommandSubmit(input.value);
      input.value = '';
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (this.historyIndex < this.history.length - 1) {
        this.historyIndex++;
        input.value = this.history[this.history.length - 1 - this.historyIndex];
      }
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (this.historyIndex > 0) {
        this.historyIndex--;
        input.value = this.history[this.history.length - 1 - this.historyIndex];
      } else {
        this.historyIndex = -1;
        input.value = '';
      }
    } else if (event.key === 'l' && event.ctrlKey) {
      event.preventDefault();
      this.logs = [];
    }
  }

  public onCommandSubmit(value: string): void {
    const cleanValue = value.trim();
    if (!cleanValue) return;

    this.logs.push({ text: `mert@sec-lab:~$ ${cleanValue}`, type: 'input' });
    this.history.push(cleanValue);
    this.historyIndex = -1;

    if (this.inQuizMode) {
      this.handleQuizInput(cleanValue);
      return;
    }

    this.executeCommand(cleanValue);
  }

  private executeCommand(cmd: string): void {
    const parts = cmd.toLowerCase().split(' ');
    const mainCmd = parts[0];

    switch (mainCmd) {
      case 'help':
        this.cmdHelp();
        break;
      case 'about':
        this.cmdAbout();
        break;
      case 'neofetch':
        this.cmdNeofetch();
        break;
      case 'skills':
        this.cmdSkills();
        break;
      case 'projects':
        this.cmdProjects();
        break;
      case 'quiz':
        this.startQuiz();
        break;
      case 'hack':
        const target = parts.length > 2 && parts[1] === '-t' ? parts[2] : '192.168.1.35';
        this.cmdHack(target);
        break;
      case 'matrix':
        this.cmdMatrix();
        break;
      case 'whoami':
        this.cmdWhoami();
        break;
      case 'contact':
        this.cmdContact();
        break;
      case 'nmap':
        this.cmdNmap(parts.slice(1).join(' ') || 'localhost');
        break;
      case 'ping':
        this.cmdPing(parts[1] || 'mertkarabulut.dev');
        break;
      case 'date':
        this.logs.push({ text: new Date().toLocaleString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }), type: 'info' });
        break;
      case 'ls':
        this.logs.push({ text: `hakkimda/   blog/   projeler/   terminal/`, type: 'info' });
        break;
      case 'pwd':
        this.logs.push({ text: `/home/mertkarabulut/portfolio`, type: 'info' });
        break;
      case 'echo':
        this.logs.push({ text: parts.slice(1).join(' '), type: 'info' });
        break;
      case 'sudo':
        this.logs.push({ text: `[sudo] password for mertkarabulut: `, type: 'warning' });
        setTimeout(() => {
          this.logs.push({ text: `sudo: Bu portfolyoya root erişimin yok. Dene ama napacaksın? 😄`, type: 'error' });
        }, 700);
        break;
      case 'clear':
        this.logs = [];
        break;
      default:
        this.logs.push({ text: `bash: ${cmd}: komut bulunamadı. Desteklenen komutları görmek için 'help' yazın.`, type: 'error' });
    }
  }

  private cmdHelp(): void {
    this.logs.push({ text: `=== MERT KARABULUT SECURITY LAB — KOMUT LİSTESİ ===`, type: 'success' });
    this.logs.push({ text: `  [Profil & Bilgi]`, type: 'warning' });
    this.logs.push({ text: `  whoami   : Kimlik ve profil bilgileri`, type: 'info' });
    this.logs.push({ text: `  about    : Biyografi ve vizyon`, type: 'info' });
    this.logs.push({ text: `  neofetch : Sistem özeti (neofetch tarzı)`, type: 'info' });
    this.logs.push({ text: `  skills   : Yetkinlikler ve araçlar`, type: 'info' });
    this.logs.push({ text: `  projects : Canlı GitHub projeleri`, type: 'info' });
    this.logs.push({ text: `  contact  : İletişim bilgileri`, type: 'info' });
    this.logs.push({ text: `  [Ağ & Güvenlik]`, type: 'warning' });
    this.logs.push({ text: `  nmap     : Port tarama demosu (Örn: nmap 192.168.1.1)`, type: 'info' });
    this.logs.push({ text: `  ping     : Bağlantı testi (Örn: ping google.com)`, type: 'info' });
    this.logs.push({ text: `  hack     : Sızma testi simülasyonu (Örn: hack -t 192.168.1.100)`, type: 'info' });
    this.logs.push({ text: `  [Eğlence & Diğer]`, type: 'warning' });
    this.logs.push({ text: `  quiz     : Siber Güvenlik quiz mücadelesi (Rozetli!)`, type: 'info' });
    this.logs.push({ text: `  matrix   : Matrix kod yağmuru efekti`, type: 'info' });
    this.logs.push({ text: `  ls       : Sayfa listesi`, type: 'info' });
    this.logs.push({ text: `  date     : Sistem tarihi`, type: 'info' });
    this.logs.push({ text: `  clear    : Terminal temizle`, type: 'info' });
    this.logs.push({ text: `  ↑↓ tuşları: komut geçmişi | Ctrl+L: temizle`, type: 'warning' });
  }

  private cmdWhoami(): void {
    this.logs.push({ text: `Mert KARABULUT`, type: 'success' });
    this.logs.push({ text: `─────────────────────────────────────────────`, type: 'ascii' });
    this.logs.push({ text: `  Rol     : Siber Güvenlik Öğrencisi & Full-Stack Geliştirici`, type: 'info' });
    this.logs.push({ text: `  Konum   : İzmir, Türkiye`, type: 'info' });
    this.logs.push({ text: `  Okul    : Konak Kavram Meslek Yüksekokulu`, type: 'info' });
    this.logs.push({ text: `  Bölüm   : Siber Güvenlik Teknolojileri`, type: 'info' });
    this.logs.push({ text: `  E-posta : mertkarabulut@icloud.com`, type: 'info' });
    this.logs.push({ text: `  GitHub  : github.com/karabulutmert68-konak`, type: 'info' });
  }

  private cmdContact(): void {
    this.logs.push({ text: `--- İLETİŞİM BİLGİLERİ ---`, type: 'success' });
    this.logs.push({ text: `  E-posta : mertkarabulut@icloud.com`, type: 'info' });
    this.logs.push({ text: `  GitHub  : https://github.com/karabulutmert68-konak`, type: 'info' });
    this.logs.push({ text: `  Konum   : İzmir, Türkiye`, type: 'info' });
    this.logs.push({ text: `  İş birlikleri için e-posta gönderebilirsin.`, type: 'warning' });
  }

  private cmdNmap(target: string): void {
    this.logs.push({ text: `Starting Nmap 7.94 ( https://nmap.org )`, type: 'warning' });
    this.logs.push({ text: `Nmap scan report for ${target}`, type: 'info' });
    setTimeout(() => {
      this.logs.push({ text: `Host is up (0.00048s latency).`, type: 'success' });
      this.logs.push({ text: `PORT      STATE  SERVICE   VERSION`, type: 'ascii' });
      this.logs.push({ text: `80/tcp    open   http      Angular 19 SPA`, type: 'success' });
      this.logs.push({ text: `8000/tcp  open   http      Django REST Framework`, type: 'success' });
      this.logs.push({ text: `443/tcp   open   https     TLS 1.3`, type: 'info' });
      this.logs.push({ text: `22/tcp    closed ssh`, type: 'info' });
      this.logs.push({ text: `Nmap done: 1 IP (1 host up) scanned in 0.93 seconds`, type: 'warning' });
    }, 600);
  }

  private cmdPing(host: string): void {
    this.logs.push({ text: `PING ${host}: 56 data bytes`, type: 'info' });
    let seq = 0;
    const interval = setInterval(() => {
      const ms = (Math.random() * 2 + 1).toFixed(1);
      this.logs.push({ text: `64 bytes from ${host}: icmp_seq=${seq} ttl=64 time=${ms} ms`, type: 'success' });
      seq++;
      if (seq >= 4) {
        clearInterval(interval);
        this.logs.push({ text: `--- ${host} ping statistics ---`, type: 'info' });
        this.logs.push({ text: `4 packets transmitted, 4 received, 0% packet loss`, type: 'success' });
      }
    }, 500);
  }

  private cmdAbout(): void {
    this.logs.push({ text: `--- PROFİL ÖZETİ & MİSYON ---`, type: 'success' });
    this.logs.push({ text: `İzmir'de yaşayan meraklı bir Siber Güvenlik öğrencisiyim. Konak Kavram Meslek Yüksekokulu siber güvenlik laboratuvarlarında ağ güvenliği, sızma testleri ve web zafiyetleri üzerine yoğunlaşıyorum.`, type: 'info' });
    this.logs.push({ text: `Aynı zamanda Full-Stack web geliştirme projeleri yapmaktan, C#, Angular ve Django REST Framework ile entegre, güvenlik odaklı sistemler kodlamaktan keyif alıyorum.`, type: 'info' });
    this.logs.push({ text: `Amacım; hem teorik siber güvenlik mekanizmalarını anlamak, hem de bunları pratik güvenli yazılım geliştirme süreçleriyle harmanlamaktır.`, type: 'info' });
  }

  private cmdNeofetch(): void {
    const neofetchText = `
   /\\_/\\     mert@security-lab
  ( o.o )    -----------------
   > ^ <     OS: İzmir Cyber Security OS v1.0.4
             Host: Konak Kavram MYO Lab
             Kernel: Angular-18-Core
             Shell: zsh (Mert-Security-Shell)
             Uptime: 20 years, 2 months
             Packages: npm (12), pip (8), nuget (4)
             CPU: Mert KARABULUT (1 Core / 4 Threads)
             Memory: Siber Güvenlik (98%) / Yazılım Geliştirme (92%)
             DB Backend: PostgreSQL (blog_db)
    `;
    this.logs.push({ text: neofetchText, type: 'ascii' });
  }

  private cmdSkills(): void {
    this.logs.push({ text: `--- TEKNİK BECERİLER & YETENEK ÇUBUKLARI ---`, type: 'success' });
    this.logs.push({ text: `Siber Güvenlik / Sızma Testleri  [██████████] 100% (Kali Linux, Wireshark, BurpSuite)`, type: 'ascii' });
    this.logs.push({ text: `C# / Unity / .NET Core         [█████████░] 90% (Masaüstü, Oyun Geliştirme, API)`, type: 'ascii' });
    this.logs.push({ text: `Python / Django REST Framework [████████░░] 80% (Veritabanı, Backend Mimarileri)`, type: 'ascii' });
    this.logs.push({ text: `TypeScript / Angular UI        [████████░░] 80% (Modern SPA, Reactive UI)`, type: 'ascii' });
    this.logs.push({ text: `Veritabanı Güvenliği (PostgreSQL)[█████████░] 90% (SQL Parametrelendirme, Tasarım)`, type: 'ascii' });
  }

  private cmdProjects(): void {
    this.logs.push({ text: `Canlı GitHub verileri çekiliyor...`, type: 'warning' });
    this.githubService.getRepositories().subscribe({
      next: (repos) => {
        this.logs.push({ text: `Başarılı! Mert KARABULUT'un Canlı GitHub Repoları:`, type: 'success' });
        this.logs.push({ text: `----------------------------------------------------------------------`, type: 'ascii' });
        this.logs.push({ text: `Proje Adı             | Dil         | Yıldız ⭐ | Link`, type: 'warning' });
        this.logs.push({ text: `----------------------------------------------------------------------`, type: 'ascii' });
        repos.forEach(repo => {
          const namePadded = repo.name.padEnd(21, ' ').substring(0, 21);
          const langPadded = (repo.language || 'N/A').padEnd(11, ' ').substring(0, 11);
          const starPadded = String(repo.stargazers_count).padEnd(9, ' ');
          this.logs.push({
            text: `${namePadded} | ${langPadded} | ${starPadded} | ${repo.html_url}`,
            type: 'info'
          });
        });
        this.logs.push({ text: `----------------------------------------------------------------------`, type: 'ascii' });
      },
      error: () => {
        this.logs.push({ text: `HATA: GitHub API'ye bağlanılamadı. Lütfen internet bağlantısını kontrol edin.`, type: 'error' });
      }
    });
  }

  private cmdHack(target: string): void {
    this.logs.push({ text: `[!] SIZMA TESTİ SİMÜLASYONU BAŞLATILDI: TARGET IP = ${target}`, type: 'warning' });
    this.logs.push({ text: `[+] Adım 1: Nmap port taraması yapılıyor...`, type: 'info' });

    setTimeout(() => {
      this.logs.push({ text: `[+] BULUNAN AÇIK PORTLAR: 22/tcp (ssh), 80/tcp (http), 443/tcp (https), 5432/tcp (postgresql)`, type: 'success' });
      this.logs.push({ text: `[+] Adım 2: Web zafiyet tarayıcısı (OWASP ZAP) çalıştırılıyor...`, type: 'info' });
    }, 800);

    setTimeout(() => {
      this.logs.push({ text: `[!] UYARI: Zayıf PostgreSQL kimlik doğrulama mekanizması tespit edildi!`, type: 'warning' });
      this.logs.push({ text: `[+] Adım 3: Brute force aracı (Hydra) tetikleniyor...`, type: 'info' });
    }, 1800);

    setTimeout(() => {
      this.logs.push({ text: `[+] Kimlik eşleşmesi tespit edildi: User 'demo_admin', Pass '████████' (REDACTED)`, type: 'success' });
      this.logs.push({ text: `[+] Adım 4: Exploit Payload enjekte ediliyor...`, type: 'info' });
    }, 2800);

    setTimeout(() => {
      this.logs.push({ text: `[████████████████████] 100% Payload Delivery Completed.`, type: 'success' });
      this.logs.push({ text: `[+++] SİMÜLASYON TAMAMLANDI — Yetki seviyesi: ROOT [Demo Ortamı]`, type: 'success' });
      this.logs.push({ text: `[⚠]  Bu bir etik sızma testi simülasyonudur. Gerçek sistemlere izinsiz erişim TCK kapsamında suçtur.`, type: 'warning' });
    }, 3800);
  }

  private cmdMatrix(): void {
    this.logs.push({ text: `--- MATRIX DİJİTAL YAĞMURU TETİKLENDİ ---`, type: 'success' });
    let count = 0;
    const generateMatrixLine = () => {
      const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ$#@%&+-/*";
      let line = "";
      for (let i = 0; i < 65; i++) {
        if (Math.random() > 0.8) {
          line += chars[Math.floor(Math.random() * chars.length)];
        } else {
          line += " ";
        }
      }
      this.logs.push({ text: line, type: 'success' });
      count++;
      if (count < 25) {
        setTimeout(generateMatrixLine, 60);
      }
    };
    generateMatrixLine();
  }

  // Quiz Game Functions
  private startQuiz(): void {
    this.inQuizMode = true;
    this.quizIndex = 0;
    this.quizScore = 0;
    this.logs.push({ text: `===============================================================`, type: 'ascii' });
    this.logs.push({ text: `🏆 SİBER GÜVENLİK QUİZ MÜCADELESİNE HOŞ GELDİN! 🏆`, type: 'success' });
    this.logs.push({ text: `Mert'in siber dünyasından 5 seçkin soru seni bekliyor.`, type: 'info' });
    this.logs.push({ text: `Cevap vermek için seçenek numarasını yazıp Enter'a basman yeterli. (Örn: '1', '2' veya '3')`, type: 'warning' });
    this.logs.push({ text: `===============================================================`, type: 'ascii' });

    this.askQuestion();
  }

  private askQuestion(): void {
    const q = this.quizQuestions[this.quizIndex];
    this.logs.push({ text: `\n${q.question}`, type: 'warning' });
    q.options.forEach((opt, idx) => {
      this.logs.push({ text: `  [ ${idx + 1} ] ${opt}`, type: 'info' });
    });
  }

  private handleQuizInput(input: string): void {
    const answer = parseInt(input, 10);
    const q = this.quizQuestions[this.quizIndex];

    if (isNaN(answer) || answer < 1 || answer > q.options.length) {
      this.logs.push({ text: `Lütfen geçerli bir seçenek numarası girin (1 - ${q.options.length}).`, type: 'error' });
      return;
    }

    if (answer === q.correct) {
      this.logs.push({ text: `✔ DOĞRU CEVAP!`, type: 'success' });
      this.quizScore++;
    } else {
      this.logs.push({ text: `❌ YANLIŞ CEVAP! Doğru seçenek: ${q.correct}) ${q.options[q.correct - 1]}`, type: 'error' });
    }

    this.quizIndex++;

    if (this.quizIndex < this.quizQuestions.length) {
      this.askQuestion();
    } else {
      this.finishQuiz();
    }
  }

  private finishQuiz(): void {
    this.inQuizMode = false;
    this.logs.push({ text: `===============================================================`, type: 'ascii' });
    this.logs.push({ text: `🏁 QUİZ TAMAMLANDI! 🏁`, type: 'success' });
    this.logs.push({ text: `Skorun: ${this.quizScore} / ${this.quizQuestions.length}`, type: 'warning' });

    if (this.quizScore === this.quizQuestions.length) {
      this.logs.push({ text: `🏆 MÜKEMMEL! Tam puan aldın! Mert KARABULUT onaylı Siber Güvenlik Rozetini kazandın!`, type: 'success' });
      this.logs.push({ text: `Rozet Kodu: [MERT-SEC-CHAMPION-2026]`, type: 'success' });
      this.logs.push({ text: `Bunu profilinde taşıyabilirsin!`, type: 'success' });
    } else if (this.quizScore >= 3) {
      this.logs.push({ text: `Tebrikler, iyi bir siber güvenlik altyapısına sahipsin!`, type: 'success' });
    } else {
      this.logs.push({ text: `Kendini geliştirmek için Mert'in blog yazılarını okuyabilirsin!`, type: 'info' });
    }
    this.logs.push({ text: `Normal terminal moduna dönüldü. Yeni bir komut yazabilirsin.`, type: 'info' });
    this.logs.push({ text: `===============================================================`, type: 'ascii' });
  }
}
