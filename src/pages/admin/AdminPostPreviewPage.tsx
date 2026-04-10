import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { api } from '../../lib/api';

interface PostDetail {
  id: string;
  title: string;
  body: string;
  coverImage: string | null;
  isPublished: boolean;
  sentByEmail: boolean;
  publishedAt: string | null;
  createdAt: string;
  project: { title: string; slug: string };
}

export default function AdminPostPreviewPage() {
  const { projectId, postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!postId) return;
    api
      .get<PostDetail>(`/posts/${postId}`)
      .then(setPost)
      .finally(() => setLoading(false));
  }, [postId]);

  async function handlePublishEmail() {
    if (!post || !confirm('¿Publicar y enviar por email a los inversionistas?')) return;
    const result = await api.post<{ sent: number }>(`/posts/${post.id}/publish-email`, {});
    setPost({ ...post, isPublished: true, sentByEmail: true, publishedAt: new Date().toISOString() });
    alert(`Publicacion enviada a ${result.sent} inversionista(s)`);
  }

  const fmtDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' }) : '';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[#61a5fa] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(`/admin/propiedades/${projectId}/posts`)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>
        {!post.sentByEmail && (
          <button
            onClick={handlePublishEmail}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#61a5fa] text-white rounded-xl text-sm font-semibold hover:bg-blue-500 shadow-lg shadow-[#61a5fa]/25 transition-all"
          >
            <Send className="w-4 h-4" />
            Publicar y enviar email
          </button>
        )}
      </div>

      <article className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {post.coverImage && (
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-72 object-cover"
          />
        )}
        <div className="p-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-medium text-[#61a5fa]">{post.project.title}</span>
            <span className="text-gray-300">·</span>
            <span className="text-xs text-gray-400">
              {fmtDate(post.publishedAt ?? post.createdAt)}
            </span>
            {post.sentByEmail && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                Enviado por email
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-6">{post.title}</h1>
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: post.body }}
          />
        </div>
      </article>
    </div>
  );
}
