import {useEffect,useMemo,useState} from 'react';
import {ArrowRight,RefreshCcw,Sparkles} from 'lucide-react';
import {Button} from '../components/ui/button';
import {Link} from '../router';

const API='https://dbwnvbfdphqmfjzbpqnw.supabase.co/functions/v1/orlica-openrouter';
const OWN='Свой вариант';

const groups=[
  {key:'style',number:'01',title:'СТИЛЬ',options:['Графика','Fine line','Blackwork','Реализм','Нео-традишнл','Японский','Dotwork','Минимализм',OWN],placeholder:'Например: гравюра, трэш-полька, скетч…'},
  {key:'genre',number:'02',title:'ЖАНР',options:['Ботаника','Животные','Мистика','Готика','Хоррор','Фэнтези','Абстракция','Портрет',OWN],placeholder:'Например: киберпанк, религия, космос…'},
  {key:'mood',number:'03',title:'ХАРАКТЕР / 18+',options:['Нежно','Смело','Тёмно','Романтика','Странно','18+',OWN],placeholder:'Например: дерзко, провокационно, иронично…'},
  {key:'source',number:'04',title:'ОТКУДА ОБРАЗ',options:['Фильм','Сериал','Аниме','Игра','Книга','Мифология',OWN],placeholder:'Например: клип, музыка, комикс, сон…'},
  {key:'reference',number:'05',title:'ВСЕЛЕННАЯ / РЕФЕРЕНС',options:['Marvel','DC','Harry Potter','Star Wars','The Lord of the Rings','The Witcher','Berserk','Studio Ghibli','Silent Hill',OWN],placeholder:'Например: Supernatural, Arcane, Alien…'},
  {key:'placement',number:'06',title:'ЧАСТЬ ТЕЛА',options:['Рука','Предплечье','Плечо','Кисть','Грудь','Рёбра','Спина','Шея','Бедро','Голень',OWN],placeholder:'Например: под ключицей с переходом на плечо…'}
];

function deviceId(){
  const key='malabar-constructor-device';
  try{
    let value=localStorage.getItem(key);
    if(!value){value=`${crypto.randomUUID()}-${crypto.randomUUID()}`;localStorage.setItem(key,value)}
    return value;
  }catch{return `${crypto.randomUUID()}-${crypto.randomUUID()}`}
}

export default function TattooConstructor(){
  const[choice,setChoice]=useState({style:'',genre:'',mood:'',source:'',reference:'',placement:''});
  const[custom,setCustom]=useState({style:'',genre:'',mood:'',source:'',reference:'',placement:''});
  const[idea,setIdea]=useState('');
  const[image,setImage]=useState('');
  const[busy,setBusy]=useState(false);
  const[error,setError]=useState('');
  const[remaining,setRemaining]=useState(null);
  const[imported,setImported]=useState(false);

  useEffect(()=>{
    try{
      const raw=sessionStorage.getItem('malabar-lab-preset');
      if(!raw)return;
      const data=JSON.parse(raw);
      const nextChoice={};const nextCustom={};
      groups.forEach(group=>{
        const value=data?.choice?.[group.key];
        const ownValue=data?.custom?.[group.key];
        if(value)nextChoice[group.key]=value;
        if(ownValue)nextCustom[group.key]=ownValue;
      });
      setChoice(v=>({...v,...nextChoice}));
      setCustom(v=>({...v,...nextCustom}));
      if(data?.idea)setIdea(String(data.idea).slice(0,400));
      setImported(true);
      sessionStorage.removeItem('malabar-lab-preset');
    }catch{}
  },[]);

  const isGroupComplete=(group)=>Boolean(choice[group.key]&&(choice[group.key]!==OWN||custom[group.key].trim()));
  const completedCount=useMemo(()=>groups.filter(isGroupComplete).length,[choice,custom]);
  const complete=completedCount===groups.length;
  const displayValue=(group)=>choice[group.key]===OWN?(custom[group.key].trim()||OWN):(choice[group.key]||'—');

  const choose=(key,value)=>{setChoice(v=>({...v,[key]:value}));setError('')};
  const changeCustom=(key,value)=>{setCustom(v=>({...v,[key]:value.slice(0,140)}));setError('')};

  const generate=async()=>{
    if(!complete||busy)return;
    setBusy(true);setError('');
    try{
      const customPayload=Object.fromEntries(groups.map(g=>[`${g.key}_custom`,custom[g.key].trim()]));
      const response=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...choice,...customPayload,idea,device_id:deviceId()}),signal:AbortSignal.timeout(95000)});
      const data=await response.json().catch(()=>null);
      if(!response.ok)throw new Error(data?.message||'Не получилось создать эскиз. Попробуй ещё раз.');
      setImage(data.image||'');
      setRemaining(Number.isFinite(data.generations_remaining)?data.generations_remaining:null);
      requestAnimationFrame(()=>document.querySelector('.constructor-result')?.scrollIntoView({behavior:'smooth',block:'center'}));
    }catch(e){
      setError(e?.name==='TimeoutError'?'Генерация заняла слишком много времени. Попробуй ещё раз.':e?.message||'Генерация временно недоступна.');
    }finally{setBusy(false)}
  };

  return <div className="constructor-page">
    <header className="constructor-hero">
      <span className="eyebrow">MALABAR / AI-КОНСТРУКТОР</span>
      <h1>СОБЕРИ<br/><i>свою</i> ИДЕЮ.</h1>
      <p>Шесть решений. Один уникальный эскиз.</p>
    </header>

    {imported&&<div className="constructor-import-note"><span>MALABAR LAB</span><p>Параметры из лаборатории уже перенесены. Дополни недостающее или меняй любые пункты.</p><button type="button" onClick={()=>setImported(false)}>×</button></div>}

    <div className="constructor-layout">
      <div className="constructor-groups">
        {groups.map(group=><section className="constructor-group" key={group.key}>
          <div className="constructor-group-title"><span>{group.number}</span><h2>{group.title}</h2></div>
          <div className="constructor-options">
            {group.options.map(option=><button type="button" key={option} aria-pressed={choice[group.key]===option} onClick={()=>choose(group.key,option)}>{option}<span>↗</span></button>)}
          </div>
          {choice[group.key]===OWN&&<div className="constructor-custom">
            <label htmlFor={`custom-${group.key}`}>НАПИШИ СВОЙ ВАРИАНТ</label>
            <input id={`custom-${group.key}`} value={custom[group.key]} maxLength={140} onChange={e=>changeCustom(group.key,e.target.value)} placeholder={group.placeholder} autoComplete="off"/>
          </div>}
          {group.key==='mood'&&<p className="constructor-hint">18+ — сексуальный взрослый характер: чувственные позы, бельё, акцент на теле и прикрытая грудь допустимы; без откровенной порнографии.</p>}
          {group.key==='placement'&&<p className="constructor-hint">Место влияет на форму эскиза: ИИ подстроит композицию под выбранную часть тела.</p>}
        </section>)}

        <section className="constructor-idea">
          <label htmlFor="constructor-idea">ОБЩИЕ ПОЖЕЛАНИЯ <span>необязательно</span></label>
          <textarea id="constructor-idea" value={idea} maxLength={400} onChange={e=>setIdea(e.target.value)} placeholder="Например: больше воздуха, без текста, добавить лилии, оставить много чёрного…"/>
        </section>
      </div>

      <aside className="constructor-summary">
        <span className="eyebrow">ТВОЯ СБОРКА · {completedCount}/6</span>
        <div className="constructor-progress" aria-label={`Заполнено ${completedCount} из 6`}><span style={{width:`${completedCount/6*100}%`}}/></div>
        <div className="constructor-summary-list">{groups.map(g=><div key={g.key}><small>{g.number}</small><span>{displayValue(g)}</span></div>)}</div>
        <Button onClick={generate} disabled={!complete||busy}>{busy?'РИСУЮ…':'СГЕНЕРИРОВАТЬ'}<Sparkles size={18}/></Button>
        {!complete&&<p>Заполни все шесть параметров.</p>}
        {error&&<p className="constructor-error" role="alert">{error}</p>}
      </aside>
    </div>

    {image&&<section className="constructor-result">
      <div className="constructor-result-copy">
        <span className="eyebrow">MALABAR / AI-ЭСКИЗ</span>
        <h2>ВОТ<br/><i>что получилось.</i></h2>
        {remaining!==null&&<p>Осталось генераций сегодня: {remaining}</p>}
        <div className="constructor-result-actions">
          <Button onClick={generate} disabled={busy}>{busy?'РИСУЮ…':'ЕЩЁ ВАРИАНТ'}<RefreshCcw size={18}/></Button>
          <Button variant="outline" asChild><Link to="/booking">ХОЧУ ОБСУДИТЬ <ArrowRight size={18}/></Link></Button>
        </div>
      </div>
      <div className="constructor-result-image"><img src={image} alt="Сгенерированный эскиз татуировки"/></div>
    </section>}
  </div>
}
