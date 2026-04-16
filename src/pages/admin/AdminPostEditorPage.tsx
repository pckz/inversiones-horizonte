import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Eye, Edit3, Trash2, Paperclip } from 'lucide-react';
import { api } from '../../lib/api';
import FileUpload from '../../components/ui/FileUpload';
import { useAuth } from '../../contexts/AuthContext';

interface Attachment {
  id?: string;
  title: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
}

export default function AdminPostEditorPage() {
  const { isReadonlyAdmin } = useAuth();
  const { projectId, postId } = useParams();
  const navigate = useNavigate();
  const isEdit = !!postId;
  const editorRef = useRef<HTMLDivElement>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!postId);
  const [preview, setPreview] = useState(false);
  const [projectTitle, setProjectTitle] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);

  useEffect(() => {
    if (projectId) {
      api.get<any>(`/projects/${projectId}`).then((p) => setProjectTitle(p.title));
    }
  }, [projectId]);

  useEffect(() => {
    if (!postId) return;
    api
      .get<any>(`/posts/${postId}`)
      .then((post) => {
        setTitle(post.title);
        setCoverImage(post.coverImage ?? '');
        setIsPublished(post.isPublished);
        setAttachments(post.attachments ?? []);
        if (editorRef.current) {
          editorRef.current.innerHTML = post.body;
        }
      })
      .finally(() => setLoading(false));
  }, [postId]);

  function execCmd(command: string, value?: string) {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  }

  async function handleInsertImage() {
    if (isReadonlyAdmin) return;
    imgInputRef.current?.click();
  }

  async function onImageFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    if (isReadonlyAdmin) return;
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { url } = await api.upload(file, 'posts');
      execCmd('insertImage', url);
    } catch {
      alert('Error al subir la imagen');
    }
    if (imgInputRef.current) imgInputRef.current.value = '';
  }

  async function handleAddAttachment(e: React.ChangeEvent<HTMLInputElement>) {
    if (isReadonlyAdmin) return;
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAttachment(true);
    try {
      const { url } = await api.upload(file, 'post-docs');
      setAttachments((prev) => [
        ...prev,
        { title: file.name, fileUrl: url, fileType: file.type || 'application/octet-stream', fileSize: file.size },
      ]);
    } catch {
      alert('Error al subir el documento');
    } finally {
      setUploadingAttachment(false);
      e.target.value = '';
    }
  }

  function removeAttachment(idx: number) {
    if (isReadonlyAdmin) return;
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  async function handleSave() {
    if (isReadonlyAdmin) return;
    const body = editorRef.current?.innerHTML ?? '';
    if (!title.trim() || !body.trim()) return;
    setSaving(true);
    try {
      const payload: any = {
        title,
        body,
        coverImage: coverImage || undefined,
        isPublished,
        attachments: attachments.map((a) => ({
          title: a.title,
          fileUrl: a.fileUrl,
          fileType: a.fileType,
          fileSize: a.fileSize,
        })),
      };

      if (isEdit) {
        await api.patch(`/posts/${postId}`, payload);
      } else {
        await api.post('/posts', { ...payload, projectId });
      }
      navigate(`/admin/propiedades/${projectId}/posts`);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[#61a5fa] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <input ref={imgInputRef} type="file" accept="image/*" onChange={onImageFileSelected} className="hidden" />

      <button
        onClick={() => navigate(`/admin/propiedades/${projectId}/posts`)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a publicaciones
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Editar publicacion' : 'Nueva publicacion'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{projectTitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPreview(!preview)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            {preview ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {preview ? 'Editar' : 'Previsualizar'}
          </button>
          {!isReadonlyAdmin && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#61a5fa] text-white rounded-xl text-sm font-semibold hover:bg-blue-500 shadow-lg shadow-[#61a5fa]/25 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          )}
        </div>
      </div>

      {isReadonlyAdmin && (
        <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl px-4 py-3 text-sm">
          Este perfil solo puede revisar publicaciones. La edicion y la creacion estan deshabilitadas.
        </div>
      )}

      {preview ? (
        <article className="bg-white rounded-2xl border border-gray-100 p-8 prose prose-sm max-w-none">
          {coverImage && (
            <img src={coverImage} alt={title} className="w-full h-64 object-cover rounded-xl mb-6" />
          )}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{title || 'Sin titulo'}</h1>
          <div dangerouslySetInnerHTML={{ __html: editorRef.current?.innerHTML ?? '' }} />
          {attachments.length > 0 && (
            <div className="mt-6 border-t border-gray-200 pt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Documentos adjuntos</h3>
              <div className="space-y-2">
                {attachments.map((a, i) => (
                  <a key={i} href={a.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-[#61a5fa] hover:underline">
                    <Paperclip className="w-3.5 h-3.5" />
                    {a.title} ({formatSize(a.fileSize)})
                  </a>
                ))}
              </div>
            </div>
          )}
        </article>
      ) : (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Titulo</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isReadonlyAdmin}
                placeholder="Titulo de la publicacion"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#61a5fa]/20 focus:border-[#61a5fa]"
              />
            </div>
            {!isReadonlyAdmin && (
              <FileUpload
                value={coverImage}
                onChange={setCoverImage}
                folder="posts"
                accept="image/*"
                label="Imagen de portada"
              />
            )}
            {isReadonlyAdmin && coverImage && (
              <img src={coverImage} alt={title} className="w-full h-40 object-cover rounded-xl border border-gray-200" />
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {!isReadonlyAdmin && (
              <div className="flex items-center gap-1 px-4 py-2 border-b border-gray-100 bg-gray-50 flex-wrap">
                <button type="button" onClick={() => execCmd('bold')} className="px-2.5 py-1.5 rounded text-sm font-bold text-gray-600 hover:bg-gray-200 transition-colors">B</button>
                <button type="button" onClick={() => execCmd('italic')} className="px-2.5 py-1.5 rounded text-sm italic text-gray-600 hover:bg-gray-200 transition-colors">I</button>
                <button type="button" onClick={() => execCmd('underline')} className="px-2.5 py-1.5 rounded text-sm underline text-gray-600 hover:bg-gray-200 transition-colors">U</button>
                <div className="w-px h-5 bg-gray-300 mx-1" />
                <button type="button" onClick={() => execCmd('formatBlock', 'h2')} className="px-2.5 py-1.5 rounded text-sm font-semibold text-gray-600 hover:bg-gray-200 transition-colors">H2</button>
                <button type="button" onClick={() => execCmd('formatBlock', 'h3')} className="px-2.5 py-1.5 rounded text-sm font-semibold text-gray-600 hover:bg-gray-200 transition-colors">H3</button>
                <button type="button" onClick={() => execCmd('formatBlock', 'p')} className="px-2.5 py-1.5 rounded text-xs text-gray-600 hover:bg-gray-200 transition-colors">Parrafo</button>
                <div className="w-px h-5 bg-gray-300 mx-1" />
                <button type="button" onClick={() => execCmd('insertUnorderedList')} className="px-2.5 py-1.5 rounded text-sm text-gray-600 hover:bg-gray-200 transition-colors">• Lista</button>
                <button type="button" onClick={() => execCmd('insertOrderedList')} className="px-2.5 py-1.5 rounded text-sm text-gray-600 hover:bg-gray-200 transition-colors">1. Lista</button>
                <div className="w-px h-5 bg-gray-300 mx-1" />
                <button type="button" onClick={() => { const url = prompt('URL del enlace:'); if (url) execCmd('createLink', url); }} className="px-2.5 py-1.5 rounded text-sm text-[#61a5fa] hover:bg-gray-200 transition-colors">Link</button>
                <button type="button" onClick={handleInsertImage} className="px-2.5 py-1.5 rounded text-sm text-gray-600 hover:bg-gray-200 transition-colors">Imagen</button>
              </div>
            )}
            <div
              ref={editorRef}
              contentEditable={!isReadonlyAdmin}
              className="min-h-[400px] px-6 py-4 text-sm text-gray-900 leading-relaxed focus:outline-none prose prose-sm max-w-none"
              style={{ whiteSpace: 'pre-wrap' }}
            />
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Documentos adjuntos</h3>
            {attachments.length > 0 && (
              <div className="space-y-2 mb-3">
                {attachments.map((a, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl border border-gray-200">
                    <Paperclip className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="text-sm text-gray-700 truncate flex-1">{a.title}</span>
                    <span className="text-xs text-gray-400 shrink-0">{formatSize(a.fileSize)}</span>
                    {!isReadonlyAdmin && (
                      <button type="button" onClick={() => removeAttachment(i)} className="p-0.5 hover:bg-gray-200 rounded transition-colors">
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
            {!isReadonlyAdmin && (
              <label className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-[#61a5fa] hover:text-[#61a5fa] hover:bg-blue-50/30 transition-all cursor-pointer">
                {uploadingAttachment ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#61a5fa] border-t-transparent rounded-full animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Paperclip className="w-4 h-4" />
                    Agregar documento
                  </>
                )}
                <input type="file" onChange={handleAddAttachment} className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.jpg,.jpeg,.png" />
              </label>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                disabled={isReadonlyAdmin}
                className="w-5 h-5 rounded border-gray-300 text-[#61a5fa] focus:ring-[#61a5fa]"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">Publicar inmediatamente</p>
                <p className="text-xs text-gray-500">
                  Los inversionistas podran ver esta publicacion en su panel
                </p>
              </div>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
