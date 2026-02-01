import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, LayoutGrid, Sparkles } from 'lucide-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password);
      }
      navigate('/');
    } catch (err) {
      setError('İşlem başarısız: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 selection:bg-indigo-500/30">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="w-full max-w-[1100px] grid grid-cols-1 lg:grid-cols-2 bg-slate-900/50 backdrop-blur-2xl rounded-[2.5rem] border border-slate-800 shadow-2xl overflow-hidden relative z-10">
        
        {/* Sol Taraf: Görsel ve Marka */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-indigo-600 to-indigo-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
             <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-xl">
                <LayoutGrid size={28} className="text-white" />
              </div>
              <h1 className="text-3xl font-black tracking-tighter italic uppercase">NovaFlow<span className="text-indigo-300">.</span></h1>
            </div>
            <h2 className="text-5xl font-black leading-tight tracking-tighter italic uppercase">Yarının İş Yönetim <br /> <span className="text-indigo-200">Sistemine Hoş Geldin.</span></h2>
          </div>

          <div className="relative z-10 bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20">
             <p className="text-indigo-100 font-medium italic">"NovaFlow ile tüm şirket operasyonlarınızı tek bir merkezden, gerçek zamanlı verilerle yönetin."</p>
             <div className="flex items-center gap-3 mt-4">
                <div className="w-10 h-10 rounded-full bg-indigo-400 border-2 border-white/50 shadow-lg overflow-hidden">
                   <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" />
                </div>
                <div>
                   <p className="text-sm font-bold">Rubina Erin</p>
                   <p className="text-[10px] uppercase font-black tracking-widest text-indigo-200">Founder & CEO</p>
                </div>
             </div>
          </div>
        </div>

        {/* Sağ Taraf: Form */}
        <div className="p-12 lg:p-20 flex flex-col justify-center">
          <div className="mb-10 text-center lg:text-left">
            <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-2">
              {isLogin ? 'Tekrar Hoş Geldin' : 'Yeni Hesap Oluştur'}
            </h3>
            <p className="text-slate-400 font-medium">Sisteme erişmek için bilgilerinizi girin.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">E-Posta Adresi</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={20} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-white font-bold focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-600" 
                  placeholder="isim@sirket.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Şifre</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={20} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-white font-bold focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-600" 
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && <p className="text-rose-500 text-sm font-bold animate-pulse">⚠️ {error}</p>}

            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest text-sm italic">
              {isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
              <ArrowRight size={18} />
            </button>
          </form>

          <div className="mt-10 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-slate-400 hover:text-white text-sm font-bold transition-colors underline decoration-indigo-500 decoration-2 underline-offset-4"
            >
              {isLogin ? 'Henüz bir hesabınız yok mu? Kayıt olun' : 'Zaten bir hesabınız var mı? Giriş yapın'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;