import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Send, Eye, Trash2, Edit3 } from 'lucide-react';
import { api } from '../../lib/api';

interface Post {
  id: string;
  title: string;
  slug: string;
  body: string;
  coverImage: string | null;
  isPublished: boolean;
  sentByEmail: boolean;
  publishedAt: string | null;
  createdAt: string;
  project?: { title: string; slug: string };
}

interface ProjectInfo {
  id: string;
  title: string;
  slug: string;
}

export default function AdminPostsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [project, setProject] = useState<ProjectInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;
    Promise.all([
      api.get<Post[]>(`/posts/project/${projectId}`),
      api.get<ProjectInfo>(`/projects/${projectId}`),
    ])
      .then(([p, proj]) => {
        setPosts(p);
        setProject(proj);
      })
      .finally(() => setLoading(false));
  }, [projectId]);

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta publicacion?')) return;
    await api.delete(`/posts/${id}`);
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }

  async function handlePublishEmail(id: string) {
    if (!confirm('¿Publicar y enviar por email a los inversionistas?')) return;
    await api.post(`/posts/${id}/publish-email`, {});
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, isPublished: true, sentByEmail: true, publishedAt: new Date().toISOString() } : p,
      ),
    );
  }

  const fmtDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[#61a5fa] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => navigate('/admin/propiedades')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a propiedades
      </button>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Publicaciones</h1>
          <p className="text-gray-500 mt-1">{project?.title}</p>
        </div>
        <Link
          to={`/admin/propiedades/${projectId}/posts/nuevo`}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#61a5fa] text-white rounded-xl text-sm font-semibold hover:bg-blue-500 shadow-lg shadow-[#61a5fa]/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          Nueva publicacion
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <p className="text-gray-400">No hay publicaciones aun</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-2xl border border-gray-100 p-6 flex items-start justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-semibold text-gray-900 truncate">{post.title}</h3>
                  <span
                    className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      post.isPublished ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {post.isPublished ? 'Publicado' : 'Borrador'}
                  </span>
                  {post.sentByEmail && (
                    <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                      Enviado
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400">{fmtDate(post.publishedAt ?? post.createdAt)}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <Link
                  to={`/admin/propiedades/${projectId}/posts/${post.id}/preview`}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                  title="Previsualizar"
                >
                  <Eye className="w-4 h-4" />
                </Link>
                <Link
                  to={`/admin/propiedades/${projectId}/posts/${post.id}`}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                  title="Editar"
                >
                  <Edit3 className="w-4 h-4" />
                </Link>
                {!post.sentByEmail && (
                  <button
                    onClick={() => handlePublishEmail(post.id)}
                    className="p-2 rounded-lg text-[#61a5fa] hover:bg-blue-50 transition-colors"
                    title="Publicar y enviar email"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(post.id)}
                  className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
