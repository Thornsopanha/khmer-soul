import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../services/supabaseClient';
import { Category, ContentItem, SiteSetting } from '../types';
import { Plus, Trash2, Edit2, Save, X, Image as ImageIcon, Layout, FileText, LogOut, Music, Upload, Loader2, Settings, Link, Map as MapIcon } from 'lucide-react';

// --- Helper Components ---

const FileUploader = ({ onFileSelect, uploading, accept, label, icon, note, className }: any) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={className}>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept={accept}
        onChange={onFileSelect}
        disabled={uploading}
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className={`w-full flex items-center justify-center gap-2 bg-stone-800 hover:bg-stone-700 text-stone-300 px-4 py-3 rounded border border-stone-700 transition-colors shadow-sm hover:shadow-md ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {uploading ? <Loader2 size={18} className="animate-spin" /> : (icon || <Upload size={18} />)}
        <span className="text-sm font-medium">{label || 'Upload'}</span>
      </button>
      {note && <p className="text-[10px] text-stone-500 mt-1">{note}</p>}
    </div>
  );
};

const Login = ({ onLogin }: { onLogin: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      onLogin();
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-950 px-4">
      <div className="max-w-md w-full bg-stone-900 p-8 rounded-lg border border-stone-800 shadow-2xl">
        <h2 className="text-2xl font-serif text-stone-100 mb-6 text-center">Admin Access</h2>
        {error && <div className="bg-red-900/50 text-red-200 p-3 rounded mb-4 text-sm">{error}</div>}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-400 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-stone-800 border border-stone-700 rounded p-2 text-stone-100 focus:border-amber-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-400 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-stone-800 border border-stone-700 rounded p-2 text-stone-100 focus:border-amber-500 focus:outline-none"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-600 hover:bg-amber-500 text-white font-medium py-2 rounded transition-colors disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

// --- Main Admin Dashboard ---

const Admin: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'categories' | 'items' | 'settings'>('items');
  const [loading, setLoading] = useState(true);

  // Data State
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<ContentItem[]>([]);
  const [settings, setSettings] = useState<SiteSetting[]>([]);

  // Edit State
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [editingItem, setEditingItem] = useState<Partial<ContentItem> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Deletion State for visual feedback
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchData();
      else setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchData();
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchData = async () => {
    // Only set global loading on initial fetch
    if (categories.length === 0) setLoading(true);

    const { data: cats } = await supabase.from('categories').select('*').order('order');
    if (cats) setCategories(cats);

    const { data: its } = await supabase.from('content_items').select('*').order('created_at', { ascending: false });
    if (its) setItems(its);

    const { data: sets } = await supabase.from('site_settings').select('*');
    if (sets) setSettings(sets);

    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // --- Upload Handler ---

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, onComplete: (url: string) => void) => {
    if (!event.target.files || event.target.files.length === 0) return;

    setUploading(true);
    const file = event.target.files[0];

    // Sanitize filename to avoid path issues
    const fileExt = file.name.split('.').pop();
    // Replace non-alphanumeric chars with underscore for safety
    const cleanName = file.name.replace(/[^a-zA-Z0-9]/g, '_');
    const filePath = `${Date.now()}_${cleanName}.${fileExt}`;

    try {
      // 1. Upload to 'media' bucket
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // 2. Get Public URL
      const { data } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      if (data) {
        onComplete(data.publicUrl);
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      alert(`Upload failed: ${error.message || "Unknown error"}. \n\nCheck if the 'media' bucket exists and RLS policies allow inserts.`);
    } finally {
      setUploading(false);
      // Reset input value to allow selecting same file again if needed
      event.target.value = '';
    }
  };


  // --- CRUD Operations ---

  const saveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    setSaveLoading(true);

    if (!editingCategory.slug || !editingCategory.title_en || !editingCategory.title_km) {
      alert("Slug, English Title, and Khmer Title are required.");
      setSaveLoading(false);
      return;
    }

    const payload = {
      ...editingCategory,
      order: Number(editingCategory.order || 0)
    };

    const { error } = await supabase.from('categories').upsert(payload).select();

    setSaveLoading(false);
    if (error) {
      alert('Error saving category: ' + error.message);
    } else {
      setIsModalOpen(false);
      setEditingCategory(null);
      fetchData();
    }
  };

  const deleteCategory = async (id: string, e?: React.MouseEvent) => {
    // Prevent event propagation if triggered from a button inside a clickable card
    if (e) e.stopPropagation();

    if (!window.confirm('Are you sure? This will delete the category AND all associated items!')) return;

    setDeletingId(id);
    try {
      // 1. Find category to get slug
      const categoryToDelete = categories.find(c => c.id === id);
      if (!categoryToDelete) {
        throw new Error("Category not found in local data. Try refreshing.");
      }

      console.log(`Deleting items for category slug: ${categoryToDelete.slug}...`);

      // 2. Delete associated items first (Safety for Non-Cascading DBs)
      // Check count to ensure we have permission to delete even if 0 items exist
      const { error: itemsError } = await supabase
        .from('content_items')
        .delete()
        .eq('category_slug', categoryToDelete.slug);

      if (itemsError) throw new Error(`Failed to delete items: ${itemsError.message}`);

      console.log(`Deleting category ID: ${id}...`);

      // 3. Delete the category itself
      // CRITICAL: We request exact count to verify deletion occurred
      const { error: catError, count } = await supabase
        .from('categories')
        .delete({ count: 'exact' })
        .eq('id', id);

      if (catError) throw new Error(`Failed to delete category: ${catError.message}`);

      // If no rows were deleted but no error occurred, it's an RLS issue
      if (count === 0) {
        throw new Error("Operation successful but 0 categories were deleted. This usually means Row Level Security (RLS) is blocking the deletion. You need to enable DELETE policies for authenticated users in Supabase.");
      }

      // 4. Refresh data on success
      await fetchData();
      alert("Category deleted successfully.");

    } catch (err: any) {
      console.error("Delete failed:", err);
      // Detailed alert to help debug RLS issues
      alert(`Delete Failed: ${err.message || "Unknown error"}`);
    } finally {
      setDeletingId(null);
    }
  };

  const saveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setSaveLoading(true);

    if (!editingItem.category_slug || !editingItem.title_en || !editingItem.title_km) {
      alert("Category, English Title, and Khmer Title are required.");
      setSaveLoading(false);
      return;
    }

    const payload = {
      ...editingItem,
      images: editingItem.images || []
    };

    const { error } = await supabase.from('content_items').upsert(payload).select();

    setSaveLoading(false);
    if (error) {
      alert('Error saving item: ' + error.message);
    } else {
      setIsModalOpen(false);
      setEditingItem(null);
      fetchData();
    }
  };

  const deleteItem = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    if (!window.confirm('Are you sure you want to delete this item?')) return;

    setDeletingId(id);
    try {
      // CRITICAL: Request count to verify deletion
      const { error, count } = await supabase
        .from('content_items')
        .delete({ count: 'exact' })
        .eq('id', id);

      if (error) throw error;

      // If no rows deleted, warn about RLS
      if (count === 0) {
        throw new Error("Item was not deleted (0 rows affected). This likely means Supabase RLS policies are blocking the DELETE operation for your user account.");
      }

      await fetchData();
    } catch (err: any) {
      console.error("Delete item failed:", err);
      alert(`Failed to delete item: ${err.message || "Unknown error"}.`);
    } finally {
      setDeletingId(null);
    }
  };

  const updateSetting = async (key: string, value: string) => {
    setSaveLoading(true);

    const exists = settings.some(s => s.key === key);
    let error;

    if (exists) {
      const res = await supabase.from('site_settings').update({ value }).eq('key', key);
      error = res.error;
    } else {
      const res = await supabase.from('site_settings').insert({ key, value, label: key });
      error = res.error;
    }

    if (error) {
      alert('Error saving setting: ' + error.message);
    } else {
      fetchData();
      window.dispatchEvent(new Event('REFRESH_SETTINGS'));
    }
    setSaveLoading(false);
  }

  // --- UI Helpers ---

  const openCategoryModal = (cat?: Category) => {
    setEditingCategory(cat || { order: categories.length + 1 });
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const openItemModal = (item?: ContentItem) => {
    setEditingItem(item || { images: [] });
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const getSettingValue = (key: string) => settings.find(s => s.key === key)?.value || '';

  const handleLocalSettingChange = (key: string, newValue: string) => {
    setSettings(prev => {
      const existing = prev.find(s => s.key === key);
      if (existing) {
        return prev.map(s => s.key === key ? { ...s, value: newValue } : s);
      } else {
        return [...prev, { key, value: newValue, label: key }];
      }
    });
  };

  if (!session) {
    if (loading) return <div className="min-h-screen bg-stone-950 flex items-center justify-center text-stone-500">Loading...</div>;
    return <Login onLogin={() => { }} />;
  }

  const isEditing = (editingCategory && editingCategory.id) || (editingItem && editingItem.id);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-200 font-sans">
      {/* Top Bar */}
      <div className="bg-stone-900 border-b border-stone-800 px-6 py-4 flex justify-between items-center sticky top-0 z-20 shadow-lg">
        <h1 className="font-serif text-xl text-amber-500">Khmer Culture Admin</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-stone-500 hidden sm:inline">{session.user.email}</span>
          <button onClick={handleLogout} className="p-2 hover:bg-stone-800 rounded text-stone-400 hover:text-red-400 transition-colors" title="Logout">
            <LogOut size={20} />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('items')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${activeTab === 'items' ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/20 translate-y-[-2px]' : 'bg-stone-900 text-stone-400 hover:bg-stone-800'}`}
          >
            <FileText size={18} /> Content Items
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${activeTab === 'categories' ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/20 translate-y-[-2px]' : 'bg-stone-900 text-stone-400 hover:bg-stone-800'}`}
          >
            <Layout size={18} /> Categories
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${activeTab === 'settings' ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/20 translate-y-[-2px]' : 'bg-stone-900 text-stone-400 hover:bg-stone-800'}`}
          >
            <Settings size={18} /> Global Settings
          </button>
        </div>

        {/* Content Area */}
        {activeTab === 'categories' && (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-serif">Categories ({categories.length})</h2>
              <button type="button" onClick={() => openCategoryModal()} className="flex items-center gap-2 bg-stone-800 hover:bg-stone-700 text-amber-500 px-4 py-2 rounded-md transition-colors border border-amber-500/20">
                <Plus size={18} /> Add Category
              </button>
            </div>
            <div className="grid gap-4">
              {categories.map(cat => (
                <div key={cat.id} className="bg-stone-900 p-4 rounded-lg border border-stone-800 flex justify-between items-center hover:border-stone-700 transition-all shadow-sm">
                  <div className="flex items-center gap-4">
                    <img src={cat.cover_image} alt="" className="w-16 h-16 rounded object-cover bg-stone-800 border border-stone-700" />
                    <div>
                      <h3 className="font-bold text-stone-100 text-lg">{cat.title_en}</h3>
                      <p className="text-amber-500 font-serif mb-1">{cat.title_km}</p>
                      <p className="text-xs text-stone-500 uppercase tracking-wider font-mono">/{cat.slug}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => openCategoryModal(cat)} className="p-2 text-stone-400 hover:text-amber-500 hover:bg-stone-800 rounded transition-colors" title="Edit"><Edit2 size={18} /></button>
                    <button
                      type="button"
                      onClick={(e) => deleteCategory(cat.id, e)}
                      disabled={deletingId === cat.id}
                      className="p-2 text-stone-400 hover:text-red-500 hover:bg-stone-800 rounded transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      {deletingId === cat.id ? <Loader2 size={18} className="animate-spin text-red-500" /> : <Trash2 size={18} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'items' && (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-serif">Content Items ({items.length})</h2>
              <button type="button" onClick={() => openItemModal()} className="flex items-center gap-2 bg-stone-800 hover:bg-stone-700 text-amber-500 px-4 py-2 rounded-md transition-colors border border-amber-500/20">
                <Plus size={18} /> Add Item
              </button>
            </div>
            <div className="space-y-12">
              {/* Group items by category */}
              {categories.map(category => {
                const categoryItems = items.filter(item => item.category_slug === category.slug);
                if (categoryItems.length === 0) return null;

                return (
                  <div key={category.id} className="relative">
                    <h3 className="text-xl font-serif text-amber-500 mb-4 sticky top-16 bg-stone-950/90 py-2 border-b border-stone-800 z-10 backdrop-blur-sm flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        {category.title_en}
                        <span className="text-sm font-sans text-stone-500 font-normal">({categoryItems.length})</span>
                      </span>
                    </h3>
                    <div className="grid gap-4">
                      {categoryItems.map(item => (
                        <div key={item.id} className="bg-stone-900 p-4 rounded-lg border border-stone-800 flex justify-between items-center hover:border-stone-700 transition-all shadow-sm">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-stone-800 rounded overflow-hidden flex-shrink-0 border border-stone-700">
                              {item.images?.[0] ? <img src={item.images[0]} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-stone-600"><ImageIcon size={20} /></div>}
                            </div>
                            <div>
                              <h3 className="font-bold text-stone-100 line-clamp-1">{item.title_en}</h3>
                              <p className="text-amber-500 font-serif mb-1 line-clamp-1">{item.title_km}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button type="button" onClick={() => openItemModal(item)} className="p-2 text-stone-400 hover:text-amber-500 hover:bg-stone-800 rounded transition-colors" title="Edit"><Edit2 size={18} /></button>
                            <button
                              type="button"
                              onClick={(e) => deleteItem(item.id, e)}
                              disabled={deletingId === item.id}
                              className="p-2 text-stone-400 hover:text-red-500 hover:bg-stone-800 rounded transition-colors disabled:opacity-50"
                              title="Delete"
                            >
                              {deletingId === item.id ? <Loader2 size={18} className="animate-spin text-red-500" /> : <Trash2 size={18} />}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Items without a valid category (Orphans) */}
              {items.filter(item => !categories.find(c => c.slug === item.category_slug)).length > 0 && (
                <div className="relative">
                  <h3 className="text-xl font-serif text-stone-500 mb-4 sticky top-16 bg-stone-950/90 py-2 border-b border-stone-800 z-10 backdrop-blur-sm">
                    Uncategorized / Orphans
                  </h3>
                  <div className="grid gap-4">
                    {items.filter(item => !categories.find(c => c.slug === item.category_slug)).map(item => (
                      <div key={item.id} className="bg-stone-900/50 p-4 rounded-lg border border-stone-800/50 flex justify-between items-center opacity-80 hover:opacity-100 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-stone-900 rounded overflow-hidden flex-shrink-0 border border-stone-800">
                            {item.images?.[0] ? <img src={item.images[0]} className="w-full h-full object-cover grayscale" /> : <div className="w-full h-full flex items-center justify-center text-stone-600"><ImageIcon size={20} /></div>}
                          </div>
                          <div>
                            <h3 className="font-bold text-stone-300 line-clamp-1">{item.title_en}</h3>
                            <p className="text-stone-500 font-serif mb-1 line-clamp-1">{item.title_km}</p>
                            <p className="text-xs text-red-900/50 bg-red-500/10 px-2 py-0.5 rounded text-[10px] uppercase font-bold inline-block border border-red-900/30">Missing Category: {item.category_slug}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => openItemModal(item)} className="p-2 text-stone-500 hover:text-amber-500 hover:bg-stone-800 rounded" title="Edit"><Edit2 size={18} /></button>
                          <button type="button" onClick={(e) => deleteItem(item.id, e)} className="p-2 text-stone-500 hover:text-red-500 hover:bg-stone-800 rounded" title="Delete"><Trash2 size={18} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="animate-fade-in max-w-3xl mx-auto">
            <h2 className="text-2xl font-serif mb-6">Global Site Settings</h2>
            <div className="bg-stone-900 border border-stone-800 rounded-lg p-8 space-y-8">

              {/* Hero Image Setting */}
              <div className="space-y-4">
                <h3 className="text-lg text-amber-500 font-medium flex items-center gap-2"><ImageIcon size={20} /> Homepage Hero Image</h3>
                <div className="flex gap-4">
                  {getSettingValue('hero_image') && (
                    <img src={getSettingValue('hero_image')} className="w-32 h-20 object-cover rounded border border-stone-700" alt="Current Hero" />
                  )}
                  <div className="flex-grow space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={getSettingValue('hero_image')}
                        onChange={(e) => handleLocalSettingChange('hero_image', e.target.value)}
                        className="w-full bg-stone-950 border border-stone-800 rounded p-2 text-stone-400 text-sm focus:border-amber-500 focus:outline-none"
                      />
                      <button
                        onClick={() => updateSetting('hero_image', getSettingValue('hero_image'))}
                        disabled={saveLoading}
                        className="bg-stone-800 hover:bg-stone-700 text-stone-300 p-2 rounded border border-stone-700 transition-colors"
                        title="Save Text Change"
                      >
                        <Save size={18} />
                      </button>
                      <FileUploader
                        uploading={uploading}
                        accept="image/*"
                        label="Upload"
                        onFileSelect={(e: any) => handleFileUpload(e, (url) => updateSetting('hero_image', url))}
                      />
                    </div>
                    <p className="text-xs text-stone-500">The main background image on the homepage.</p>
                  </div>
                </div>
              </div>

              <div className="h-px bg-stone-800 w-full" />

              {/* BG Music Setting */}
              <div className="space-y-4">
                <h3 className="text-lg text-amber-500 font-medium flex items-center gap-2"><Music size={20} /> Background Music</h3>
                <div className="flex gap-4">
                  <div className="flex-grow space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={getSettingValue('bg_music')}
                        onChange={(e) => handleLocalSettingChange('bg_music', e.target.value)}
                        className="w-full bg-stone-950 border border-stone-800 rounded p-2 text-stone-400 text-sm focus:border-amber-500 focus:outline-none"
                        placeholder="Enter MP3 URL or leave empty to disable"
                      />
                      <button
                        onClick={() => updateSetting('bg_music', getSettingValue('bg_music'))}
                        disabled={saveLoading}
                        className="bg-stone-800 hover:bg-stone-700 text-stone-300 p-2 rounded border border-stone-700 transition-colors"
                        title="Save Text Change"
                      >
                        <Save size={18} />
                      </button>
                      <FileUploader
                        uploading={uploading}
                        accept="audio/*"
                        label="Upload"
                        onFileSelect={(e: any) => handleFileUpload(e, (url) => updateSetting('bg_music', url))}
                      />
                    </div>
                    <p className="text-xs text-stone-500">The MP3 file played when the user enables sound. Leave empty to disable.</p>
                    {getSettingValue('bg_music') && (
                      <audio controls src={getSettingValue('bg_music')} className="h-8 mt-2 opacity-50 w-full max-w-sm" />
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-stone-900 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-stone-700 animate-fade-in">
            <div className="sticky top-0 bg-stone-900 p-4 border-b border-stone-800 flex justify-between items-center z-10">
              <h3 className="text-xl font-serif text-stone-100 flex items-center gap-2">
                {isEditing ? <Edit2 size={20} className="text-amber-500" /> : <Plus size={20} className="text-amber-500" />}
                {editingCategory ? (editingCategory.id ? 'Edit Category' : 'New Category') : (editingItem?.id ? 'Edit Item' : 'New Item')}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-white transition-colors"><X size={24} /></button>
            </div>

            <div className="p-6">
              {editingCategory && (
                <form onSubmit={saveCategory} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Slug (ID)"
                      value={editingCategory.slug}
                      onChange={(v: string) => setEditingCategory(prev => ({ ...prev!, slug: v }))}
                      placeholder="e.g. temples-architecture"
                      required
                      disabled={!!editingCategory.id}
                      note={editingCategory.id ? "Slug cannot be changed after creation to preserve links." : "Unique identifier for URL. Cannot be changed later."}
                    />
                    <Input label="Order" type="number" value={editingCategory.order} onChange={(v: string) => setEditingCategory(prev => ({ ...prev!, order: Number(v) }))} />
                    <Input label="Title (English)" value={editingCategory.title_en} onChange={(v: string) => setEditingCategory(prev => ({ ...prev!, title_en: v }))} required />
                    <Input label="Title (Khmer)" value={editingCategory.title_km} onChange={(v: string) => setEditingCategory(prev => ({ ...prev!, title_km: v }))} required fontClass="font-serif" />
                    <TextArea label="Description (English)" value={editingCategory.description_en} onChange={(v: string) => setEditingCategory(prev => ({ ...prev!, description_en: v }))} />
                    <TextArea label="Description (Khmer)" value={editingCategory.description_km} onChange={(v: string) => setEditingCategory(prev => ({ ...prev!, description_km: v }))} fontClass="font-serif" />

                    <div className="md:col-span-2 bg-stone-950 p-4 rounded border border-stone-800 flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-stone-300 block mb-1">Enable Map & Highlights</label>
                        <p className="text-xs text-stone-500">If enabled, items in this category can display maps, photos spots, and location data.</p>
                      </div>
                      <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                        <input
                          type="checkbox"
                          name="toggle"
                          id="map-toggle"
                          className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer checkbox-checked:right-0 checkbox-checked:border-green-400"
                          checked={editingCategory.has_map_feature || false}
                          onChange={(e) => setEditingCategory(prev => ({ ...prev!, has_map_feature: e.target.checked }))}
                          style={{ right: editingCategory.has_map_feature ? '0' : 'auto', left: editingCategory.has_map_feature ? 'auto' : '0' }}
                        />
                        <label
                          htmlFor="map-toggle"
                          className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${editingCategory.has_map_feature ? 'bg-amber-600' : 'bg-stone-700'}`}
                          onClick={() => setEditingCategory(prev => ({ ...prev!, has_map_feature: !prev!.has_map_feature }))}
                        ></label>
                      </div>
                    </div>
                  </div>

                  {/* Cover Image with Upload */}
                  <div>
                    <label className="block text-xs font-medium text-stone-400 mb-2 uppercase tracking-wider">Cover Image</label>

                    <div className="space-y-4">
                      {/* Preview */}
                      <div className="bg-stone-950 border border-stone-800 rounded-lg p-4 flex flex-col items-center justify-center relative min-h-[160px]">
                        {editingCategory.cover_image ? (
                          <div className="relative w-full group">
                            <img
                              src={editingCategory.cover_image}
                              alt="Preview"
                              className="w-full h-48 object-cover rounded shadow-sm border border-stone-800"
                            />
                            <button
                              type="button"
                              onClick={() => setEditingCategory(prev => ({ ...prev!, cover_image: '' }))}
                              className="absolute top-2 right-2 bg-red-600/90 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                              title="Remove Image"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ) : (
                          <div className="text-center text-stone-600">
                            <ImageIcon size={48} className="mx-auto mb-2 opacity-20" />
                            <p className="text-sm">No image selected</p>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FileUploader
                          uploading={uploading}
                          accept="image/*"
                          label={editingCategory.cover_image ? "Replace Image" : "Upload Image"}
                          icon={<Upload size={16} />}
                          onFileSelect={(e: any) => handleFileUpload(e, (url) => setEditingCategory(prev => ({ ...prev!, cover_image: url })))}
                        />
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Link size={14} className="text-stone-500" />
                          </div>
                          <input
                            type="text"
                            value={editingCategory.cover_image || ''}
                            onChange={e => setEditingCategory(prev => ({ ...prev!, cover_image: e.target.value }))}
                            className="w-full bg-stone-950 border border-stone-800 rounded p-2 pl-9 text-stone-300 text-sm focus:border-amber-500 focus:outline-none h-full"
                            placeholder="Or paste image URL..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={saveLoading}
                    className="w-full bg-amber-600 hover:bg-amber-500 text-white py-3 rounded font-medium flex justify-center items-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {saveLoading ? 'Saving...' : <><Save size={18} /> Save Category</>}
                  </button>
                </form>
              )}

              {editingItem && (
                <form onSubmit={saveItem} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-medium text-stone-400 mb-1 uppercase tracking-wider">Category *</label>
                      <select
                        value={editingItem.category_slug || ''}
                        onChange={e => setEditingItem(prev => ({ ...prev!, category_slug: e.target.value }))}
                        className="w-full bg-stone-950 border border-stone-800 rounded p-3 text-stone-200 focus:border-amber-500 focus:outline-none"
                        required
                      >
                        <option value="">Select Category</option>
                        {categories.map(c => <option key={c.id} value={c.slug}>{c.title_en}</option>)}
                      </select>
                    </div>
                    <div /> {/* Spacer */}

                    <Input label="Title (English)" value={editingItem.title_en} onChange={(v: string) => setEditingItem(prev => ({ ...prev!, title_en: v }))} required />
                    <Input label="Title (Khmer)" value={editingItem.title_km} onChange={(v: string) => setEditingItem(prev => ({ ...prev!, title_km: v }))} required fontClass="font-serif" />

                    <TextArea label="Summary (English)" value={editingItem.summary_en} onChange={(v: string) => setEditingItem(prev => ({ ...prev!, summary_en: v }))} rows={2} />
                    <TextArea label="Summary (Khmer)" value={editingItem.summary_km} onChange={(v: string) => setEditingItem(prev => ({ ...prev!, summary_km: v }))} rows={2} fontClass="font-serif" />

                    <TextArea label="Full Content (English)" value={editingItem.content_en} onChange={(v: string) => setEditingItem(prev => ({ ...prev!, content_en: v }))} rows={6} />

                    <TextArea label="Full Content (Khmer)" value={editingItem.content_km} onChange={(v: string) => setEditingItem(prev => ({ ...prev!, content_km: v }))} rows={6} fontClass="font-serif" />

                    {/* Location Data - Only show if relevant category or always available as optional */}
                    <div className="md:col-span-2 border-t border-stone-800 pt-6 mt-2">
                      <h4 className="text-sm font-medium text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <MapIcon size={16} /> Location & Mapping
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-stone-950 p-4 rounded border border-stone-800">
                        <Input
                          label="Latitude"
                          type="number"
                          value={editingItem.location_coordinates?.lat}
                          onChange={(v: string) => setEditingItem(prev => ({
                            ...prev!,
                            location_coordinates: {
                              lat: parseFloat(v),
                              lng: prev?.location_coordinates?.lng || 0
                            }
                          }))}
                          placeholder="e.g. 13.4125"
                        />
                        <Input
                          label="Longitude"
                          type="number"
                          value={editingItem.location_coordinates?.lng}
                          onChange={(v: string) => setEditingItem(prev => ({
                            ...prev!,
                            location_coordinates: {
                              lat: prev?.location_coordinates?.lat || 0,
                              lng: parseFloat(v)
                            }
                          }))}
                          placeholder="e.g. 103.8670"
                        />
                        <div className="md:col-span-2">
                          <Input
                            label="Temple Plan / Map Image URL"
                            value={editingItem.map_image_url}
                            onChange={(v: string) => setEditingItem(prev => ({ ...prev!, map_image_url: v }))}
                            placeholder="https://example.com/plan.jpg"
                            note="Upload an internal layout map if available."
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-stone-800 pt-8 mt-4">
                    <h4 className="text-lg font-serif text-amber-500 mb-6 flex items-center gap-2">
                      <ImageIcon size={20} /> Media Assets
                    </h4>

                    <div className="grid grid-cols-1 gap-6">
                      {/* Audio Upload */}
                      <div>
                        <label className="block text-xs font-medium text-stone-400 mb-1 uppercase tracking-wider">Audio URL (MP3)</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={editingItem.audio || ''}
                            onChange={e => setEditingItem(prev => ({ ...prev!, audio: e.target.value }))}
                            className="w-full bg-stone-950 border border-stone-800 rounded p-3 text-stone-200 focus:border-amber-500 focus:outline-none"
                            placeholder="https://example.com/audio.mp3"
                          />
                          <FileUploader
                            uploading={uploading}
                            accept="audio/*"
                            label="Upload Audio"
                            onFileSelect={(e: any) => handleFileUpload(e, (url) => setEditingItem(prev => ({ ...prev!, audio: url })))}
                          />
                        </div>
                        <p className="text-[10px] text-stone-500 mt-2 flex items-center gap-1">
                          <Music size={12} /> Supports MP3 files. Displayed as a player on the item page.
                        </p>
                      </div>

                      {/* Images */}
                      <div>
                        <div className="flex justify-between items-end mb-1">
                          <label className="block text-xs font-medium text-stone-400 uppercase tracking-wider">Images (One URL per line)</label>
                          <div className="flex items-center gap-2">
                            <FileUploader
                              uploading={uploading}
                              accept="image/*"
                              label="Add Image"
                              icon={<Plus size={12} />}
                              className="px-2 py-1 text-xs"
                              onFileSelect={(e: any) => handleFileUpload(e, (url) => {
                                setEditingItem(prev => {
                                  const currentImages = prev?.images || [];
                                  return { ...prev!, images: [...currentImages, url] };
                                });
                              })}
                            />
                          </div>
                        </div>
                        <textarea
                          value={editingItem.images?.join('\n') || ''}
                          onChange={e => setEditingItem(prev => ({ ...prev!, images: e.target.value.split('\n').filter(s => s.trim() !== '') }))}
                          className="w-full bg-stone-950 border border-stone-800 rounded p-3 text-stone-200 focus:border-amber-500 focus:outline-none font-mono text-sm"
                          rows={4}
                          placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                        />
                        <p className="text-[10px] text-stone-500 mt-1">First image is the cover. Subsequent images appear in the gallery.</p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={saveLoading}
                    className="w-full bg-amber-600 hover:bg-amber-500 text-white py-3 rounded font-medium flex justify-center items-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {saveLoading ? 'Saving...' : <><Save size={18} /> Save Item</>}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )
      }
    </div >
  );
};

// --- Form Helpers ---

const Input = ({ label, value, onChange, type = "text", required, placeholder, fontClass, disabled, note }: any) => (
  <div>
    <label className="block text-xs font-medium text-stone-400 mb-1 uppercase tracking-wider">{label} {required && '*'}</label>
    <input
      type={type}
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      className={`w-full bg-stone-950 border border-stone-800 rounded p-3 text-stone-200 focus:border-amber-500 focus:outline-none ${fontClass} ${disabled ? 'opacity-50 cursor-not-allowed bg-stone-900' : ''}`}
      required={required}
      placeholder={placeholder}
      disabled={disabled}
    />
    {note && <p className="text-[10px] text-stone-500 mt-1">{note}</p>}
  </div>
);

const TextArea = ({ label, value, onChange, rows = 3, fontClass }: any) => (
  <div>
    <label className="block text-xs font-medium text-stone-400 mb-1 uppercase tracking-wider">{label}</label>
    <textarea
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      className={`w-full bg-stone-950 border border-stone-800 rounded p-3 text-stone-200 focus:border-amber-500 focus:outline-none ${fontClass}`}
      rows={rows}
    />
  </div>
);

export default Admin;