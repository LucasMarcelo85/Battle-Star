# 📤 GUIA DE DEPLOY - COLOCAR O JOGO ONLINE

## Opção 1: GitHub Pages (RECOMENDADO - Gratuito)

### Passo 1: Criar repositório no GitHub
1. Acesse [github.com](https://github.com)
2. Clique em "New repository"
3. Nome: `Battle-Star`
4. Descrição: `Jogo de nave em ação - Mobile Friendly`
5. Marque "Public"
6. Clique "Create repository"

### Passo 2: Push do seu código
```powershell
cd "c:\Users\Windows\Desktop\Battle-Star"
git init
git add .
git commit -m "Initial commit - Mobile optimized"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/Battle-Star.git
git push -u origin main
```

### Passo 3: Ativar GitHub Pages
1. Vá para Settings do repositório
2. Seção "Pages"
3. Source: `main branch`
4. Save

**URL do jogo**: `https://seu_usuario.github.io/Battle-Star`

---

## Opção 2: Netlify (MUITO FÁCIL)

### Passo 1: Conectar GitHub
1. Acesse [netlify.com](https://netlify.com)
2. Clique "Sign up"
3. "Sign up with GitHub"
4. Autorize

### Passo 2: Deploy
1. Clique "New site from Git"
2. Selecione "Battle-Star"
3. Configure:
   - Branch: `main`
   - Build command: (deixar em branco)
   - Publish directory: `.` (ou `/`)
4. Clique "Deploy site"

**URL do jogo**: `https://seu-site.netlify.app`

---

## Opção 3: Vercel (RECOMENDADO)

### Passo 1: Deploy Direto
1. Acesse [vercel.com](https://vercel.com)
2. Clique "New Project"
3. Importe seu repositório GitHub
4. Clique "Deploy"

**URL do jogo**: `https://battle-star.vercel.app`

---

## Opção 4: Seu Próprio Servidor (Mais Controle)

### Requisitos
- Servidor web (Apache, Nginx, Node.js, etc)
- FTP ou SSH acesso

### Upload via FTP
```
1. Use FileZilla ou Cyberduck
2. Conecte ao seu servidor
3. Copie todos os arquivos para public_html/
4. Acesse via seu domínio
```

### Upload via SSH
```bash
scp -r "C:\Users\Windows\Desktop\Battle-Star" user@seu-servidor.com:/var/www/html/
```

---

## Checklist Pré-Deploy

- [ ] Todos os arquivos estão no lugar
- [ ] `index.html` está na raiz
- [ ] Pastas `css/`, `js/`, `img/`, `sound/` existem
- [ ] Scripts carregam sem erros (F12 > Console)
- [ ] Testou em mobile
- [ ] Testou em desktop
- [ ] Som está funcionando
- [ ] Controles responderam
- [ ] Nenhum erro no console

---

## Teste Após Deploy

### URL Base
Acesse sua URL no navegador

### Checklist de Teste
1. **Página carrega?** ✅
2. **Som toca?** ✅
3. **Clica em "Jogar"?** ✅
4. **Consegue mover (teclado)?** ✅
5. **Consegue atirar (Space)?** ✅
6. **Em mobile aparece botão de tiro?** ✅
7. **Arrastar funciona em mobile?** ✅
8. **Sem erros no console (F12)?** ✅

---

## Optimizar Para Produção

### Minificar CSS
```bash
npm install -g clean-css-cli
cleancss css/style.css css/mobile.css -o css/style.min.css
```

### Minificar JavaScript
```bash
npm install -g uglify-js
uglifyjs js/main.js js/game.js -c -m -o js/main.min.js
```

### Otimizar Imagens
```bash
npm install -g imagemin-cli
imagemin img/ --out-dir=img-optimized
```

---

## Performance Checklist

- [ ] Google PageSpeed > 80
- [ ] Lighthouse > 80
- [ ] Load time < 3s
- [ ] FPS mantido em 60
- [ ] Sem memory leaks
- [ ] Responsive design ok

### Testar Performance
1. Abra DevTools (F12)
2. Aba "Lighthouse"
3. Clique "Analyze page load"

---

## SEO Básico

### Adicione ao `<head>`
```html
<meta name="description" content="Jogo grátis de nave em ação para mobile e desktop">
<meta name="keywords" content="jogo, nave, ação, mobile, grátis">
<meta name="author" content="DevMarcelo">
<meta property="og:title" content="Galácticos">
<meta property="og:description" content="Jogo grátis de nave em ação">
<meta property="og:image" content="/img/banner.png">
```

---

## Domínio Personalizado

### GitHub Pages
1. Compre domínio (Godaddy, Namecheap, etc)
2. Configure DNS:
   - `A` record: `185.199.108.153`
   - `CNAME`: seu-usuario.github.io
3. No GitHub: Settings > Pages > Custom domain
4. Espere 24h para propagar

### Netlify
1. Em Site settings > Domain management
2. Clique "Add custom domain"
3. Siga as instruções

---

## Monitorar Depois do Deploy

### Analytics
```html
<!-- Google Analytics (adicione ao final do body) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_ID');
</script>
```

### Error Tracking
```html
<!-- Sentry (para monitorar erros) -->
<script src="https://browser.sentry-cdn.com/6.19.0/bundle.min.js"></script>
<script>
  Sentry.init({ dsn: "YOUR_DSN_HERE" });
</script>
```

---

## Troubleshooting Deploy

| Problema | Solução |
|----------|---------|
| Imagens não carregam | Verifique paths relativos |
| Sons não tocam | Use HTTPS, not HTTP |
| Scripts não carregam | Verifique console, caminhos |
| Cache antigo | Limpe browser cache |
| CORS error | Configure headers no servidor |

---

## Suporte Mobile no Servidor

### Adicione aos headers HTTP
```
Access-Control-Allow-Origin: *
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
X-UA-Compatible: IE=edge
```

### .htaccess (Apache)
```apache
<IfModule mod_mime.c>
    AddEncoding gzip .gz
    AddType application/x-gzip .gz
</IfModule>

<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/gif "access plus 1 month"
    ExpiresByType image/jpeg "access plus 1 month"
    ExpiresByType image/png "access plus 1 month"
</IfModule>
```

---

## URL Final

Depois de fazer deploy, sua URL será:

**GitHub Pages**: `https://seu-usuario.github.io/Battle-Star`
**Netlify**: `https://seu-site.netlify.app`
**Vercel**: `https://seu-site.vercel.app`
**Seu domínio**: `https://seu-dominio.com`

---

## Sharing Social

### Link para compartilhar
```
https://seu-site.com
```

### Texto sugerido
```
Joga Galácticos! 🚀 Um jogo de nave em ação 
totalmente otimizado para mobile! Arraste para 
mover e clique para atirar. Totalmente grátis! 

[link]
```

---

**Pronto para ir ao ar! 🚀**

Escolha a opção que preferir e siga os passos. Em minutos seu jogo estará online e acessível para todos!
