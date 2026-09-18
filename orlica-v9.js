(() => {
  const API='https://dbwnvbfdphqmfjzbpqnw.supabase.co';
  const KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRid252YmZkcGhxbWZqemJwcW53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk2ODYxNzIsImV4cCI6MjEwNTI2MjE3Mn0.3fxOPVcWuVCMmACMCkRR9vjt2SLMts-DjI2SSuYof5A';
  const headers={'apikey':KEY,'Authorization':`Bearer ${KEY}`,'Content-Type':'application/json'};

  async function submitWaitlist(payload){
    const r=await fetch(`${API}/functions/v1/orlica-waitlist`,{method:'POST',headers,body:JSON.stringify({
      client_name:payload.name,
      contact:payload.contact,
      tattoo_place:payload.place,
      tattoo_size:payload.size,
      idea:payload.idea,
      preferred_time:payload.preferred
    })});
    const data=await r.json().catch(()=>null);
    if(!r.ok){if(data?.error==='ALREADY_WAITING')throw new Error('Ты уже есть в листе ожидания. Света увидит заявку.');throw new Error('Не удалось добавить в лист ожидания.');}
    return data;
  }

  function mount(){
    const book=document.querySelector('#book');
    if(!book||book.querySelector('.orlica-waitlist'))return;
    const anchor=book.querySelector('.booking-live-grid')||book.lastElementChild;
    if(!anchor)return;
    const box=document.createElement('section');
    box.className='orlica-waitlist';
    box.innerHTML=`
      <div class="orlica-waitlist-head">
        <div><h3>НЕТ ПОДХОДЯЩЕЙ ДАТЫ?</h3></div>
        <p>Оставь контакт и идею. Если освободится окно или Света откроет новую дату — ты уже будешь в списке.</p>
      </div>
      <button class="waitlist-toggle" type="button" aria-expanded="false">Встать в лист ожидания</button>
      <div class="waitlist-panel">
        <form class="waitlist-form">
          <label>Имя<input name="name" maxlength="80" required placeholder="Как тебя зовут"></label>
          <label>Telegram / телефон<input name="contact" maxlength="120" required placeholder="@username или +7..."></label>
          <label>Место тату<input name="place" maxlength="120" placeholder="Предплечье"></label>
          <label>Размер<input name="size" maxlength="80" placeholder="Примерно 12 см"></label>
          <label class="wide">Когда удобно<input name="preferred" maxlength="160" placeholder="Например: будни после 18:00"></label>
          <label class="wide">Что хочется набить?<textarea name="idea" maxlength="2000" required placeholder="Идея, стиль, детали…"></textarea></label>
          <button class="waitlist-submit" type="submit">Добавить меня в список</button>
          <div class="waitlist-message"></div>
        </form>
      </div>`;
    anchor.insertAdjacentElement('afterend',box);
    const toggle=box.querySelector('.waitlist-toggle'),panel=box.querySelector('.waitlist-panel'),form=box.querySelector('form'),message=box.querySelector('.waitlist-message');
    toggle.addEventListener('click',()=>{const on=panel.classList.toggle('show');toggle.setAttribute('aria-expanded',String(on));toggle.textContent=on?'Скрыть форму':'Встать в лист ожидания';});
    form.addEventListener('submit',async e=>{
      e.preventDefault();
      const fd=new FormData(form),btn=form.querySelector('.waitlist-submit');
      message.textContent='';message.className='waitlist-message';btn.disabled=true;btn.textContent='Добавляю…';
      try{
        await submitWaitlist({name:String(fd.get('name')||'').trim(),contact:String(fd.get('contact')||'').trim(),place:String(fd.get('place')||'').trim(),size:String(fd.get('size')||'').trim(),preferred:String(fd.get('preferred')||'').trim(),idea:String(fd.get('idea')||'').trim()});
        form.reset();message.textContent='Готово. Ты в листе ожидания — Света увидит заявку.';message.className='waitlist-message ok';btn.textContent='Ты в списке';
      }catch(err){message.textContent=err.message||'Ошибка';message.className='waitlist-message err';btn.disabled=false;btn.textContent='Добавить меня в список';}
    });
    const empty=book.querySelector('#booking-empty');
    if(empty){const sync=()=>{box.classList.toggle('is-prominent',!empty.hidden);};new MutationObserver(sync).observe(empty,{attributes:true,attributeFilter:['hidden']});sync();}
  }
  const boot=()=>{let n=0;const t=setInterval(()=>{mount();if(document.querySelector('.orlica-waitlist')||++n>40)clearInterval(t)},150)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
