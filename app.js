const formEl = document.getElementById("survey");
const statusEl = document.getElementById("status");
const sendBtn = document.getElementById("send");

function esc(s){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));}

function render(){
  formEl.innerHTML = `
  <section class="card"><label><b>Nome da pessoa</b> <span class="req">*</span>
  <input id="personName" required placeholder="Digite o nome"></label>
  <label><b>Etapa da pesquisa</b> <span class="req">*</span>
  <select id="stage" required><option value="">Selecione</option><option value="antes">Antes da implementação</option><option value="depois">Depois da implementação</option></select></label></section>`;
  questions.forEach((q,i)=>{
    const [id,title,type,opts]=q;
    let body="";
    if(type==="single") body=opts.map(o=>`<label class="option"><input required type="radio" name="${id}" value="${esc(o)}"> ${esc(o)}</label>`).join("");
    if(type==="multi") body=opts.map(o=>`<label class="option"><input type="checkbox" name="${id}" value="${esc(o)}"> ${esc(o)}</label>`).join("");
    if(type==="scale") body=`<div class="scale">${opts.map(o=>`<label><span>${o}</span><input required type="radio" name="${id}" value="${o}"></label>`).join("")}</div><small>1 = menor / mais difícil &nbsp; 5 = maior / mais fácil</small>`;
    if(type==="text") body=`<textarea required name="${id}" placeholder="Digite sua resposta"></textarea>`;
    formEl.insertAdjacentHTML("beforeend",`<section class="card"><div class="q">${i+1}. ${esc(title)} <span class="req">*</span></div>${body}</section>`);
  });
}
render();

function getValue(id,type){
  if(type==="multi") return [...document.querySelectorAll(`input[name="${id}"]:checked`)].map(x=>x.value);
  const x=document.querySelector(`[name="${id}"]:checked`) || document.querySelector(`[name="${id}"]`);
  return x ? x.value : "";
}
sendBtn.onclick=async()=>{
  if(!formEl.reportValidity()) return;
  const name=document.getElementById("personName").value.trim();
  const stage=document.getElementById("stage").value;
  if(!name||!stage) return;
  const answers={};
  questions.forEach(q=>answers[q[0]]=getValue(q[0],q[2]));
  sendBtn.disabled=true; statusEl.textContent="Enviando...";
  try{
    const r=await fetch(`${SUPABASE_URL}/rest/v1/responses`,{
      method:"POST",
      headers:{"apikey":SUPABASE_ANON_KEY,"Authorization":`Bearer ${SUPABASE_ANON_KEY}`,"Content-Type":"application/json","Prefer":"return=minimal"},
      body:JSON.stringify({name,stage,answers})
    });
    if(!r.ok) throw new Error(await r.text());
    formEl.innerHTML=""; sendBtn.style.display="none";
    statusEl.innerHTML="<strong>✅ Resposta enviada com sucesso!</strong><br>Obrigado pela participação.";
  }catch(e){statusEl.textContent="Não foi possível enviar. Verifique a configuração do sistema."; console.error(e); sendBtn.disabled=false;}
};