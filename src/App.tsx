/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { fetchDailyArticles, Article } from './services/geminiService';
import { Brain, BookOpen, ExternalLink, RefreshCw, AlertCircle, Copy, Check } from 'lucide-react';
import { motion } from 'motion/react';

export default function App() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const loadArticles = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDailyArticles();
      setArticles(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Une erreur est survenue lors de la recherche des articles.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUrls = () => {
    const urls = articles.map(a => a.url).join('\n');
    navigator.clipboard.writeText(urls);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopySingleUrl = (url: string, index: number) => {
    navigator.clipboard.writeText(url);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  useEffect(() => {
    loadArticles();
  }, []);

  return (
    <div className="min-h-screen text-slate-900 font-sans selection:bg-indigo-100 pb-12">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-7 h-7 text-indigo-600" />
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              PsyNeuro<span className="text-indigo-600">Daily</span>
            </h1>
          </div>
          <button
            onClick={loadArticles}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualiser</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12 text-center max-w-3xl mx-auto">
          <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl mb-4">
            L'actualité scientifique du jour
          </h2>
          <p className="text-lg text-slate-600">
            Découvrez 9 articles de presse publiés récemment sur la psychologie, les relations de couple et les neurosciences, tous basés sur la recherche académique.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 animate-pulse h-80 flex flex-col">
                <div className="h-6 bg-slate-200 rounded-full w-1/3 mb-4"></div>
                <div className="h-7 bg-slate-200 rounded w-full mb-2"></div>
                <div className="h-7 bg-slate-200 rounded w-5/6 mb-6"></div>
                <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-2/3 mt-auto"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-800 p-8 rounded-3xl flex flex-col items-center text-center max-w-lg mx-auto border border-red-100 shadow-sm">
            <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">Erreur de chargement</h3>
            <p className="mb-8 text-red-700">{error}</p>
            <button
              onClick={loadArticles}
              className="px-8 py-3 bg-red-600 text-white rounded-full font-semibold hover:bg-red-700 transition-colors shadow-sm"
            >
              Réessayer
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {articles.map((article, index) => (
                <motion.article
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  key={index}
                  className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 flex flex-col h-full group"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full uppercase tracking-wider">
                      {article.source}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3 leading-tight group-hover:text-indigo-700 transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-slate-600 mb-6 flex-grow leading-relaxed">
                    {article.summary}
                  </p>
                  <div className="mt-auto pt-5 border-t border-slate-100">
                    <div className="flex items-start gap-3 mb-5 text-sm text-slate-600 bg-slate-50 p-4 rounded-xl">
                      <BookOpen className="w-5 h-5 mt-0.5 flex-shrink-0 text-indigo-400" />
                      <p className="italic leading-relaxed">{article.academicContext}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-800 transition-colors"
                      >
                        Lire l'article complet
                        <ExternalLink className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </a>
                      <button
                        onClick={() => handleCopySingleUrl(article.url, index)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                        title="Copier le lien"
                      >
                        {copiedIndex === index ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>

            {articles.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 max-w-4xl mx-auto"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-slate-900">Tous les liens des articles</h3>
                  <button
                    onClick={handleCopyUrls}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copié !' : 'Copier les liens'}
                  </button>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 font-mono text-sm text-slate-700 whitespace-pre-wrap break-all">
                  {articles.map(a => a.url).join('\n')}
                </div>
              </motion.div>
            )}

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="mt-12 flex justify-center"
            >
              <button
                onClick={loadArticles}
                disabled={loading}
                className="flex items-center gap-3 px-8 py-4 text-lg font-bold text-white bg-indigo-600 rounded-full hover:bg-indigo-700 transition-all hover:shadow-lg hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
              >
                <RefreshCw className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} />
                Lancer une nouvelle recherche
              </button>
            </motion.div>
          </>
        )}
      </main>
    </div>
  );
}
