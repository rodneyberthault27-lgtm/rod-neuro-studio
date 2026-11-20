/* ROD Neuro Studio | Attention Lab v3
   Browser-local contrast/saliency estimate. NOT an eye-tracking measurement. */
function renderAtencao(){
  view.innerHTML = [
    '<section class="attention-head">',
      '<div><div class="eyebrow">02 / ATTENTION LAB</div>',
      '<h1>O que a peça faz o olhar notar?</h1>',
      '<p>Explore o contraste, a hierarquia e a legibilidade de uma peça real. O mapa utiliza um algoritmo local de saliência visual. Ele não mede fixações, emoção nem conversão.</p></div>',
      '<span class="attention-tag">PREVISÃO VISUAL / NÃO MEDIÇÃO</span>',
    '</section>',
    '<div class="attention-grid">',
      '<section class="attention-workspace" aria-label="Prévia da peça e saliência visual">',
        '<div class="attention-toolbar"><strong>CAMPO DE OBSERVAÇÃO</strong><span id="rodAttentionStatus">AGUARDANDO IMAGEM</span></div>',
        '<div class="attention-canvas">',
          '<div class="attention-empty" id="rodAttentionEmpty">',
            '<div class="attention-empty-number">INPUT 01 / CRIATIVO</div>',
            '<h2>A análise começa pela peça.</h2>',
            '<p>Envie um anúncio, banner ou embalagem para observar contraste e a hierarquia visual estimada.</p>',
          '</div>',
          '<canvas id="rodAttentionCanvas" role="img" aria-label="Prévia da peça analisada"></canvas>',
        '</div>',
        '<div class="attention-controls" role="group" aria-label="Camadas de visualização">',
          '<button type="button" data-attention-mode="heat" aria-pressed="true" disabled>Mapa previsto</button>',
          '<button type="button" data-attention-mode="original" disabled>Original</button>',
          '<button type="button" data-attention-mode="gray" disabled>Cinza</button>',
          '<button type="button" data-attention-mode="blur" disabled>Desfoque</button>',
          '<button type="button" id="rodAttentionDownload" disabled>Exportar prévia</button>',
        '</div>',
      '</section>',
      '<aside class="attention-sidebar">',
        '<div class="card">',
          '<div class="attention-file-label">01 / IMPORTE SUA PEÇA</div>',
          '<input id="rodAttentionFile" class="attention-file" type="file" accept="image/png,image/jpeg,image/webp" aria-label="Selecionar imagem PNG, JPEG ou WebP">',
          '<p class="attention-filename" id="rodAttentionName">PNG, JPEG ou WebP. Até 10 MB. Processamento local.</p>',
          '<p id="rodAttentionError" class="attention-error" role="alert"></p>',
        '</div>',
        '<div class="card">',
          '<h2>Como interpretar</h2>',
          '<ol>',
            '<li><strong>Mapa previsto:</strong> sinaliza regiões de maior diferença visual.</li>',
            '<li><strong>Cinza:</strong> mostra se o contraste funciona sem depender da cor.</li>',
            '<li><strong>Desfoque:</strong> revela a hierarquia geral antes dos detalhes.</li>',
          '</ol>',
          '<div class="attention-legend"><span>BAIXO</span><span class="legend-gradient"></span><span>ALTO</span></div>',
        '</div>',
        '<div class="attention-warning"><strong>Limite científico</strong>',
          'Não há câmera, sensor ocular ou participantes nesta análise. O mapa representa uma heurística computacional de contraste, sem inferência de percurso real do olhar. Texto, rostos, tarefa e cultura podem mudar o resultado.</div>',
      '</aside>',
    '</div>'
  ].join('');
  const input=view.querySelector('#rodAttentionFile');
  const canvas=view.querySelector('#rodAttentionCanvas');
  const status=view.querySelector('#rodAttentionStatus');
  const name=view.querySelector('#rodAttentionName');
  const error=view.querySelector('#rodAttentionError');
  const empty=view.querySelector('#rodAttentionEmpty');
  const toggles=[...view.querySelectorAll('[data-attention-mode]')];
  const exportBtn=view.querySelector('#rodAttentionDownload');
  let original=null,mode='heat';
  let heatPixels=null;
  function calculate(source){
    const {width:w,height:h}=source;
    const data=source.data;
    const lum=new Float32Array(w*h);
    const saturation=new Float32Array(w*h);
    for(let i=0;i<w*h;i++){
      const r=data[i*4],g=data[i*4+1],b=data[i*4+2];
      lum[i]=(r*.2126+g*.7152+b*.0722)/255;
      saturation[i]=(Math.max(r,g,b)-Math.min(r,g,b))/255;
    }
    const sal=new Float32Array(w*h);
    let peak=.001;
    for(let y=2;y<h-2;y++)for(let x=2;x<w-2;x++){
      const i=y*w+x;
      const gradient=Math.abs(lum[i-2]-lum[i+2])+
        Math.abs(lum[i-2*w]-lum[i+2*w]);
      const chroma=Math.abs(saturation[i]-saturation[i+w+1]);
      const central=1-.23*Math.hypot((x-w*.5)/(w*.5),(y-h*.5)/(h*.5));
      const value=Math.max(0,gradient*.86+chroma*.24)*Math.max(.6,central);
      sal[i]=value;
      if(value>peak)peak=value;
    }
    const overlay=new ImageData(w,h);
    const pix=overlay.data;
    for(let i=0;i<sal.length;i++){
      const val=Math.min(1,Math.sqrt(sal[i]/peak));
      const alpha=val>.25?Math.min(.78,Math.pow((val-.25)/.75,1.6)*.75):0;
      const p=i*4;
      pix[p]=Math.round(45+205*val);
      pix[p+1]=Math.round(val>.65?230-150*(val-.65)/.35:120+170*val);
      pix[p+2]=Math.round(210*(1-val));
      pix[p+3]=Math.round(alpha*255);
    }
    return overlay;
  }
  function display(){
    if(!original)return;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});
    if(!ctx)return;
    canvas.width=original.width;canvas.height=original.height;
    ctx.filter=mode==='gray'?'grayscale(1)':mode==='blur'?'blur(9px)':'none';
    ctx.drawImage(original,0,0);
    ctx.filter='none';
    if(mode==='heat'&&heatPixels){
      // drawImage composites transparency over the source; putImageData would erase it.
      const overlay=document.createElement('canvas');
      overlay.width=canvas.width;overlay.height=canvas.height;
      overlay.getContext('2d').putImageData(heatPixels,0,0);
      ctx.drawImage(overlay,0,0);
    }
    toggles.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.attentionMode===mode)));
    status.textContent={heat:'SALIÊNCIA PREVISTA',original:'PEÇA ORIGINAL',gray:'CONTRASTE EM CINZA',blur:'HIERARQUIA / DESFOQUE'}[mode];
  }
  toggles.forEach(b=>b.addEventListener('click',()=>{
    if(!original)return;
    mode=b.dataset.attentionMode;display();
  }));
  exportBtn.addEventListener('click',()=>{
    if(!original)return;
    canvas.toBlob(blob=>{
      if(!blob)return;
      const a=document.createElement('a');const url=URL.createObjectURL(blob);
      a.href=url;a.download='rod-attention-'+mode+'.png';a.click();
      setTimeout(()=>URL.revokeObjectURL(url),1000);
    },'image/png');
  });
  input.addEventListener('change',()=>{
    const file=input.files&&input.files[0];
    error.textContent='';
    if(!file)return;
    if(!['image/png','image/jpeg','image/webp'].includes(file.type)){
      error.textContent='Formato não suportado. Envie PNG, JPEG ou WebP.';return;
    }
    if(file.size>10*1024*1024){
      error.textContent='Imagem maior que 10 MB.';return;
    }
    const url=URL.createObjectURL(file);
    const image=new Image();
    image.onload=()=>{
      URL.revokeObjectURL(url);
      const max=680;
      const factor=Math.min(1,max/Math.max(image.naturalWidth,image.naturalHeight));
      const w=Math.max(1,Math.round(image.naturalWidth*factor));
      const h=Math.max(1,Math.round(image.naturalHeight*factor));
      const src=document.createElement('canvas');src.width=w;src.height=h;
      const ctx=src.getContext('2d',{willReadFrequently:true});
      if(!ctx){error.textContent='Seu navegador não permite analisar esta imagem.';return;}
      ctx.drawImage(image,0,0,w,h);
      try{
        const pixels=ctx.getImageData(0,0,w,h);
        original=src;
        heatPixels=calculate(pixels);
        empty.hidden=true;canvas.style.display='block';
        toggles.forEach(b=>b.disabled=false);exportBtn.disabled=false;
        name.textContent=file.name+' · '+w+' × '+h+' px (prévia reduzida)';
        mode='heat';display();
      }catch(e){error.textContent='Falha na leitura da imagem.';}
    };
    image.onerror=()=>{
      URL.revokeObjectURL(url);
      error.textContent='Não foi possível abrir esta imagem.';
    };
    image.src=url;
  });
}
