import {useMemo,useState} from 'react';
import {ArrowRight,RefreshCcw,Sparkles} from 'lucide-react';
import {Button} from '../components/ui/button';
import {Link} from '../router';

const API='https://dbwnvbfdphqmfjzbpqnw.supabase.co/functions/v1/orlica-openrouter';

const groups=[
  {key:'style',number:'01',title:'СТИЛЬ',options:['Графика','Fine line','Blackwork','Реализм','Нео-традишнл','Японский','Dotwork','Минимализм']},
  {key:'genre',number:'02',title:'ЖАНР',options:['Ботаника','Животные','Мистика','Готика','Хоррор','Фэнтези','Абстракция','Портрет']},
  {key:'mood',number:'03',title:'ХАРАКТЕР / 18+',options:['Нежно','Смело','Тёмно','Романтика','Странно','18+']},
  {key:'source',number:'04',title:'ОТКУДА ОБРАЗ',options:['Фильм','Сериал','Аниме','Игра','Книга','Мифология']},
  {key:'reference',number:'05',title:'ВСЕЛЕННАЯ / РЕФЕРЕНС',options:['Marvel','DC','Harry Potter','Star Wars','The Lord of the Rings','The Witcher','Berserk','Studio Ghibli','Silent Hill','Свой вариант']}
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
  const[choice,setChoice]=useState({style:'',genre:'',mood:'',source:'',reference:''});
  const[idea,setIdea]=useState('');
  const[image,setImage]=useState('');
  const[busy,setBusy]=useState(false);
  const[error,setError]=useState('');
  const[remaining,setRemaining]=useState(null);
  const complete=useMemo(()=>groups.every(g=>choice[g.key]),[choice]);

  const choose=(key,value)=>{setChoice(v=>({...v,[key]:value}));setError('')};
  const generate=async()=>{
    if(!complete||busy)return;
    setBusy(true);setError('');
    try{
      const response=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...choice,idea,device_id:deviceId()}),signal:AbortSignal.timeout(95000)});
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
      <p>Пять решений. Один уникальный эскиз.</p>
    </header>

    <div className="constructor-layout">
      <div className="constructor-groups">
        {groups.map(group=><section className="constructor-group" key={group.key}>
          <div className="constructor-group-title"><span>{group.number}</span><h2>{group.title}</h2></div>
          <div className="constructor-options">
            {group.options.map(option=><button type="button" key={option} aria-pressed={choice[group.key]===option} onClick={()=>choose(group.key,option)}>{option}<span>↗</span></button>)}
          </div>
          {group.key==='mood'&&<p className="constructor-hint">18+ — взрослая чувственная эстетика без откровенного контента.</p>}
          {group.key==='reference'&&<p className="constructor-hint">Если выбрал «Свой вариант» — напиши название фильма, героя или вселенной ниже.</p>}
        </section>)}

        <section className="constructor-idea">
          <label htmlFor="constructor-idea">ДОБАВЬ ДЕТАЛЬ <span>необязательно</span></label>
          <textarea id="constructor-idea" value={idea} maxLength={400} onChange={e=>setIdea(e.target.value)} placeholder="Например: Дарт Вейдер в готической подаче, без текста, больше чёрного…"/>
        </section>
      </div>

      <aside className="constructor-summary">
        <span className="eyebrow">ТВОЯ СБОРКА</span>
        <div className="constructor-summary-list">{groups.map(g=><div key={g.key}><small>{g.number}</small><span>{choice[g.key]||'—'}</span></div>)}</div>
        <Button onClick={generate} disabled={!complete||busy}>{busy?'РИСУЮ…':'СГЕНЕРИРОВАТЬ'}<Sparkles size={18}/></Button>
        {!complete&&<p>Выбери все пять параметров.</p>}
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
