let all=[];
const $=id=>document.getElementById(id);
async function login(){
 $("loginStatus").textContent="Entrando...";
 const r=await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`,{method:"POST",headers:{"apikey":SUPABASE_ANON_KEY,"Content-Type":"application/json"},body:JSON.stringify({email:$("email").value,password:$("password").value})});
 if(!r.ok){$("loginStatus").textContent="E-mail ou senha inválidos.";return;}
 const s=await r.json(); localStorage.setItem("sb_access",s.access_token); showDash();
}
function headers(){const t=localStorage.getItem("sb_access");return {"apikey":SUPABASE_ANON_KEY,"Authorization":`Bearer ${t}`};}
async function showDash(){
 $("loginBox").style.display="none";$("dashboard").style.display="block";
 const r=await fetch(`${SUPABASE_URL}/rest/v1/responses?select=*&order=created_at.desc`,{headers:headers()});
 if(!r.ok){$("people").textContent="Não foi possível carregar as respostas.";return;}
 all=await r.json(); render();
}
function filtered(){let st=$("stageFilter").value,s=$("search").value.toLowerCase();return all.filter(x=>(st==="todos"||x.stage===st)&&x.name.toLowerCase().includes(s));}
function render(){
 const rows=filtered(); $("count").textContent=`${rows.length} resposta(s) exibida(s) — ${all.length} no total`;
 const statQuestions=questions.slice(0,23);
 $("stats").innerHTML=statQuestions.map(q=>{
   const vals=rows.map(r=>r.answers?.[q[0]]).flatMap(v=>Array.isArray(v)?v:[v]).filter(Boolean);
   const counts={}; vals.forEach(v=>counts[v]=(counts[v]||0)+1);
   const total=vals.length;
   const items=Object.entries(counts).sort((a,b)=>b[1]-a[1]).map(([k,n])=>`<div class="barrow"><span>${k}</span><b>${n} (${total?((n/total)*100).toFixed(1):0}%)</b></div>`).join("");
   return `<section class="card"><h3>${q[1]}</h3>${items||"<small>Sem respostas.</small>"}</section>`;
 }).join("");
 $("people").innerHTML=rows.map(r=>`<details class="person"><summary><b>${r.name}</b> — ${r.stage==="antes"?"Antes":"Depois"} — ${new Date(r.created_at).toLocaleString("pt-BR")}</summary><div>${questions.map((q,i)=>`<p><b>${i+1}. ${q[1]}</b><br>${Array.isArray(r.answers?.[q[0]])?r.answers[q[0]].join(", "):(r.answers?.[q[0]]||"—")}</p>`).join("")}</div></details>`).join("");
}
$("login").onclick=login;
$("stageFilter").onchange=render;$("search").oninput=render;
$("logout").onclick=()=>{localStorage.removeItem("sb_access");location.reload();};
if(localStorage.getItem("sb_access")) showDash();