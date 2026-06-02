@echo off
chcp 65001 >nul
title Mert KARABULUT - Blog Projesi

echo.
echo  ============================================================
echo   Mert KARABULUT - Siber Guvenlik ve Full-Stack Blog Projesi
echo   Baslatiliyor...
echo  ============================================================
echo.

:: ---------------------------------------------------------------
:: Python kontrolu
:: ---------------------------------------------------------------
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [HATA] Python bulunamadi!
    echo Python'u https://www.python.org/downloads/ adresinden indirin.
    echo Kurulum sirasinda "Add Python to PATH" secenegini isaretleyin.
    pause
    exit /b 1
)

:: Node.js kontrolu
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [HATA] Node.js bulunamadi!
    echo Node.js'i https://nodejs.org adresinden indirin.
    pause
    exit /b 1
)

:: ---------------------------------------------------------------
:: Backend kurulum
:: ---------------------------------------------------------------
echo [1/5] Backend ortami hazirlaniyor...
cd /d "%~dp0backend"

if not exist "venv" (
    echo       Sanal ortam olusturuluyor...
    python -m venv venv
    if %errorlevel% neq 0 (
        echo [HATA] Sanal ortam olusturulamadi!
        pause
        exit /b 1
    )
)

echo [2/5] Python kutuphaneleri yukleniyor...
call venv\Scripts\activate.bat
pip install -r requirements.txt -q
if %errorlevel% neq 0 (
    echo [UYARI] Bazi kutuphaneler yuklenemedi. psycopg2 olmadan SQLite ile devam ediliyor...
    pip install django djangorestframework djangorestframework-simplejwt django-cors-headers drf-spectacular pillow django-environ -q
)

echo [3/5] Veritabani migrasyonlari calistiriliyor...
python manage.py migrate --run-syncdb >nul 2>&1
python manage.py migrate
if %errorlevel% neq 0 (
    echo [HATA] Migrasyon basarisiz!
    pause
    exit /b 1
)

:: Superuser yoksa olustur (admin / admin123)
echo [4/5] Admin kullanicisi kontrol ediliyor...
python manage.py shell -c "from django.contrib.auth import get_user_model; U=get_user_model(); U.objects.filter(username='admin').exists() or U.objects.create_superuser('admin','admin@blog.local','admin123'); print('Admin hazir.')"

:: ---------------------------------------------------------------
:: Frontend kurulum
:: ---------------------------------------------------------------
echo [5/5] Frontend bagimliliklari kontrol ediliyor...
cd /d "%~dp0frontend"

if not exist "node_modules" (
    echo       node_modules bulunamadi, npm install calistiriliyor...
    npm install
    if %errorlevel% neq 0 (
        echo [HATA] npm install basarisiz!
        pause
        exit /b 1
    )
)

:: ---------------------------------------------------------------
:: Sunuculari ayri pencerelerde baslat
:: ---------------------------------------------------------------
echo.
echo  ============================================================
echo   Sunucular baslatiliyor...
echo  ============================================================
echo.

:: Django backend - yeni pencerede
start "Django Backend (Port 8000)" cmd /k "cd /d "%~dp0backend" && call venv\Scripts\activate.bat && python manage.py runserver 8000"

:: 2 saniye bekle
timeout /t 2 /nobreak >nul

:: Angular frontend - yeni pencerede
start "Angular Frontend (Port 4200)" cmd /k "cd /d "%~dp0frontend" && npm run start"

:: ---------------------------------------------------------------
:: Bilgi ekrani
:: ---------------------------------------------------------------
echo.
echo  ============================================================
echo   Proje basariyla baslatildi!
echo  ============================================================
echo.
echo   Frontend  :  http://localhost:4200
echo   Backend   :  http://localhost:8000
echo   Admin     :  http://localhost:8000/admin
echo               Kullanici: admin  /  Sifre: admin123
echo   API Docs  :  http://localhost:8000/api/docs/
echo.
echo   Not: Iki yeni terminal penceresi acildi.
echo        Projeyi durdurmak icin her iki pencereyi de kapatin.
echo.

timeout /t 5 /nobreak >nul
start http://localhost:4200

pause
