import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { createClient } from "@supabase/supabase-js";
import { BookHeart, BookOpen, Heart, Users, Sparkles, Send, ShieldCheck, Eye, EyeOff, RefreshCw } from "lucide-react";
import "./style.css";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = url && key ? createClient(url, key) : null;
const categories = [
  { id: "親情", emoji: "🏡", color: "peach" },
  { id: "友情", emoji: "🫶", color: "mint" },
  { id: "愛情", emoji: "💗", color: "pink" },
  { id: "其他", emoji: "🌈", color: "lilac" },
];

function App() {
  const [tab, setTab] = useState("wall");
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState("全部");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState({ nickname: "", category: "友情", investment: "", return_value: "", expectation: "", message: "", is_public: true });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!supabase) { setReady(true); return; }
    supabase.auth.signInAnonymously().then(({ error }) => {
      if (error) setNotice("匿名登入未啟用，請依 README 開啟 Supabase Anonymous Sign-ins。");
      setReady(true);
    });
  }, []);

  async function loadPosts() {
    if (!supabase) return;
    setLoading(true);
    const { data, error } = await supabase.from("relationship_ledgers")
      .select("id,nickname,category,investment,return_value,expectation,message,created_at")
      .eq("is_public", true).order("created_at", { ascending: false }).limit(100);
    if (error) setNotice("讀取帳本失敗：" + error.message);
    else setPosts(data || []);
    setLoading(false);
  }
  useEffect(() => { if (ready) loadPosts(); }, [ready]);

  const visiblePosts = useMemo(() => filter === "全部" ? posts : posts.filter(p => p.category === filter), [posts, filter]);
  const update = (e) => setForm({ ...form, [e.target.name]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  async function submit(e) {
    e.preventDefault();
    if (!supabase) { setNotice("尚未設定雲端資料庫，請先依 README 設定 Supabase。"); return; }
    if (!form.investment.trim() || !form.return_value.trim()) { setNotice("請至少填寫「我的付出」與「我獲得的回饋」。"); return; }
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) { setNotice("匿名登入尚未完成，請重新整理頁面。"); return; }
    const payload = { ...form, nickname: form.nickname.trim() || "匿名訪客", owner_id: auth.user.id };
    const { error } = await supabase.from("relationship_ledgers").insert(payload);
    if (error) setNotice("投稿失敗：" + error.message);
    else {
      setNotice(form.is_public ? "帳本已送出，已加入公開帳本牆。" : "帳本已保存為私人紀錄，不會出現在公開帳本牆。");
      setForm({ nickname: "", category: "友情", investment: "", return_value: "", expectation: "", message: "", is_public: true });
      setTab("wall"); loadPosts();
    }
  }

  return <div className="app">
    <header className="topbar">
      <a className="brand" onClick={() => setTab("wall")}><span className="brand-icon"><BookHeart size={22}/></span><span>關係帳本<small>MY RELATIONSHIP LEDGER</small></span></a>
      <div className="top-actions"><span className="privacy"><ShieldCheck size={15}/> 可匿名分享</span><button className="nav-button" onClick={() => setTab("write")}><BookOpen size={17}/> 寫一本帳本</button></div>
    </header>
    <main>
      <section className="hero">
        <div className="hero-copy"><div className="eyebrow"><Sparkles size={15}/> 把關係裡的感受，好好寫下來</div>
          <h1>每一段關係，<br/><span>都有自己的故事。</span></h1>
          <p>記錄付出、感受與期待。也讀讀別人的故事，看看我們如何用不同方式理解關係。</p>
          <div className="hero-buttons"><button className="primary" onClick={() => setTab("write")}><Heart size={17}/> 建立我的關係帳本</button><button className="secondary" onClick={() => {setTab("wall");loadPosts();}}>逛逛大家的帳本 <span>→</span></button></div>
        </div>
        <div className="hero-art"><div className="sun"></div><div className="note note-back">關係，需要理解與練習。</div><div className="note note-front"><div className="note-heart">♡</div><b>我的關係帳本</b><span>付出・回饋・期待</span><div className="scribble">✳</div></div><div className="float f1">💌</div><div className="float f2">🌷</div></div>
      </section>

      <section className="content">
        <div className="section-heading"><div><div className="eyebrow">EXPLORE & SHARE</div><h2>{tab === "write" ? "寫下你的關係故事" : "大家的關係帳本"}</h2><p>{tab === "write" ? "不需要寫得完美，真實記錄自己的感受就好。" : "每個人的關係經驗都不同，閱讀時請保持尊重與理解。"}</p></div>
          <div className="tab-switch"><button className={tab==="wall"?"active":""} onClick={()=>setTab("wall")}><Users size={16}/> 帳本牆</button><button className={tab==="write"?"active":""} onClick={()=>setTab("write")}><BookHeart size={16}/> 寫帳本</button></div>
        </div>
        {notice && <div className="notice" role="status">{notice}<button onClick={()=>setNotice("")}>✕</button></div>}
        {!supabase && <div className="setup-warning">目前是未連接資料庫的預覽畫面。完成專案中的 README 設定並部署後，投稿才會跨裝置共享。</div>}
        {tab === "write" ? <form className="write-layout" onSubmit={submit}>
          <div className="form-card">
            <div className="form-title"><span className="step">01</span><div><h3>這是一本關於⋯⋯的帳本</h3><p>選擇你想記錄的關係</p></div></div>
            <div className="category-select">{categories.map(c=><button type="button" key={c.id} className={`category-choice ${c.color} ${form.category===c.id?"chosen":""}`} onClick={()=>setForm({...form,category:c.id})}><span>{c.emoji}</span>{c.id}</button>)}</div>
            <label className="field-label">暱稱 <span>選填，留空將以「匿名訪客」顯示</span></label>
            <input name="nickname" value={form.nickname} onChange={update} maxLength="24" placeholder="例如：小樹、今天想分享的人"/>
          </div>
          <div className="form-card">
            <div className="form-title"><span className="step">02</span><div><h3>我的關係帳本</h3><p>沒有標準答案，依照自己的感受填寫</p></div></div>
            <label className="field-label">📥 我付出的成本 <span>時間、心力、情感、金錢⋯⋯</span></label>
            <textarea name="investment" value={form.investment} onChange={update} maxLength="2000" required placeholder="在這段關係中，我曾經付出⋯⋯"/>
            <label className="field-label">🎁 我獲得的回饋 <span>陪伴、支持、理解、信任⋯⋯</span></label>
            <textarea name="return_value" value={form.return_value} onChange={update} maxLength="2000" required placeholder="這段關係帶給我的收穫是⋯⋯"/>
            <label className="field-label">🌱 我對這段關係的期待 <span>還希望有什麼改變？</span></label>
            <textarea name="expectation" value={form.expectation} onChange={update} maxLength="2000" placeholder="我希望未來我們可以⋯⋯"/>
            <label className="field-label">💬 我想說的話 <span>選填</span></label>
            <textarea name="message" value={form.message} onChange={update} maxLength="2000" placeholder="有沒有一句話，想留給這段關係或自己？"/>
          </div>
          <div className="form-card submit-card">
            <div><h3>分享設定</h3><p>你可以決定這本帳本是否出現在公開帳本牆。</p></div>
            <label className="toggle-row"><span>{form.is_public ? <Eye size={18}/> : <EyeOff size={18}/>} <b>{form.is_public ? "公開分享" : "私人保存"}</b><small>{form.is_public ? "其他參與者可以瀏覽這本帳本" : "不會顯示在公開帳本牆"}</small></span><input type="checkbox" name="is_public" checked={form.is_public} onChange={update}/></label>
            <div className="consent">請避免填寫真實姓名、電話、地址、學號或其他可辨識個人身分的資訊。公開內容可能被其他參與者閱讀。</div>
            <button className="primary submit" type="submit"><Send size={17}/> 送出我的帳本</button>
          </div>
        </form> : <div className="wall">
          <div className="filters"><div className="filter-pills">{["全部","親情","友情","愛情","其他"].map(x=><button key={x} className={filter===x?"selected":""} onClick={()=>setFilter(x)}>{x==="全部"?"🌈":categories.find(c=>c.id===x)?.emoji} {x}</button>)}</div><button className="refresh" onClick={loadPosts}><RefreshCw size={15}/> 更新</button></div>
          {loading ? <div className="empty">正在讀取帳本⋯⋯</div> : visiblePosts.length===0 ? <div className="empty"><div>📖</div><h3>這裡還沒有帳本</h3><p>成為第一個分享故事的人吧。</p><button className="primary" onClick={()=>setTab("write")}>建立第一本帳本</button></div> :
            <div className="ledger-grid">{visiblePosts.map((p,i)=><article className={`ledger-card card-${i%4}`} key={p.id}><div className="ledger-top"><span className="category-tag">{categories.find(c=>c.id===p.category)?.emoji} {p.category}</span><span className="date">{new Date(p.created_at).toLocaleDateString("zh-TW")}</span></div><div className="author"><span className="avatar">{p.nickname?.slice(0,1)||"匿"}</span><b>{p.nickname||"匿名訪客"}</b></div><div className="ledger-section"><b>📥 我的付出</b><p>{p.investment}</p></div><div className="ledger-section"><b>🎁 我獲得的回饋</b><p>{p.return_value}</p></div>{p.expectation&&<div className="ledger-section"><b>🌱 我的期待</b><p>{p.expectation}</p></div>}{p.message&&<div className="quote">「{p.message}」</div>}</article>)}</div>}
          <p className="wall-note"><ShieldCheck size={15}/> 請尊重每一份分享，不截圖、不轉傳、不評論他人的真實經歷。</p>
        </div>}
      </section>
    </main>
    <footer>關係帳本 · 讓理解，從看見彼此開始 <span>Made for sharing with care ♡</span></footer>
  </div>;
}

createRoot(document.getElementById("root")).render(<App/>);