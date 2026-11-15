/* Teste do HTML local via Chromium (não modifica dados do Artifact Claude). */
const fs=require('fs');
const path=require('path');
const puppeteer=require('C:/Users/rodne/AppData/Local/npm-cache/_npx/4b4c857f6efdfb61/node_modules/puppeteer');
const source=path.resolve(__dirname,'../assets/rod-neuro-studio.html');
const report=[];
const errors=[];
function check(condition,msg) {if(!condition)throw new Error(msg);report.push('OK: '+msg);}
(async()=>{
 const browser=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--no-sandbox','--use-gl=angle','--enable-webgl','--disable-gpu-sandbox','--window-size=1440,900']});
 try{
   const page=await browser.newPage();
   page.on('pageerror',e=>errors.push(String(e)));
   page.on('console',msg=>{if(msg.type()==='error') errors.push('console: '+msg.text().slice(0,180));});
   await page.setViewport({width:1440,height:900});
   const url='file:///'+source.replace(/\\/g,'/');
   await page.goto(url,{waitUntil:'domcontentloaded',timeout:20000});
   await page.waitForSelector('#view',{timeout:10000});
   const title=await page.title();
   check(title==='ROD Neuro Studio','Título do Studio carregado');
   const logo=await page.$eval('.brand svg',e=>({label:e.getAttribute('aria-label'),paths:e.querySelectorAll('path').length}));
   check(logo.label==='Símbolo ROD'&&logo.paths>=10,'Logo SVG original renderizado');
   const routes=['painel','simulador','creative','jornada','comparar','testes','aprendizados','historico','pergunte'];
   for(const route of routes){
     await page.evaluate(route=>{location.hash=route},route);
     await new Promise(r=>setTimeout(r,200));
     const heading=await page.$eval('#view h1, #view h2',el=>el.innerText);
     check(!!heading, 'Aba '+route+': '+heading);
   }
   await page.evaluate(()=>{location.hash='simulador'});
   await new Promise(r=>setTimeout(r,350));
   const deckCount=await page.$$eval('.cc',els=>els.length);
   check(deckCount>=15,'Cartas de vieses presentes: '+deckCount);
   const first=await page.$('.cc:not(.trap)');
   if(first) {await first.click();const pressed=await page.$eval('.cc[aria-pressed="true"]',el=>el.dataset.id);check(!!pressed,'Seleção de mecanismos funciona');}
   const views=await page.$$eval('#stage .b3dView',xs=>xs.map(e=>e.innerText));
   check(views.join('|')==='Lateral|Frente|Cima|Trás','Quatro vistas do cérebro disponíveis');
   const webgl=await page.$eval('#stage',el=>({canvas:!!el.querySelector('canvas'),fallback:!!el.querySelector('.hint')}));
   report.push('Info: mapa 3D canvas = '+webgl.canvas);
   if(webgl.canvas){
     await page.click('#stage [data-view=front]');
     check((await page.$eval('#b3dGira',e=>e.innerText))==='Girar','Troca de vista frontal pausa giro');
   } else {
     report.push('AVISO: WebGL/Three.js não renderizou no Chrome headless; fallback está disponível.');
   }
   await page.evaluate(()=>{location.hash='jornada'});
   await new Promise(r=>setTimeout(r,250));
   check((await page.$$eval('#stage2 .b3dView',els=>els.length))===4,'Vistas também aparecem no Atlas');
   const stats=await page.evaluate(()=>{
     const base={a:{base:12000,conv:180},b:{base:11800,conv:236},hipotese:'Hipótese',metrica:'Pedidos',periodo:'14 dias'};
     return {
       invalid:estat({a:{base:100,conv:-2},b:{base:100,conv:3}}).ok,
       preliminary:estat({...base,status:'rodando',plano_ok:true}),
       confirmed:estat({...base,status:'concluido',plano_ok:true}),
       unsigned:estat({...base,status:'concluido',plano_ok:false})
     };
   });
   check(stats.invalid===false,'Contagens negativas rejeitadas');
   check(stats.preliminary.vk!=='ok','Teste em andamento não declara vencedor');
   check(stats.unsigned.vk!=='ok','Sem confirmação de plano não declara vencedor');
   check(stats.confirmed.ok&&stats.confirmed.pA<stats.confirmed.pB,'Cálculo de conversão A/B executado');
   await page.evaluate(()=>{location.hash='testes'});
   await new Promise(r=>setTimeout(r,160));
   await page.click('#bNovo');
   await new Promise(r=>setTimeout(r,160));
   check((await page.$('#tPlano'))!==null,'Confirmação do planejamento no formulário A/B');
   const sample={
     id:'qa-a',titulo:'Campanha ROD A',criado:'2026-11-15T15:00:00Z',
     nota:4,emocao:'Confiança',resumo:'Exemplo sintético apenas para QA.',
     objetivo_comportamental:'Gerar pedidos pelo WhatsApp',
     contexto:{tipo:'Anúncio',categoria:'Serviços',publico:'Público morno',canal:'WhatsApp',objetivo:'Pedidos'},
     intencao:{ideia:'Teste de diagnóstico',pensar:'É simples',sentir:'Confiança',fazer:'Pedir'},
     leituras:[{nome:'Atenção',nota:8,achado:'Bom contraste visual'},{nome:'Carga',nota:7,achado:'Mensagem curta'}],
     intencao_percepcao:[{aspecto:'Clareza',intencao:'Simples',percepcao:'Provavelmente clara',status:'ok',evidencia:'CONTEXTUAL'}],
     barreiras:[{id:'esforco',peso:'alto',porque:'Muitos passos'}],
     simulador:{ativas:['contraste'],sugeridas:['cta_unico']},
     ciencia:[{conceito:'Fluência',evidencia:'CONTEXTUAL',o_que_diz:'Facilidade depende do contexto',aplicacao:'Título direto',fonte:'Referência de QA'}],
     versoes:[{nome:'A',descricao:'Original'},{nome:'B',descricao:'Revisada'}]
   };
   await page.evaluate(a=>{
      const b={...a,id:'qa-b',titulo:'Campanha ROD B',nota:3,simulador:{ativas:['cta_unico'],sugeridas:['contraste']}};
      analises=[a,b];selecionar(a.id);
   },sample);
   await page.evaluate(()=>{location.hash='painel'});
   await new Promise(r=>setTimeout(r,250));
   check((await page.$eval('#view',e=>e.innerText)).includes('Campanha ROD A'),'Diagnóstico com dados sintéticos renderiza');
   await page.evaluate(()=>{location.hash='comparar'});
   await new Promise(r=>setTimeout(r,220));
   check((await page.$('#cmpA'))!==null&&(await page.$('#cmpB'))!==null,'Comparador A/B renderiza duas análises');
   await page.evaluate(()=>{location.hash='creative'});
   await new Promise(r=>setTimeout(r,220));
   check((await page.$('#canais'))!==null,'Creative Lab renderiza canal e diretrizes');
   await page.setViewport({width:390,height:844,isMobile:true,deviceScaleFactor:1});
   await page.evaluate(()=>{location.hash='jornada'});
   await new Promise(r=>setTimeout(r,350));
   const mobile=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));
   check(mobile.scroll<=mobile.width+4,'Layout mobile sem overflow horizontal: '+JSON.stringify(mobile));
   await page.screenshot({path:process.env.TEMP+'/rod-neuro-studio-qa-mobile.png',fullPage:false});
   await page.setViewport({width:1440,height:900});
   await page.evaluate(()=>{location.hash='simulador'});
   await new Promise(r=>setTimeout(r,200));
   await page.screenshot({path:process.env.TEMP+'/rod-neuro-studio-qa-desktop.png',fullPage:false});
   report.push('Info: erros de console = '+errors.length);
   if(errors.length) report.push(...errors.slice(0,6));
   const output=path.resolve(__dirname,'../QA-resultado.txt');
   fs.writeFileSync(output,report.join('\n')+'\n', 'utf8');
   console.log(report.join('\n'));
   if(errors.some(x=>/Uncaught|TypeError|ReferenceError|SyntaxError/i.test(x)))process.exitCode=1;
 }finally{await browser.close();}
})().catch(err=>{console.error('FALHA:',err.stack||err);process.exitCode=1;});
